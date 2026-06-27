const { ObjectId } = require("mongodb");

class FavoriteService {
  constructor(client) {
    this.Favorite = client.db().collection("favorites");
  }

  async add(userId, productId) {
    const filter = {
      userId: new ObjectId(userId),
      productId: new ObjectId(productId),
    };

    // Tránh thêm trùng lặp
    const existing = await this.Favorite.findOne(filter);
    if (existing) return existing;

    const doc = { ...filter, createdAt: new Date() };
    const result = await this.Favorite.insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  async remove(userId, productId) {
    return await this.Favorite.findOneAndDelete({
      userId: new ObjectId(userId),
      productId: new ObjectId(productId),
    });
  }

  async findByUser(userId, query = {}) {
    const { page = 1, limit = 12 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const matchStage = { userId: new ObjectId(userId) };

    const [favorites, total] = await Promise.all([
      this.Favorite.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
      ]).toArray(),
      this.Favorite.countDocuments(matchStage),
    ]);

    return {
      favorites,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async isFavorited(userId, productId) {
    const doc = await this.Favorite.findOne({
      userId: new ObjectId(userId),
      productId: new ObjectId(productId),
    });
    return !!doc;
  }

  async countByProduct(productId) {
    return await this.Favorite.countDocuments({
      productId: new ObjectId(productId),
    });
  }

  async removeAllByUser(userId) {
    return await this.Favorite.deleteMany({
      userId: new ObjectId(userId),
    });
  }
}

module.exports = FavoriteService;