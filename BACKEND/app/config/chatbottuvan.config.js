const chatbotTuvanConfig = {
    providers: [
        {
            url: "https://api.groq.com/openai/v1/chat/completions",
            apiKeys: [
                process.env.GROQ_API_KEY   || "",
                process.env.GROQ_API_KEY_2 || "",
                process.env.GROQ_API_KEY_3 || "",
            ].filter(Boolean),
            models: [
                "openai/gpt-oss-120b",     // fallback khi 2 model trên hết hạn
                "qwen/qwen3.6-27b",        // fallback khi 2 model trên hết hạn
                
            ],
        },
    ],
    systemPrompt: `Bạn là nhân viên tư vấn bán hàng chuyên nghiệp của shop phụ kiện điện thoại.
QUAN TRỌNG: Chỉ trả lời bằng tiếng Việt, tuyệt đối không dùng ngôn ngữ khác.
Có thể trả lời vừa đủ và văn thơ.
Hiện tại shop đang có 21 sản phẩm phụ kiện điện thoại.
Chính sách shop: giao hàng 2-5 ngày, đổi trả 7 ngày nếu lỗi NSX, thanh toán COD/chuyển khoản/VNPay.

Khi trả lời, hãy ưu tiên dùng thông tin trong [NGỮ CẢNH] được cung cấp.
Nếu không tìm thấy thông tin phù hợp, hãy trả lời dựa trên kiến thức chung.

BẠN CÓ THỂ:
- Tra điểm tích lũy của khách (get_point_balance)
- Xem hồ sơ khách: họ tên, SĐT, địa chỉ đã lưu (get_my_profile)
- Xem đơn hàng gần đây của khách (get_my_orders) hoặc tra 1 đơn cụ thể (get_order_status)
- Tìm sản phẩm để lấy đúng mã sản phẩm trước khi đặt hàng (search_product)
- Đặt hàng giúp khách (create_order) — CHỈ hỗ trợ thanh toán COD qua chat

QUY TẮC KHI ĐẶT HÀNG:
1. Luôn dùng search_product để lấy productId chính xác, không tự đoán hay bịa mã sản phẩm.
2. Khi cần địa chỉ/SĐT giao hàng: gọi get_my_profile trước. Nếu hồ sơ đã có sẵn địa chỉ/SĐT, đề xuất dùng luôn ("Giao đến {địa chỉ trong hồ sơ}, SĐT {sđt trong hồ sơ}, đúng không ạ?") thay vì bắt khách gõ lại. Chỉ hỏi nhập tay nếu khách muốn đổi địa chỉ khác hoặc hồ sơ chưa có thông tin.
3. Trước khi gọi create_order, PHẢI tóm tắt lại đơn hàng (sản phẩm, số lượng, tổng tiền, địa chỉ, SĐT) và hỏi khách xác nhận "có" thì mới được gọi tool.
4. Nếu khách chưa đăng nhập, báo khách cần đăng nhập để đặt hàng hoặc tra điểm/đơn hàng.
5. Không tự ý dùng điểm tích lũy nếu khách không yêu cầu.
6. Trước khi tóm tắt đơn hàng lần cuối để khách xác nhận (bước 3), luôn gọi get_point_balance để kiểm tra điểm hiện có của khách:
   - Nếu điểm > 0: chủ động hỏi khách có muốn dùng điểm để giảm giá cho đơn này không, tuyệt đối KHÔNG tự ý áp dụng khi khách chưa đồng ý.
   - Nếu điểm = 0 hoặc khách chưa đăng nhập: bỏ qua bước này, không nhắc gì đến điểm để tránh hỏi thừa.
   - Nếu khách đồng ý dùng điểm, hỏi rõ muốn dùng bao nhiêu điểm rồi mới đưa vào pointsToUse khi tóm tắt và gọi create_order.`,

    vectorCollection: "rag_documents",
    topK: 5,

    // Số vòng lặp tool-call tối đa cho 1 lượt chat (tránh model lặp vô hạn)
    maxToolSteps: 4,

    // Tool schema chuẩn OpenAI function-calling (Groq tương thích)
    tools: [
        {
            type: "function",
            function: {
                name: "get_point_balance",
                description: "Lấy số điểm tích lũy hiện tại của khách hàng đang chat (chỉ dùng được khi khách đã đăng nhập)",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "get_my_profile",
                description: "Lấy thông tin hồ sơ khách hàng đang chat (họ tên, số điện thoại, địa chỉ đã lưu). Dùng để đề xuất địa chỉ/SĐT có sẵn thay vì bắt khách nhập lại, giống trang thanh toán.",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "get_my_orders",
                description: "Lấy danh sách đơn hàng gần đây của khách hàng đang chat (chỉ dùng được khi khách đã đăng nhập)",
                parameters: { type: "object", properties: {}, required: [] },
            },
        },
        {
            type: "function",
            function: {
                name: "get_order_status",
                description: "Tra cứu trạng thái 1 đơn hàng cụ thể theo mã đơn",
                parameters: {
                    type: "object",
                    properties: {
                        orderId: { type: "string", description: "Mã đơn hàng (24 ký tự hex, ví dụ: 665f1a2b3c4d5e6f7a8b9c0d)" },
                    },
                    required: ["orderId"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "search_product",
                description: "Tìm sản phẩm theo tên/từ khóa để lấy đúng productId, giá, tồn kho trước khi đặt hàng",
                parameters: {
                    type: "object",
                    properties: {
                        query: { type: "string", description: "Từ khóa tên sản phẩm cần tìm" },
                    },
                    required: ["query"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "create_order",
                description: "Tạo đơn hàng mới cho khách (chỉ thanh toán COD). CHỈ gọi sau khi đã tóm tắt đơn hàng và khách xác nhận đồng ý đặt.",
                parameters: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            description: "Danh sách sản phẩm đặt mua, productId phải lấy từ kết quả search_product",
                            items: {
                                type: "object",
                                properties: {
                                    productId: { type: "string" },
                                    quantity: { type: "integer", minimum: 1 },
                                },
                                required: ["productId", "quantity"],
                            },
                        },
                        shippingAddress: { type: "string", description: "Địa chỉ giao hàng. Có thể bỏ trống nếu khách đồng ý dùng địa chỉ đã lưu trong hồ sơ (lấy qua get_my_profile) — hệ thống sẽ tự điền." },
                        phone: { type: "string", description: "Số điện thoại liên hệ. Có thể bỏ trống nếu khách đồng ý dùng SĐT đã lưu trong hồ sơ (lấy qua get_my_profile) — hệ thống sẽ tự điền." },
                        note: { type: "string", description: "Ghi chú thêm cho đơn (tùy chọn)" },
                        pointsToUse: { type: "integer", description: "Số điểm khách muốn dùng để giảm giá, 0 nếu không dùng", minimum: 0 },
                    },
                    required: ["items"],
                },
            },
        },
    ],
};

module.exports = chatbotTuvanConfig;