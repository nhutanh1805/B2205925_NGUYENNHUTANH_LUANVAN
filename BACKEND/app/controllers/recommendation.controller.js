const RecommendationService = require("../services/recommendation.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.getRecommendations = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 4, 10);

    const service = new RecommendationService(MongoDB.client);
    const { collaborative, sameCategory } = await service.getSmartRecommendations(productId, limit);

    return res.status(200).json({ status: "success", collaborative, sameCategory });
  } catch (error) {
    console.error("Recommendation Error:", error);
    return next(new ApiError(500, "Lỗi gợi ý sản phẩm: " + error.message));
  }
};

exports.invalidate = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const service = new RecommendationService(MongoDB.client);
    const deleted = await service.invalidate(productId);

    return res.status(200).json({
      status: "success",
      message: deleted
        ? `Đã xóa gợi ý cho productId=${productId}, sẽ tính lại lần load tiếp`
        : "Không có data để xóa",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi invalidate: " + error.message));
  }
};

exports.invalidateAll = async (req, res, next) => {
  try {
    const service = new RecommendationService(MongoDB.client);
    const count = await service.invalidateAll();

    return res.status(200).json({
      status: "success",
      message: `Đã xóa ${count} gợi ý, tất cả sẽ được tính lại khi có request`,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi invalidate all: " + error.message));
  }
};