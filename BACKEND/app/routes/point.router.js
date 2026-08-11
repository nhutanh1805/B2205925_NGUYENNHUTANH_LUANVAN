const express = require("express");
const point = require("../controllers/point.controller");

const router = express.Router();

router.post("/balance", point.getBalance);
router.post("/history", point.getHistory);
router.post("/batches", point.getBatches);
router.post("/earn", point.earnFromOrder);
router.post("/redeem", point.redeem);

module.exports = router;