const express = require("express");
const router  = express.Router();
const recommendationController = require("../controllers/recommendation.controller");

// Lấy gợi ý sản phẩm (đọc từ DB, nếu chưa có thì tính bằng LLM)
router.get("/:productId", recommendationController.getRecommendations);

router.delete("/invalidate/:productId", recommendationController.invalidate);

router.delete("/invalidate", recommendationController.invalidateAll);

module.exports = router;