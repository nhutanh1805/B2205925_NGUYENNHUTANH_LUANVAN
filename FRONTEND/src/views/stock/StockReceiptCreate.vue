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
          <button class="btn-add" @click="openModal">+ Thêm sản phẩm</button>
        </div>

        <div v-if="items.length === 0" class="empty-items">
          Chưa có sản phẩm nào. Nhấn "+ Thêm sản phẩm" để chọn.
        </div>

        <table v-else class="selected-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th>Tồn kho</th>
              <th>Số lượng nhập</th>
              <th>Giá nhập (đ)</th>
              <th>Thành tiền</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in items" :key="item.productId">
              <td>
                <div class="product-cell">
                  <img v-if="item.image" :src="item.image" class="prod-thumb" />
                  <div v-else class="prod-thumb-placeholder"></div>
                  <span>{{ item.name }}</span>
                </div>
              </td>
              <td class="mono">{{ item.sku || '—' }}</td>
              <td>{{ item.stock }}</td>
              <td>
                <input
                  v-model.number="item.quantity"
                  type="number" min="1"
                  class="input-num"
                />
              </td>
              <td>
                <input
                  v-model.number="item.importPrice"
                  type="number" min="0"
                  class="input-num"
                />
              </td>
              <td><b>{{ formatPrice(item.quantity * item.importPrice) }}</b></td>
              <td>
                <button class="btn-remove" @click="removeItem(i)">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary" v-if="items.length > 0">
        <span>Tổng số lượng: <b>{{ totalQuantity }}</b></span>
        <span>Tổng tiền: <b>{{ formatPrice(totalCost) }}</b></span>
      </div>

      <p class="error"   v-if="error">{{ error }}</p>
      <p class="success" v-if="success">{{ success }}</p>

      <button class="btn-submit" @click="submit" :disabled="loading">
        {{ loading ? "Đang tạo..." : "Tạo phiếu nhập" }}
      </button>
    </div>

    <!-- ===== MODAL CHỌN SẢN PHẨM ===== -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Chọn sản phẩm</h3>
          <button class="btn-close" @click="showModal = false">✕</button>
        </div>

        <input
          v-model="search"
          placeholder="Tìm theo tên hoặc SKU..."
          class="search-input"
          @input="filterProducts"
        />

        <div class="modal-body">
          <div v-if="loadingProducts" class="modal-empty">Đang tải sản phẩm...</div>
          <div v-else-if="filteredProducts.length === 0" class="modal-empty">Không tìm thấy sản phẩm</div>

          <div
            v-for="p in filteredProducts"
            :key="p._id"
            class="product-row"
            :class="{ selected: isSelected(p._id) }"
            @click="toggleSelect(p)"
          >
            <img v-if="p.images && p.images[0]" :src="p.images[0]" class="prod-thumb" />
            <div v-else class="prod-thumb-placeholder"></div>

            <div class="prod-info">
              <div class="prod-name">{{ p.name }}</div>
              <div class="prod-meta">
                <span class="sku">{{ p.sku || 'Không có SKU' }}</span>
                <span class="stock">Tồn: {{ p.stock ?? 0 }}</span>
                <span class="price">Giá bán: {{ formatPrice(p.price) }}</span>
              </div>
            </div>

            <div class="prod-check" v-if="isSelected(p._id)">✓</div>
          </div>
        </div>

        <div class="modal-footer">
          <span class="selected-count">Đã chọn: {{ tempSelected.length }} sản phẩm</span>
          <div class="modal-footer-actions">
            <button class="btn-view" @click="showModal = false">Hủy</button>
            <button class="btn-confirm" @click="confirmSelection">Xác nhận</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StockReceiptService from "@/services/stockReceipt.service";
import ProductService      from "@/services/product.service";

