const { ObjectId } = require("mongodb");
const axios = require("axios");
const config = require("../config/recommendation.config");

const provider = config.providers[0];

if (!provider.apiKeys.length) throw new Error("Chưa cấu hình GROQ_API_KEY");

async function callGroq(messages, poolLabel = "?") {
  for (const model of provider.models) {
    for (let keyIdx = 0; keyIdx < provider.apiKeys.length; keyIdx++) {
      const apiKey = provider.apiKeys[keyIdx];
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
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: config.timeout,
          }
        );

        console.log(
          `[Groq] [${poolLabel}] ${model} | key#${keyIdx + 1} còn lại: ${res.headers["x-ratelimit-remaining-requests"]}/${res.headers["x-ratelimit-limit-requests"]} req` +
          ` | ${res.headers["x-ratelimit-remaining-tokens"]}/${res.headers["x-ratelimit-limit-tokens"]} tokens` +
          ` | reset: ${res.headers["x-ratelimit-reset-requests"]}`
        );

        return res.data.choices[0].message.content;
      } catch (err) {
        console.warn(`[Groq] [${poolLabel}] model=${model} key#${keyIdx + 1} lỗi: status=${err.response?.status}`);
      }
    }
  }
  throw new Error("Không có model/key nào phản hồi được");
}

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

// Chuẩn hoá list compatibility về chữ thường để so khớp
function normalizeCompat(list = []) {
  return (list || []).map(c => String(c).toLowerCase().trim());
}

// Kiểm tra 2 sản phẩm có cùng "hệ" thiết bị không (dựa trên field compatibility)
// - Nếu 1 trong 2 không có data compatibility -> coi như "không xác định", không loại
// - Nếu cả 2 có data nhưng không giao nhau -> không tương thích
function isCompatible(currentCompat, productCompat) {
  if (!currentCompat.length || !productCompat.length) return true; // thiếu data -> không chặn
  return productCompat.some(c => currentCompat.includes(c));
}

