const { ObjectId } = require("mongodb");

class RecommendationService {
  constructor(client) {
    this.Order   = client.db().collection("orders");
    this.Product = client.db().collection("products");
  }

  async getRecommendations(productId, limit = 4) {
    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) return [];

    // DEBUG
    const testMatch = await this.Order.find({ "items.productId": new ObjectId(productId) }).toArray();
    console.log("=== DEBUG RECOMMENDATION ===");
    console.log("productId:", productId);
    console.log("Orders found:", testMatch.length);

    const result = await this.Order.aggregate([
      {
        $match: {
          "items.productId": new ObjectId(productId),
          status: { $nin: ["cancelled"] }
        }
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.productId": { $ne: new ObjectId(productId) }
        }
      },
      {
        $group: {
          _id: "$items.productId",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          let: { pid: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$pid"] },
                    { $eq: ["$isActive", true] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1, name: 1, brand: 1,
                price: 1, salePrice: 1,
                images: 1, stock: 1, category: 1
              }
            }
          ],
          as: "productInfo"
        }
      },
      { $match: { productInfo: { $ne: [] } } },
      { $unwind: "$productInfo" },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$productInfo", { coOccurrenceCount: "$count" }]
          }
        }
      }
    ]).toArray();

    console.log("Collaborative result count:", result.length);
    console.log("============================");

    return result;
  }

  async getFallbackRecommendations(productId, limit = 4) {
    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) return [];

    const product = await this.Product.findOne({ _id: new ObjectId(productId) });
    if (!product) return [];

    const fallback = await this.Product.find({
      _id:      { $ne: new ObjectId(productId) },
      category: product.category,
      isActive: true,
      stock:    { $gt: 0 }
    })
      .sort({ sold: -1 })
      .limit(limit)
      .project({ _id: 1, name: 1, brand: 1, price: 1, salePrice: 1, images: 1, stock: 1, category: 1 })
      .toArray();

    return fallback;
  }
}

module.exports = RecommendationService;