const { ObjectId } = require("mongodb");

const POINT_TO_VND = 100;              // 1 điểm = 100₫ (khi dùng để giảm giá)
const POINT_EXPIRY_DAYS = 15;          // điểm hết hạn sau 15 ngày nếu không dùng
const POINT_EXPIRY_MS = POINT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// const POINT_EXPIRY_MS = 60 * 1000; // TEST: hết hạn sau 1 phút, nếu test sẽ xóa 2 dòng trên

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

  // Lấy lịch sử giao dịch điểm
  async getHistory(userId, limit = 20) {
    return this.Points.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  // Trừ dần điểm theo FIFO từ các giao dịch cộng điểm còn remainingPoints > 0
  // (điểm cũ nhất, sắp hết hạn nhất sẽ bị tiêu trước)
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
      // Có thể do dữ liệu cũ (tạo trước khi có remainingPoints) chưa được migrate.
      // Không chặn giao dịch, chỉ log để biết mà kiểm tra lại.
      console.warn(
        `[Point] User ${userId} thiếu ${remaining} điểm remainingPoints khi trừ FIFO (kiểm tra dữ liệu cũ)`
      );
    }
  }

  // Tích điểm khi đặt hàng thành công
  // Tỉ lệ: 1.000đ = 1 điểm (tính theo giá gốc, không phải giá sau giảm)
  async earnFromOrder(userId, orderId, orderTotal) {
    const points = Math.floor(orderTotal / 1000);
    if (points <= 0) return null;

    // Chống tích điểm 2 lần cho cùng 1 đơn
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

  // Hoàn điểm khi đơn hàng bị huỷ (hoàn lại điểm ĐÃ TÍCH cho đơn đó)
  async refundFromOrder(userId, orderId, orderTotal) {
    const points = Math.floor(orderTotal / 1000);
    if (points <= 0) return null;

    // Trừ ngược đúng vào giao dịch earn gốc của đơn này (nếu còn đủ điểm chưa dùng)
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

  // Dùng điểm để đổi ưu đãi thủ công (không gắn đơn hàng)
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

  // Dùng điểm khi thanh toán đơn hàng
  // Tự động giới hạn MAX_REDEEM_PER_ORDER
  async redeemForOrder(userId, orderId, pointsRequested, orderTotal) {
    const maxByOrder = Math.floor((orderTotal * 0.2) / POINT_TO_VND);
    const capped = Math.min(pointsRequested, maxByOrder);
    const discount = capped * POINT_TO_VND;

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
    return { transaction, pointsUsed: capped, discount };
  }

  // Hoàn lại điểm đã dùng khi đơn bị huỷ
  // Tạo thành 1 lô điểm mới với hạn 15 ngày tính từ lúc hoàn (không giữ hạn cũ)
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