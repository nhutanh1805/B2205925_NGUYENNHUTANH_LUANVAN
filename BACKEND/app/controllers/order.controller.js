const OrderService = require("../services/order.service");
const CartService = require("../services/cart.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.createOrder = async (req, res, next) => {
  const { userId, shippingAddress, phone, note } = req.body;

  if (!userId || !shippingAddress || !phone) {
    return next(new ApiError(400, "Thiếu thông tin bắt buộc: userId, shippingAddress hoặc phone"));
  }

  try {
    const cartService = new CartService(MongoDB.client);
    const orderService = new OrderService(MongoDB.client);

    const cart = await cartService.getCartByUser(userId);

    if (!cart || cart.items.length === 0) {
      return next(new ApiError(400, "Giỏ hàng trống"));
    }

    const order = await orderService.createOrder({
      userId,
      items: cart.items,
      totalQuantity: cart.totalQuantity,
      totalPrice: cart.totalPrice,
      shippingAddress,
      phone,
      note: note || "",
    });

    await cartService.clearCart(userId);

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
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return next(new ApiError(400, "Trạng thái không hợp lệ"));
  }

  try {
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.updateStatus(orderId, status);

    if (!order) return next(new ApiError(404, "Đơn hàng không tồn tại"));

    return res.json({ message: "Cập nhật trạng thái thành công", data: order });
  } catch (error) {
    return next(new ApiError(500, "Lỗi cập nhật trạng thái"));
  }
};