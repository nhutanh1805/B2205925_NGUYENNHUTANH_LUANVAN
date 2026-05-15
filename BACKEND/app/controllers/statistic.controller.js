const StatisticService = require("../services/statistic.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Helper lấy query filter
const getFilter = (query) => ({
  from:   query.from   || null,
  to:     query.to     || null,
  period: query.period || "day",   // day | week | month | year
  limit:  query.limit  || 10,
});

// TỔNG QUAN (KPIs)

exports.getOverview = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const { from, to } = getFilter(req.query);
    const data = await service.getOverview({ from, to });
    return res.json({ message: "Lấy tổng quan thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy tổng quan"));
  }
};

// DOANH THU THEO THỜI GIAN

exports.getRevenueByPeriod = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const { from, to, period } = getFilter(req.query);
    const data = await service.getRevenueByPeriod({ from, to, period });
    return res.json({ message: "Lấy doanh thu thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy doanh thu"));
  }
};

// ĐƠN HÀNG THEO THỜI GIAN

exports.getOrdersByPeriod = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const { from, to, period } = getFilter(req.query);
    const data = await service.getOrdersByPeriod({ from, to, period });
    return res.json({ message: "Lấy đơn hàng theo thời gian thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy đơn hàng theo thời gian"));
  }
};

// TOP KHÁCH HÀNG

exports.getTopCustomers = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const { from, to, limit } = getFilter(req.query);
    const data = await service.getTopCustomers({ from, to, limit });
    return res.json({ message: "Lấy top khách hàng thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy top khách hàng"));
  }
};

// KHÁCH HAY HUỶ ĐƠN

exports.getTopCancelCustomers = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const { from, to, limit } = getFilter(req.query);
    const data = await service.getTopCancelCustomers({ from, to, limit });
    return res.json({ message: "Lấy danh sách khách hay huỷ thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy danh sách khách hay huỷ"));
  }
};

// SẢN PHẨM BÁN CHẠY

exports.getTopProducts = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const { from, to, limit } = getFilter(req.query);
    const data = await service.getTopProducts({ from, to, limit });
    return res.json({ message: "Lấy sản phẩm bán chạy thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy sản phẩm bán chạy"));
  }
};

// SẢN PHẨM HAY BỊ HUỶ

exports.getMostCancelledProducts = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const { from, to, limit } = getFilter(req.query);
    const data = await service.getMostCancelledProducts({ from, to, limit });
    return res.json({ message: "Lấy sản phẩm hay bị huỷ thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy sản phẩm hay bị huỷ"));
  }
};

// KHUNG GIỜ ĐẶT HÀNG NHIỀU NHẤT

exports.getOrdersByHour = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const { from, to } = getFilter(req.query);
    const data = await service.getOrdersByHour({ from, to });
    return res.json({ message: "Lấy thống kê khung giờ thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy thống kê khung giờ"));
  }
};

// NGÀY TRONG TUẦN BÁN CHẠY

exports.getOrdersByDayOfWeek = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const { from, to } = getFilter(req.query);
    const data = await service.getOrdersByDayOfWeek({ from, to });
    return res.json({ message: "Lấy thống kê ngày trong tuần thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy thống kê ngày trong tuần"));
  }
};

// COD VS VNPAY

exports.getPaymentMethodStats = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const { from, to } = getFilter(req.query);
    const data = await service.getPaymentMethodStats({ from, to });
    return res.json({ message: "Lấy thống kê thanh toán thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy thống kê thanh toán"));
  }
};

// TĂNG TRƯỞNG SO SÁNH KỲ TRƯỚC

exports.getGrowthComparison = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const { from, to } = getFilter(req.query);
    const data = await service.getGrowthComparison({ from, to });
    return res.json({ message: "Lấy so sánh tăng trưởng thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy so sánh tăng trưởng"));
  }
};

// ĐƠN CHỜ XỬ LÝ QUÁ LÂU

exports.getStaleOrders = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const days = req.query.days || 2;
    const data = await service.getStaleOrders({ days });
    return res.json({ message: "Lấy đơn chờ quá lâu thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy đơn chờ quá lâu"));
  }
};

// TRUNG BÌNH ĐƠN HÀNG

exports.getOrderAverages = async (req, res, next) => {
  try {
    const service = new StatisticService(MongoDB.client);
    const { from, to } = getFilter(req.query);
    const data = await service.getOrderAverages({ from, to });
    return res.json({ message: "Lấy trung bình đơn hàng thành công", data });
  } catch (err) {
    return next(new ApiError(500, err.message || "Lỗi khi lấy trung bình đơn hàng"));
  }
};