const StockReceiptService = require("../services/stockReceipt.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  try {
    const service = new StockReceiptService(MongoDB.client);
    const doc = await service.create(req.body);
    return res.status(201).json({ message: "Tạo phiếu nhập thành công", data: doc });
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const service = new StockReceiptService(MongoDB.client);
    const result = await service.findAll(req.query);
    return res.json({ message: "Lấy danh sách phiếu nhập thành công", ...result });
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy danh sách phiếu nhập"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const service = new StockReceiptService(MongoDB.client);
    const doc = await service.findById(req.params.id);
    if (!doc) return next(new ApiError(404, "Không tìm thấy phiếu nhập"));
    return res.json(doc);
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy phiếu nhập"));
  }
};

exports.complete = async (req, res, next) => {
  try {
    const service = new StockReceiptService(MongoDB.client);
    const doc = await service.complete(req.params.id);
    return res.json({ message: "Duyệt phiếu nhập thành công — đã cộng kho", data: doc });
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const service = new StockReceiptService(MongoDB.client);
    const doc = await service.cancel(req.params.id, req.body.reason);
    return res.json({ message: "Đã hủy phiếu nhập", data: doc });
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};