const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/chatbottuvan.controller");

router.post  ("/ask",     controller.ask);
router.get   ("/history", controller.getHistory);
router.delete("/history", controller.clearHistory);

module.exports = router;