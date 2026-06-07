const OrderService = require("../services/order.service");
const CartService  = require("../services/cart.service");
const PointService = require("../services/point.service");
const MongoDB      = require("../utils/mongodb.util");
const ApiError     = require("../api-error");

exports.createOrder = async (req, res, next) => {
  const {
    userId, shippingAddress, phone, note,
    paymentMethod, items,
    pointsToUse = 0, // số điểm muốn dùng (0 = không dùng)
  } = req.body;

  if (!userId || !shippingAddress || !phone) {
    return next(new ApiError(400, "Thiếu thông tin bắt buộc"));
  }
  if (!items || items.length === 0) {
    return next(new ApiError(400, "Chưa chọn sản phẩm nào"));
  }

  try {
    const cartService  = new CartService(MongoDB.client);
    const orderService = new OrderService(MongoDB.client);
    const pointService = new PointService(MongoDB.client);

    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
    const originalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

    // ── Xử lý điểm ──
    let pointsUsed = 0;
    let discount   = 0;

    if (pointsToUse > 0) {
      const redeemResult = await pointService.redeemForOrder(
        userId,
        null, // orderId chưa có, cập nhật sau
        pointsToUse
      );
      pointsUsed = redeemResult.pointsUsed;
      discount   = redeemResult.discount;
    }

    const totalPrice = Math.max(0, originalPrice - discount);

    // ── Tạo đơn hàng ──
    const order = await orderService.createOrder({
      userId,
      items,
      totalQuantity,
      originalPrice, // giá gốc
      discount,      // tiền giảm
      pointsUsed,    // điểm đã dùng
      totalPrice,    // giá khách trả
      shippingAddress,
      phone,
      note: note || "",
      paymentMethod: paymentMethod || "COD",
    });

    // ── Cập nhật orderId vào transaction điểm vừa tạo ──
    if (pointsUsed > 0) {
      await pointService.Points.updateOne(
        { userId, type: "redeem", orderId: null },
        { $set: { orderId: order._id, note: `Dùng điểm giảm giá đơn hàng #${order._id}` } },
        // Lấy transaction mới nhất (createdAt giảm dần)
      );
    }

    // ── Xoá sản phẩm đã đặt khỏi giỏ ──
    for (const item of items) {
      await cartService.removeItem(userId, item.productId);
    }

    return res.status(201).json({
      message: "Đặt hàng thành công",
      data: order,
    });
  } catch (error) {
    return next(new ApiError(500, error.message || "Lỗi tạo đơn hàng"));
  }
};

exports.getOrdersByUser = async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return next(new ApiError(400, "Thiếu userId"));

  try {
    const orderService = new OrderService(MongoDB.client);
    const orders = await orderService.getOrdersByUser(userId);
    return res.json(orders);
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy danh sách đơn hàng"));
  }
};

exports.getOrderById = async (req, res, next) => {
  const { orderId } = req.params;
  if (!orderId) return next(new ApiError(400, "Thiếu orderId"));

  try {
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.findById(orderId);
    if (!order) return next(new ApiError(404, "Đơn hàng không tồn tại"));
    return res.json(order);
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy thông tin đơn hàng"));
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { status }  = req.body;

  const validStatuses = ["pending", "confirmed", "paid", "preparing", "shipping", "delivered", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return next(new ApiError(400, "Trạng thái không hợp lệ"));
  }

  try {
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.updateStatus(orderId, status);
    if (!order) return next(new ApiError(404, "Đơn hàng không tồn tại"));

    const pointService = new PointService(MongoDB.client);

    // Tích điểm khi giao hàng thành công (tính theo giá gốc, không phải giá sau giảm)
    if (status === "completed") {
      await pointService.earnFromOrder(
        order.userId,
        orderId,
        order.originalPrice ?? order.totalPrice
      );
    }

    // Hoàn điểm đã dùng khi đơn bị huỷ
    if (status === "cancelled" && order.pointsUsed > 0) {
      await pointService.refundRedeemedPoints(order.userId, orderId, order.pointsUsed);
    }

    return res.json({ message: "Cập nhật trạng thái thành công", data: order });
  } catch (error) {
    return next(new ApiError(500, "Lỗi cập nhật trạng thái: " + error.message));
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orderService = new OrderService(MongoDB.client);

    const {
      page = 1, limit = 10, status,
      sortBy = "createdAt", sortOrder = "desc",
    } = req.query;

    const result = await orderService.getAllOrders({ page, limit, status, sortBy, sortOrder });

    return res.json({
      message: "Lấy danh sách tất cả đơn hàng thành công",
      ...result,
    });
  } catch (error) {
    console.error("Lỗi getAllOrders controller:", error);
    return next(new ApiError(500, "Lỗi lấy danh sách đơn hàng: " + error.message));
  }
};