require("dotenv").config();
const { MongoClient } = require("mongodb");

const COLLECTION = "rag_documents";

const STATIC_DOCS = [
    { type: "policy", text: "Chính sách giao hàng: Shop giao hàng toàn quốc trong 2-5 ngày làm việc. Miễn phí giao hàng cho đơn từ 500.000 VNĐ." },
    { type: "policy", text: "Chính sách đổi trả: Đổi trả miễn phí trong 7 ngày nếu sản phẩm lỗi do nhà sản xuất. Sản phẩm phải còn nguyên seal và đầy đủ phụ kiện." },
    { type: "policy", text: "Phương thức thanh toán: Shop chấp nhận thanh toán COD tiền mặt khi nhận hàng, chuyển khoản ngân hàng và VNPay." },
    { type: "policy", text: "Bảo hành: Sản phẩm được bảo hành 12 tháng tại trung tâm bảo hành chính hãng. Tem bảo hành không được bóc." },
    { type: "faq",    text: "Hỏi: Shop có bán hàng chính hãng không? Đáp: Shop cam kết 100% hàng chính hãng, có tem bảo hành và hóa đơn VAT." },
    { type: "faq",    text: "Hỏi: Tôi có thể mua trả góp không? Đáp: Shop hỗ trợ trả góp 0% qua thẻ tín dụng Visa Mastercard và ứng dụng Kredivo Home Credit." },
    { type: "faq",    text: "Hỏi: Sản phẩm bị lỗi sau khi nhận hàng thì làm sao? Đáp: Liên hệ hotline shop trong vòng 24h, shop sẽ thu hồi và đổi máy mới hoặc hoàn tiền." },
    { type: "faq",    text: "Hỏi: Shop có hỗ trợ tư vấn chọn máy không? Đáp: Có, đội ngũ tư vấn viên sẵn sàng hỗ trợ qua chat hotline và Zalo 24/7." },
    { type: "faq",    text: "Hỏi: Tôi muốn mua số lượng lớn có được giảm giá không? Đáp: Shop có chính sách giá đặc biệt cho đơn hàng số lượng lớn, vui lòng liên hệ trực tiếp." },
];

async function getProductDocs(db) {
    const products = await db.collection("products").find({}).toArray();
    return products.map((p) => {
        const hasSale   = p.salePrice && p.salePrice < p.price;
        const priceText = hasSale
            ? `${p.price.toLocaleString()} VNĐ khuyến mãi còn ${p.salePrice.toLocaleString()} VNĐ`
            : `${p.price.toLocaleString()} VNĐ`;
        const desc = p.description ? ` ${p.description}` : "";
        return {
            type: "product",
            productId: p._id.toString(),
            text: `Sản phẩm ${p.name} loại ${p.category} giá ${priceText}.${desc}`,
        };
    });
}

async function main() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log("✅ Kết nối MongoDB thành công");

    const db         = client.db();
    const collection = db.collection(COLLECTION);

    console.log("🔄 Đang lấy dữ liệu sản phẩm...");
    const productDocs = await getProductDocs(db);
    const allDocs     = [...STATIC_DOCS, ...productDocs];

    console.log(`📦 Tổng ${allDocs.length} document (${productDocs.length} sản phẩm + ${STATIC_DOCS.length} chính sách/FAQ)`);

    console.log("🗑  Xoá dữ liệu cũ...");
    await collection.deleteMany({});

    console.log("💾 Insert dữ liệu mới...");
    await collection.insertMany(allDocs.map((d) => ({ ...d, updatedAt: new Date() })));

    // Tạo text index để tìm kiếm nhanh
    await collection.createIndex({ text: "text" });
    await collection.createIndex({ type: 1 });

    console.log(`\n✅ Seed xong! ${allDocs.length} document sẵn sàng.`);
    console.log("🚀 Không cần embedding, chatbot RAG có thể dùng ngay!\n");

    await client.close();
}

main().catch((err) => {
    console.error("❌ Seed thất bại:", err);
    process.exit(1);
});