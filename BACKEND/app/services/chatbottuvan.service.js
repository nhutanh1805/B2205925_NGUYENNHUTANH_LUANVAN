const { ObjectId } = require("mongodb");
const config       = require("../config/chatbottuvan.config");
const OrderService  = require("./order.service");
const PointService  = require("./point.service");
const CartService   = require("./cart.service");

function extractContent(msg) {
    if (!msg) return null;
    const content = msg.content;
    if (content && content.trim()) return content.trim();
    const reasoning = msg.reasoning;
    if (reasoning && reasoning.trim()) return reasoning.trim();
    return null;
}

// ─── Tìm đơn hàng theo _id đầy đủ HOẶC mã rút gọn 6 ký tự cuối ────────────────
// UI (OrderDetail, shipper app...) chỉ hiển thị mã rút gọn kiểu #3F0CC0BD
// (_id.slice(-6).toUpperCase()), khách/shipper không bao giờ nhìn thấy _id đầy
// đủ 24 ký tự. Vì vậy khi khách nhắn mã rút gọn cho chatbot, phải tự tra theo
// 6 ký tự cuối của _id thay vì findById thẳng (sẽ luôn ra null/lỗi).
async function resolveOrder(db, rawId) {
    if (!rawId) return null;
    const clean = rawId.toString().replace("#", "").trim();

    // Mã đầy đủ (24 ký tự hex) → tìm trực tiếp
    if (/^[0-9a-fA-F]{24}$/.test(clean)) {
        return await db.collection("orders").findOne({ _id: new ObjectId(clean) });
    }

    // Mã rút gọn (4-23 ký tự hex) → so khớp N ký tự CUỐI của _id, N = độ dài mã
    // được truyền vào. Không cố định 6 ký tự vì các UI khác nhau trong hệ thống
    // (shipper app, OrderDetail khách, admin...) có thể cắt số ký tự khác nhau.
    if (/^[0-9a-fA-F]{4,23}$/.test(clean)) {
        const len = clean.length;
        const start = 24 - len;
        const orders = await db.collection("orders").find({
            $expr: {
                $eq: [
                    { $toLower: { $substrCP: [{ $toString: "$_id" }, start, len] } },
                    clean.toLowerCase(),
                ],
            },
        }).toArray();
        return orders[0] || null;
    }

    return null;
}

// ─── Fallback parser cho model KHÔNG hỗ trợ native tool_calls ─────────────────
// Một số model (thường là các model fallback ít hỗ trợ function-calling chuẩn
// OpenAI) sẽ in tool call ra dạng text kiểu Llama cũ:
//   <function=search_product>{"query":"..."}</function>
// thay vì điền vào field `tool_calls` chuẩn. Nếu không xử lý, đoạn text rác này
// sẽ bị coi là câu trả lời cuối và hiển thị thẳng cho khách, hoặc tệ hơn là model
// tự bịa luôn nhiều lệnh gọi liên tiếp (kèm tham số bịa) trong CÙNG 1 lượt mà
// chưa hề có kết quả thật của lệnh trước — vi phạm đúng quy trình tool-calling.
//
// Hàm này quét và trích ra các lệnh gọi dạng text, dùng cân bằng dấu ngoặc {}
// để lấy đúng khối JSON (an toàn hơn regex non-greedy khi JSON có ngoặc lồng).
function parsePseudoFunctionCalls(text) {
    if (!text) return [];
    const calls = [];
    const tagRegex = /<?function\s*=\s*([a-zA-Z_][\w]*)\s*>/g;
    let match;

    while ((match = tagRegex.exec(text)) !== null) {
        const name = match[1];
        const jsonStart = text.indexOf("{", match.index);
        if (jsonStart === -1) continue;

        let depth = 0;
        let end = -1;
        for (let j = jsonStart; j < text.length; j++) {
            if (text[j] === "{") depth++;
            else if (text[j] === "}") {
                depth--;
                if (depth === 0) { end = j + 1; break; }
            }
        }
        if (end === -1) continue;

        try {
            const args = JSON.parse(text.slice(jsonStart, end));
            calls.push({ name, args });
        } catch {
            // JSON hỏng thì bỏ qua lệnh này, không cố đoán
        }
    }
    return calls;
}

