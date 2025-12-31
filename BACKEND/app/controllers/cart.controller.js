const CartService = require("../services/cart.service");
const ProductService = require("../services/product.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.getCart = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) return next(new ApiError(400, "Thiếu userId"));

  try {
    const cartService = new CartService(MongoDB.client);
    const cart = await cartService.getCartByUser(userId);

    return res.json(cart || { items: [], totalQuantity: 0, totalPrice: 0 });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy giỏ hàng"));
  }
};

exports.addToCart = async (req, res, next) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId) {
    return next(new ApiError(400, "Thiếu userId hoặc productId"));
  }

  try {
    const productService = new ProductService(MongoDB.client);
    const product = await productService.findById(productId);

    if (!product || !product.isActive) {
      return next(new ApiError(404, "Sản phẩm không tồn tại"));
    }

    const cartService = new CartService(MongoDB.client);
    const cart = await cartService.addToCart(userId, product, quantity || 1);

    return res.json({ message: "Đã thêm vào giỏ hàng", data: cart });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

exports.updateQuantity = async (req, res, next) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || quantity === undefined) {
    return next(new ApiError(400, "Thiếu userId, productId hoặc quantity"));
  }

  try {
    const cartService = new CartService(MongoDB.client);
    const cart = await cartService.updateQuantity(userId, productId, quantity);

    return res.json({ message: "Cập nhật giỏ hàng thành công", data: cart });
  } catch (error) {
    return next(new ApiError(500, "Lỗi cập nhật số lượng"));
  }
};

exports.removeItem = async (req, res, next) => {
  const { userId } = req.body;
  const { productId } = req.params;

  if (!userId || !productId) {
    return next(new ApiError(400, "Thiếu userId hoặc productId"));
  }

  try {
    const cartService = new CartService(MongoDB.client);
    const cart = await cartService.removeItem(userId, productId);

    return res.json({ message: "Đã xóa sản phẩm", data: cart });
  } catch (error) {
    return next(new ApiError(500, "Lỗi xóa sản phẩm"));
  }
};

exports.clearCart = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) return next(new ApiError(400, "Thiếu userId"));

  try {
    const cartService = new CartService(MongoDB.client);
    await cartService.clearCart(userId);

    return res.json({ message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (error) {
    return next(new ApiError(500, "Lỗi xóa giỏ hàng"));
  }
};