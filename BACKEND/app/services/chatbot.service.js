const chatbotConfig = require("../config/chatbot.config");

class ChatbotService {
    async chatWithAI(userMessage, productContext = "") {
        const { apiKey, url, model, systemPrompt } = chatbotConfig;

        const payload = {
            model,
            messages: [
                {
                    role: "system",
                    content: `${systemPrompt}\n\nDanh sách sản phẩm hiện có:\n${productContext}`
                },
                {
                    role: "user",
                    content: userMessage
                }
            ]
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return data.choices[0].message.content;
    }
}

module.exports = new ChatbotService();