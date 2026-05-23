const chatbotConfig = require("../config/chatbot.config");

let cachedModel = null;
let cacheTime = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 tiếng

async function pingModel(model) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const start = Date.now();

    try {
        const res = await fetch(chatbotConfig.url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${chatbotConfig.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                max_tokens: 1,
                messages: [{ role: "user", content: "hi" }],
            }),
            signal: controller.signal,
        });

        clearTimeout(timer);
        if (!res.ok) return null;

        return { model, latency: Date.now() - start };
    } catch {
        clearTimeout(timer);
        return null;
    }
}

// Tách riêng hàm refresh — dùng cho cả lần đầu lẫn background
async function refreshBestModel() {
    const results = await Promise.allSettled(
        chatbotConfig.models.map((m) => pingModel(m))
    );

    const alive = results
        .map((r) => r.value)
        .filter(Boolean)
        .sort((a, b) => a.latency - b.latency);

    if (!alive.length) return; // giữ cache cũ nếu ping thất bại

    cachedModel = alive[0].model;
    cacheTime = Date.now();

    console.log("[Chatbot] Model tốt nhất:", cachedModel);
}

async function findBestModel() {
    // Chưa có cache → chờ ping lần đầu
    if (!cachedModel) {
        await refreshBestModel();
        if (!cachedModel) throw new Error("Tất cả model đều không khả dụng");
        return cachedModel;
    }

    // Cache hết hạn → ping ngầm, không chặn request
    if (Date.now() - cacheTime > CACHE_TTL) {
        refreshBestModel(); // không await — chạy background
    }

    return cachedModel; // trả luôn cache hiện tại
}

// Trích content từ response — xử lý cả model reasoning
function extractContent(data) {
    const choice = data.choices?.[0];
    if (!choice) return null;

    const content = choice.message?.content;
    if (content && content.trim()) return content.trim();

    const reasoning = choice.message?.reasoning;
    if (reasoning && reasoning.trim()) return reasoning.trim();

    return null;
}

class ChatbotService {
    async chatWithAI(userMessage, productContext = "", conversationHistory = []) {
        const { apiKey, url, models, systemPrompt } = chatbotConfig;

        const messages = [
            {
                role: "system",
                content: `${systemPrompt}\n\nDanh sách sản phẩm hiện có:\n${productContext}`,
            },
            ...conversationHistory.map((msg) => ({
                role: msg.role === "bot" ? "assistant" : msg.role,
                content: msg.content,
            })),
            {
                role: "user",
                content: userMessage,
            },
        ];

        const bestModel = await findBestModel();
        const modelsToTry = [bestModel, ...models.filter((m) => m !== bestModel)];

        for (const model of modelsToTry) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ model, messages }),
                });

                const data = await response.json();

                if (data.error) {
                    console.warn(`[Chatbot] Model ${model} lỗi:`, data.error.message);
                    if (model === cachedModel) cachedModel = null;
                    continue;
                }

                const content = extractContent(data);

                if (!content) {
                    console.warn(`[Chatbot] Model ${model} trả content rỗng, thử model tiếp...`);
                    if (model === cachedModel) cachedModel = null;
                    continue;
                }

                return content;

            } catch (err) {
                console.warn(`[Chatbot] Model ${model} exception:`, err.message);
                if (model === cachedModel) cachedModel = null;
            }
        }

        throw new Error("Không có model nào phản hồi được");
    }
}

module.exports = new ChatbotService();