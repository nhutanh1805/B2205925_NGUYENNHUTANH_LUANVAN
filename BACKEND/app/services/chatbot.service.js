const chatbotConfig = require("../config/chatbot.config");

class ChatbotService {
  async chatWithAI(userMessage, productContext = "", conversationHistory = []) {
    const { apiKey, url, model, systemPrompt } = chatbotConfig;

    // Ghép lịch sử hội thoại + tin nhắn hiện tại
    const messages = [
      {
        role: "system",
        content: `${systemPrompt}\n\nDanh sách sản phẩm hiện có:\n${productContext}`,
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role === "bot" ? "assistant" : msg.role, // "bot" → "assistant" cho đúng chuẩn API
        content: msg.content,
      })),
      {
        role: "user",
        content: userMessage,
      },
    ];

    const payload = { model, messages };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    return data.choices[0].message.content;
  }
}

module.exports = new ChatbotService();