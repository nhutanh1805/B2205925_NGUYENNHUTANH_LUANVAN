const DeliveryService = require("../services/delivery.service");
const MongoDB         = require("../utils/mongodb.util");
const ApiError        = require("../api-error");

// Lấy danh sách tất cả delivery (admin)
exports.getAllDeliveries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, shipperId } = req.query;
    const service = new DeliveryService(MongoDB.client);
    const result  = await service.getAllDeliveries({ page, limit, status, shipperId });
    return res.json({ message: "Lấy danh sách giao hàng thành công", ...result });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

// Lịch sử giao hàng của 1 đơn
exports.getDeliveriesByOrder = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const service    = new DeliveryService(MongoDB.client);
    const deliveries = await service.getDeliveriesByOrder(orderId);
    return res.json({ data: deliveries });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

// Thống kê theo shipper
exports.getStatsByShipper = async (req, res, next) => {
  const { shipperId } = req.params;
  try {
    const service = new DeliveryService(MongoDB.client);
    const stats   = await service.getStatsByShipper(shipperId);
    return res.json({ data: stats });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};