const ProductService = require("../services/product.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body?.name || !req.body?.price) {
        return next(new ApiError(400, "Tên sản phẩm và giá không được để trống"));
    }

    try {
        const productService = new ProductService(MongoDB.client);
        const document = await productService.create(req.body);
        return res.status(201).json({
            message: "Thêm sản phẩm thành công",
            data: document,
        });
    } catch (error) {
        return next(
            new ApiError(500, error.message || "Đã xảy ra lỗi khi thêm sản phẩm")
        );
    }
};

exports.findAll = async (req, res, next) => {
    try {
        const productService = new ProductService(MongoDB.client);
        const result = await productService.findAll(req.query);
        return res.json({
            message: result.products?.length > 0 ? "Lấy danh sách thành công" : "Không có sản phẩm",
            ...result,
        });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi truy xuất danh sách sản phẩm"));
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const productService = new ProductService(MongoDB.client);
        const document = await productService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sản phẩm"));
        }
        if (!document.isActive) {
            return next(new ApiError(410, "Sản phẩm đã bị gỡ khỏi kệ"));
        }
        return res.json(document);
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi truy xuất sản phẩm id=${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
    }

    try {
        const productService = new ProductService(MongoDB.client);
        const document = await productService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sản phẩm để cập nhật"));
        }
        return res.json({ message: "Cập nhật sản phẩm thành công", data: document });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi cập nhật sản phẩm id=${req.params.id}`));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const productService = new ProductService(MongoDB.client);
        const document = await productService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sản phẩm để xóa"));
        }
        return res.json({ message: "Xóa sản phẩm thành công (soft delete)" });
    } catch (error) {
        return next(new ApiError(500, `Không thể xóa sản phẩm id=${req.params.id}`));
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const productService = new ProductService(MongoDB.client);
        const result = await productService.deleteAll();
        return res.json({
            message: `Đã gỡ ${result.deletedCount} sản phẩm khỏi kệ`,
        });
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả sản phẩm"));
    }
};

exports.findByCategory = async (req, res, next) => {
    try {
        const productService = new ProductService(MongoDB.client);
        const result = await productService.findAll({
            ...req.query,
            category: req.params.id,
        });
        return res.json({
            message: "Lấy sản phẩm theo danh mục thành công",
            ...result,
        });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi lấy sản phẩm theo danh mục"));
    }
};