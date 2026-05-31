<template>
  <div class="page">
    <div class="page-header">
      <button class="btn-back" @click="$router.back()">← Quay lại</button>
      <h2>Tạo phiếu nhập kho</h2>
    </div>

    <div class="form-card">
      <div class="form-group">
        <label>Nhà cung cấp <span class="required">*</span></label>
        <input v-model="supplierName" placeholder="Tên nhà cung cấp" />
      </div>

      <div class="form-group">
        <label>Ghi chú</label>
        <input v-model="note" placeholder="Ghi chú (không bắt buộc)" />
      </div>

      <div class="items-section">
        <div class="items-header">
          <label>Danh sách sản phẩm <span class="required">*</span></label>
          <button class="btn-add" @click="addItem">+ Thêm sản phẩm</button>
        </div>

        <div class="item-row" v-for="(item, i) in items" :key="i">
          <input v-model="item.productId" placeholder="Product ID" class="input-id" />
          <input v-model.number="item.quantity" type="number" placeholder="Số lượng" min="1" class="input-num" />
          <input v-model.number="item.importPrice" type="number" placeholder="Giá nhập (đ)" min="0" class="input-num" />
          <span class="subtotal">= {{ formatPrice(item.quantity * item.importPrice) }}</span>
          <button class="btn-remove" @click="removeItem(i)" v-if="items.length > 1">✕</button>
        </div>
      </div>

      <div class="summary">
        <span>Tổng số lượng: <b>{{ totalQuantity }}</b></span>
        <span>Tổng tiền: <b>{{ formatPrice(totalCost) }}</b></span>
      </div>

      <p class="error"   v-if="error">{{ error }}</p>
      <p class="success" v-if="success">{{ success }}</p>

      <button class="btn-submit" @click="submit" :disabled="loading">
        {{ loading ? "Đang tạo..." : "Tạo phiếu nhập" }}
      </button>
    </div>
  </div>
</template>

<script>
import StockReceiptService from "@/services/stockReceipt.service";

export default {
  data() {
    return {
      supplierName: "",
      note: "",
      items: [{ productId: "", quantity: 1, importPrice: 0 }],
      error: "",
      success: "",
      loading: false,
    };
  },
  computed: {
    totalQuantity() {
      return this.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
    },
    totalCost() {
      return this.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.importPrice) || 0), 0);
    },
  },
  methods: {
    addItem() {
      this.items.push({ productId: "", quantity: 1, importPrice: 0 });
    },
    removeItem(i) {
      this.items.splice(i, 1);
    },
    async submit() {
      this.error   = "";
      this.success = "";
      if (!this.supplierName.trim()) return (this.error = "Vui lòng nhập tên nhà cung cấp");
      if (this.items.some(i => !i.productId.trim())) return (this.error = "Vui lòng nhập đủ Product ID");
      if (this.items.some(i => i.quantity <= 0)) return (this.error = "Số lượng phải lớn hơn 0");

      this.loading = true;
      try {
        await StockReceiptService.create({
          supplierName: this.supplierName,
          note: this.note,
          items: this.items,
        });
        this.success = "Tạo phiếu nhập thành công!";
        setTimeout(() => this.$router.push({ name: "admin.stockReceipt.list" }), 1200);
      } catch (err) {
        this.error = err.response?.data?.message || "Lỗi tạo phiếu nhập";
      } finally {
        this.loading = false;
      }
    },
    formatPrice(v) {
      return Number(v || 0).toLocaleString("vi-VN") + "đ";
    },
  },
};
</script>

<style scoped>
.page { max-width: 720px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; }
.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
h2 { font-size: 1.8rem; font-weight: 700; color: #1e293b; }
.btn-back { background: none; border: none; color: #3b82f6; font-size: 14px; cursor: pointer; font-weight: 600; }
.form-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.form-group { margin-bottom: 20px; }
label { display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px; }
.required { color: #ef4444; }
input { width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: border-color 0.2s; }
input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.items-section { margin-bottom: 20px; }
.items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.item-row { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
.input-id  { flex: 2; min-width: 140px; }
.input-num { flex: 1; min-width: 100px; }
.subtotal { min-width: 110px; text-align: right; font-size: 13px; color: #64748b; white-space: nowrap; }
.btn-add    { padding: 6px 14px; background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; white-space: nowrap; }
.btn-remove { background: #fee2e2; color: #b91c1c; border: none; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
.summary { display: flex; justify-content: flex-end; gap: 24px; padding: 14px 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 14px; color: #475569; }
.summary b { color: #1e293b; }
.btn-submit { width: 100%; padding: 14px; background: linear-gradient(135deg, #3b82f6, #60a5fa); color: #fff; border: none; border-radius: 10px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.3s; }
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59,130,246,0.4); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.error   { color: #ef4444; font-size: 14px; margin-bottom: 12px; }
.success { color: #22c55e; font-size: 14px; margin-bottom: 12px; }
</style>