const RecommendationService = require("../services/recommendation.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.getRecommendations = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 4, 10);

    const recommendationService = new RecommendationService(MongoDB.client);

    // Chạy song song cả 2
    const [collaborative, fallback] = await Promise.all([
      recommendationService.getRecommendations(productId, limit),
      recommendationService.getFallbackRecommendations(productId, limit)
    ]);

    // Lọc fallback không trùng với collaborative
    const collaborativeIds = collaborative.map(r => r._id.toString());
    const filteredFallback = fallback.filter(f => !collaborativeIds.includes(f._id.toString()));

    return res.status(200).json({
      status: "success",
      collaborative,
      sameCategory: filteredFallback,
    });
  } catch (error) {
    console.error("Recommendation Error:", error);
    return next(new ApiError(500, "Lỗi gợi ý sản phẩm: " + error.message));
  }
};