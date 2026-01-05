const express = require("express");
const order = require("../controllers/order.controller");

const router = express.Router();

router.post("/create", order.createOrder);

router.post("/", order.getOrdersByUser);

router.get("/all", order.getAllOrders);

router.get("/:orderId", order.getOrderById);

router.patch("/:orderId/status", order.updateOrderStatus);


module.exports = router;