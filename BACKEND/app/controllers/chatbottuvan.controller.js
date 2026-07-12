const chatbotTuvanService = require("../services/chatbottuvan.service");
const ChatHistoryService  = require("../services/chatHistory.service");
const MongoDB             = require("../utils/mongodb.util");
const ApiError            = require("../api-error");

// POST /api/chatbottuvan/ask
exports.ask = async (req, res, next) => {
    try {
        const { message, sessionId, userId: bodyUserId } = req.body;

        if (!message?.trim()) {
            return next(new ApiError(400, "Nội dung tin nhắn không được để trống"));
        }

        const userId = bodyUserId || req.user?.id || req.user?._id?.toString() || null;

        if (!userId && !sessionId) {
            return next(new ApiError(400, "Cần cung cấp sessionId nếu chưa đăng nhập"));
        }

        const client             = MongoDB.client;
        const chatHistoryService = new ChatHistoryService(client);

        // 1. Lấy lịch sử hội thoại gần nhất (20 messages = 10 lượt)
        const history = await chatHistoryService.getRecentMessages(userId, sessionId, 20);

        // 2. Gọi AI có RAG + tool-calling (truyền client để tạo OrderService/PointService bên trong)
        const reply = await chatbotTuvanService.chatWithAI(client, message.trim(), history, userId);

        // 3. Lưu vào DB
        await chatHistoryService.appendMessages(userId, sessionId, message.trim(), reply);

        return res.status(200).json({ status: "success", reply });
    } catch (error) {
        console.error("ChatbotTuvan Controller Error:", error);
        return next(new ApiError(500, "Lỗi chatbot tư vấn: " + error.message));
    }
};

// GET /api/chatbottuvan/history?sessionId=xxx&userId=xxx
exports.getHistory = async (req, res, next) => {
    try {
        const { sessionId, userId: queryUserId } = req.query;
        const userId = queryUserId || req.user?.id || req.user?._id?.toString() || null;

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

// DELETE /api/chatbottuvan/history?sessionId=xxx&userId=xxx
exports.clearHistory = async (req, res, next) => {
    try {
        const { sessionId, userId: queryUserId } = req.query;
        const userId = queryUserId || req.user?.id || req.user?._id?.toString() || null;

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