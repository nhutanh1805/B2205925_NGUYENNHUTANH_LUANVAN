const express  = require("express");
const shipper  = require("../controllers/shipper.controller");

const router = express.Router();

router.post("/login",  shipper.login);          

router.post("/",       shipper.createShipper);  
router.get("/",        shipper.getAllShippers);  

router.get("/:shipperId",        shipper.getShipperById);       
router.patch("/:shipperId/status", shipper.updateShipperStatus); 

// Gán đơn hàng cho shipper
router.post("/:shipperId/assign",  shipper.assignOrder); 

router.get("/:shipperId/orders",            shipper.getMyOrders);

router.patch("/:shipperId/orders/:orderId/status", shipper.updateOrderStatus);

router.get("/:shipperId/stats",   shipper.getStats);

module.exports = router;