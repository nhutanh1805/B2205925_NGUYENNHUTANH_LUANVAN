const ForumService = require("../services/forum.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Lấy tin nhắn (load ban đầu, hoặc load thêm khi polling nếu có ?since=)
exports.getMessages = async (req, res, next) => {
  const { since } = req.query;

  try {
    const service = new ForumService(MongoDB.client);
    const messages = since
      ? await service.getMessagesSince(since)
      : await service.getMessages();
    return res.json({ messages });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy tin nhắn diễn đàn"));
  }
};

// Đăng tin nhắn mới
exports.createMessage = async (req, res, next) => {
  const { userId, userName, content } = req.body;
  if (!userId) return next(new ApiError(400, "Thiếu userId"));
  if (!content?.trim()) return next(new ApiError(400, "Thiếu nội dung tin nhắn"));
  if (content.length > 1000) return next(new ApiError(400, "Nội dung quá dài (tối đa 1000 ký tự)"));

  try {
    const service = new ForumService(MongoDB.client);
    const message = await service.createMessage({
      userId,
      userName: userName || "Ẩn danh",
      content: content.trim(),
    });
    return res.status(201).json({ message });
  } catch (error) {
    return next(new ApiError(500, "Lỗi đăng tin nhắn"));
  }
};