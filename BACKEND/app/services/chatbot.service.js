const chatbotConfig = require("../config/chatbot.config");

let cachedModel = null;
let cacheTime = null;
const CACHE_TTL = 60 * 60 * 1000;

async function pingModel(model) {
    for (const apiKey of chatbotConfig.apiKeys) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const start = Date.now();

        try {
            const res = await fetch(chatbotConfig.url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
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
            if (res.ok) return { model, latency: Date.now() - start };
        } catch {
            clearTimeout(timer);
        }
    }
    return null;
}

async function refreshBestModel() {
    const results = await Promise.allSettled(
        chatbotConfig.models.map((m) => pingModel(m))
    );

    const alive = results
        .map((r) => r.value)
        .filter(Boolean)
        .sort((a, b) => a.latency - b.latency);

    if (!alive.length) return;

    cachedModel = alive[0].model;
    cacheTime = Date.now();

    console.log("[Chatbot] Model tốt nhất:", cachedModel);
}

async function findBestModel() {
    if (!cachedModel) {
        await refreshBestModel();
        if (!cachedModel) throw new Error("Tất cả model đều không khả dụng");
        return cachedModel;
    }

    if (Date.now() - cacheTime > CACHE_TTL) {
        refreshBestModel();
    }

    return cachedModel;
}

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
        const { apiKeys, url, models, systemPrompt } = chatbotConfig;

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
            for (const apiKey of apiKeys) {
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
                        console.warn(`[Chatbot] ${model} / ...${apiKey.slice(-6)} lỗi:`, data.error.message);
                        if (model === cachedModel) cachedModel = null;
                        continue;
                    }

                    const content = extractContent(data);
                    if (!content) {
                        console.warn(`[Chatbot] ${model} trả content rỗng, thử tiếp...`);
                        if (model === cachedModel) cachedModel = null;
                        continue;
                    }

                    console.log(`[Chatbot] Dùng model: ${model}`);
                    return content;
                } catch (err) {
                    console.warn(`[Chatbot] ${model} exception:`, err.message);
                    if (model === cachedModel) cachedModel = null;
                }
            }
        }

        throw new Error("Không có model nào phản hồi được");
    }
}

module.exports = new ChatbotService();