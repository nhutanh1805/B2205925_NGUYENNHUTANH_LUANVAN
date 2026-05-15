const { ObjectId } = require("mongodb");

class PaymentService {
  constructor(client) {
    this.client = client;
    this.Payment = client.db().collection("payments");
  }

  async createPayment({ orderId, amount, ipAddr }) {
    const payment = {
      orderId,
      amount,
      method: "VNPAY",
      status: "pending",    // pending | success | failed
      ipAddr,
      vnpay: {
        txnRef:        orderId,
        responseCode:  null,
        transactionNo: null,
        bankCode:      null,
        payDate:       null,
        orderInfo:     null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.Payment.insertOne(payment);
    payment._id = result.insertedId;

    return payment;
  }

  async findById(paymentId) {
    if (!paymentId || paymentId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(paymentId)) return null;

    return this.Payment.findOne({ _id: new ObjectId(paymentId) });
  }

  async findByOrderId(orderId) {
    if (!orderId) return null;

    return this.Payment.find({ orderId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findLatestByOrderId(orderId) {
    if (!orderId) return null;

    return this.Payment.findOne(
      { orderId },
      { sort: { createdAt: -1 } }
    );
  }

  async updatePaymentByTxnRef(txnRef, vnpParams) {
    if (!txnRef) return null;

    const isSuccess = vnpParams["vnp_ResponseCode"] === "00";

    const result = await this.Payment.findOneAndUpdate(
      { "vnpay.txnRef": txnRef },
      {
        $set: {
          status:                isSuccess ? "success" : "failed",
          "vnpay.responseCode":  vnpParams["vnp_ResponseCode"]  || null,
          "vnpay.transactionNo": vnpParams["vnp_TransactionNo"] || null,
          "vnpay.bankCode":      vnpParams["vnp_BankCode"]      || null,
          "vnpay.payDate":       vnpParams["vnp_PayDate"]       || null,
          "vnpay.orderInfo":     vnpParams["vnp_OrderInfo"]     || null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result;
  }
}

module.exports = PaymentService;