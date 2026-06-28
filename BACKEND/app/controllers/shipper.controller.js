const ShipperService = require("../services/shipper.service");
const PointService   = require("../services/point.service");
const MongoDB        = require("../utils/mongodb.util");
const ApiError       = require("../api-error");

// đăng ký
exports.createShipper = async (req, res, next) => {
  const { name, phone, email, password, vehicle } = req.body;
  if (!name || !phone || !email || !password)
    return next(new ApiError(400, "Thiếu thông tin bắt buộc (name, phone, email, password)"));

  try {
    const service = new ShipperService(MongoDB.client);
    const shipper = await service.createShipper({ name, phone, email, password, vehicle });
    return res.status(201).json({ message: "Tạo shipper thành công", data: shipper });
  } catch (err) {
    return next(new ApiError(400, err.message));
  }
};

// đăng nhập 
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ApiError(400, "Thiếu email hoặc mật khẩu"));

  try {
    const service = new ShipperService(MongoDB.client);
    const shipper = await service.login({ email, password });
    // Lưu vào session / trả về thông tin (tích hợp JWT nếu cần)
    return res.json({ message: "Đăng nhập thành công", data: shipper });
  } catch (err) {
    return next(new ApiError(401, err.message));
  }
};

exports.getAllShippers = async (req, res, next) => {
  try {
    const service   = new ShipperService(MongoDB.client);
    const shippers  = await service.getAllShippers();
    return res.json({ data: shippers });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

exports.getShipperById = async (req, res, next) => {
  const { shipperId } = req.params;
  try {
    const service = new ShipperService(MongoDB.client);
    const shipper = await service.findById(shipperId);
    if (!shipper) return next(new ApiError(404, "Shipper không tồn tại"));
    return res.json({ data: shipper });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

// gán đơn hàng cho shipper
exports.assignOrder = async (req, res, next) => {
  const { shipperId } = req.params;
  const { orderId }   = req.body;
  if (!orderId) return next(new ApiError(400, "Thiếu orderId"));

  try {
    const service = new ShipperService(MongoDB.client);
    const order   = await service.assignOrder(shipperId, orderId);
    return res.json({ message: "Gán đơn thành công", data: order });
  } catch (err) {
    return next(new ApiError(400, err.message));
  }
};

// lấy danh sách đơn của mình
exports.getMyOrders = async (req, res, next) => {
  const { shipperId } = req.params;
  const { status }    = req.query;

  try {
    const service = new ShipperService(MongoDB.client);
    const orders  = await service.getOrdersByShipper(shipperId, { status });
    return res.json({ data: orders });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  const { shipperId, orderId } = req.params;
  const { status, reason }     = req.body;

  if (!status) return next(new ApiError(400, "Thiếu status"));

  try {
    const shipperService = new ShipperService(MongoDB.client);
    const order = await shipperService.updateOrderStatus(shipperId, orderId, status, reason);

    if (status === "delivered") {
      const pointService = new PointService(MongoDB.client);
      await pointService.earnFromOrder(
        order.userId,
        orderId,
        order.originalPrice ?? order.totalPrice
      );
    }

    return res.json({ message: "Cập nhật thành công", data: order });
  } catch (err) {
    return next(new ApiError(400, err.message));
  }
};

exports.getStats = async (req, res, next) => {
  const { shipperId } = req.params;
  try {
    const service = new ShipperService(MongoDB.client);
    const stats   = await service.getStats(shipperId);
    return res.json({ data: stats });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

exports.updateShipperStatus = async (req, res, next) => {
  const { shipperId } = req.params;
  const { status }    = req.body;

  try {
    const service = new ShipperService(MongoDB.client);
    const shipper = await service.updateShipperStatus(shipperId, status);
    return res.json({ message: "Cập nhật trạng thái shipper thành công", data: shipper });
  } catch (err) {
    return next(new ApiError(400, err.message));
  }
};