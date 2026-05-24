const config = require("../config/chatbottuvan.config");

function extractContent(data) {
    const choice = data.choices?.[0];
    if (!choice) return null;
    const content = choice.message?.content;
    if (content && content.trim()) return content.trim();
    const reasoning = choice.message?.reasoning;
    if (reasoning && reasoning.trim()) return reasoning.trim();
    return null;
}

// ─── RAG: Full-text search trên MongoDB ───────────────────────────────────────
async function retrieveContext(db, userMessage) {
    const collection = db.collection(config.vectorCollection);

    const stopwords = ["tôi", "bạn", "có", "không", "gì", "là", "và", "của", "cho", "được", "này", "những", "các", "một", "với", "trong", "để", "thì", "mà", "như", "khi", "từ", "về", "ở", "đã", "sẽ", "đang", "rất", "nào", "hay", "hoặc", "cũng", "vì", "nếu", "thế", "làm", "muốn", "cần", "hỏi", "đáp"];
    const keywords = userMessage
        .toLowerCase()
        .replace(/[?!.,]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 1 && !stopwords.includes(w));

    if (!keywords.length) return "";

    const regexList = keywords.map((k) => new RegExp(k, "i"));

    const docs = await collection
        .find({ text: { $in: regexList.map((r) => r) } })
        .limit(config.topK * 3)
        .toArray();

    if (!docs.length) {
        const allDocs = await collection.find({}).limit(config.topK).toArray();
        return allDocs.map((d, i) => `[${i + 1}] (${d.type}) ${d.text}`).join("\n");
    }

    const scored = docs
        .map((doc) => {
            const score = keywords.filter((k) => doc.text.toLowerCase().includes(k)).length;
            return { text: doc.text, type: doc.type, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, config.topK);

    return scored.map((r, i) => `[${i + 1}] (${r.type}) ${r.text}`).join("\n");
}

// ─── Main Service ─────────────────────────────────────────────────────────────
class ChatbotTuvanService {
    async chatWithAI(db, userMessage, conversationHistory = []) {
        // 1. RAG context
        let ragContext = "";
        try {
            ragContext = await retrieveContext(db, userMessage);
        } catch (err) {
            console.warn("[ChatbotTuvan] RAG lỗi:", err.message);
        }

        // 2. Lấy sản phẩm thật từ DB
        let productContext = "";
        try {
            const products = await db.collection("products").find({}).limit(50).toArray();
            productContext = products
                .map((p) => {
                    const hasSale = p.salePrice && p.salePrice < p.price;
                    const priceText = hasSale
                        ? `${p.price.toLocaleString()} VNĐ → KM còn ${p.salePrice.toLocaleString()} VNĐ`
                        : `${p.price.toLocaleString()} VNĐ`;
                    return `- ${p.name}: ${priceText} (Loại: ${p.category})`;
                })
                .join("\n");
        } catch (err) {
            console.warn("[ChatbotTuvan] Lấy sản phẩm lỗi:", err.message);
        }

        // 3. Build system prompt
        const systemContent = [
            config.systemPrompt,
            productContext ? `[SẢN PHẨM HIỆN CÓ]:\n${productContext}` : "",
            ragContext     ? `[NGỮ CẢNH BỔ SUNG]:\n${ragContext}`      : "",
        ].filter(Boolean).join("\n\n");

        // 4. Build messages
        const messages = [
            { role: "system", content: systemContent },
            ...conversationHistory.map((msg) => ({
                role: msg.role === "bot" ? "assistant" : msg.role,
                content: msg.content,
            })),
            { role: "user", content: userMessage },
        ];

        // 5. Gọi AI — xoay vòng apiKeys × models
        for (const apiKey of config.apiKeys) {
            for (const model of config.models) {
                try {
                    const response = await fetch(config.url, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ model, messages }),
                    });

                    const data = await response.json();

                    if (data.error) {
                        console.warn(`[ChatbotTuvan] ${model} / ...${apiKey.slice(-6)} lỗi:`, data.error.message);
                        continue;
                    }

                    const content = extractContent(data);
                    if (!content) {
                        console.warn(`[ChatbotTuvan] ${model} trả content rỗng, thử tiếp...`);
                        continue;
                    }

                    console.log(`[ChatbotTuvan] Dùng model: ${model}`);
                    return content;
                } catch (err) {
                    console.warn(`[ChatbotTuvan] ${model} exception:`, err.message);
                }
            }
        }

        throw new Error("Không có model nào phản hồi được");
    }
}

module.exports = new ChatbotTuvanService();