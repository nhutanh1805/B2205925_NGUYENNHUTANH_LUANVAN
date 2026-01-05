const { ObjectId } = require("mongodb");

class OrderService {
  constructor(client) {
    this.Order = client.db().collection("orders");
    this.User = client.db().collection("users");
  }

  async createOrder(orderData) {
    let userName = "";
    try {
      const user = await this.User.findOne({ _id: new ObjectId(orderData.userId) });
      if (user) {
        userName = user.name;
      }
    } catch (error) {
      console.error("Lỗi lấy user:", error);
    }

    const order = {
      userId: orderData.userId,
      userName, // lưu luôn tên người đặt
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
    try {
      const orders = await this.Order.aggregate([
        { $match: { userId: userId } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo"
          }
        },
        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            items: 1,
            totalQuantity: 1,
            totalPrice: 1,
            shippingAddress: 1,
            phone: 1,
            note: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            userName: { $ifNull: ["$userInfo.name", "$userName"] }
          }
        },
        { $sort: { createdAt: -1 } }
      ]).toArray();

      return orders;
    } catch (error) {
      console.error("Lỗi getOrdersByUser:", error);
      return [];
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

      let matchQuery = {};
      if (status && status.trim() !== "") {
        matchQuery.status = status.trim();
      }

      const sort = {};
      sort[sortBy || "createdAt"] = sortOrder === "asc" ? 1 : -1;

      const orders = await this.Order.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo"
          }
        },
        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            items: 1,
            totalQuantity: 1,
            totalPrice: 1,
            shippingAddress: 1,
            phone: 1,
            note: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            userName: { $ifNull: ["$userInfo.name", "$userName"] }
          }
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: limitNum }
      ]).toArray();

      const total = await this.Order.countDocuments(matchQuery);

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
      console.error("Lỗi getAllOrders:", error);
      throw error;
    }
  }

  async findById(orderId) {
    if (!orderId || orderId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
      return null;
    }

    try {
      const orders = await this.Order.aggregate([
        { $match: { _id: new ObjectId(orderId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo"
          }
        },
        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            items: 1,
            totalQuantity: 1,
            totalPrice: 1,
            shippingAddress: 1,
            phone: 1,
            note: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            userName: { $ifNull: ["$userInfo.name", "$userName"] }
          }
        }
      ]).toArray();

      return orders[0] || null;
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

      return await this.findById(orderId); 
    } catch (error) {
      console.error("Lỗi updateStatus:", error);
      return null;
    }
  }
}

module.exports = OrderService;
