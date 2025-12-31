const express = require("express");
const cart = require("../controllers/cart.controller");

const router = express.Router();

router.post("/", cart.getCart);

router.post("/add", cart.addToCart);

router.put("/update", cart.updateQuantity);

router.delete("/remove/:productId", cart.removeItem);

router.delete("/clear", cart.clearCart);

module.exports = router;