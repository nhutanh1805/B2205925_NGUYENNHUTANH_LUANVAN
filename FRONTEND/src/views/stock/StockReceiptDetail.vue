<template>
  <div class="page">
    <div class="page-header">
      <button class="btn-back" @click="$router.back()">← Quay lại</button>
      <h2>Chi tiết phiếu nhập</h2>
    </div>

    <div v-if="receipt" class="detail-card">
      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Mã phiếu</span>
          <span class="meta-value mono">{{ receipt._id }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Nhà cung cấp</span>
          <span class="meta-value">{{ receipt.supplierName }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Trạng thái</span>
          <span :class="['badge', receipt.status]">{{ statusLabel(receipt.status) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Người tạo</span>
          <span class="meta-value">{{ receipt.createdBy }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Ngày tạo</span>
          <span class="meta-value">{{ formatDate(receipt.createdAt) }}</span>
        </div>
        <div class="meta-item" v-if="receipt.completedAt">
          <span class="meta-label">Ngày duyệt</span>
          <span class="meta-value">{{ formatDate(receipt.completedAt) }}</span>
        </div>
        <div class="meta-item" v-if="receipt.note">
          <span class="meta-label">Ghi chú</span>
          <span class="meta-value">{{ receipt.note }}</span>
        </div>
        <div class="meta-item" v-if="receipt.cancelReason">
          <span class="meta-label">Lý do hủy</span>
          <span class="meta-value cancel-reason">{{ receipt.cancelReason }}</span>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên sản phẩm</th>
            <th>SKU</th>
            <th>Số lượng</th>
            <th>Giá nhập</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in receipt.items" :key="i">
            <td>{{ i + 1 }}</td>
            <td>{{ item.name }}</td>
            <td class="mono">{{ item.sku || "—" }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatPrice(item.importPrice) }}</td>
            <td><b>{{ formatPrice(item.subtotal) }}</b></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="total-label">Tổng cộng</td>
            <td><b>{{ receipt.totalItems }}</b></td>
            <td></td>
            <td><b>{{ formatPrice(receipt.totalCost) }}</b></td>
          </tr>
        </tfoot>
      </table>

      <div class="detail-actions" v-if="receipt.status === 'pending'">
        <button class="btn-approve" @click="complete">✓ Duyệt phiếu — cộng kho</button>
        <button class="btn-cancel"  @click="openCancel">✕ Hủy phiếu</button>
      </div>
    </div>

    <div v-else class="loading">Đang tải...</div>

    <div class="modal-overlay" v-if="cancelModal" @click.self="cancelModal = false">
      <div class="modal">
        <h3>Hủy phiếu nhập</h3>
        <input v-model="cancelReason" placeholder="Lý do hủy (không bắt buộc)" />
        <div class="modal-actions">
          <button class="btn-cancel" @click="confirmCancel">Xác nhận hủy</button>
          <button class="btn-view"   @click="cancelModal = false">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StockReceiptService from "@/services/stockReceipt.service";

export default {
  data() {
    return {
      receipt: null,
      cancelModal: false,
      cancelReason: "",
    };
  },
  mounted() {
    this.loadReceipt();
  },
  methods: {
    async loadReceipt() {
      try {
        this.receipt = await StockReceiptService.getById(this.$route.params.id);
      } catch {
        alert("Không tìm thấy phiếu nhập");
        this.$router.back();
      }
    },
    async complete() {
      if (!confirm("Duyệt phiếu này? Stock sẽ được cộng ngay.")) return;
      try {
        this.receipt = (await StockReceiptService.complete(this.receipt._id)).data;
      } catch (err) {
        alert(err.response?.data?.message || "Lỗi duyệt phiếu");
      }
    },
    openCancel() {
      this.cancelReason = "";
      this.cancelModal  = true;
    },
    async confirmCancel() {
      try {
        this.receipt     = (await StockReceiptService.cancel(this.receipt._id, this.cancelReason)).data;
        this.cancelModal = false;
      } catch (err) {
        alert(err.response?.data?.message || "Lỗi hủy phiếu");
      }
    },
    formatPrice(v) {
      return Number(v).toLocaleString("vi-VN") + "đ";
    },
    formatDate(d) {
      return new Date(d).toLocaleString("vi-VN");
    },
    statusLabel(s) {
      return { pending: "Chờ duyệt", completed: "Đã duyệt", cancelled: "Đã hủy" }[s] || s;
    },
  },
};
</script>

<style scoped>
.page { max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; }
.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
h2 { font-size: 1.8rem; font-weight: 700; color: #1e293b; }
.btn-back { background: none; border: none; color: #3b82f6; font-size: 14px; cursor: pointer; font-weight: 600; }
.detail-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
.meta-item { display: flex; flex-direction: column; gap: 4px; }
.meta-label { font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.meta-value { font-size: 14px; color: #1e293b; }
.mono { font-family: monospace; font-size: 13px; color: #64748b; }
.cancel-reason { color: #b91c1c; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge.pending   { background: #fef9c3; color: #a16207; }
.badge.completed { background: #dcfce7; color: #15803d; }
.badge.cancelled { background: #fee2e2; color: #b91c1c; }
.items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
.items-table thead { background: #f1f5f9; }
.items-table th, .items-table td { padding: 12px 14px; text-align: left; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
.items-table th { font-weight: 600; color: #475569; }
.items-table tfoot td { background: #f8fafc; font-weight: 600; }
.total-label { text-align: right; color: #475569; }
.detail-actions { display: flex; gap: 12px; }
.btn-approve { flex: 1; padding: 12px; background: linear-gradient(135deg, #22c55e, #4ade80); color: #fff; border: none; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s; }
.btn-approve:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(34,197,94,0.4); }
.btn-cancel  { flex: 1; padding: 12px; background: linear-gradient(135deg, #ef4444, #f87171); color: #fff; border: none; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s; }
.btn-cancel:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239,68,68,0.4); }
.loading { text-align: center; color: #94a3b8; padding: 60px; font-size: 16px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal { background: #fff; padding: 28px; border-radius: 16px; width: 380px; }
.modal h3 { margin-bottom: 16px; font-size: 1.2rem; font-weight: 700; color: #1e293b; }
.modal input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; margin-bottom: 16px; box-sizing: border-box; }
.modal-actions { display: flex; gap: 10px; }
.btn-view { flex: 1; padding: 10px; background: #e0f2fe; color: #0369a1; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
</style>