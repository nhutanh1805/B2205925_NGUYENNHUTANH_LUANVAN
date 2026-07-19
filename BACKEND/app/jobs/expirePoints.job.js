const cron = require("node-cron");
const MongoDB = require("../utils/mongodb.util");

/**
 * Cron chạy mỗi ngày lúc 00:05.
 * Tìm các giao dịch cộng điểm (earn/refund) đã quá hạn (expiresAt <= hiện tại)
 * mà vẫn còn remainingPoints > 0 (tức là chưa được dùng hết)
 * → tạo giao dịch "expire" trừ đúng phần điểm còn dư, đưa remainingPoints về 0.
 */
cron.schedule("5 0 * * *", async () => { // sửa lại "* * * * *" nếu muốn cron từng phút
  try {
    const client = await MongoDB.connect();
    const Points = client.db().collection("point_transactions");

    const expiredSources = await Points.find({
      type: { $in: ["earn", "refund"] },
      points: { $gt: 0 },
      remainingPoints: { $gt: 0 },
      expiresAt: { $lte: new Date() },
    }).toArray();

    if (expiredSources.length === 0) return;

    const now = new Date();
    const expireTxs = expiredSources.map((doc) => ({
      userId: doc.userId,
      orderId: doc.orderId || null,
      type: "expire",
      points: -doc.remainingPoints,
      relatedTransactionId: doc._id,
      note: `Hết hạn ${doc.remainingPoints.toLocaleString("vi-VN")} điểm (tích ngày ${new Date(
        doc.createdAt
      ).toLocaleDateString("vi-VN")})`,
      createdAt: now,
    }));

    await Points.insertMany(expireTxs);

    await Points.updateMany(
      { _id: { $in: expiredSources.map((d) => d._id) } },
      { $set: { remainingPoints: 0 } }
    );

    const totalExpired = expireTxs.reduce((sum, t) => sum - t.points, 0);
    console.log(
      `[CRON ${now.toISOString()}] Đã hết hạn ${expireTxs.length} giao dịch, tổng ${totalExpired} điểm`
    );
  } catch (err) {
    console.error("[CRON] Lỗi expire points:", err.message);
  }
});

console.log("[CRON] Job hết hạn điểm tích lũy đã khởi động (chạy mỗi ngày lúc 00:05)");