const chatbotTuvanConfig = {
     apiKeys: [
        process.env.OPENROUTER_API_KEY   || "",
        process.env.OPENROUTER_API_KEY_2 || "",
        process.env.OPENROUTER_API_KEY_3 || "",
    ].filter(Boolean),
    url: "https://openrouter.ai/api/v1/chat/completions",
    models: [
        "meta-llama/llama-3.3-70b-instruct:free",
        "meta-llama/llama-3.1-8b-instruct:free",
        "nvidia/nemotron-3-super-120b-a12b:free",
        "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        "tencent/hy3-preview:free",
        "inclusionai/ling-2.6-1t:free",
        "arcee-ai/trinity-large-thinking:free",
        "poolside/laguna-m.1:free",
        "deepseek/deepseek-v4-flash:free",
        "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "google/gemma-3-12b-it:free",
    "qwen/qwen3-14b:free",
    "qwen/qwen3-8b:free",
    "deepseek/deepseek-v4-flash:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "arcee-ai/trinity-large-thinking:free",
    ],
    systemPrompt: `Bạn là nhân viên tư vấn bán hàng chuyên nghiệp của shop điện thoại/điện tử.
QUAN TRỌNG: Chỉ trả lời bằng tiếng Việt, tuyệt đối không dùng ngôn ngữ khác.
Hãy trả lời ngắn gọn, thân thiện.
Chính sách shop: giao hàng 2-5 ngày, đổi trả 7 ngày nếu lỗi NSX, thanh toán COD/chuyển khoản/VNPay.

Khi trả lời, hãy ưu tiên dùng thông tin trong [NGỮ CẢNH] được cung cấp.
Nếu không tìm thấy thông tin phù hợp, hãy trả lời dựa trên kiến thức chung.`,

    vectorCollection: "rag_documents",
    topK: 5,
};

module.exports = chatbotTuvanConfig;