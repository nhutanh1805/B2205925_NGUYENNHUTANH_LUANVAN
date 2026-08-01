const express = require("express");
const batch = require("../controllers/stockBatch.controller");

const router = express.Router();

router.get("/product/:productId", batch.getByProduct);

module.exports = router;