const express = require("express");
const receipt = require("../controllers/stockReceipt.controller");

const router = express.Router();

router.route("/").get(receipt.findAll).post(receipt.create);
router.patch("/:id/complete", receipt.complete);   
router.patch("/:id/cancel", receipt.cancel);       
router.get("/:id", receipt.findOne);              

module.exports = router;