const UserAuthService = require("../services/userAuth.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.register = async (req, res, next) => {
  if (!req.body?.email || !req.body?.password || !req.body?.name) {
    return next(new ApiError(400, "Thiếu thông tin user"));
  }

  try {
    const service = new UserAuthService(MongoDB.client);
    const result = await service.register(req.body);
    return res.status(201).json({
      message: "Tạo user thành công",
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
    const service = new UserAuthService(MongoDB.client);
    const user = await service.login(req.body.email, req.body.password);
    return res.json({
      message: "Đăng nhập user thành công",
      user,
    });
  } catch (error) {
    return next(new ApiError(401, error.message));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const service = new UserAuthService(MongoDB.client);
    const users = await service.findAll();
    return res.json(users);
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy danh sách user"));
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const service = new UserAuthService(MongoDB.client);
    const user = await service.updateProfile(req.params.id, req.body);

    if (!user) {
      return next(new ApiError(404, "Không tìm thấy user"));
    }

    return res.json({
      message: "Cập nhật thông tin cá nhân thành công",
      data: user,
    });
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const service = new UserAuthService(MongoDB.client);
    const result = await service.delete(req.params.id);

    if (!result) {
      return next(new ApiError(404, "Không tìm thấy user"));
    }

    return res.json({ message: "Xóa user thành công" });
  } catch (error) {
    return next(new ApiError(500, "Không thể xóa user"));
  }
};
