const StockBatchService = require("../services/stockBatch.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// GET /api/stock-batches/product/:productId
exports.getByProduct = async (req, res, next) => {
  try {
    const service = new StockBatchService(MongoDB.client);
    const batches = await service.getBatchesByProductWithReceipt(req.params.productId);

    const totalQuantity = batches.reduce((s, b) => s + b.quantity, 0);
    const totalValue    = batches.reduce((s, b) => s + b.subtotal, 0);

    return res.json({
      message: "Lấy danh sách lô hàng thành công",
      data: batches,
      summary: { totalQuantity, totalValue },
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy danh sách lô hàng"));
  }
};