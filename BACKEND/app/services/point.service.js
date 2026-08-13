const { ObjectId } = require("mongodb");

const POINT_TO_VND = 100;
const POINT_EXPIRY_DAYS = 15;
const POINT_EXPIRY_MS = POINT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

class PointService {
  constructor(client) {
    this.Points = client.db().collection("point_transactions");
  }

  async getBalance(userId) {
    const result = await this.Points.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]).toArray();

    return result[0]?.total || 0;
  }

  async getHistory(userId, limit = 20) {
    return this.Points.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  async getActiveBatches(userId) {
    const now = Date.now();

    const batches = await this.Points.find({
      userId,
      remainingPoints: { $gt: 0 },
    })
      .sort({ expiresAt: 1 })
      .toArray();

    return batches.map((b) => {
      const expiresAt = b.expiresAt || null;
      const daysLeft = expiresAt
        ? Math.ceil((new Date(expiresAt).getTime() - now) / (24 * 60 * 60 * 1000))
        : null;

      return {
        _id: b._id,
        points: b.remainingPoints,
        createdAt: b.createdAt,
        expiresAt,
        daysLeft,
        note: b.note,
      };
    });
  }

  async _consumePoints(userId, amount) {
    let remaining = amount;

    const sources = await this.Points.find({
      userId,
      points: { $gt: 0 },
      remainingPoints: { $gt: 0 },
    })
      .sort({ createdAt: 1 })
      .toArray();

    const ops = [];
    for (const doc of sources) {
      if (remaining <= 0) break;
      const take = Math.min(doc.remainingPoints, remaining);
      ops.push(
        this.Points.updateOne({ _id: doc._id }, { $inc: { remainingPoints: -take } })
      );
      remaining -= take;
    }
    await Promise.all(ops);

    if (remaining > 0) {
      console.warn(
        `[Point] User ${userId} thiếu ${remaining} điểm remainingPoints khi trừ FIFO (kiểm tra dữ liệu cũ)`
      );
    }
  }

  async earnFromOrder(userId, orderId, orderTotal) {
    const points = Math.floor(orderTotal / 1000);
    if (points <= 0) return null;

    if (orderId) {
      const existed = await this.Points.findOne({
        userId,
        orderId: new ObjectId(orderId),
        type: "earn",
      });
      if (existed) return null;
    }

    const createdAt = new Date();
    const transaction = {
      userId,
      orderId: orderId ? new ObjectId(orderId) : null,
      type: "earn",
      points,
      remainingPoints: points,
      expiresAt: new Date(createdAt.getTime() + POINT_EXPIRY_MS),
      note: `Tích điểm đơn hàng #${orderId}`,
      createdAt,
    };

    await this.Points.insertOne(transaction);
    return transaction;
  }

  async refundFromOrder(userId, orderId, orderTotal) {
    const points = Math.floor(orderTotal / 1000);
    if (points <= 0) return null;

    if (orderId) {
      const earnTx = await this.Points.findOne({
        userId,
        orderId: new ObjectId(orderId),
        type: "earn",
      });
      if (earnTx) {
        const deduct = Math.min(points, earnTx.remainingPoints ?? earnTx.points);
        await this.Points.updateOne(
          { _id: earnTx._id },
          { $inc: { remainingPoints: -deduct } }
        );
      }
    }

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

  async redeem(userId, points, note = "Đổi điểm") {
    const balance = await this.getBalance(userId);
    if (balance < points) throw new Error("Không đủ điểm");

    await this._consumePoints(userId, points);

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

  // ─── Dùng điểm giảm giá cho đơn hàng ─────────────────────────────────────
  // QUY TẮC: điểm chỉ được dùng để giảm TỐI ĐA 20% giá trị đơn hàng
  // (1 điểm = 100 VNĐ). Nếu số điểm khách yêu cầu (pointsRequested) vượt mức
  // này, tự động cắt xuống còn đúng mức tối đa (capped) và báo lại qua
  // wasCapped/maxAllowed để tầng gọi (vd: chatbot) biết mà thông báo khách,
  // tránh trường hợp khách tưởng đã dùng hết điểm nhưng thực ra bị giới hạn.
  async redeemForOrder(userId, orderId, pointsRequested, orderTotal) {
    const maxByOrder = Math.floor((orderTotal * 0.2) / POINT_TO_VND);
    const capped = Math.min(pointsRequested, maxByOrder);
    const discount = capped * POINT_TO_VND;
    const wasCapped = pointsRequested > maxByOrder;

    const balance = await this.getBalance(userId);
    if (balance < capped) throw new Error("Không đủ điểm");

    await this._consumePoints(userId, capped);

    const transaction = {
      userId,
      orderId: orderId ? new ObjectId(orderId) : null,
      type: "redeem",
      points: -capped,
      note: `Dùng điểm giảm giá đơn hàng #${orderId ?? "mới"}`,
      createdAt: new Date(),
    };

    await this.Points.insertOne(transaction);
    return {
      transaction,
      pointsUsed: capped,
      discount,
      maxAllowed: maxByOrder,
      wasCapped,
    };
  }

  async refundRedeemedPoints(userId, orderId, points) {
    if (!points || points <= 0) return null;

    const createdAt = new Date();
    const transaction = {
      userId,
      orderId: orderId ? new ObjectId(orderId) : null,
      type: "refund",
      points: +points,
      remainingPoints: points,
      expiresAt: new Date(createdAt.getTime() + POINT_EXPIRY_MS),
      note: `Hoàn điểm đã dùng do huỷ đơn #${orderId}`,
      createdAt,
    };

    await this.Points.insertOne(transaction);
    return transaction;
  }
}

module.exports = PointService;