export default {
  data() {
    return {
      supplierName: "",
      note: "",
      items: [],
      error: "",
      success: "",
      loading: false,

      // modal
      showModal: false,
      search: "",
      allProducts: [],
      filteredProducts: [],
      tempSelected: [],
      loadingProducts: false,
    };
  },
  computed: {
    totalQuantity() {
      return this.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
    },
    totalCost() {
      return this.items.reduce(
        (s, i) => s + (Number(i.quantity) || 0) * (Number(i.importPrice) || 0), 0
      );
    },
  },
  methods: {
    async openModal() {
      this.showModal    = true;
      this.search       = "";
      this.tempSelected = this.items.map(i => i.productId);

      if (this.allProducts.length === 0) {
        this.loadingProducts = true;
        try {
          const res = await ProductService.getAll({ limit: 1000 });
          this.allProducts = res.products ?? res.data ?? res;
        } catch {
          alert("Lỗi tải danh sách sản phẩm");
        } finally {
          this.loadingProducts = false;
        }
      }
      this.filteredProducts = [...this.allProducts];
    },

    filterProducts() {
      const q = this.search.toLowerCase().trim();
      this.filteredProducts = q
        ? this.allProducts.filter(
            p =>
              (p.name || "").toLowerCase().includes(q) ||
              (p.sku  || "").toLowerCase().includes(q)
          )
        : [...this.allProducts];
    },

    isSelected(id) {
      return this.tempSelected.includes(id);
    },

    toggleSelect(product) {
      const idx = this.tempSelected.indexOf(product._id);
      if (idx === -1) this.tempSelected.push(product._id);
      else            this.tempSelected.splice(idx, 1);
    },

    confirmSelection() {
      const next = [];
      for (const id of this.tempSelected) {
        const existing = this.items.find(i => i.productId === id);
        if (existing) {
          next.push(existing);
        } else {
          const p = this.allProducts.find(p => p._id === id);
          if (p) {
            next.push({
              productId:   p._id,
              name:        p.name,
              sku:         p.sku || "",
              stock:       p.stock ?? 0,
              image:       (p.images && p.images[0]) || "",
              quantity:    1,
              importPrice: p.price || 0,
            });
          }
        }
      }
      this.items     = next;
      this.showModal = false;
    },

    removeItem(i) {
      this.items.splice(i, 1);
    },

    async submit() {
      this.error   = "";
      this.success = "";
      if (!this.supplierName.trim()) return (this.error = "Vui lòng nhập tên nhà cung cấp");
      if (this.items.length === 0)   return (this.error = "Vui lòng chọn ít nhất 1 sản phẩm");
      if (this.items.some(i => i.quantity <= 0))
        return (this.error = "Số lượng phải lớn hơn 0");

      this.loading = true;
      try {
        await StockReceiptService.create({
          supplierName: this.supplierName,
          note:         this.note,
          items:        this.items.map(i => ({
            productId:   i.productId,
            quantity:    i.quantity,
            importPrice: i.importPrice,
          })),
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
.page { max-width: 860px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; }
.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
h2 { font-size: 1.8rem; font-weight: 700; color: #1e293b; }
.btn-back { background: none; border: none; color: #3b82f6; font-size: 14px; cursor: pointer; font-weight: 600; }

.form-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.form-group { margin-bottom: 20px; }
label { display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px; }
.required { color: #ef4444; }
input { width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.items-section { margin-bottom: 20px; }
.items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.empty-items { text-align: center; padding: 32px; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 10px; font-size: 14px; }

.selected-table { width: 100%; border-collapse: collapse; }
.selected-table thead { background: #f1f5f9; }
.selected-table th, .selected-table td { padding: 12px 14px; text-align: left; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
.selected-table th { font-weight: 600; color: #475569; }
.product-cell { display: flex; align-items: center; gap: 10px; }
.prod-thumb { width: 36px; height: 36px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
.prod-thumb-placeholder { width: 36px; height: 36px; border-radius: 6px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.mono { font-family: monospace; font-size: 13px; color: #64748b; }
.input-num { width: 90px; padding: 8px 10px; font-size: 13px; }
.btn-remove { background: #fee2e2; color: #b91c1c; border: none; border-radius: 6px; padding: 5px 10px; cursor: pointer; }

.summary { display: flex; justify-content: flex-end; gap: 24px; padding: 14px 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 14px; color: #475569; }
.summary b { color: #1e293b; }

.btn-add    { padding: 6px 14px; background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; }
.btn-submit { width: 100%; padding: 14px; background: linear-gradient(135deg, #3b82f6, #60a5fa); color: #fff; border: none; border-radius: 10px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.3s; }
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59,130,246,0.4); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.error   { color: #ef4444; font-size: 14px; margin-bottom: 12px; }
.success { color: #22c55e; font-size: 14px; margin-bottom: 12px; }

/* ===== MODAL ===== */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal { background: #fff; border-radius: 16px; width: 560px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0; }
.modal-header h3 { font-size: 1.2rem; font-weight: 700; color: #1e293b; }
.btn-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #94a3b8; }
.search-input { margin: 16px 24px 0; width: calc(100% - 48px); box-sizing: border-box; }

.modal-body { flex: 1; overflow-y: auto; padding: 12px 24px; margin-top: 12px; }
.modal-empty { text-align: center; color: #94a3b8; padding: 40px 0; }

.product-row { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 10px; cursor: pointer; border: 2px solid transparent; transition: all 0.15s; margin-bottom: 6px; }
.product-row:hover    { background: #f1f5f9; }
.product-row.selected { background: #eff6ff; border-color: #3b82f6; }
.prod-thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
.prod-thumb-placeholder { width: 48px; height: 48px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.prod-info { flex: 1; }
.prod-name { font-weight: 600; color: #1e293b; font-size: 14px; margin-bottom: 4px; }
.prod-meta { display: flex; gap: 12px; font-size: 12px; color: #64748b; }
.sku   { font-family: monospace; }
.stock { color: #0369a1; }
.price { color: #15803d; }
.prod-check { width: 24px; height: 24px; background: #3b82f6; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }

.modal-footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.selected-count { font-size: 13px; color: #64748b; }
.modal-footer-actions { display: flex; gap: 10px; }
.btn-view    { padding: 10px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-confirm { padding: 10px 20px; background: linear-gradient(135deg, #3b82f6, #60a5fa); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
</style>