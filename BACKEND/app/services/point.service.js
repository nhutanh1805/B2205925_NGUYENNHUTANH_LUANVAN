const { ObjectId } = require("mongodb");

const POINT_TO_VND = 100;         // 1 điểm = 100₫
const MAX_REDEEM_PER_ORDER = 5000; // tối đa 5.000 điểm/đơn = 500.000₫

class PointService {
  constructor(client) {
    this.Points = client.db().collection("point_transactions");
  }

  // Lấy tổng điểm hiện tại của user
  async getBalance(userId) {
    const result = await this.Points.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]).toArray();

    return result[0]?.total || 0;
  }

  // Lấy lịch sử giao dịch điểm
  async getHistory(userId, limit = 20) {
    return this.Points.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  // Tích điểm khi đặt hàng thành công
  // Tỉ lệ: 1.000đ = 1 điểm (tính theo giá gốc, không phải giá sau giảm)
  async earnFromOrder(userId, orderId, orderTotal) {
    const points = Math.floor(orderTotal / 1000);
    if (points <= 0) return null;

    const transaction = {
      userId,
      orderId: orderId ? new ObjectId(orderId) : null,
      type: "earn",
      points,
      note: `Tích điểm đơn hàng #${orderId}`,
      createdAt: new Date(),
    };

    await this.Points.insertOne(transaction);
    return transaction;
  }

  // Hoàn điểm khi đơn hàng bị huỷ (hoàn điểm tích)
  async refundFromOrder(userId, orderId, orderTotal) {
    const points = Math.floor(orderTotal / 1000);
    if (points <= 0) return null;

    const transaction = {
      userId,
      orderId: orderId ? new ObjectId(orderId) : null,
      type: "refund",
      points: -points,
      note: `Hoàn điểm đơn hàng huỷ #${orderId}`,
      createdAt: new Date(),
    };

    await this.Points.insertOne(transaction);
    return transaction;
  }

  // Dùng điểm để đổi ưu đãi thủ công (không gắn đơn hàng)
  async redeem(userId, points, note = "Đổi điểm") {
    const balance = await this.getBalance(userId);
    if (balance < points) throw new Error("Không đủ điểm");

    const transaction = {
      userId,
      orderId: null,
      type: "redeem",
      points: -points,
      note,
      createdAt: new Date(),
    };

    await this.Points.insertOne(transaction);
    return transaction;
  }

  // Dùng điểm khi thanh toán đơn hàng
  // Tự động giới hạn MAX_REDEEM_PER_ORDER
  async redeemForOrder(userId, orderId, pointsRequested) {
    const capped   = Math.min(pointsRequested, MAX_REDEEM_PER_ORDER);
    const discount = capped * POINT_TO_VND;

    const balance = await this.getBalance(userId);
    if (balance < capped) throw new Error("Không đủ điểm");

    const transaction = {
      userId,
      orderId: orderId ? new ObjectId(orderId) : null,
      type: "redeem",
      points: -capped,
      note: `Dùng điểm giảm giá đơn hàng #${orderId ?? "mới"}`,
      createdAt: new Date(),
    };

    await this.Points.insertOne(transaction);
    return { transaction, pointsUsed: capped, discount };
  }

  // Hoàn lại điểm đã dùng khi đơn bị huỷ
  async refundRedeemedPoints(userId, orderId, points) {
    if (!points || points <= 0) return null;

    const transaction = {
      userId,
      orderId: orderId ? new ObjectId(orderId) : null,
      type: "refund",
      points: +points,
      note: `Hoàn điểm đã dùng do huỷ đơn #${orderId}`,
      createdAt: new Date(),
    };

    await this.Points.insertOne(transaction);
    return transaction;
  }
}

module.exports = PointService;