const { ObjectId } = require("mongodb");

class ReviewService {
  constructor(client) {
    this.Review = client.db().collection("reviews");
    this.Order = client.db().collection("orders");
  }

  extractReviewData(payload) {
    const review = {
      rating: Number(payload.rating),
      comment: payload.comment?.trim(),
      title: payload.title?.trim() || undefined,
      images: Array.isArray(payload.images) ? payload.images : [],
    };

    Object.keys(review).forEach(
      (key) => review[key] === undefined && delete review[key]
    );

    return review;
  }

  async create(userId, productId, payload) {
    const existed = await this.Review.findOne({
      userId: new ObjectId(userId),
      productId: new ObjectId(productId),
    });
    if (existed) throw new Error("Bạn đã đánh giá sản phẩm này rồi");

    const hasPurchased = await this.Order.findOne({
      userId: userId.toString(),
      status: "completed",
      "items.productId": productId.toString(),
    });

    if (!hasPurchased) {
      throw new Error("Bạn cần mua và nhận sản phẩm này trước khi đánh giá");
    }

    const review = {
      ...this.extractReviewData(payload),
      userId: new ObjectId(userId),
      productId: new ObjectId(productId),
      helpfulVotes: [],
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.Review.insertOne(review);
    return { _id: result.insertedId, ...review };
  }

  async findByProduct(productId, query = {}) {
    const { page = 1, limit = 10, sort = "createdAt", rating } = query;

    const filter = {
      productId: new ObjectId(productId),
      status: "approved",
    };
    if (rating) filter.rating = Number(rating);

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      this.Review.aggregate([
        { $match: filter },
        { $sort: { [sort]: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            rating: 1,
            title: 1,
            comment: 1,
            images: 1,
            helpfulVotes: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            adminReply: 1,
            "userInfo.name": 1,
            "userInfo.avatar": 1,
          },
        },
      ]).toArray(),
      this.Review.countDocuments(filter),
    ]);

    return {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRatingSummary(productId) {
    const result = await this.Review.aggregate([
      {
        $match: {
          productId: new ObjectId(productId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    const summary = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, avg: 0, total: 0 };
    let totalRating = 0;

    result.forEach(({ _id, count }) => {
      summary[_id] = count;
      summary.total += count;
      totalRating += _id * count;
    });

    if (summary.total > 0) {
      summary.avg = Math.round((totalRating / summary.total) * 10) / 10;
    }

    return summary;
  }

  async update(reviewId, userId, payload) {
    const filter = {
      _id: new ObjectId(reviewId),
      userId: new ObjectId(userId),
    };

    const update = {
      ...this.extractReviewData(payload),
      updatedAt: new Date(),
    };

    const result = await this.Review.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Không tìm thấy đánh giá hoặc bạn không có quyền");
    }
    return result;
  }

  async delete(reviewId, userId, userRole) {
    const filter =
      userRole === "admin"
        ? { _id: new ObjectId(reviewId) }
        : { _id: new ObjectId(reviewId), userId: new ObjectId(userId) };

    const result = await this.Review.findOneAndDelete(filter);
    if (!result) {
      throw new Error("Không tìm thấy đánh giá hoặc bạn không có quyền");
    }

    return { message: "Xóa đánh giá thành công" };
  }

  async toggleHelpful(reviewId, userId) {
    const review = await this.Review.findOne({ _id: new ObjectId(reviewId) });
    if (!review) throw new Error("Không tìm thấy đánh giá");

    const uid = new ObjectId(userId);
    const alreadyVoted = review.helpfulVotes.some((v) =>
      new ObjectId(v).equals(uid)
    );

    const update = alreadyVoted
      ? { $pull: { helpfulVotes: uid } }
      : { $push: { helpfulVotes: uid } };

    await this.Review.updateOne({ _id: new ObjectId(reviewId) }, update);

    return {
      helpful: alreadyVoted
        ? review.helpfulVotes.length - 1
        : review.helpfulVotes.length + 1,
      voted: !alreadyVoted,
    };
  }

  // ===== ADMIN =====

  async adminFindAll(query = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      rating,
      keyword,
      productId,
      sort = "createdAt",
    } = query;

    const filter = {};
    if (status) filter.status = status;
    if (rating) filter.rating = Number(rating);
    if (productId) filter.productId = new ObjectId(productId);
    if (keyword) {
      filter.$or = [
        { comment: { $regex: keyword, $options: "i" } },
        { title: { $regex: keyword, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      this.Review.aggregate([
        { $match: filter },
        { $sort: { [sort]: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            rating: 1,
            title: 1,
            comment: 1,
            images: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            adminReply: 1,
            "userInfo.name": 1,
            "userInfo.email": 1,
            "productInfo.name": 1,
          },
        },
      ]).toArray(),
      this.Review.countDocuments(filter),
    ]);

    return {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async adminGetStats(productId) {
    const matchStage = productId
      ? { $match: { productId: new ObjectId(productId) } }
      : null;

    const [byStatus, byRating] = await Promise.all([
      this.Review.aggregate([
        ...(matchStage ? [matchStage] : []),
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]).toArray(),
      this.Review.aggregate([
        ...(matchStage ? [matchStage] : []),
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]).toArray(),
    ]);

    return {
      total: byStatus.reduce((s, i) => s + i.count, 0),
      byStatus: byStatus.reduce((acc, i) => ({ ...acc, [i._id]: i.count }), {}),
      byRating: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        ...byRating.reduce((acc, i) => ({ ...acc, [i._id]: i.count }), {}),
      },
    };
  }

  async toggleVisibility(reviewId) {
    const review = await this.Review.findOne({ _id: new ObjectId(reviewId) });
    if (!review) throw new Error("Không tìm thấy đánh giá");

    const newStatus = review.status === "hidden" ? "approved" : "hidden";
    await this.Review.updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { status: newStatus, updatedAt: new Date() } }
    );
    return { status: newStatus };
  }

  async replyToReview(reviewId, content, adminId) {
    if (!content?.trim()) throw new Error("Nội dung phản hồi không được để trống");

    const adminReply = {
      content: content.trim(),
      adminId: adminId ? new ObjectId(adminId) : null,
      repliedAt: new Date(),
    };

    const result = await this.Review.findOneAndUpdate(
      { _id: new ObjectId(reviewId) },
      { $set: { adminReply, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) throw new Error("Không tìm thấy đánh giá");
    return result;
  }

  async deleteReply(reviewId) {
    const result = await this.Review.findOneAndUpdate(
      { _id: new ObjectId(reviewId) },
      { $unset: { adminReply: "" }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) throw new Error("Không tìm thấy đánh giá");
    return result;
  }
}

module.exports = ReviewService;