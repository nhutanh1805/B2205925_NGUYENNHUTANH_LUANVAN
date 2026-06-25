const SupportService = require("../services/support.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

const VALID_STATUSES = ["pending", "processing", "done", "rejected", "refunded"];

// KHÁCH HÀNG

exports.createRequest = async (req, res, next) => {
  const { userId, userName, type, orderId, reason, images, selectedProducts } = req.body;
  if (!userId || !type || !reason || !orderId)
    return next(new ApiError(400, "Thiếu thông tin bắt buộc"));
  if (!["warranty", "return"].includes(type))
    return next(new ApiError(400, "Loại yêu cầu không hợp lệ"));

  try {
    const service = new SupportService(MongoDB.client);
    const request = await service.createRequest(userId, {
      type,
      orderId,
      reason,
      images,
      userName,
      // selectedProducts: mảng sản phẩm khách chọn [{ productId, quantity, ... }]
      // sẽ được service đối chiếu lại với order thật trước khi lưu
      selectedProducts: Array.isArray(selectedProducts) ? selectedProducts : [],
    });
    return res.status(201).json({ message: "Gửi yêu cầu thành công", request });
  } catch (error) {
    // error có thể là { status, message } do service throw, hoặc lỗi hệ thống khác
    return next(new ApiError(error.status || 500, error.message || "Lỗi tạo yêu cầu"));
  }
};

exports.getEligibleOrders = async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return next(new ApiError(400, "Thiếu userId"));

  try {
    const service = new SupportService(MongoDB.client);
    const orders = await service.getEligibleOrders(userId);
    return res.json({ orders });
  } catch (error) {
    return next(new ApiError(error.status || 500, error.message || "Lỗi lấy danh sách đơn hàng"));
  }
};

exports.getMyRequests = async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return next(new ApiError(400, "Thiếu userId"));

  try {
    const service = new SupportService(MongoDB.client);
    const requests = await service.getMyRequests(userId);
    return res.json({ requests });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy danh sách yêu cầu"));
  }
};

exports.getRequestDetail = async (req, res, next) => {
  const { userId } = req.body;
  const { id } = req.params;

  try {
    const service = new SupportService(MongoDB.client);
    const request = await service.getRequestById(id, userId);
    if (!request) return next(new ApiError(404, "Không tìm thấy yêu cầu"));
    const messages = await service.getMessages(id);
    return res.json({ request, messages });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy chi tiết yêu cầu"));
  }
};

exports.sendMessage = async (req, res, next) => {
  const { id } = req.params;
  const { userId, senderName, content } = req.body;
  if (!content)
    return next(new ApiError(400, "Thiếu nội dung tin nhắn"));

  try {
    const service = new SupportService(MongoDB.client);
    const request = await service.getRequestById(id, userId);
    if (!request) return next(new ApiError(404, "Không tìm thấy yêu cầu"));

    const message = await service.sendMessage({
      requestId: id,
      senderId:   userId || null,
      senderName: senderName || "Khách",
      role:       "user",
      content,
    });
    return res.status(201).json({ message });
  } catch (error) {
    return next(new ApiError(500, "Lỗi gửi tin nhắn"));
  }
};

// ADMIN

exports.getAllRequests = async (req, res, next) => {
  const { status, type, page, limit } = req.query;

  try {
    const service = new SupportService(MongoDB.client);
    const data = await service.getAllRequests({
      status,
      type,
      page:  parseInt(page)  || 1,
      limit: parseInt(limit) || 20,
    });
    return res.json(data);
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy danh sách yêu cầu"));
  }
};

exports.updateStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;

  if (!VALID_STATUSES.includes(status))
    return next(new ApiError(400, "Trạng thái không hợp lệ"));

  try {
    const service = new SupportService(MongoDB.client);

    if (status === "refunded") {
      const request = await service.getRequestById(id);
      if (!request) return next(new ApiError(404, "Không tìm thấy yêu cầu"));
      if (request.type !== "return")
        return next(new ApiError(400, "Chỉ yêu cầu đổi trả mới có trạng thái hoàn tiền"));
    }

    const updated = await service.updateStatus(id, { status, adminNote });
    if (!updated) return next(new ApiError(404, "Không tìm thấy yêu cầu"));
    return res.json({ message: "Cập nhật thành công", request: updated });
  } catch (error) {
    return next(new ApiError(500, "Lỗi cập nhật trạng thái"));
  }
};

exports.getMessages = async (req, res, next) => {
  const { id } = req.params;
  try {
    const service = new SupportService(MongoDB.client);
    const messages = await service.getMessages(id);
    return res.json({ messages });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy tin nhắn"));
  }
};

exports.adminSendMessage = async (req, res, next) => {
  const { id } = req.params;
  const { senderName, content } = req.body;
  if (!content)
    return next(new ApiError(400, "Thiếu nội dung tin nhắn"));

  try {
    const service = new SupportService(MongoDB.client);
    const request = await service.getRequestById(id);
    if (!request) return next(new ApiError(404, "Không tìm thấy yêu cầu"));

    const message = await service.sendMessage({
      requestId: id,
      senderId:   null,
      senderName: senderName || "Admin",
      role:       "admin",
      content,
    });
    return res.status(201).json({ message });
  } catch (error) {
    return next(new ApiError(500, "Lỗi gửi tin nhắn"));
  }
};