const { ObjectId } = require("mongodb");

class StockBatchService {
  constructor(client) {
    this.Batch = client.db().collection("stock_batches");
  }

  async createBatch({ productId, receiptId, quantity, importPrice, importedAt }) {
    const batch = {
      productId,
      receiptId,
      quantity,
      importPrice,
      importedAt: importedAt || new Date(),
      createdAt:  new Date(),
    };
    const result = await this.Batch.insertOne(batch);
    batch._id = result.insertedId;
    return batch;
  }

  async deductFIFO(productId, quantityNeeded) {
    const batches = await this.Batch.find({
      productId,
      quantity: { $gt: 0 },
    })
      .sort({ importedAt: 1 })
      .toArray();

    let remaining = quantityNeeded;
    const deducted = [];

    for (const batch of batches) {
      if (remaining <= 0) break;

      const take = Math.min(batch.quantity, remaining);
      remaining -= take;

      deducted.push({
        batchId:     batch._id,
        importPrice: batch.importPrice,
        quantity:    take,
      });

      await this.Batch.updateOne(
        { _id: batch._id },
        { $inc: { quantity: -take } }
      );
    }

    if (remaining > 0) {
      throw new Error(`Không đủ hàng trong kho (thiếu ${remaining} sản phẩm)`);
    }

    return deducted;
  }

  // FIX: restore đúng từng batch đã trừ, dùng deductedBatches lưu từ lúc deduct
  async restoreByBatches(deductedBatches) {
    for (const d of deductedBatches) {
      await this.Batch.updateOne(
        { _id: new ObjectId(d.batchId) },
        { $inc: { quantity: d.quantity } }
      );
    }
  }

  // Giữ lại để tương thích ngược, nhưng đã fix logic
  async restoreFIFO(productId, quantityToRestore) {
    // Lấy batch theo LIFO (nhập sau → hoàn trước, reverse của FIFO)
    const batches = await this.Batch.find({ productId })
      .sort({ importedAt: -1 })
      .toArray();

    let remaining = quantityToRestore;

    for (const batch of batches) {
      if (remaining <= 0) break;

      await this.Batch.updateOne(
        { _id: batch._id },
        { $inc: { quantity: remaining } }
      );
      remaining = 0;
    }
  }

  async getBatchesByProduct(productId) {
    return await this.Batch.find({
      productId,
      quantity: { $gt: 0 },
    })
      .sort({ importedAt: 1 })
      .toArray();
  }

  async getTotalStock(productId) {
    const result = await this.Batch.aggregate([
      { $match: { productId, quantity: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]).toArray();
    return result[0]?.total || 0;
  }
}

module.exports = StockBatchService;