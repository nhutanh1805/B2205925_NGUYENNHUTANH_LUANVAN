const chatbotConfig = {
    apiKey: process.env.OPENROUTER_API_KEY || "",
    url: "https://openrouter.ai/api/v1/chat/completions",
    models: [
        "nvidia/nemotron-3-super-120b-a12b:free",
        "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        "tencent/hy3-preview:free",
        "inclusionai/ling-2.6-1t:free",
    ],
    systemPrompt: `Bạn là nhân viên tư vấn bán hàng chuyên nghiệp của shop điện thoại/điện tử.
Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt.
Chính sách shop: giao hàng 2-5 ngày, đổi trả 7 ngày nếu lỗi NSX, thanh toán COD/chuyển khoản/VNPay.`,
};

module.exports = chatbotConfig;