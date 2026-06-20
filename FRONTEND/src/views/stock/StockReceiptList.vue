<template>
  <div class="receipt-page">

    <!-- ══ HERO ══ -->
    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Quản lý kho hàng
        </div>

        <h1 class="hero-title">Phiếu<br/><em>nhập kho</em></h1>

        <p class="hero-sub">Theo dõi · Duyệt · Quản lý nhập hàng</p>

        <div class="hero-stats">
          <div class="hero-stat">
            <span class="stat-num">{{ stats.total }}</span>
            <span class="stat-lbl">Tổng phiếu</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ stats.pending }}</span>
            <span class="stat-lbl">Chờ duyệt</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ stats.completed }}</span>
            <span class="stat-lbl">Đã duyệt</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MAIN PANEL ══ -->
    <div class="main-panel">

      <!-- Action bar -->
      <div class="action-wrap">
        <div class="action-left">
          <h2 class="action-title">Danh sách phiếu nhập</h2>
          <span class="result-pill"><span class="result-num">{{ receipts.length }}</span> phiếu</span>
        </div>
        <button class="btn-create" @click="$router.push({ name: 'admin.stockReceipt.create' })">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="plus-icon">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tạo phiếu nhập
          <span class="btn-shine"></span>
        </button>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar">
        <div class="status-wrap">
          <button
            v-for="s in statusOptions"
            :key="s.value"
            class="status-btn"
            :class="[{ active: filterStatus === s.value }, s.value || 'all']"
            @click="selectStatus(s.value)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Cards grid -->
      <div v-if="receipts.length" class="receipt-grid">
        <div
          v-for="(r, idx) in receipts"
          :key="r._id"
          class="rcard"
          :style="`--delay:${idx * 0.04}s`"
        >
          <div class="rcard-top">
            <span class="rcard-code">#{{ r._id.slice(-8).toUpperCase() }}</span>
            <span :class="['rbadge', r.status]">{{ statusLabel(r.status) }}</span>
          </div>

          <h4 class="rcard-supplier">{{ r.supplierName }}</h4>

          <div class="rcard-meta-row">
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon">
                <path d="M20 7h-9M14 17H5M17 3a2 2 0 0 1 2 2v.5M17 21a2 2 0 0 0 2-2v-.5M3 7a2 2 0 0 1 2-2h.5M3 17a2 2 0 0 0 2 2h.5"/>
              </svg>
              {{ r.totalItems }} sản phẩm
            </div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ formatDate(r.createdAt) }}
            </div>
          </div>

          <div class="rcard-cost-row">
            <span class="rcard-cost-lbl">Tổng tiền</span>
            <span class="rcard-cost">{{ formatPrice(r.totalCost) }}</span>
          </div>

          <div class="rcard-actions">
            <button class="rbtn rbtn-view" @click="$router.push({ name: 'admin.stockReceipt.detail', params: { id: r._id } })">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="rbtn-icon">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Chi tiết
            </button>
            <button v-if="r.status === 'pending'" class="rbtn rbtn-approve" @click="complete(r._id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="rbtn-icon">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Duyệt
            </button>
            <button v-if="r.status === 'pending'" class="rbtn rbtn-cancel" @click="openCancel(r._id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="rbtn-icon">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Hủy
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon"></div>
        <p>Không có phiếu nhập nào phù hợp</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="page === 1" @click="changePage(page - 1)">‹</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page === totalPages" @click="changePage(page + 1)">›</button>
      </div>

    </div>

    <!-- ══ CANCEL MODAL ══ -->
    <Transition name="modal">
      <div v-if="cancelModal" class="modal-backdrop" @click.self="cancelModal = false">
        <div class="modal-card">
          <div class="modal-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-warn-icon">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="modal-body">
            <h3 class="modal-title">Hủy phiếu nhập?</h3>
            <p class="modal-desc">Hành động này không thể hoàn tác.</p>
            <input v-model="cancelReason" class="modal-input" placeholder="Lý do hủy (không bắt buộc)" />
            <div class="modal-actions">
              <button class="modal-secondary" @click="cancelModal = false">Đóng</button>
              <button class="modal-danger" @click="confirmCancel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="cart-icon-sm">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ TOAST ══ -->
    <Transition name="toast">
      <div v-if="showToast" class="toast" :class="toastType">
        <div class="toast-icon">{{ toastType === 'error' ? '!' : '✓' }}</div>
        <div class="toast-text">
          <span class="toast-title">{{ toastType === 'error' ? 'Lỗi' : 'Thành công' }}</span>
          <span class="toast-name">{{ toastMessage }}</span>
        </div>
      </div>
    </Transition>

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
      showToast: false,
      toastMessage: "",
      toastType: "success",
      statusOptions: [
        { value: "", label: "Tất cả" },
        { value: "pending", label: "Chờ duyệt" },
        { value: "completed", label: "Đã duyệt" },
        { value: "cancelled", label: "Đã hủy" },
      ],
    };
  },
  computed: {
    stats() {
      return {
        total: this.receipts.length,
        pending: this.receipts.filter(r => r.status === "pending").length,
        completed: this.receipts.filter(r => r.status === "completed").length,
      };
    },
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
        this.notify("Lỗi tải danh sách phiếu nhập", "error");
      }
    },
    selectStatus(val) {
      this.filterStatus = val;
      this.page = 1;
      this.loadReceipts();
    },
    async complete(id) {
      if (!confirm("Duyệt phiếu này? Stock sẽ được cộng ngay.")) return;
      try {
        await StockReceiptService.complete(id);
        await this.loadReceipts();
        this.notify("Đã duyệt phiếu nhập kho", "success");
      } catch (err) {
        this.notify(err.response?.data?.message || "Lỗi duyệt phiếu", "error");
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
        this.notify("Đã hủy phiếu nhập kho", "success");
      } catch (err) {
        this.notify(err.response?.data?.message || "Lỗi hủy phiếu", "error");
      }
    },
    changePage(p) {
      this.page = p;
      this.loadReceipts();
    },
    notify(msg, type = "success") {
      this.toastMessage = msg;
      this.toastType = type;
      this.showToast = true;
      setTimeout(() => { this.showToast = false; }, 3500);
    },
    formatPrice(v) {
      return new Intl.NumberFormat("vi-VN").format(v) + "₫";
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
.receipt-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ══ HERO ══ */
.hero {
  position: relative; overflow: hidden;
  background: #0a0f1e; padding: 72px 32px 80px; text-align: center;
}
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%, rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3), transparent),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,.08), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25); top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.2); bottom: -60px; right: -40px; }
.hero-orb-3 { width: 180px; height: 180px; background: rgba(16,185,129,.15); top: 40%; left: 55%; }

