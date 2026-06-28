const express  = require("express");
const delivery = require("../controllers/delivery.controller");

const router = express.Router();

// Admin: danh sách tất cả delivery (filter by status, shipperId)
// GET /api/deliveries?status=failed&shipperId=xxx&page=1&limit=10
router.get("/", delivery.getAllDeliveries);

// Admin: lịch sử giao hàng của 1 đơn
// GET /api/deliveries/order/:orderId
router.get("/order/:orderId", delivery.getDeliveriesByOrder);

// Admin/Shipper: thống kê theo shipper
// GET /api/deliveries/shipper/:shipperId/stats
router.get("/shipper/:shipperId/stats", delivery.getStatsByShipper);

module.exports = router;