const PointService = require("../services/point.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Lấy số điểm hiện tại
exports.getBalance = async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return next(new ApiError(400, "Thiếu userId"));

  try {
    const pointService = new PointService(MongoDB.client);
    const balance = await pointService.getBalance(userId);
    return res.json({ balance });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy điểm"));
  }
};

// Lấy lịch sử giao dịch điểm
exports.getHistory = async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return next(new ApiError(400, "Thiếu userId"));

  try {
    const pointService = new PointService(MongoDB.client);
    const history = await pointService.getHistory(userId);
    return res.json({ history });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy lịch sử điểm"));
  }
};

// Tích điểm thủ công (gọi sau khi đơn hàng thành công)
exports.earnFromOrder = async (req, res, next) => {
  const { userId, orderId, orderTotal } = req.body;
  if (!userId || !orderTotal) return next(new ApiError(400, "Thiếu thông tin"));

  try {
    const pointService = new PointService(MongoDB.client);
    const transaction = await pointService.earnFromOrder(userId, orderId, orderTotal);
    const balance = await pointService.getBalance(userId);
    return res.json({ message: "Tích điểm thành công", transaction, balance });
  } catch (error) {
    return next(new ApiError(500, "Lỗi tích điểm"));
  }
};

// Dùng điểm
exports.redeem = async (req, res, next) => {
  const { userId, points, note } = req.body;
  if (!userId || !points) return next(new ApiError(400, "Thiếu thông tin"));

  try {
    const pointService = new PointService(MongoDB.client);
    const transaction = await pointService.redeem(userId, points, note);
    const balance = await pointService.getBalance(userId);
    return res.json({ message: "Đổi điểm thành công", transaction, balance });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};