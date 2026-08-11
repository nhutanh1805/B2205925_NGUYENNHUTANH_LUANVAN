const express             = require("express");
const router              = express.Router();
const controller          = require("../controllers/chatbottuvan.controller");
const optionalAuthMiddleware = require("../middlewares/optionalAuth.middleware");

router.post  ("/ask",     optionalAuthMiddleware, controller.ask);
router.get   ("/history", optionalAuthMiddleware, controller.getHistory);
router.delete("/history", optionalAuthMiddleware, controller.clearHistory);

module.exports = router;