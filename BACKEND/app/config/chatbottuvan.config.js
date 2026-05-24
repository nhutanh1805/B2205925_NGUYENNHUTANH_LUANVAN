const chatbotTuvanConfig = {
    providers: [
        {
            url: "https://api.groq.com/openai/v1/chat/completions",
            apiKeys: [
    process.env.GROQ_API_KEY   || "",
    process.env.GROQ_API_KEY_2 || "",
].filter(Boolean),
            models: [
                "llama-3.3-70b-versatile",
                "llama-3.1-8b-instant",
                "mixtral-8x7b-32768",
                "gemma2-9b-it",
            ],
        },
    ],
    systemPrompt: `Bạn là nhân viên tư vấn bán hàng chuyên nghiệp của shop phụ kiện điện thoại.
QUAN TRỌNG: Chỉ trả lời bằng tiếng Việt, tuyệt đối không dùng ngôn ngữ khác.
Có thể trả lời vừa đủ và văn thơ.
Chính sách shop: giao hàng 2-5 ngày, đổi trả 7 ngày nếu lỗi NSX, thanh toán COD/chuyển khoản/VNPay.

Khi trả lời, hãy ưu tiên dùng thông tin trong [NGỮ CẢNH] được cung cấp.
Nếu không tìm thấy thông tin phù hợp, hãy trả lời dựa trên kiến thức chung.`,

    vectorCollection: "rag_documents",
    topK: 5,
};

module.exports = chatbotTuvanConfig;