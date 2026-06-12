const { ObjectId } = require("mongodb");
const axios = require("axios");
const config = require("../config/recommendation.config");

// ── Groq caller ────────────────────────────────────────────────────────────
const provider = config.providers[0];

let _keyIndex = 0;
function getNextApiKey() {
  if (!provider.apiKeys.length) throw new Error("Chưa cấu hình GROQ_API_KEY");
  const key = provider.apiKeys[_keyIndex % provider.apiKeys.length];
  _keyIndex++;
  return key;
}

async function callGroq(messages) {
  for (let attempt = 0; attempt < provider.models.length; attempt++) {
    const model = provider.models[attempt];
    try {
      const res = await axios.post(
        provider.url,
        {
          model,
          messages: [
            { role: "system", content: config.systemPrompt },
            ...messages,
          ],
          max_tokens:  config.maxTokens,
          temperature: config.temperature,
        },
        {
          headers: {
            Authorization: `Bearer ${getNextApiKey()}`,
            "Content-Type": "application/json",
          },
          timeout: config.timeout,
        }
      );
      return res.data.choices[0].message.content;
    } catch (err) {
      console.warn(`[Groq] model=${model} attempt=${attempt + 1} status=${err.response?.status}`);
      if (attempt === provider.models.length - 1) throw err;
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatSpecs(specs = {}) {
  if (!specs || typeof specs !== "object") return "";
  return Object.entries(specs)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => {
      const label = k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
      return `${label}: ${v}`;
    })
    .join(" | ")
    .slice(0, 200);
}

function inferUserIntent(product) {
  const name     = (product.name        || "").toLowerCase();
  const category = (product.category    || "").toLowerCase();
  const desc     = (product.description || "").toLowerCase();
  const combined = `${name} ${category} ${desc}`;

  const intents = [];

  const isIphone  = /iphone|ios|apple|lightning/.test(combined);
  const isAndroid = /\b(android|samsung|xiaomi|oppo|realme|vivo|huawei)\b/.test(combined) && !isIphone;

  if (isIphone)  intents.push("dùng cho iPhone/iOS");
  if (isAndroid) intents.push("dùng cho Android");

  if (/type-c|usb-c|usbc/.test(combined))               intents.push("cổng USB-C");
  if (/lightning/.test(combined))                         intents.push("cổng Lightning");
  if (/\b(ốp|case|bao da)\b/.test(combined))             intents.push("bảo vệ điện thoại");
  if (/kính|cường lực|dán màn/.test(combined))            intents.push("bảo vệ màn hình");
  if (/\b(sạc|charger|adapter|củ sạc)\b/.test(combined)) intents.push("nhu cầu sạc điện");
  if (/tai nghe|earphone|earbud|airpod/.test(combined))   intents.push("nghe nhạc / nghe gọi");
  if (/gaming|game|chơi game/.test(combined))              intents.push("chơi game mobile");
  if (/pin dự phòng|powerbank/.test(combined))             intents.push("dùng ngoài trời");
  if (/selfie|chụp ảnh|gimbal|tripod/.test(combined))     intents.push("chụp ảnh / quay video");
  if (/không dây|wireless|bluetooth/.test(combined))       intents.push("kết nối không dây");
  if (/\b(cáp|cable|dây sạc)\b/.test(combined))           intents.push("cần cáp kết nối");
  if (/magsafe/.test(combined))                            intents.push("hỗ trợ MagSafe");

  return intents.length > 0 ? intents.join(", ") : "sử dụng hàng ngày";
}

// ── Service ────────────────────────────────────────────────────────────────
class RecommendationService {
  constructor(client) {
    this.Order           = client.db().collection("orders");
    this.Product         = client.db().collection("products");
    // Thay recommendation_cache → product_recommendations (lưu vĩnh viễn, không TTL)
    this.Recommendations = client.db().collection("product_recommendations");

    this.Recommendations.createIndex(
      { productId: 1 },
      { unique: true, background: true }
    ).catch(() => {});
  }

  // ── LƯU / ĐỌC TỪ DB ─────────────────────────────────────────────────────

  async getStored(productId) {
    try {
      const doc = await this.Recommendations.findOne({ productId });
      if (!doc) {
        console.log(`[Rec] DB MISS — productId=${productId}`);
        return null;
      }
      console.log(`[Rec] DB HIT  — productId=${productId} | updatedAt=${doc.updatedAt?.toISOString()}`);
      return { collaborative: doc.collaborative, sameCategory: doc.sameCategory };
    } catch (err) {
      console.error("[Rec] Lỗi đọc DB:", err.message);
      return null;
    }
  }

  async saveToDb(productId, result) {
    try {
      await this.Recommendations.updateOne(
        { productId },
        {
          $set: {
            productId,
            collaborative: result.collaborative,
            sameCategory:  result.sameCategory,
            updatedAt:     new Date(),
          },
        },
        { upsert: true }
      );
      console.log(`[Rec] DB SAVED — productId=${productId} | collaborative=${result.collaborative.length} | sameCategory=${result.sameCategory.length}`);
    } catch (err) {
      console.error("[Rec] Lỗi lưu DB:", err.message);
    }
  }

  /** Xóa gợi ý của 1 SP → lần load tiếp sẽ tính lại */
  async invalidate(productId) {
    try {
      const res = await this.Recommendations.deleteOne({ productId });
      console.log(`[Rec] INVALIDATED — productId=${productId} | deleted=${res.deletedCount}`);
      return res.deletedCount > 0;
    } catch (err) {
      console.error("[Rec] Lỗi invalidate:", err.message);
      return false;
    }
  }

  /** Xóa toàn bộ gợi ý đã lưu */
  async invalidateAll() {
    try {
      const res = await this.Recommendations.deleteMany({});
      console.log(`[Rec] INVALIDATED ALL — deleted=${res.deletedCount}`);
      return res.deletedCount;
    } catch (err) {
      console.error("[Rec] Lỗi invalidate all:", err.message);
      return 0;
    }
  }

  // ── THU THẬP DỮ LIỆU THÔ ────────────────────────────────────────────────

  async getCurrentProduct(productId) {
    return this.Product.findOne(
      { _id: new ObjectId(productId) },
      { projection: { _id:1, name:1, brand:1, category:1, description:1, price:1, specs:1 } }
    );
  }

  async getPurchaseHistory(productId, maxOrders = config.maxOrders) {
    const oid = new ObjectId(productId);
    const orders = await this.Order.find({
      $or: [
        { "items.productId": oid },
        { "items.productId": productId },
      ],
      status: { $nin: ["cancelled", "deleted", "failed"] },
    })
      .limit(maxOrders)
      .project({ "items.productId": 1, "items.quantity": 1 })
      .toArray();

    const freq = {};
    for (const order of orders) {
      for (const item of order.items || []) {
        const id = item.productId?.toString();
        if (!id || id === productId) continue;
        freq[id] = (freq[id] || 0) + (item.quantity || 1);
      }
    }

    console.log(`[Rec] Purchase history: ${Object.keys(freq).length} SP từ ${orders.length} đơn hàng hợp lệ`);
    return freq;
  }

  async getCatalog(currentProductId, limit = 40) {
    return this.Product.find({
      _id:      { $ne: new ObjectId(currentProductId) },
      isActive: true,
    })
      .sort({ sold: -1 })
      .limit(limit)
      .project({ _id:1, name:1, brand:1, category:1, description:1, price:1, salePrice:1, images:1, stock:1, specs:1 })
      .toArray();
  }

  // ── LLM ─────────────────────────────────────────────────────────────────

  async getLLMRecommendations(currentProduct, purchaseHistory, catalog, limit = 4) {
    if (!catalog.length) return [];

    const userIntent   = inferUserIntent(currentProduct);
    const currentSpecs = formatSpecs(currentProduct.specs);

    const catalogInfo = catalog.map((p, i) => {
      const histCount = purchaseHistory[p._id.toString()] || 0;
      const specs     = formatSpecs(p.specs);
      const priceInfo = p.salePrice
        ? `${p.salePrice.toLocaleString("vi-VN")}₫ (giảm từ ${p.price.toLocaleString("vi-VN")}₫)`
        : `${(p.price || 0).toLocaleString("vi-VN")}₫`;

      return [
        `[${i}] ${p.name}`,
        `    Brand: ${p.brand || "N/A"} | Danh mục: ${p.category || "N/A"}`,
        specs         ? `    Specs: ${specs}`                        : null,
        p.description ? `    Mô tả: ${p.description.slice(0, 80)}`  : null,
        `    Giá: ${priceInfo}`,
        histCount > 0 ? `    ★ Đã mua kèm ${histCount} lần`         : null,
      ].filter(Boolean).join("\n");
    }).join("\n\n");

    const prompt = `## SẢN PHẨM KHÁCH ĐANG XEM:
Tên: ${currentProduct.name}
Brand: ${currentProduct.brand || "N/A"}
Danh mục: ${currentProduct.category || "N/A"}
${currentSpecs            ? `Specs: ${currentSpecs}`                              : ""}
${currentProduct.description ? `Mô tả: ${currentProduct.description.slice(0, 200)}` : ""}

## MỤC ĐÍCH KHÁCH HÀNG (đã phân tích):
${userIntent}

## DANH SÁCH SẢN PHẨM CÓ THỂ GỢI Ý:
${catalogInfo}

## YÊU CẦU:
Chọn đúng ${limit} sản phẩm PHÙ HỢP NHẤT để gợi ý kèm.
KHÔNG chọn SP dành cho thiết bị khác (VD: SP đang xem là iPhone thì không chọn SP Galaxy/Android).
KHÔNG chọn SP cùng loại với SP đang xem.
Nếu không đủ SP phù hợp, trả về ít hơn ${limit} phần tử.

Khi viết aiReason:
- Phải liên quan trực tiếp đến "${currentProduct.name}"
- Nêu rõ lợi ích cụ thể khách nhận được
- Tối đa 15 từ tiếng Việt, không dùng dấu chấm cuối câu
- Ví dụ hay: "Bảo vệ camera khỏi trầy khi để túi cùng ốp lưng"

Trả về JSON hợp lệ:
[
  { "index": 0, "reason": "Lý do cụ thể tối đa 15 từ" }
]`;

    try {
      console.log(`[LLM] Gọi Groq | intent="${userIntent}" | catalog=${catalog.length} SP`);
      const raw = await callGroq([{ role: "user", content: prompt }]);

      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Không tìm thấy JSON trong response");

      const picks = JSON.parse(jsonMatch[0]);
      const result = [];
      for (const pick of picks) {
        const product = catalog[pick.index];
        if (product) result.push({ ...product, aiReason: pick.reason || null });
        if (result.length >= limit) break;
      }

      if (result.length < limit) {
        const usedIdx = new Set(picks.map(p => p.index));
        for (let i = 0; i < catalog.length && result.length < limit; i++) {
          if (!usedIdx.has(i)) result.push({ ...catalog[i], aiReason: null });
        }
      }

      console.log(`[LLM] Kết quả: ${result.map(p => `"${p.name}" → "${p.aiReason}"`).join(" | ")}`);
      return result;

    } catch (err) {
      console.error("[LLM] Lỗi:", err.message);
      return catalog.slice(0, limit).map(p => ({ ...p, aiReason: null }));
    }
  }

  async getSmartRecommendations(productId, limit = 4) {
    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      return { collaborative: [], sameCategory: [] };
    }

    // 1. Đọc từ DB — nếu có thì trả về luôn, không gọi LLM
    const stored = await this.getStored(productId);
    if (stored) return stored;

    // 2. Chưa có → tính toán bằng LLM
    console.log(`[Rec] Tính toán mới cho productId=${productId}`);

    const [currentProduct, purchaseHistory, catalog] = await Promise.all([
      this.getCurrentProduct(productId),
      this.getPurchaseHistory(productId),
      this.getCatalog(productId, config.catalogLimit),
    ]);

    if (!currentProduct) {
      console.warn(`[Rec] Không tìm thấy sản phẩm productId=${productId}`);
      return { collaborative: [], sameCategory: [] };
    }

    const userIntent = inferUserIntent(currentProduct);
    console.log(`[Rec] SP: "${currentProduct.name}" | Intent: "${userIntent}" | Lịch sử: ${Object.keys(purchaseHistory).length} SP | Catalog: ${catalog.length} SP`);

    const historyIds = new Set(Object.keys(purchaseHistory));

    const poolA = catalog
      .filter(p => historyIds.has(p._id.toString()))
      .map(p => ({ ...p, coOccurrenceCount: purchaseHistory[p._id.toString()] || 0 }));

    const poolAIds  = new Set(poolA.map(p => p._id.toString()));
    const poolB     = catalog.filter(p => !poolAIds.has(p._id.toString()) && p.category === currentProduct.category);
    const poolBFull = poolB.length >= limit
      ? poolB
      : [
          ...poolB,
          ...catalog
            .filter(p => !poolAIds.has(p._id.toString()) && p.category !== currentProduct.category)
            .slice(0, limit * 2),
        ];

    console.log(`[Rec] Pool A: ${poolA.length} SP | Pool B: ${poolBFull.length} SP`);

    const [collaborative, sameCategoryRaw] = await Promise.all([
      poolA.length > 0
        ? this.getLLMRecommendations(currentProduct, purchaseHistory, poolA, limit)
        : Promise.resolve([]),
      poolBFull.length >= 2
        ? this.getLLMRecommendations(currentProduct, {}, poolBFull, limit)
        : Promise.resolve([]),
    ]);

    const collabIds = new Set(collaborative.map(p => p._id.toString()));
    const result = {
      collaborative,
      sameCategory: sameCategoryRaw.filter(p => !collabIds.has(p._id.toString())),
    };

    // 3. Lưu vào DB vĩnh viễn
    await this.saveToDb(productId, result);

    return result;
  }
}

module.exports = RecommendationService;