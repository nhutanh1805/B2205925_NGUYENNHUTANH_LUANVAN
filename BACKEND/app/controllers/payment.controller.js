const crypto = require("crypto");
const moment = require("moment");
const querystring = require("qs");

const MongoDB = require("../utils/mongodb.util");
const OrderService = require("../services/order.service");
const PaymentService = require("../services/payment.service");
const vnpayConfig = require("../config/vnpay.config");

// =========================
// SORT OBJECT
// =========================
function sortObject(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return sorted;
}

// =========================
// CREATE PAYMENT
// =========================
exports.createVNPayPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: "Thiếu orderId hoặc amount" });
    }

    const client = await MongoDB.connect();
    const orderService = new OrderService(client);

    // Kiểm tra đơn hàng tồn tại và chưa hết hạn
    const order = await orderService.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Đơn hàng đã được thanh toán" });
    }
    if (order.paymentExpiredAt && new Date() > new Date(order.paymentExpiredAt)) {
      return res.status(400).json({ message: "Đơn hàng đã hết hạn thanh toán" });
    }

    const paymentService = new PaymentService(client);
    await paymentService.createPayment({ orderId, amount, ipAddr: "127.0.0.1" });

    let vnp_Params = {};

    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = vnpayConfig.vnp_TmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = `Thanh_toan_don_hang_${orderId}`;
    vnp_Params["vnp_OrderType"] = "billpayment";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = vnpayConfig.vnp_ReturnUrl;
    vnp_Params["vnp_IpAddr"] = "127.0.0.1";
    vnp_Params["vnp_CreateDate"] = moment().format("YYYYMMDDHHmmss");

    vnp_Params = sortObject(vnp_Params);

    const signData = Object.keys(vnp_Params)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(vnp_Params[key])}`)
      .join("&");

    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret.trim());
    const secureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = secureHash;

    const paymentUrl =
      vnpayConfig.vnp_Url +
      "?" +
      querystring.stringify(vnp_Params, { encode: false });

    return res.json({ payment_url: paymentUrl });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// =========================
// RETURN + UPDATE ORDER
// =========================
exports.vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = { ...req.query };

    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    const signData = Object.keys(vnp_Params)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(vnp_Params[key])}`)
      .join("&");

    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret.trim());
    const checkHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash !== checkHash) {
      return res.redirect("http://localhost:3002/payment-failed?reason=invalid_signature");
    }

    const orderId = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];

    const client = await MongoDB.connect();
    const orderService = new OrderService(client);
    const paymentService = new PaymentService(client);

    // Cập nhật payment record
    await paymentService.updatePaymentByTxnRef(orderId, vnp_Params);

    if (responseCode === "00") {
      try {
        const order = await orderService.findById(orderId);

        if (!order) {
          return res.redirect("http://localhost:3002/payment-failed?reason=order_not_found");
        }

        // Kiểm tra đơn chưa hết hạn
        if (order.paymentExpiredAt && new Date() > new Date(order.paymentExpiredAt)) {
          return res.redirect("http://localhost:3002/payment-failed?reason=expired");
        }

        // Kiểm tra chưa thanh toán (tránh xử lý trùng)
        if (order.paymentStatus === "paid") {
          return res.redirect(`http://localhost:3002/payment-success?orderId=${orderId}`);
        }

        // Trừ kho nếu chưa trừ (VNPay)
        if (!order.stockDeducted) {
          await orderService.deductStock(order);
        }

        // Cập nhật trạng thái đơn
        await orderService.updateStatus(orderId, "paid");

        return res.redirect(`http://localhost:3002/payment-success?orderId=${orderId}`);
      } catch (err) {
        console.error("[VNPay Return] Lỗi xử lý sau thanh toán:", err.message);
        return res.redirect("http://localhost:3002/payment-failed?reason=server_error");
      }
    }

    // Thanh toán thất bại
    return res.redirect(`http://localhost:3002/payment-failed?orderId=${orderId}`);
  } catch (err) {
    console.error("[VNPay Return] Lỗi:", err.message);
    return res.status(500).json({ message: err.message });
  }
};