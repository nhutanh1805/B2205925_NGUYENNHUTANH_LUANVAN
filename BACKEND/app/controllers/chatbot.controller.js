const chatbotService = require("../services/chatbot.service");
const ProductService = require("../services/product.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.ask = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) {
            return next(new ApiError(400, "Nội dung tin nhắn không được để trống"));
        }

        // 1. Khởi tạo ProductService với MongoDB client
        const productService = new ProductService(MongoDB.client);
        
        // 2. Gọi findAll. Theo code của bạn, nó trả về { products, pagination }
        // Mình truyền limit lớn một chút để AI có nhiều dữ liệu tư vấn hơn
        const result = await productService.findAll({ limit: 50 }); 
        const products = result.products || [];
        
        // 3. Chuẩn bị dữ liệu cho AI (chỉ lấy các thông tin cần thiết để tránh quá tải dữ liệu)
        const productInfo = products
            .map(p => `- ${p.name}: ${p.price.toLocaleString()} VNĐ (Loại: ${p.category})`)
            .join("\n");

        // 4. Gửi cho AI xử lý
        const reply = await chatbotService.chatWithAI(message, productInfo);
        
        return res.status(200).json({
            status: "success",
            reply: reply
        });

    } catch (error) {
        console.error("Chatbot Controller Error:", error);
        return next(new ApiError(500, "Lỗi chatbot: " + error.message));
    }
};