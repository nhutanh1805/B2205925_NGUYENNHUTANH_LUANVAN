const { ObjectId } = require("mongodb");

class ProductService {
  constructor(client) {
    this.Product = client.db().collection("products");
  }

  /* ================= CATEGORY CONFIG ================= */
  categoryConfig = {
  tai_nghe: {
    label: "Tai nghe",
    specs: [
      "loai",
      "ket_noi",
      "thoi_luong_pin",
      "chong_on",
      "kich_thuoc_driver",
      "day_tan_so",
      "tro_khang",
      "micro",
      "phien_ban_bluetooth",
      "trong_luong"
    ]
  },

  op_lung: {
    label: "Ốp lưng",
    specs: [
      "chat_lieu",
      "tuong_thich_model",
      "mau_sac",
      "do_day",
      "chong_soc",
      "chong_tray",
      "trong_luong",
      "kieu_dang",
      "do_bam",
      "tan_nhiet"
    ]
  },

  cu_sac: {
    label: "Củ sạc",
    specs: [
      "cong_suat",
      "so_cong",
      "ho_tro_sac_nhanh",
      "dien_ap_vao",
      "dien_ap_ra",
      "chat_lieu",
      "chuan_sac",
      "an_toan",
      "kich_thuoc",
      "trong_luong"
    ]
  },

  cap_sac: {
    label: "Cáp sạc",
    specs: [
      "do_dai",
      "loai_dau_cam",
      "ho_tro_sac_nhanh",
      "toc_do_truyen",
      "chat_lieu",
      "do_ben",
      "chong_dut",
      "tuong_thich",
      "loi_day",
      "cong_suat_toi_da"
    ]
  },

  pin_du_phong: {
    label: "Pin dự phòng",
    specs: [
      "dung_luong",
      "cong_suat_ra",
      "ho_tro_sac_nhanh",
      "so_cong",
      "dung_luong_thuc",
      "loai_pin",
      "cong_sac_vao",
      "den_led",
      "trong_luong",
      "an_toan"
    ]
  },

  kinh_cuong_luc: {
    label: "Kính cường lực",
    specs: [
      "do_cung",
      "do_day",
      "chong_vet_van_tay",
      "tuong_thich_model",
      "do_trong_suot",
      "chong_vo",
      "phu_oleophobic",
      "vien_kinh",
      "do_phu_man_hinh",
      "do_cong"
    ]
  },

  sac_khong_day: {
    label: "Sạc không dây",
    specs: [
      "cong_suat",
      "chuan_sac",
      "ho_tro_magsafe",
      "hieu_suat",
      "khoang_cach_sac",
      "nhiet_do_hoat_dong",
      "den_bao",
      "chat_lieu",
      "tuong_thich",
      "toc_do_sac"
    ]
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
  : null,

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

  // Tách salePrice ra khỏi $set nếu null, dùng $unset để xóa hẳn
  const setData = { ...update };
  const unsetData = {};
  if (setData.salePrice === null) {
    delete setData.salePrice;
    unsetData.salePrice = "";
  }

  const result = await this.Product.findOneAndUpdate(
    filter,
    {
      $set: setData,
      ...(Object.keys(unsetData).length ? { $unset: unsetData } : {})
    },
    { returnDocument: "after" }
  );

  return result;
}

async delete(id) {
  const result = await this.Product.findOneAndUpdate(
    { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
    { $set: { isActive: false, deletedAt: new Date() } },
    { returnDocument: "after" }
  );

  return result; 
}

  /* ================= HELPER ================= */

  getCategorySpecs(category) {
    return this.categoryConfig[category] || {};
  }
}

module.exports = ProductService;