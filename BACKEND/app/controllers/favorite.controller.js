const FavoriteService = require("../services/favorite.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { ObjectId } = require("mongodb");

exports.add = async (req, res, next) => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
        return next(new ApiError(400, "userId và productId không được để trống"));
    }
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
        return next(new ApiError(400, "userId hoặc productId không hợp lệ"));
    }

    try {
        const favoriteService = new FavoriteService(MongoDB.client);
        const document = await favoriteService.add(userId, productId);
        return res.status(201).json({
            message: "Đã thêm vào danh sách yêu thích",
            data: document,
        });
    } catch (error) {
        return next(
            new ApiError(500, error.message || "Đã xảy ra lỗi khi thêm yêu thích")
        );
    }
};

exports.remove = async (req, res, next) => {
    const { userId, productId } = req.params;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
        return next(new ApiError(400, "userId hoặc productId không hợp lệ"));
    }

    try {
        const favoriteService = new FavoriteService(MongoDB.client);
        const document = await favoriteService.remove(userId, productId);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sản phẩm trong danh sách yêu thích"));
        }
        return res.json({ message: "Đã xóa khỏi danh sách yêu thích" });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi xóa sản phẩm yêu thích"));
    }
};

exports.findByUser = async (req, res, next) => {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
        return next(new ApiError(400, "userId không hợp lệ"));
    }

    try {
        const favoriteService = new FavoriteService(MongoDB.client);
        const result = await favoriteService.findByUser(userId, req.query);
        return res.json({
            message: result.favorites?.length > 0 ? "Lấy danh sách yêu thích thành công" : "Chưa có sản phẩm yêu thích",
            ...result,
        });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi truy xuất danh sách yêu thích"));
    }
};

exports.check = async (req, res, next) => {
    const { userId, productId } = req.params;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
        return next(new ApiError(400, "userId hoặc productId không hợp lệ"));
    }

    try {
        const favoriteService = new FavoriteService(MongoDB.client);
        const isFavorited = await favoriteService.isFavorited(userId, productId);
        return res.json({ isFavorited });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi kiểm tra trạng thái yêu thích"));
    }
};

exports.countByProduct = async (req, res, next) => {
    const { productId } = req.params;

    if (!ObjectId.isValid(productId)) {
        return next(new ApiError(400, "productId không hợp lệ"));
    }

    try {
        const favoriteService = new FavoriteService(MongoDB.client);
        const count = await favoriteService.countByProduct(productId);
        return res.json({ productId, count });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi đếm số lượt yêu thích"));
    }
};

exports.removeAllByUser = async (req, res, next) => {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
        return next(new ApiError(400, "userId không hợp lệ"));
    }

    try {
        const favoriteService = new FavoriteService(MongoDB.client);
        const result = await favoriteService.removeAllByUser(userId);
        return res.json({
            message: `Đã xóa ${result.deletedCount} sản phẩm khỏi danh sách yêu thích`,
        });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi xóa toàn bộ danh sách yêu thích"));
    }
};