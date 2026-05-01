const ReviewService = require("../services/review.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.rating || !req.body?.comment) {
    return next(new ApiError(400, "Rating và bình luận không được để trống"));
  }
  if (!req.body?.userId) {
    return next(new ApiError(400, "userId không được để trống"));
  }

  try {
    const reviewService = new ReviewService(MongoDB.client);
    const document = await reviewService.create(
      req.body.userId,
      req.params.productId,
      req.body
    );
    return res.status(201).json({
      message: "Đánh giá sản phẩm thành công",
      data: document,
    });
  } catch (error) {
    return next(new ApiError(400, error.message || "Lỗi khi tạo đánh giá"));
  }
};

exports.findByProduct = async (req, res, next) => {
  try {
    const reviewService = new ReviewService(MongoDB.client);
    const result = await reviewService.findByProduct(
      req.params.productId,
      req.query
    );
    return res.json({
      message:
        result.reviews.length > 0
          ? "Lấy danh sách thành công"
          : "Chưa có đánh giá nào",
      ...result,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách đánh giá"));
  }
};

exports.getRatingSummary = async (req, res, next) => {
  try {
    const reviewService = new ReviewService(MongoDB.client);
    const summary = await reviewService.getRatingSummary(req.params.productId);
    return res.json({ message: "Lấy thống kê thành công", data: summary });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy thống kê đánh giá"));
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  if (!req.body?.userId) {
    return next(new ApiError(400, "userId không được để trống"));
  }

  try {
    const reviewService = new ReviewService(MongoDB.client);
    const document = await reviewService.update(
      req.params.reviewId,
      req.body.userId,
      req.body
    );
    return res.json({
      message: "Cập nhật đánh giá thành công",
      data: document,
    });
  } catch (error) {
    return next(new ApiError(400, error.message || "Lỗi khi cập nhật đánh giá"));
  }
};

exports.delete = async (req, res, next) => {
  if (!req.body?.userId) {
    return next(new ApiError(400, "userId không được để trống"));
  }

  try {
    const reviewService = new ReviewService(MongoDB.client);
    const result = await reviewService.delete(
      req.params.reviewId,
      req.body.userId,
      req.body.role || "user"
    );
    return res.json(result);
  } catch (error) {
    return next(new ApiError(400, error.message || "Lỗi khi xóa đánh giá"));
  }
};

exports.toggleHelpful = async (req, res, next) => {
  if (!req.body?.userId) {
    return next(new ApiError(400, "userId không được để trống"));
  }

  try {
    const reviewService = new ReviewService(MongoDB.client);
    const result = await reviewService.toggleHelpful(
      req.params.reviewId,
      req.body.userId
    );
    return res.json({ message: "Cập nhật vote thành công", data: result });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật vote hữu ích"));
  }
};