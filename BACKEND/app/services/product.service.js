const { ObjectId } = require("mongodb");

class ProductService {
  constructor(client) {
    this.Product = client.db().collection("products");
  }

  /* ================= CATEGORY CONFIG ================= */
  categoryConfig = {
    tai_nghe: {
      label: "Tai nghe",
      specs: ["type", "connectivity", "batteryLife", "noiseCancelling"]
    },

    cu_sac: {
      label: "Củ sạc",
      specs: ["power", "ports", "fastCharge"]
    },

    op_lung: {
      label: "Ốp lưng",
      specs: ["material", "compatibleModel", "color"]
    },

    cap_sac: {
      label: "Cáp sạc",
      specs: ["length", "connectorType", "fastChargeSupport"]
    }
  };

  /* ================= EXTRACT DATA ================= */

  extractProductData(payload) {

    const categoryRule = this.categoryConfig[payload.category];

    // lọc specs theo category
    let specs = {};
    if (categoryRule && payload.specs) {
      categoryRule.specs.forEach((key) => {
        if (payload.specs[key] !== undefined) {
          specs[key] = payload.specs[key];
        }
      });
    }

    const product = {
      name: payload.name,
      slug: payload.slug,
      shortDescription: payload.shortDescription,
      description: payload.description,

      price: Number(payload.price),
      salePrice: payload.salePrice
        ? Number(payload.salePrice)
        : undefined,

      sku: payload.sku,
      stock: Number(payload.stock || 0),
      sold: Number(payload.sold || 0),

      brand: payload.brand,
      category: payload.category,

      images: Array.isArray(payload.images)
        ? payload.images
        : [],

      specs, // ⭐ dynamic specs

      compatibility: payload.compatibility || [],

      origin: payload.origin || "Việt Nam",
      warrantyMonths: payload.warrantyMonths
        ? Number(payload.warrantyMonths)
        : undefined,

      isFeatured: payload.isFeatured === true,
      isActive: payload.isActive !== false,
    };

    Object.keys(product).forEach(
      (key) => product[key] === undefined && delete product[key]
    );

    return product;
  }

  /* ================= CRUD ================= */

  async create(payload) {
    const product = this.extractProductData(payload);

    product.createdAt = new Date();
    product.updatedAt = new Date();

    const result = await this.Product.insertOne(product);
    return { _id: result.insertedId, ...product };
  }

  async findAll(query = {}) {
    const {
      page = 1,
      limit = 12,
      search,
      brand,
      category,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = query;

    let filters = { isActive: true };

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ];
    }

    if (brand) filters.brand = brand;
    if (category) filters.category = category;

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [products, total] = await Promise.all([
      this.Product.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .toArray(),
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
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null
    };

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

  /* ================= HELPER ================= */

  getCategorySpecs(category) {
    return this.categoryConfig[category] || {};
  }
}

module.exports = ProductService;