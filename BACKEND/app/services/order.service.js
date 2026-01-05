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
    if (!orderId || orderId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
      return null;
    }

    try {
      return await this.Order.findOne({ _id: new ObjectId(orderId) });
    } catch (error) {
      console.error("Lỗi findById:", error);
      return null;
    }
  }

  async updateStatus(orderId, status) {
    if (!orderId || orderId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
      return null;
    }

    try {
      const filter = { _id: new ObjectId(orderId) };

      const updateResult = await this.Order.updateOne(filter, {
        $set: { status: status, updatedAt: new Date() }
      });

      if (updateResult.matchedCount === 0) {
        return null;
      }
      
      return await this.Order.findOne(filter);
    } catch (error) {
      console.error("Lỗi updateStatus:", error);
      return null;
    }
  }

  async getAllOrders({
    page = 1,
    limit = 10,
    status,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = {}) {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = Math.min(parseInt(limit) || 10, 100);
      const skip = (pageNum - 1) * limitNum;

      let query = {};
      if (status && status.trim() !== "") {
        query.status = status.trim();
      }

      const sort = {};
      sort[sortBy || "createdAt"] = sortOrder === "asc" ? 1 : -1;

      const orders = await this.Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .toArray();

      const total = await this.Order.countDocuments(query);

      return {
        data: orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OrderService;