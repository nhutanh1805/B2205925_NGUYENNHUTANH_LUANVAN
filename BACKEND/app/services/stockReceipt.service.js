const { ObjectId } = require("mongodb");
const StockBatchService = require("./stockBatch.service");

class StockReceiptService {
  constructor(client) {
    this.Receipt      = client.db().collection("stock_receipts");
    this.Product      = client.db().collection("products");
    this.batchService = new StockBatchService(client);
  }

  async create(payload) {
    const { supplierName, items, note, createdBy } = payload;

    if (!supplierName) throw new Error("Thiếu tên nhà cung cấp");
    if (!items || items.length === 0) throw new Error("Phiếu nhập phải có ít nhất 1 sản phẩm");

    const builtItems = [];
    for (const item of items) {
      if (!item.productId) throw new Error("Thiếu productId trong items");
      if (!item.quantity || item.quantity <= 0) throw new Error("Số lượng phải lớn hơn 0");
      if (item.importPrice === undefined || item.importPrice < 0) throw new Error("Giá nhập không hợp lệ");

      const product = await this.Product.findOne({
        _id: ObjectId.isValid(item.productId) ? new ObjectId(item.productId) : null,
      });
      if (!product) throw new Error(`Không tìm thấy sản phẩm id=${item.productId}`);

      builtItems.push({
        productId:   item.productId,
        name:        product.name,
        sku:         product.sku || "",
        quantity:    Number(item.quantity),
        importPrice: Number(item.importPrice),
        subtotal:    Number(item.quantity) * Number(item.importPrice),
      });
    }

    const totalItems = builtItems.reduce((s, i) => s + i.quantity, 0);
    const totalCost  = builtItems.reduce((s, i) => s + i.subtotal, 0);

    const receipt = {
      supplierName,
      items:     builtItems,
      totalItems,
      totalCost,
      note:      note || "",
      status:    "pending",
      createdBy: createdBy || "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.Receipt.insertOne(receipt);
    receipt._id = result.insertedId;
    return receipt;
  }

  async complete(receiptId) {
    const receipt = await this.findById(receiptId);
    if (!receipt) throw new Error("Không tìm thấy phiếu nhập");
    if (receipt.status === "completed") throw new Error("Phiếu nhập đã được duyệt trước đó");
    if (receipt.status === "cancelled") throw new Error("Phiếu nhập đã bị hủy, không thể duyệt");

    const importedAt = new Date();

    for (const item of receipt.items) {
      // 1. Cộng stock vào product
      await this.Product.updateOne(
        { _id: ObjectId.isValid(item.productId) ? new ObjectId(item.productId) : null },
        {
          $inc: { stock: item.quantity },
          $set: { updatedAt: new Date() },
        }
      );

      // 2. Tạo batch mới
      await this.batchService.createBatch({
        productId:   item.productId,
        receiptId:   receiptId,
        quantity:    item.quantity,
        importPrice: item.importPrice,
        importedAt,
      });
    }

    return await this.Receipt.findOneAndUpdate(
      { _id: new ObjectId(receiptId) },
      { $set: { status: "completed", completedAt: new Date(), updatedAt: new Date() } },
      { returnDocument: "after" }
    );
  }

  async cancel(receiptId, reason = "") {
    const receipt = await this.findById(receiptId);
    if (!receipt) throw new Error("Không tìm thấy phiếu nhập");
    if (receipt.status !== "pending") {
      throw new Error(`Không thể hủy phiếu đã ở trạng thái "${receipt.status}"`);
    }

    return await this.Receipt.findOneAndUpdate(
      { _id: new ObjectId(receiptId) },
      { $set: { status: "cancelled", cancelReason: reason, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
  }

  async findAll(query = {}) {
    const {
      page = 1, limit = 10,
      status,
      sortBy = "createdAt", sortOrder = "desc",
    } = query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [receipts, total] = await Promise.all([
      this.Receipt.find(filter).sort(sort).skip(skip).limit(Number(limit)).toArray(),
      this.Receipt.countDocuments(filter),
    ]);

    return {
      data: receipts,
      pagination: {
        page:       Number(page),
        limit:      Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.Receipt.findOne({ _id: new ObjectId(id) });
  }
}

module.exports = StockReceiptService;