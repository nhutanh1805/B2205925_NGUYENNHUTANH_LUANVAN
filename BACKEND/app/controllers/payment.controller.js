const crypto = require("crypto");
const moment = require("moment");
const vnpayConfig = require("../config/vnpay.config");

// =========================
// SORT OBJECT
// =========================
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

// =========================
// CREATE PAYMENT URL
// =========================
exports.createVNPayPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        message: "Thiếu orderId hoặc amount",
      });
    }

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

    // SORT
    vnp_Params = sortObject(vnp_Params);

    // CREATE SIGN STRING
    const signData = Object.keys(vnp_Params)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(vnp_Params[key])}`)
      .join("&");

    const hmac = crypto.createHmac(
      "sha512",
      vnpayConfig.vnp_HashSecret.trim()
    );

    const secureHash = hmac
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    vnp_Params["vnp_SecureHash"] = secureHash;

    const querystring = require("qs");

    const paymentUrl =
      vnpayConfig.vnp_Url +
      "?" +
      querystring.stringify(vnp_Params, { encode: false });

    return res.json({ payment_url: paymentUrl });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// =========================
// RETURN URL (VERIFY)
// =========================
exports.vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;

    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    const signData = Object.keys(vnp_Params)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(vnp_Params[key])}`)
      .join("&");

    const hmac = crypto.createHmac(
      "sha512",
      vnpayConfig.vnp_HashSecret.trim()
    );

    const checkHash = hmac
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    // =========================
    // VERIFY SUCCESS
    // =========================
    if (secureHash === checkHash) {
      const orderId = vnp_Params["vnp_TxnRef"];
      const responseCode = vnp_Params["vnp_ResponseCode"];

      if (responseCode === "00") {
        // TODO: update DB order = PAID
        return res.redirect(
          "http://localhost:3002/payment-success"
        );
      } else {
        return res.redirect(
          "http://localhost:3002/payment-failed"
        );
      }
    }

    return res.status(400).json({
      message: "Sai chữ ký VNPay",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};