// ─── RAG: Full-text search trên MongoDB ───────────────────────────────────────
async function retrieveContext(db, userMessage) {
    const collection = db.collection(config.vectorCollection);

    const stopwords = ["tôi", "bạn", "có", "không", "gì", "là", "và", "của", "cho", "được", "này", "những", "các", "một", "với", "trong", "để", "thì", "mà", "như", "khi", "từ", "về", "ở", "đã", "sẽ", "đang", "rất", "nào", "hay", "hoặc", "cũng", "vì", "nếu", "thế", "làm", "muốn", "cần", "hỏi", "đáp"];
    const keywords = userMessage
        .toLowerCase()
        .replace(/[?!.,]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 1 && !stopwords.includes(w));

    if (!keywords.length) return "";

    const regexList = keywords.map((k) => new RegExp(k, "i"));

    const docs = await collection
        .find({ text: { $in: regexList.map((r) => r) } })
        .limit(config.topK * 3)
        .toArray();

    if (!docs.length) {
        const allDocs = await collection.find({}).limit(config.topK).toArray();
        return allDocs.map((d, i) => `[${i + 1}] (${d.type}) ${d.text}`).join("\n");
    }

    const scored = docs
        .map((doc) => {
            const score = keywords.filter((k) => doc.text.toLowerCase().includes(k)).length;
            return { text: doc.text, type: doc.type, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, config.topK);

    return scored.map((r, i) => `[${i + 1}] (${r.type}) ${r.text}`).join("\n");
}

// ─── Main Service ─────────────────────────────────────────────────────────────
class ChatbotTuvanService {

    async _executeTool(toolName, args, ctx) {
        const { client, db, userId } = ctx;
        const orderService = new OrderService(client);
        const pointService  = new PointService(client);
        const cartService   = new CartService(client);

        try {
            switch (toolName) {
                case "get_point_balance": {
                    if (!userId) return { error: "Khách chưa đăng nhập, không thể tra điểm" };
                    const balance = await pointService.getBalance(userId);
                    return { balance };
                }

                case "get_my_profile": {
                    if (!userId) return { error: "Khách chưa đăng nhập, không thể lấy hồ sơ" };
                    const user = await db.collection("users").findOne(
                        { _id: new ObjectId(userId) },
                        { projection: { name: 1, phone: 1, address: 1 } }
                    );
                    if (!user) return { error: "Không tìm thấy hồ sơ khách hàng" };
                    return {
                        fullName: user.name || null,
                        phone: user.phone || null,
                        address: user.address || null,
                    };
                }

                case "get_my_orders": {
                    if (!userId) return { error: "Khách chưa đăng nhập, không thể tra đơn hàng" };
                    const orders = await orderService.getOrdersByUser(userId);
                    return {
                        orders: orders.slice(0, 5).map((o) => ({
                            orderId: o._id.toString(),
                            shortCode: o._id.toString().slice(-6).toUpperCase(),
                            status: o.status,
                            totalPrice: o.totalPrice,
                            createdAt: o.createdAt,
                        })),
                    };
                }

                case "get_order_status": {
    // Hỗ trợ cả _id đầy đủ và mã rút gọn 6 ký tự (#3F0CC0BD) mà UI hiển thị
    const order = await resolveOrder(db, args.orderId);
    if (!order) return { error: "Không tìm thấy đơn hàng với mã này" };
    if (userId && order.userId?.toString() !== userId.toString()) {
        return { error: "Đơn hàng này không thuộc về khách đang chat" };
    }
    return {
        orderId: order._id.toString(),
        status: order.status,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
    };
}

                case "search_product": {
                    if (!args.query?.trim()) return { error: "Thiếu từ khóa tìm kiếm" };
                    const regex = new RegExp(args.query.trim(), "i");
                    const products = await db.collection("products")
                        .find({ name: regex, isActive: true })
                        .limit(5)
                        .toArray();

                    return {
                        products: products.map((p) => ({
                            productId: p._id.toString(),
                            name: p.name,
                            price: p.salePrice && p.salePrice < p.price ? p.salePrice : p.price,
                            stock: p.stock,
                        })),
                    };
                }

                case "create_order": {
                    if (!userId) return { error: "Khách cần đăng nhập để đặt hàng" };

                    if (ctx.createdOrder) {
                        return {
                            success: true,
                            orderId: ctx.createdOrder.orderId,
                            totalPrice: ctx.createdOrder.totalPrice,
                            pointsUsed: ctx.createdOrder.pointsUsed,
                            discount: ctx.createdOrder.discount,
                            note: "Đơn hàng đã được tạo trước đó trong lượt chat này, không tạo trùng.",
                        };
                    }

                    if (!Array.isArray(args.items) || args.items.length === 0) {
                        return { error: "Thiếu danh sách sản phẩm" };
                    }

                    // Tự điền địa chỉ/SĐT từ hồ sơ nếu model không truyền (giống CheckoutView.vue)
                    let shippingAddress = args.shippingAddress?.trim();
                    let phone = args.phone?.trim();

                    if (!shippingAddress || !phone) {
                        const user = await db.collection("users").findOne(
                            { _id: new ObjectId(userId) },
                            { projection: { phone: 1, address: 1 } }
                        );
                        if (!shippingAddress) shippingAddress = user?.address || "";
                        if (!phone) phone = user?.phone || "";
                    }

                    if (!shippingAddress) return { error: "Chưa có địa chỉ giao hàng, hãy hỏi khách cung cấp" };
                    if (!phone) return { error: "Chưa có số điện thoại, hãy hỏi khách cung cấp" };

                    let productIds;
                    try {
                        productIds = args.items.map((i) => new ObjectId(i.productId));
                    } catch {
                        return { error: "productId không hợp lệ, hãy dùng search_product để lấy đúng mã" };
                    }

                    const products = await db.collection("products")
                        .find({ _id: { $in: productIds }, isActive: true })
                        .toArray();

                    const items = [];
                    for (const reqItem of args.items) {
                        const p = products.find((p) => p._id.toString() === reqItem.productId);
                        if (!p) return { error: `Không tìm thấy sản phẩm mã ${reqItem.productId}` };
                        if (p.stock < reqItem.quantity) {
                            return { error: `Sản phẩm "${p.name}" chỉ còn ${p.stock} cái, không đủ số lượng yêu cầu` };
                        }
                        items.push({
                            productId: p._id.toString(),
                            name: p.name,
                            price: p.salePrice && p.salePrice < p.price ? p.salePrice : p.price,
                            quantity: reqItem.quantity,
                            images: p.images,
                        });
                    }

                    const originalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
                    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);

                    let pointsUsed = 0;
                    let discount   = 0;

                    if (args.pointsToUse > 0) {
                        const redeemResult = await pointService.redeemForOrder(
                            userId,
                            null,
                            args.pointsToUse,
                            originalPrice
                        );
                        pointsUsed = redeemResult.pointsUsed;
                        discount   = redeemResult.discount;
                    }

                    const totalPrice = Math.max(0, originalPrice - discount);

                    const order = await orderService.createOrder({
                        userId,
                        items,
                        totalQuantity,
                        originalPrice,
                        discount,
                        pointsUsed,
                        totalPrice,
                        shippingAddress,
                        phone,
                        note: args.note || "",
                        paymentMethod: "COD",
                    });

                    // ── Gắn orderId vào transaction điểm vừa tạo ──
                    if (pointsUsed > 0) {
                        await pointService.Points.updateOne(
                            { userId, type: "redeem", orderId: null },
                            { $set: { orderId: order._id, note: `Dùng điểm giảm giá đơn hàng #${order._id}` } }
                        );
                    }

                    // ── Xoá sản phẩm đã đặt khỏi giỏ (best-effort, không chặn đơn nếu lỗi) ──
                    for (const item of items) {
                        try {
                            await cartService.removeItem(userId, item.productId);
                        } catch (err) {
                            console.warn("[ChatbotTuvan] Xoá giỏ hàng lỗi:", err.message);
                        }
                    }

                    const resultPayload = {
                        success: true,
                        orderId: order._id.toString(),
                        totalPrice: order.totalPrice,
                        pointsUsed,
                        discount,
                    };

                    // Lưu lại vào ctx để chống tạo trùng nếu model lỡ gọi lại tool này
                    // trong cùng lượt chat, và để dùng làm fallback nếu hết maxSteps.
                    ctx.createdOrder = resultPayload;

                    return resultPayload;
                }

                default:
                    return { error: `Không hỗ trợ tool "${toolName}"` };
            }
        } catch (err) {
            return { error: err.message };
        }
    }

    async _callModelWithFallback(messages) {
        let lastErr = null;

        for (const provider of config.providers) {
            for (const model of provider.models) {
                for (const apiKey of provider.apiKeys) {
                    try {
                        const response = await fetch(provider.url, {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${apiKey}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                model,
                                messages,
                                tools: config.tools,
                                tool_choice: "auto",
                            }),
                        });

                        console.log(
                            `[Groq] ${model} | ...${apiKey.slice(-6)} còn lại: ` +
                            `${response.headers.get("x-ratelimit-remaining-requests")}/${response.headers.get("x-ratelimit-limit-requests")} req` +
                            ` | ${response.headers.get("x-ratelimit-remaining-tokens")}/${response.headers.get("x-ratelimit-limit-tokens")} tokens` +
                            ` | reset: ${response.headers.get("x-ratelimit-reset-requests")}`
                        );

                        const data = await response.json();

                        if (data.error) {
                            console.warn(`[ChatbotTuvan] ${model} / ...${apiKey.slice(-6)} lỗi:`, data.error.message);
                            lastErr = new Error(data.error.message);
                            continue; // thử model/key khác CHO BƯỚC HIỆN TẠI
                        }

                        const choice = data.choices?.[0];
                        if (!choice?.message) {
                            lastErr = new Error("Response không có message");
                            continue;
                        }

                        console.log(`[ChatbotTuvan] Dùng model: ${model} | Key: ...${apiKey.slice(-6)}`);
                        return choice.message;
                    } catch (err) {
                        console.warn(`[ChatbotTuvan] ${model} exception:`, err.message);
                        lastErr = err;
                    }
                }
            }
        }

        throw lastErr || new Error("Không có model nào phản hồi được");
    }

    async chatWithAI(client, userMessage, conversationHistory = [], userId = null) {
        const db = client.db();

        // 1. RAG context
        let ragContext = "";
        try {
            ragContext = await retrieveContext(db, userMessage);
        } catch (err) {
            console.warn("[ChatbotTuvan] RAG lỗi:", err.message);
        }

        // 2. Lấy sản phẩm thật từ DB
        let productContext = "";
        try {
            const products = await db.collection("products").find({}).limit(50).toArray();
            productContext = products
                .map((p) => {
                    const hasSale = p.salePrice && p.salePrice < p.price;
                    const priceText = hasSale
                        ? `${p.price.toLocaleString()} VNĐ → KM còn ${p.salePrice.toLocaleString()} VNĐ`
                        : `${p.price.toLocaleString()} VNĐ`;
                    return `- ${p.name}: ${priceText} (Loại: ${p.category})`;
                })
                .join("\n");
        } catch (err) {
            console.warn("[ChatbotTuvan] Lấy sản phẩm lỗi:", err.message);
        }

        // 3. Build system prompt
        const systemContent = [
            config.systemPrompt,
            userId ? "" : "[LƯU Ý]: Khách hiện CHƯA đăng nhập, không thể tra điểm/đơn hàng hoặc đặt hàng.",
            "[LƯU Ý VỀ MÃ ĐƠN HÀNG]: Khách thường cung cấp mã đơn dạng RÚT GỌN " +
            "(ví dụ: #3F0CC0BD), đây chính là mã hiển thị trên giao diện, không phải " +
            "_id đầy đủ trong database. Khi gọi tool get_order_status, hãy truyền " +
            "NGUYÊN VĂN mã khách cung cấp (có thể bỏ dấu #), KHÔNG tự bịa thêm ký tự " +
            "hay cố đoán ra mã dài hơn — hệ thống sẽ tự tra theo mã rút gọn này, " +
            "dù mã dài hay ngắn.",
            productContext ? `[SẢN PHẨM HIỆN CÓ]:\n${productContext}` : "",
            ragContext     ? `[NGỮ CẢNH BỔ SUNG]:\n${ragContext}`      : "",
        ].filter(Boolean).join("\n\n");

        // 4. Build messages (chỉ khởi tạo 1 lần cho cả lượt chat)
        let messages = [
            { role: "system", content: systemContent },
            ...conversationHistory.map((msg) => ({
                role: msg.role === "bot" ? "assistant" : msg.role,
                content: msg.content,
            })),
            { role: "user", content: userMessage },
        ];

        const ctx = { client, db, userId, createdOrder: null };
        const maxSteps = config.maxToolSteps || 4;

        for (let step = 0; step < maxSteps; step++) {
            const msg = await this._callModelWithFallback(messages);

            if (!msg.tool_calls?.length && msg.content) {
                const pseudoCalls = parsePseudoFunctionCalls(msg.content);
                if (pseudoCalls.length) {
                    const first = pseudoCalls[0];
                    if (pseudoCalls.length > 1) {
                        console.warn(
                            `[ChatbotTuvan] Model trả ${pseudoCalls.length} tool-call dạng text giả trong 1 lượt, ` +
                            `chỉ thực thi lệnh đầu tiên "${first.name}", bỏ qua các lệnh sau (model tự bịa, chưa có kết quả thật).`
                        );
                    } else {
                        console.warn(`[ChatbotTuvan] Model trả tool-call dạng text giả "${first.name}", tự parse lại.`);
                    }
                    msg.tool_calls = [{
                        id: `pseudo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        function: { name: first.name, arguments: JSON.stringify(first.args || {}) },
                    }];
                    msg.content = null; // không hiển thị text rác cho khách
                }
            }

            // Model muốn gọi tool
            if (msg.tool_calls?.length) {
                messages.push(msg);

                for (const call of msg.tool_calls) {
                    let result;
                    try {
                        const args = JSON.parse(call.function.arguments || "{}");
                        result = await this._executeTool(call.function.name, args, ctx);
                    } catch (err) {
                        result = { error: err.message };
                    }

                    console.log(`[ChatbotTuvan] Tool "${call.function.name}" ->`, JSON.stringify(result).slice(0, 200));

                    messages.push({
                        role: "tool",
                        tool_call_id: call.id,
                        content: JSON.stringify(result),
                    });
                }
                continue; 
            }

            // Model trả lời text bình thường
            const content = extractContent(msg);
            if (content) {
                if (/function\s*=\s*[a-zA-Z_]\w*\s*>/.test(content)) {
                    console.warn("[ChatbotTuvan] Content cuối vẫn dính cú pháp tool-call giả, bỏ qua:", content.slice(0, 200));
                    break;
                }
                return content;
            }
            break;
        }

        if (ctx.createdOrder) {
            const o = ctx.createdOrder;
            return `Đơn hàng của bạn đã được đặt thành công! Mã đơn: ${o.orderId}, tổng tiền: ${o.totalPrice.toLocaleString()} VNĐ (thanh toán COD). Cảm ơn bạn đã mua hàng, shop sẽ giao trong 2-5 ngày nhé!`;
        }

        throw new Error("Model trả về định dạng không hợp lệ, vui lòng thử lại");
    }
}

module.exports = new ChatbotTuvanService();