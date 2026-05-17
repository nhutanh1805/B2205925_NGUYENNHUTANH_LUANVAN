const chatbotService    = require("../services/chatbot.service");
const ChatHistoryService = require("../services/chatHistory.service");
const ProductService     = require("../services/product.service");
const MongoDB            = require("../utils/mongodb.util");
const ApiError           = require("../api-error");

// POST /api/chatbot/ask
exports.ask = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message?.trim()) {
      return next(new ApiError(400, "Nội dung tin nhắn không được để trống"));
    }

    // Lấy userId từ middleware auth nếu có (không bắt buộc đăng nhập)
    const userId = req.user?.id || req.user?._id?.toString() || null;

    if (!userId && !sessionId) {
      return next(new ApiError(400, "Cần cung cấp sessionId nếu chưa đăng nhập"));
    }

    const client             = MongoDB.client;
    const productService     = new ProductService(client);
    const chatHistoryService = new ChatHistoryService(client);

    // 1. Lấy danh sách sản phẩm
    const result      = await productService.findAll({ limit: 50 });
    const products    = result.products || [];
    const productInfo = products
      .map((p) => `- ${p.name}: ${p.price.toLocaleString()} VNĐ (Loại: ${p.category})`)
      .join("\n");

    // 2. Lấy lịch sử hội thoại gần nhất (20 messages = 10 lượt)
    const history = await chatHistoryService.getRecentMessages(userId, sessionId, 20);

    // 3. Gọi AI
    const reply = await chatbotService.chatWithAI(message.trim(), productInfo, history);

    // 4. Lưu vào DB
    await chatHistoryService.appendMessages(userId, sessionId, message.trim(), reply);

    return res.status(200).json({ status: "success", reply });
  } catch (error) {
    console.error("Chatbot Controller Error:", error);
    return next(new ApiError(500, "Lỗi chatbot: " + error.message));
  }
};

// GET /api/chatbot/history?sessionId=xxx
exports.getHistory = async (req, res, next) => {
  try {
    const userId    = req.user?.id || req.user?._id?.toString() || null;
    const { sessionId } = req.query;

    if (!userId && !sessionId) {
      return next(new ApiError(400, "Cần cung cấp sessionId hoặc đăng nhập"));
    }

    const chatHistoryService = new ChatHistoryService(MongoDB.client);
    const messages = await chatHistoryService.getFullHistory(userId, sessionId);

    return res.status(200).json({ status: "success", data: messages });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy lịch sử: " + error.message));
  }
};

// DELETE /api/chatbot/history?sessionId=xxx
exports.clearHistory = async (req, res, next) => {
  try {
    const userId    = req.user?.id || req.user?._id?.toString() || null;
    const { sessionId } = req.query;

    if (!userId && !sessionId) {
      return next(new ApiError(400, "Cần cung cấp sessionId hoặc đăng nhập"));
    }

    const chatHistoryService = new ChatHistoryService(MongoDB.client);
    await chatHistoryService.clearHistory(userId, sessionId);

    return res.status(200).json({ status: "success", message: "Đã xoá lịch sử chat" });
  } catch (error) {
    return next(new ApiError(500, "Lỗi xoá lịch sử: " + error.message));
  }
};