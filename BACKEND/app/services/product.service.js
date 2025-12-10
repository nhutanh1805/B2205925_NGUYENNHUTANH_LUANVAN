const { ObjectId } = require("mongodb");

class ProductService {
  constructor(client) {
    this.Product = client.db().collection("products");
  }

  extractProductData(payload) {
    const product = {
      name: payload.name,
      slug: payload.slug,
      shortDescription: payload.shortDescription,
      description: payload.description,
      price: Number(payload.price),
      salePrice: payload.salePrice ? Number(payload.salePrice) : undefined,
      sku: payload.sku,
      imei: payload.imei,
      stock: Number(payload.stock || 0),
      sold: Number(payload.sold || 0),
      brand: payload.brand,
      images: Array.isArray(payload.images) ? payload.images : [],
      specs: payload.specs || {},
      condition: payload.condition || "brand-new",
      batteryHealth: payload.batteryHealth ? Number(payload.batteryHealth) : undefined,
      origin: payload.origin || "Việt Nam",
      warrantyMonths: payload.warrantyMonths ? Number(payload.warrantyMonths) : undefined,
      isFeatured: payload.isFeatured === true,
      isActive: payload.isActive !== false,
    };

    Object.keys(product).forEach(
      (key) => product[key] === undefined && delete product[key]
    );

    return product;
  }

  async create(payload) {
    const product = this.extractProductData(payload);
    product.createdAt = new Date();
    product.updatedAt = new Date();

    if (product.imei) {
      const exist = await this.Product.findOne({ imei: product.imei });
      if (exist) throw new Error("IMEI đã tồn tại!");
    }

    const result = await this.Product.insertOne(product);
    return { _id: result.insertedId, ...product };
  }

  async findAll(query = {}) {
    const {
      page = 1,
      limit = 12,
      search,
      brand,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = query;

    let filters = { isActive: true };

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { "specs.storage": { $regex: search, $options: "i" } },
        { "specs.color": { $regex: search, $options: "i" } }
      ];
    }
    if (brand) filters.brand = brand;
    if (minPrice || maxPrice) {
      filters.salePrice = filters.salePrice || {};
      if (minPrice) filters.salePrice.$gte = Number(minPrice);
      if (maxPrice) filters.salePrice.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [products, total] = await Promise.all([
      this.Product.find(filters).sort(sort).skip(skip).limit(Number(limit)).toArray(),
      this.Product.countDocuments(filters)
    ]);

    return {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    return await this.Product.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = { _id: ObjectId.isValid(id) ? new ObjectId(id) : null };
    const update = this.extractProductData(payload);
    update.updatedAt = new Date();

    const result = await this.Product.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async delete(id) {
    const result = await this.Product.findOneAndUpdate(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      { $set: { isActive: false, deletedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async deleteAll() {
    const result = await this.Product.updateMany(
      { isActive: true },
      { $set: { isActive: false, deletedAt: new Date() } }
    );
    return { deletedCount: result.modifiedCount };
  }
}

module.exports = ProductService;