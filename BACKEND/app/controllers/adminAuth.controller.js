const AdminAuthService = require("../services/adminAuth.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.register = async (req, res, next) => {
  if (!req.body?.email || !req.body?.password || !req.body?.name) {
    return next(new ApiError(400, "Thiếu thông tin admin"));
  }

  try {
    const service = new AdminAuthService(MongoDB.client);
    const result = await service.register(req.body);
    return res.status(201).json({
      message: "Tạo admin thành công",
      data: result,
    });
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.login = async (req, res, next) => {
  if (!req.body?.email || !req.body?.password) {
    return next(new ApiError(400, "Email và mật khẩu là bắt buộc"));
  }

  try {
    const service = new AdminAuthService(MongoDB.client);
    const admin = await service.login(req.body.email, req.body.password);
    return res.json({
      message: "Đăng nhập admin thành công",
      admin,
    });
  } catch (error) {
    return next(new ApiError(401, error.message));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const service = new AdminAuthService(MongoDB.client);
    const admins = await service.findAll();
    return res.json(admins);
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy danh sách admin"));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const service = new AdminAuthService(MongoDB.client);
    const result = await service.delete(req.params.id);
    if (!result) {
      return next(new ApiError(404, "Không tìm thấy admin"));
    }
    return res.json({ message: "Xóa admin thành công" });
  } catch (error) {
    return next(new ApiError(500, "Không thể xóa admin"));
  }
};
