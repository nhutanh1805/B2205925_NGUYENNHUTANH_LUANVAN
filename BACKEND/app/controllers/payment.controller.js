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
  Object.keys(obj).sort().forEach((key) => {
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
      return res.status(400).json({ message: "Sai chữ ký VNPay" });
    }

    const orderId = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];

    const client = await MongoDB.connect();
    const orderService = new OrderService(client);
    const paymentService = new PaymentService(client);

    // Cập nhật payment record dù success hay failed
    await paymentService.updatePaymentByTxnRef(orderId, vnp_Params);

    // =========================
    // SUCCESS
    // =========================
    if (responseCode === "00") {
      try {
        await orderService.updateStatus(orderId, "paid");

        const amount = parseInt(vnp_Params["vnp_Amount"] || "0") / 100;
        const points = Math.floor(amount / 1000);

        return res.redirect(
          `http://localhost:3002/payment-success?points=${points}`
        );
      } catch (err) {
        console.log("UPDATE ERROR:", err);
        return res.redirect("http://localhost:3002/payment-failed");
      }
    }

    // FAIL
    return res.redirect("http://localhost:3002/payment-failed");
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};