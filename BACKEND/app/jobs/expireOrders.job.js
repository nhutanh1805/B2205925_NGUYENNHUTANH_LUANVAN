const cron = require("node-cron");
const MongoDB = require("../utils/mongodb.util");

/**
 * Cron job chạy mỗi phút.
 * Tìm các đơn VNPay chưa thanh toán và đã quá paymentExpiredAt
 * → cập nhật status: "cancelled", paymentStatus: "expired"
 * Không cần hoàn kho vì VNPay chưa trừ kho lúc tạo đơn.
 */
cron.schedule("* * * * *", async () => {
  try {
    const client = await MongoDB.connect();
    const Order = client.db().collection("orders");

    const result = await Order.updateMany(
      {
        paymentMethod: "VNPAY",
        paymentStatus: "unpaid",
        paymentExpiredAt: { $lt: new Date() },
        status: { $nin: ["cancelled", "delivered"] },
      },
      {
        $set: {
          status: "cancelled",
          paymentStatus: "expired",
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[CRON ${new Date().toISOString()}] Đã hủy ${result.modifiedCount} đơn VNPay hết hạn`
      );
    }
  } catch (err) {
    console.error("[CRON] Lỗi expire orders:", err.message);
  }
});

console.log("[CRON] Job hủy đơn VNPay hết hạn đã khởi động (chạy mỗi phút)");