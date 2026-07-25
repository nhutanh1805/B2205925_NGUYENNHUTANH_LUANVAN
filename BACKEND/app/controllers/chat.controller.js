const ChatService = require("../services/chat.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// ─── KHÁCH HÀNG ─────────────────────────────────────────────

// Lấy tin nhắn của chính mình
exports.getMyMessages = async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return next(new ApiError(400, "Thiếu userId"));

  try {
    const service = new ChatService(MongoDB.client);
    const messages = await service.getMessages(userId);
    return res.json({ messages });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy tin nhắn"));
  }
};

// Khách gửi tin nhắn
exports.sendMessage = async (req, res, next) => {
  const { userId, senderName, content } = req.body;
  if (!userId)  return next(new ApiError(400, "Thiếu userId"));
  if (!content) return next(new ApiError(400, "Thiếu nội dung tin nhắn"));

  try {
    const service = new ChatService(MongoDB.client);
    const message = await service.sendMessage({
      userId,
      senderId:   userId,
      senderName: senderName || "Khách",
      role:       "user",
      content,
    });
    return res.status(201).json({ message });
  } catch (error) {
    if (error.isBadWord) {
      return next(new ApiError(400, error.message));
    }
    return next(new ApiError(500, "Lỗi gửi tin nhắn"));
  }
};

// ─── ADMIN ──────────────────────────────────────────────────

// Danh sách hội thoại
exports.getConversations = async (req, res, next) => {
  try {
    const service = new ChatService(MongoDB.client);
    const conversations = await service.getConversations();
    return res.json({ conversations });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy danh sách hội thoại"));
  }
};

// Admin xem tin nhắn của 1 khách
exports.getMessagesByUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const service = new ChatService(MongoDB.client);
    const [messages, user] = await Promise.all([
      service.getMessages(userId),
      service.getUserInfo(userId),
    ]);
    await service.markAsRead(userId);
    return res.json({
      messages,
      user: user || { userId, name: "Khách", email: null },
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy tin nhắn"));
  }
};

exports.adminSendMessage = async (req, res, next) => {
  const { userId } = req.params;
  const { adminId, adminName, content } = req.body;
  if (!adminId) return next(new ApiError(400, "Thiếu adminId"));
  if (!content) return next(new ApiError(400, "Thiếu nội dung tin nhắn"));

  try {
    const service = new ChatService(MongoDB.client);
    const message = await service.sendMessage({
      userId,
      senderId:   adminId,
      senderName: adminName || "Admin",
      role:       "admin",
      content,
    });
    return res.status(201).json({ message });
  } catch (error) {
    if (error.isBadWord) {
      return next(new ApiError(400, error.message));
    }
    return next(new ApiError(500, "Lỗi gửi tin nhắn"));
  }
};