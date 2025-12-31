const { ObjectId } = require("mongodb");

class CartService {
  constructor(client) {
    this.Cart = client.db().collection("carts");
  }

  async getCartByUser(userId) {
    let cart = await this.Cart.findOne({ userId: userId });

    if (!cart) {
      cart = { userId: userId, items: [], totalQuantity: 0, totalPrice: 0 };
      await this.Cart.insertOne(cart);
    }

    return cart;
  }

  async addToCart(userId, product, quantity = 1) {
    if (!ObjectId.isValid(product._id)) throw new Error("productId không hợp lệ");

    const productId = new ObjectId(product._id);

    let cart = await this.getCartByUser(userId);

    const existingItem = cart.items.find(item => item.productId.equals(productId));

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: product.salePrice || product.price,
        quantity,
        images: product.images || [],
      });
    }

    cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    await this.Cart.updateOne(
      { userId: userId },
      { $set: cart },
      { upsert: true }
    );

    return cart;
  }

  async updateQuantity(userId, productId, quantity) {
    if (!ObjectId.isValid(productId)) throw new Error("productId không hợp lệ");

    const prodObjectId = new ObjectId(productId);

    let cart = await this.getCartByUser(userId);

    const item = cart.items.find(i => i.productId.equals(prodObjectId));
    if (!item) throw new Error("Sản phẩm không tồn tại trong giỏ hàng");

    item.quantity = quantity;

    cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    await this.Cart.updateOne({ userId: userId }, { $set: cart });

    return cart;
  }

  async removeItem(userId, productId) {
    if (!ObjectId.isValid(productId)) throw new Error("productId không hợp lệ");

    const prodObjectId = new ObjectId(productId);

    let cart = await this.getCartByUser(userId);

    cart.items = cart.items.filter(i => !i.productId.equals(prodObjectId));

    cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    await this.Cart.updateOne({ userId: userId }, { $set: cart });

    return cart;
  }

  async clearCart(userId) {
    await this.Cart.updateOne(
      { userId: userId },
      { $set: { items: [], totalQuantity: 0, totalPrice: 0 } }
    );
  }
}

module.exports = CartService;