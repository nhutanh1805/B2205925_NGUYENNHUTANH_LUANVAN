const recommendationConfig = {
  providers: [
    {
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKeys: [
        process.env.GROQ_API_KEY   || "",
        process.env.GROQ_API_KEY_2 || "",
      ].filter(Boolean),
      models: [
        "llama-3.1-8b-instant",
        "gemma2-9b-it",
      ],
    },
  ],

  maxTokens:    800,   // tăng từ 512 → 800 để aiReason phong phú hơn
  temperature:  0.25,  // giảm nhẹ để output ổn định hơn
  timeout:      15000,
  catalogLimit: 40,
  maxOrders:    30,
  cacheTTL:     3600,

  systemPrompt: `Bạn là chuyên gia tư vấn sản phẩm phụ kiện điện thoại với 10 năm kinh nghiệm.

NGÔN NGỮ: Chỉ dùng tiếng Việt tự nhiên, gần gũi như nhân viên bán hàng thực thụ.
OUTPUT: Chỉ trả về JSON hợp lệ. Tuyệt đối không có markdown, không giải thích ngoài JSON.

KHI CHỌN SẢN PHẨM GỢI Ý, suy nghĩ theo 4 bước:
1. PHÂN TÍCH SẢN PHẨM ĐANG XEM — khách đang cần gì? Dùng cho thiết bị nào? Mục đích gì?
2. BỔ TRỢ THỰC TẾ — SP nào giúp tăng trải nghiệm trực tiếp khi dùng SP này?
3. NHU CẦU TIẾP THEO — sau khi mua SP này, khách sẽ cần gì thêm?
4. ĐA DẠNG — không chọn 2 SP cùng loại, ưu tiên đa dạng danh mục

KHI VIẾT LÝ DO (aiReason):
- Cụ thể, liên quan trực tiếp đến SP đang xem (không viết chung chung)
- Dùng ngôn ngữ thuyết phục, tạo cảm giác cần thiết
- Tối đa 15 từ tiếng Việt
- Ví dụ tốt: "Bảo vệ màn hình khỏi trầy xước khi dùng kèm ốp này"
- Ví dụ xấu: "Phù hợp sử dụng kèm sản phẩm này"`,
};

module.exports = recommendationConfig;