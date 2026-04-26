class ChatbotService {
    async chatWithAI(userMessage, productContext = "") {
        const apiKey = "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"; 
        const url = "https://openrouter.ai/api/v1/chat/completions";

        const payload = {
            // SỬA CHÍNH XÁC DÒNG NÀY - Đây là model ổn định nhất của OpenRouter
            model: "meta-llama/llama-3-8b-instruct:free", 
            messages: [
                {
                    role: "system",
                    content: `Bạn là nhân viên tư vấn bán hàng chuyên nghiệp. Đây là danh sách sản phẩm: ${productContext}`
                },
                {
                    role: "user",
                    content: userMessage
                }
            ]
        };

        try {
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
        } catch (error) {
            console.error("Lỗi:", error.message);
            throw error;
        }
    }
}

module.exports = new ChatbotService();