.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px; padding: 6px 18px;
  font-size: .75rem; font-weight: 700; color: rgba(255,255,255,.8);
  letter-spacing: .08em; text-transform: uppercase;
  margin-bottom: 22px; backdrop-filter: blur(8px);
}
.eyebrow-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #10b981; box-shadow: 0 0 8px #10b981;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}
.hero-title {
  font-size: clamp(2.4rem, 6vw, 4rem); font-weight: 900; color: white;
  line-height: 1.1; letter-spacing: -.02em; margin-bottom: 14px;
  text-shadow: 0 2px 30px rgba(0,0,0,.4);
}
.hero-title em {
  font-style: normal;
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size: 1rem; color: rgba(255,255,255,.55); letter-spacing: .06em; margin-bottom: 36px; }
.hero-stats {
  display: inline-flex; align-items: center; gap: 24px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  border-radius: 20px; padding: 18px 32px; backdrop-filter: blur(16px);
}
.hero-stat { text-align: center; }
.stat-num { display: block; font-size: 1.6rem; font-weight: 900; color: white; line-height: 1; }
.stat-lbl { font-size: .7rem; color: rgba(255,255,255,.5); letter-spacing: .07em; text-transform: uppercase; margin-top: 3px; display: block; }
.stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,.15); }

/* ══ MAIN PANEL ══ */
.main-panel {
  max-width: 1300px; margin: -24px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

/* ══ ACTION BAR ══ */
.action-wrap {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 14px;
  background: white; border-radius: 20px; padding: 18px 22px;
  box-shadow: 0 8px 40px rgba(10,15,30,.12);
  margin-bottom: 16px; border: 1px solid rgba(37,99,235,.1);
}
.action-left { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.action-title { font-size: 1.2rem; font-weight: 800; color: #0f172a; }
.result-pill {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #e0e7ff; color: #4f46e5;
  font-size: .8rem; font-weight: 700;
  padding: 6px 16px; border-radius: 999px; white-space: nowrap;
}
.result-num { font-size: 1rem; }

.btn-create {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 22px; border-radius: 13px;
  font-size: .9rem; font-weight: 700; color: white;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  border: none; cursor: pointer; position: relative; overflow: hidden;
  box-shadow: 0 4px 14px rgba(37,99,235,.3); transition: transform .2s, box-shadow .2s;
}
.btn-create:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,99,235,.4); }
.plus-icon { width: 16px; height: 16px; }
.btn-shine {
  position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
  transform: skewX(-20deg); transition: left .5s;
}
.btn-create:hover .btn-shine { left: 130%; }

/* ══ FILTER BAR ══ */
.filter-bar { margin-bottom: 24px; }
.status-wrap { display: flex; gap: 10px; flex-wrap: wrap; }
.status-btn {
  padding: 8px 18px; border-radius: 999px;
  border: 1.5px solid #e0e7ff; background: white;
  color: #4f46e5; font-weight: 600; font-size: .85rem;
  cursor: pointer; transition: all .2s;
  box-shadow: 0 2px 8px rgba(37,99,235,.06);
}
.status-btn:hover { background: #eff6ff; border-color: #a5b4fc; }
.status-btn.active {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; border-color: transparent;
  box-shadow: 0 4px 12px rgba(37,99,235,.3);
}
.status-btn.active.pending { background: linear-gradient(135deg, #d97706, #f59e0b); box-shadow: 0 4px 12px rgba(217,119,6,.3); }
.status-btn.active.completed { background: linear-gradient(135deg, #15803d, #22c55e); box-shadow: 0 4px 12px rgba(21,128,61,.3); }
.status-btn.active.cancelled { background: linear-gradient(135deg, #b91c1c, #ef4444); box-shadow: 0 4px 12px rgba(185,28,28,.3); }

/* ══ GRID ══ */
.receipt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* ══ CARD ══ */
.rcard {
  position: relative; background: white;
  border-radius: 22px; overflow: hidden;
  border: 1.5px solid #e8edf8; padding: 18px;
  transition: transform .3s cubic-bezier(.175,.885,.32,1.275), box-shadow .3s, border-color .3s;
  animation: cardIn .4s ease both;
  animation-delay: var(--delay, 0s);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.rcard:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 24px 50px rgba(37,99,235,.16);
  border-color: #a5b4fc;
}

.rcard-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.rcard-code { font-family: monospace; font-size: .75rem; font-weight: 700; color: #94a3b8; letter-spacing: .03em; }

.rbadge { font-size: .65rem; font-weight: 800; padding: 4px 11px; border-radius: 999px; letter-spacing: .04em; }
.rbadge.pending   { background: #fef9c3; color: #a16207; }
.rbadge.completed { background: #dcfce7; color: #15803d; }
.rbadge.cancelled { background: #fee2e2; color: #b91c1c; }

.rcard-supplier { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 14px; line-height: 1.3; }

.rcard-meta-row { display: flex; gap: 16px; margin-bottom: 14px; flex-wrap: wrap; }
.meta-item { display: flex; align-items: center; gap: 6px; font-size: .8rem; color: #64748b; font-weight: 600; }
.meta-icon { width: 14px; height: 14px; flex-shrink: 0; color: #2563eb; }

.rcard-cost-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; background: #f8faff; border-radius: 13px; margin-bottom: 14px;
}
.rcard-cost-lbl { font-size: .75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; }
.rcard-cost { font-size: 1.05rem; font-weight: 800; color: #e11d48; }

.rcard-actions { display: flex; gap: 8px; }
.rbtn {
  flex: 1; padding: 10px 8px; border-radius: 12px;
  font-size: .78rem; font-weight: 700; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  transition: transform .2s, box-shadow .2s, background .2s;
}
.rbtn-icon { width: 13px; height: 13px; flex-shrink: 0; }
.rbtn-view    { background: #e0f2fe; color: #0369a1; }
.rbtn-view:hover    { background: #bae6fd; transform: translateY(-1px); }
.rbtn-approve { background: #dcfce7; color: #15803d; }
.rbtn-approve:hover { background: #bbf7d0; transform: translateY(-1px); }
.rbtn-cancel  { background: #fee2e2; color: #b91c1c; }
.rbtn-cancel:hover  { background: #fecaca; transform: translateY(-1px); }

.empty-state { text-align: center; padding: 60px 20px; color: #94a3b8; font-size: 1rem; }
.empty-icon { font-size: 3rem; margin-bottom: 12px; display: block; }

/* ══ PAGINATION ══ */
.pagination { display: flex; justify-content: center; align-items: center; gap: 18px; margin-top: 32px; }
.page-btn {
  width: 38px; height: 38px; border-radius: 12px;
  border: 1.5px solid #e0e7ff; background: white; color: #4f46e5;
  font-size: 1.1rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(37,99,235,.06); transition: all .2s;
}
.page-btn:hover:not(:disabled) { background: #eff6ff; border-color: #a5b4fc; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-info { font-size: .85rem; font-weight: 700; color: #475569; }

/* ══ MODAL ══ */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(10,15,30,.65); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-card { background: white; border-radius: 24px; overflow: hidden; max-width: 380px; width: 100%; box-shadow: 0 30px 70px rgba(0,0,0,.25); display: flex; flex-direction: column; }
.modal-icon-wrap { display: flex; align-items: center; justify-content: center; padding: 28px 0 4px; }
.modal-warn-icon { width: 48px; height: 48px; color: #ef4444; }
.modal-body { padding: 12px 24px 24px; text-align: center; }
.modal-title { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
.modal-desc { font-size: .85rem; color: #94a3b8; margin-bottom: 18px; }
.modal-input {
  width: 100%; padding: 12px 14px; border-radius: 12px;
  border: 1.5px solid #e2e8f0; font-size: .85rem; margin-bottom: 18px;
  box-sizing: border-box; outline: none; transition: border-color .2s;
}
.modal-input:focus { border-color: #a5b4fc; }
.modal-actions { display: flex; gap: 10px; }
.modal-secondary { flex: 1; padding: 12px; border-radius: 12px; background: #f1f5f9; color: #475569; font-weight: 700; border: none; cursor: pointer; transition: background .2s; }
.modal-secondary:hover { background: #e2e8f0; }
.modal-danger { flex: 2; padding: 12px; border-radius: 12px; background: linear-gradient(135deg, #ef4444, #b91c1c); color: white; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(239,68,68,.35); transition: all .2s; }
.modal-danger:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(239,68,68,.45); }
.cart-icon-sm { width: 15px; height: 15px; }
.modal-enter-active, .modal-leave-active { transition: opacity .25s, transform .25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card, .modal-leave-to .modal-card { transform: scale(.92) translateY(20px); }

/* ══ TOAST ══ */
.toast { position: fixed; top: 24px; right: 24px; z-index: 200; background: #0a0f1e; color: white; border-radius: 16px; padding: 14px 20px; display: flex; align-items: center; gap: 14px; box-shadow: 0 12px 40px rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.08); min-width: 260px; }
.toast-icon { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; font-size: .9rem; font-weight: 900; flex-shrink: 0; box-shadow: 0 4px 12px rgba(16,185,129,.4); }
.toast.error .toast-icon { background: linear-gradient(135deg, #ef4444, #b91c1c); box-shadow: 0 4px 12px rgba(239,68,68,.4); }
.toast.error .toast-title { color: #ef4444; }
.toast-text { display: flex; flex-direction: column; gap: 2px; }
.toast-title { font-size: .75rem; font-weight: 700; color: #10b981; letter-spacing: .04em; text-transform: uppercase; }
.toast-name { font-size: .88rem; color: rgba(255,255,255,.85); font-weight: 500; }
.toast-enter-active { animation: toastSlide .4s cubic-bezier(.175,.885,.32,1.275); }
.toast-leave-active { animation: toastSlide .3s ease reverse; }
@keyframes toastSlide {
  from { opacity: 0; transform: translateX(40px) scale(.9); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}

/* ── MOBILE ── */
@media (max-width: 640px) {
  .hero { padding: 50px 20px 60px; }
  .hero-stats { gap: 16px; padding: 14px 20px; }
  .main-panel { padding: 0 14px 40px; }
  .receipt-grid { grid-template-columns: 1fr; gap: 14px; }
  .action-wrap { flex-direction: column; align-items: stretch; }
  .btn-create { justify-content: center; }
  .status-wrap { gap: 8px; }
  .status-btn { padding: 6px 14px; font-size: .78rem; }
}
</style>