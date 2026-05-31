<template>
  <div class="page">
    <div class="page-header">
      <h2>Phiếu nhập kho</h2>
      <button class="btn-primary" @click="$router.push({ name: 'admin.stockReceipt.create' })">
        + Tạo phiếu nhập
      </button>
    </div>

    <div class="filters">
      <select v-model="filterStatus" @change="loadReceipts">
        <option value="">Tất cả trạng thái</option>
        <option value="pending">Chờ duyệt</option>
        <option value="completed">Đã duyệt</option>
        <option value="cancelled">Đã hủy</option>
      </select>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mã phiếu</th>
            <th>Nhà cung cấp</th>
            <th>Số mặt hàng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="receipts.length === 0">
            <td colspan="7" class="empty">Không có phiếu nhập nào</td>
          </tr>
          <tr v-for="r in receipts" :key="r._id">
            <td class="mono">{{ r._id.slice(-8).toUpperCase() }}</td>
            <td>{{ r.supplierName }}</td>
            <td>{{ r.totalItems }} sản phẩm</td>
            <td>{{ formatPrice(r.totalCost) }}</td>
            <td><span :class="['badge', r.status]">{{ statusLabel(r.status) }}</span></td>
            <td>{{ formatDate(r.createdAt) }}</td>
            <td class="actions">
              <button class="btn-view" @click="$router.push({ name: 'admin.stockReceipt.detail', params: { id: r._id } })">
                Chi tiết
              </button>
              <button v-if="r.status === 'pending'" class="btn-approve" @click="complete(r._id)">
                Duyệt
              </button>
              <button v-if="r.status === 'pending'" class="btn-cancel" @click="openCancel(r._id)">
                Hủy
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page === 1" @click="changePage(page - 1)">‹</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page === totalPages" @click="changePage(page + 1)">›</button>
    </div>

    <div class="modal-overlay" v-if="cancelModal" @click.self="cancelModal = false">
      <div class="modal">
        <h3>Hủy phiếu nhập</h3>
        <input v-model="cancelReason" placeholder="Lý do hủy (không bắt buộc)" />
        <div class="modal-actions">
          <button class="btn-cancel" @click="confirmCancel">Xác nhận hủy</button>
          <button class="btn-view" @click="cancelModal = false">Đóng</button>
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
      receipts: [],
      filterStatus: "",
      page: 1,
      totalPages: 1,
      cancelModal: false,
      cancelTargetId: null,
      cancelReason: "",
    };
  },
  mounted() {
    this.loadReceipts();
  },
  methods: {
    async loadReceipts() {
      try {
        const res = await StockReceiptService.getAll({
          page: this.page,
          limit: 10,
          status: this.filterStatus,
        });
        this.receipts   = res.data;
        this.totalPages = res.pagination.totalPages;
      } catch {
        alert("Lỗi tải danh sách phiếu nhập");
      }
    },
    async complete(id) {
      if (!confirm("Duyệt phiếu này? Stock sẽ được cộng ngay.")) return;
      try {
        await StockReceiptService.complete(id);
        await this.loadReceipts();
      } catch (err) {
        alert(err.response?.data?.message || "Lỗi duyệt phiếu");
      }
    },
    openCancel(id) {
      this.cancelTargetId = id;
      this.cancelReason   = "";
      this.cancelModal    = true;
    },
    async confirmCancel() {
      try {
        await StockReceiptService.cancel(this.cancelTargetId, this.cancelReason);
        this.cancelModal = false;
        await this.loadReceipts();
      } catch (err) {
        alert(err.response?.data?.message || "Lỗi hủy phiếu");
      }
    },
    changePage(p) {
      this.page = p;
      this.loadReceipts();
    },
    formatPrice(v) {
      return Number(v).toLocaleString("vi-VN") + "đ";
    },
    formatDate(d) {
      return new Date(d).toLocaleDateString("vi-VN");
    },
    statusLabel(s) {
      return { pending: "Chờ duyệt", completed: "Đã duyệt", cancelled: "Đã hủy" }[s] || s;
    },
  },
};
</script>

<style scoped>
.page { max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
h2 { font-size: 1.8rem; font-weight: 700; color: #1e293b; }
.filters { margin-bottom: 16px; }
select { padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; }
.table-wrap { overflow-x: auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; background: #fff; }
thead { background: #f1f5f9; }
th, td { padding: 14px 16px; text-align: left; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
th { font-weight: 600; color: #475569; }
.empty { text-align: center; color: #94a3b8; padding: 32px; }
.mono { font-family: monospace; font-size: 13px; color: #64748b; }
.badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge.pending   { background: #fef9c3; color: #a16207; }
.badge.completed { background: #dcfce7; color: #15803d; }
.badge.cancelled { background: #fee2e2; color: #b91c1c; }
.actions { display: flex; gap: 6px; }
.btn-primary { padding: 10px 20px; background: linear-gradient(135deg, #3b82f6, #60a5fa); color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-view    { padding: 6px 12px; background: #e0f2fe; color: #0369a1; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
.btn-approve { padding: 6px 12px; background: #dcfce7; color: #15803d; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
.btn-cancel  { padding: 6px 12px; background: #fee2e2; color: #b91c1c; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; }
.pagination button { padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; cursor: pointer; font-size: 16px; }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal { background: #fff; padding: 28px; border-radius: 16px; width: 380px; }
.modal h3 { margin-bottom: 16px; font-size: 1.2rem; font-weight: 700; }
.modal input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; margin-bottom: 16px; box-sizing: border-box; }
.modal-actions { display: flex; gap: 10px; }
</style>