function inferUserIntent(product) {
  const name     = (product.name        || "").toLowerCase();
  const category = (product.category    || "").toLowerCase();
  const desc     = (product.description || "").toLowerCase();
  const compat   = (product.compatibility || []).join(" ").toLowerCase();
  const specText = Object.values(product.specs || {}).join(" ").toLowerCase();
  const combined = `${name} ${category} ${desc} ${compat} ${specText}`;

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

class RecommendationService {
  constructor(client) {
    this.Order           = client.db().collection("orders");
    this.Product         = client.db().collection("products");
    this.Recommendations = client.db().collection("product_recommendations");

    this.Recommendations.createIndex(
      { productId: 1 },
      { unique: true, background: true }
    ).catch(() => {});
  }

  async getStored(productId) {
    try {
      const doc = await this.Recommendations.findOne({ productId });
      if (!doc) {
        console.log(`[Rec] DB MISS — productId=${productId}`);
        return null;
      }
      console.log(`[Rec] DB HIT  — productId=${productId} | updatedAt=${doc.updatedAt?.toISOString()}`);
      return {
        collaborative: doc.collaborative,
        sameCategory:  doc.sameCategory,
      };
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

  async getCurrentProduct(productId) {
    return this.Product.findOne(
      { _id: new ObjectId(productId) },
      { projection: { _id:1, name:1, brand:1, category:1, description:1, price:1, specs:1, compatibility:1 } }
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

    // freq[id] = SỐ ĐƠN HÀNG KHÁC NHAU có xuất hiện sản phẩm này cùng productId.
    // Trước đây cộng theo item.quantity nên 1 đơn mua 2 cái bị tính thành "2 đơn hàng" — SAI.
    // Giờ mỗi đơn chỉ được tính tối đa 1 lần cho mỗi sản phẩm, bất kể mua bao nhiêu cái trong đơn đó.
    const freq = {};
    for (const order of orders) {
      const seenInThisOrder = new Set();
      for (const item of order.items || []) {
        const id = item.productId?.toString();
        if (!id || id === productId) continue;
        if (seenInThisOrder.has(id)) continue;
        seenInThisOrder.add(id);
        freq[id] = (freq[id] || 0) + 1;
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
      .project({ _id:1, name:1, brand:1, category:1, description:1, price:1, salePrice:1, images:1, stock:1, specs:1, compatibility:1 })
      .toArray();
  }

  async getLLMRecommendations(currentProduct, purchaseHistory, catalog, limit = 4, excludeSameCategory = true, poolLabel = "?") {
    if (!catalog.length) return [];

    const userIntent   = inferUserIntent(currentProduct);
    const currentSpecs = formatSpecs(currentProduct.specs);

    const catalogInfo = catalog.map((p, i) => {
      const histCount = purchaseHistory[p._id.toString()] || 0;
      const specs     = formatSpecs(p.specs);
      const compat    = (p.compatibility || []).join(", ");
      const priceInfo = p.salePrice
        ? `${p.salePrice.toLocaleString("vi-VN")}₫ (giảm từ ${p.price.toLocaleString("vi-VN")}₫)`
        : `${(p.price || 0).toLocaleString("vi-VN")}₫`;

      return [
        `[${i}] ${p.name}`,
        `    Brand: ${p.brand || "N/A"} | Danh mục: ${p.category || "N/A"}`,
        compat        ? `    Tương thích: ${compat}`                : null,
        specs         ? `    Specs: ${specs}`                       : null,
        p.description ? `    Mô tả: ${p.description.slice(0, 80)}` : null,
        `    Giá: ${priceInfo}`,
        histCount > 0 ? `    ★ Đã mua kèm ${histCount} lần`        : null,
      ].filter(Boolean).join("\n");
    }).join("\n\n");

    const prompt = `## SẢN PHẨM KHÁCH ĐANG XEM:
Tên: ${currentProduct.name}
Brand: ${currentProduct.brand || "N/A"}
Danh mục: ${currentProduct.category || "N/A"}
Tương thích: ${(currentProduct.compatibility || []).join(", ") || "N/A"}
${currentSpecs ? `Specs: ${currentSpecs}` : ""}
${currentProduct.description ? `Mô tả: ${currentProduct.description.slice(0, 200)}` : ""}

## MỤC ĐÍCH KHÁCH HÀNG (đã phân tích):
${userIntent}

## DANH SÁCH SẢN PHẨM CÓ THỂ GỢI Ý:
${catalogInfo}

## YÊU CẦU:
Chọn đúng ${limit} sản phẩm PHÙ HỢP NHẤT để gợi ý kèm.
BẮT BUỘC: nếu SP đang xem có "Tương thích" ghi rõ hệ thiết bị (iPhone/iOS hoặc Android),
chỉ chọn SP trong danh sách có "Tương thích" khớp đúng hệ đó.
Nếu SP trong danh sách không ghi "Tương thích", chỉ chọn khi specs/mô tả không mâu thuẫn với hệ thiết bị đang xem.
TUYỆT ĐỐI KHÔNG chọn SP dành riêng cho hệ điều hành/thiết bị khác (vd: đang xem SP cho iPhone thì không chọn SP chỉ dùng cho Android).
${excludeSameCategory ? "Ưu tiên SP khác loại với SP đang xem nếu có lựa chọn phù hợp. Nếu TẤT CẢ SP trong danh sách đều cùng loại với SP đang xem, vẫn PHẢI chọn đủ trong số đó, không được bỏ trống." : ""}
Nếu không đủ SP phù hợp, trả về ít hơn ${limit} phần tử.

Khi viết aiReason:
- Phải liên quan trực tiếp đến "${currentProduct.name}"
- Mỗi reason riêng biệt, không copy sang SP khác
- Tối đa 15 từ tiếng Việt, không dùng dấu chấm cuối câu

Trả về JSON hợp lệ:
[
  { "index": 0, "reason": "Lý do cụ thể tối đa 15 từ" }
]`;

    try {
      console.log(`[LLM] [${poolLabel}] Gọi Groq | intent="${userIntent}" | catalog=${catalog.length} SP`);
      const raw = await callGroq([{ role: "user", content: prompt }], poolLabel);

      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Không tìm thấy JSON trong response");

      const picks = JSON.parse(jsonMatch[0]);
      const result = [];
      const usedProductIds = new Set();

      for (const pick of picks) {
        const product = catalog[pick.index];
        if (!product) continue;
        const pid = product._id.toString();
        if (usedProductIds.has(pid)) continue;
        usedProductIds.add(pid);
        result.push({ ...product, aiReason: pick.reason || null });
        if (result.length >= limit) break;
      }

      if (result.length < limit) {
        const usedIdx = new Set(picks.map(p => p.index));
        for (let i = 0; i < catalog.length && result.length < limit; i++) {
          const product = catalog[i];
          const pid = product._id.toString();
          if (!usedIdx.has(i) && !usedProductIds.has(pid)) {
            usedProductIds.add(pid);
            result.push({ ...product, aiReason: null });
          }
        }
      }

      console.log(`[LLM] [${poolLabel}] Kết quả: ${result.map(p => `"${p.name}" → "${p.aiReason}"`).join(" | ")}`);
      return result;

    } catch (err) {
      console.error(`[LLM] [${poolLabel}] Lỗi:`, err.message);
      return catalog.slice(0, limit).map(p => ({ ...p, aiReason: null }));
    }
  }

  async getSmartRecommendations(productId, limit = 4) {
    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      return { collaborative: [], sameCategory: [] };
    }

    const stored = await this.getStored(productId);
    if (stored) return stored;

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

    const poolAIds = new Set(poolA.map(p => p._id.toString()));

    const currentCompat = normalizeCompat(currentProduct.compatibility);

    // Pool B: cùng danh mục, chưa có trong poolA, ưu tiên đúng hệ thiết bị
    const poolBAll = catalog.filter(p =>
      !poolAIds.has(p._id.toString()) &&
      p.category === currentProduct.category
    );
    const poolBMatched = poolBAll.filter(p => isCompatible(currentCompat, normalizeCompat(p.compatibility)));
    // Nếu lọc theo tương thích bị hết sạch (vd thiếu data), fallback dùng poolBAll để không mất gợi ý
    const poolB = poolBMatched.length ? poolBMatched : poolBAll;

    console.log(`[Rec] Pool A: ${poolA.length} SP | Pool B: ${poolB.length} SP`);

    const [collaborative, sameCategoryRaw] = await Promise.all([
      poolA.length > 0
        ? this.getLLMRecommendations(currentProduct, purchaseHistory, poolA, Math.min(limit, poolA.length), true, "PoolA-CollabHistory")
        : Promise.resolve([]),
      poolB.length >= 1
        ? this.getLLMRecommendations(currentProduct, {}, poolB, Math.min(limit, poolB.length), false, "PoolB-SameCategory")
        : Promise.resolve([]),
    ]);

    const collabIds = new Set(collaborative.map(p => p._id.toString()));

    const result = {
      collaborative,
      sameCategory: sameCategoryRaw.filter(p => !collabIds.has(p._id.toString())),
    };

    await this.saveToDb(productId, result);
    return result;
  }
}

module.exports = RecommendationService;