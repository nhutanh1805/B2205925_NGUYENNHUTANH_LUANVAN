const { ObjectId } = require("mongodb");

class OrderService {
  constructor(client) {
    this.Order = client.db().collection("orders");
  }

  async createOrder(orderData) {
    const order = {
      userId: orderData.userId,
      items: orderData.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        images: item.images,
      })),
      totalQuantity: orderData.totalQuantity,
      totalPrice: orderData.totalPrice,
      shippingAddress: orderData.shippingAddress,
      phone: orderData.phone,
      note: orderData.note,
      status: "pending", 
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.Order.insertOne(order);
    order._id = result.insertedId;

    return order;
  }

  async getOrdersByUser(userId) {
    const orders = await this.Order.find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    return orders;
  }

  async findById(orderId) {
    if (!ObjectId.isValid(orderId)) return null;

    return await this.Order.findOne({ _id: new ObjectId(orderId) });
  }

  async updateStatus(orderId, status) {
    if (!ObjectId.isValid(orderId)) return null;

    const result = await this.Order.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: { status: status, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    return result.value;
  }
}

module.exports = OrderService;