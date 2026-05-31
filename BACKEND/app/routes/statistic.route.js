const express = require("express");
const stats = require("../controllers/statistic.controller");

const router = express.Router();

// Tổng quan KPIs
router.get("/overview",               stats.getOverview);

// Doanh thu & đơn theo thời gian (?from=&to=&period=day|week|month|year)
router.get("/revenue",                stats.getRevenueByPeriod);
router.get("/orders-by-period",       stats.getOrdersByPeriod);

// Khách hàng
router.get("/top-customers",          stats.getTopCustomers);
router.get("/cancel-customers",       stats.getTopCancelCustomers);

// Sản phẩm
router.get("/top-products",           stats.getTopProducts);
router.get("/cancelled-products",     stats.getMostCancelledProducts);

// Thời gian
router.get("/orders-by-hour",         stats.getOrdersByHour);
router.get("/orders-by-day-of-week",  stats.getOrdersByDayOfWeek);

// Thanh toán
router.get("/payment-methods",        stats.getPaymentMethodStats);

// Tăng trưởng so sánh kỳ trước
router.get("/growth",                 stats.getGrowthComparison);

// Vận hành
router.get("/stale-orders",           stats.getStaleOrders);
router.get("/order-averages",         stats.getOrderAverages);

// Doanh thu & lợi nhuận (doanh thu - giá vốn)
router.get("/profit",                 stats.getProfit);

module.exports = router;