<template>
  <div class="receipt-page">

    <!-- ══ HERO ══ -->
    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <button class="hero-back" @click="$router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Quay lại
        </button>

        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Quản lý kho hàng
        </div>

        <h1 class="hero-title">Chi tiết<br/><em>phiếu nhập</em></h1>

        <p v-if="receipt" class="hero-sub">{{ receipt.supplierName }}</p>
      </div>
    </div>

    <!-- ══ MAIN PANEL ══ -->
    <div class="main-panel">

      <div v-if="receipt" class="detail-card">

        <!-- Status banner -->
        <div class="status-banner" :class="receipt.status">
          <div class="status-banner-left">
            <div class="status-icon-wrap" :class="receipt.status">
              <svg v-if="receipt.status === 'completed'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <svg v-else-if="receipt.status === 'cancelled'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <p class="status-banner-lbl">Trạng thái</p>
              <p class="status-banner-val">{{ statusLabel(receipt.status) }}</p>
            </div>
          </div>
          <span class="rcard-code">#{{ receipt._id.slice(-8).toUpperCase() }}</span>
        </div>

        <!-- Meta grid -->
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Nhà cung cấp</span>
            <span class="meta-value strong">{{ receipt.supplierName }}</span>
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
          <div class="meta-item meta-full" v-if="receipt.note">
            <span class="meta-label">Ghi chú</span>
            <span class="meta-value">{{ receipt.note }}</span>
          </div>
          <div class="meta-item meta-full" v-if="receipt.cancelReason">
            <span class="meta-label">Lý do hủy</span>
            <span class="meta-value cancel-reason">{{ receipt.cancelReason }}</span>
          </div>
        </div>

        <!-- Items -->
        <div class="items-section">
          <div class="items-header">
            <h3 class="items-title">Danh sách sản phẩm</h3>
            <span class="result-pill"><span class="result-num">{{ receipt.items.length }}</span> sản phẩm</span>
          </div>

          <div class="item-grid">
            <div
              v-for="(item, i) in receipt.items"
              :key="i"
              class="item-card"
              :style="`--delay:${i * 0.04}s`"
            >
              <div class="item-top">
                <span class="item-index">{{ i + 1 }}</span>
                <div class="item-info">
                  <p class="item-name">{{ item.name }}</p>
                  <p class="item-meta mono">{{ item.sku || '—' }}</p>
                </div>
              </div>

              <div class="item-fields">
                <div class="item-field">
                  <span class="item-field-lbl">Số lượng</span>
                  <span class="item-field-val">{{ item.quantity }}</span>
                </div>
                <div class="item-field">
                  <span class="item-field-lbl">Giá nhập</span>
                  <span class="item-field-val">{{ formatPrice(item.importPrice) }}</span>
                </div>
              </div>

              <div class="item-subtotal">
                <span>Thành tiền</span>
                <b>{{ formatPrice(item.subtotal) }}</b>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="summary">
          <div class="summary-item">
            <span class="summary-lbl">Tổng số lượng</span>
            <span class="summary-val">{{ receipt.totalItems }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item">
            <span class="summary-lbl">Tổng tiền</span>
            <span class="summary-val summary-val-price">{{ formatPrice(receipt.totalCost) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="detail-actions" v-if="receipt.status === 'pending'">
          <button class="btn-approve" @click="complete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="action-icon">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Duyệt phiếu — cộng kho
            <span class="btn-shine"></span>
          </button>
          <button class="btn-cancel" @click="openCancel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="action-icon">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Hủy phiếu
          </button>
        </div>
      </div>

      <div v-else class="loading-state">
        <span class="spinner spinner-dark"></span>
        <p>Đang tải...</p>
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
      receipt: null,
      cancelModal: false,
      cancelReason: "",
      showToast: false,
      toastMessage: "",
      toastType: "success",
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
        this.notify("Không tìm thấy phiếu nhập", "error");
        setTimeout(() => this.$router.back(), 1200);
      }
    },
    async complete() {
      if (!confirm("Duyệt phiếu này? Stock sẽ được cộng ngay.")) return;
      try {
        this.receipt = (await StockReceiptService.complete(this.receipt._id)).data;
        this.notify("Đã duyệt phiếu nhập kho", "success");
      } catch (err) {
        this.notify(err.response?.data?.message || "Lỗi duyệt phiếu", "error");
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
        this.notify("Đã hủy phiếu nhập kho", "success");
      } catch (err) {
        this.notify(err.response?.data?.message || "Lỗi hủy phiếu", "error");
      }
    },
    notify(msg, type = "success") {
      this.toastMessage = msg;
      this.toastType = type;
      this.showToast = true;
      setTimeout(() => { this.showToast = false; }, 3500);
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
.receipt-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ══ HERO ══ */
.hero {
  position: relative; overflow: hidden;
  background: #0a0f1e; padding: 56px 32px 80px; text-align: center;
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

.hero-back {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.14);
  color: rgba(255,255,255,.8); font-size: .82rem; font-weight: 700;
  padding: 8px 16px; border-radius: 999px; cursor: pointer;
  margin-bottom: 24px; transition: all .2s; backdrop-filter: blur(8px);
}
.hero-back:hover { background: rgba(255,255,255,.14); color: white; }
.hero-back svg { width: 15px; height: 15px; }

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
  font-size: clamp(2.2rem, 5.5vw, 3.6rem); font-weight: 900; color: white;
  line-height: 1.1; letter-spacing: -.02em; margin-bottom: 14px;
  text-shadow: 0 2px 30px rgba(0,0,0,.4);
}
.hero-title em {
  font-style: normal;
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size: 1rem; color: rgba(255,255,255,.55); letter-spacing: .03em; }

/* ══ MAIN PANEL ══ */
.main-panel {
  max-width: 920px; margin: -36px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

/* ══ DETAIL CARD ══ */
.detail-card {
  background: white; border-radius: 24px; padding: 32px;
  box-shadow: 0 8px 40px rgba(10,15,30,.12);
  border: 1px solid rgba(37,99,235,.1);
}

/* ══ STATUS BANNER ══ */
.status-banner {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-radius: 16px; margin-bottom: 24px;
  background: #f8faff; border: 1.5px solid #e8edf8;
}
.status-banner-left { display: flex; align-items: center; gap: 14px; }
.status-icon-wrap {
  width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #fef9c3; color: #a16207;
}
.status-icon-wrap svg { width: 20px; height: 20px; }
.status-icon-wrap.completed { background: #dcfce7; color: #15803d; }
.status-icon-wrap.cancelled { background: #fee2e2; color: #b91c1c; }
.status-banner-lbl { font-size: .7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 2px; }
.status-banner-val { font-size: 1rem; font-weight: 800; color: #0f172a; }
.status-banner.completed .status-banner-val { color: #15803d; }
.status-banner.cancelled .status-banner-val { color: #b91c1c; }
.rcard-code { font-family: monospace; font-size: .78rem; font-weight: 700; color: #94a3b8; }

/* ══ META GRID ══ */
.meta-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 18px 24px;
  margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px dashed #e0e7ff;
}
.meta-item { display: flex; flex-direction: column; gap: 5px; }
.meta-full { grid-column: 1 / -1; }
.meta-label { font-size: .7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.meta-value { font-size: .9rem; color: #1e293b; }
.meta-value.strong { font-weight: 800; font-size: 1rem; }
.mono { font-family: monospace; font-size: .8rem; color: #64748b; }
.cancel-reason { color: #b91c1c; }

/* ══ ITEMS SECTION ══ */
.items-section { margin-bottom: 26px; }
.items-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.items-title { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.result-pill {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #e0e7ff; color: #4f46e5;
  font-size: .75rem; font-weight: 700;
  padding: 4px 13px; border-radius: 999px; white-space: nowrap;
}
.result-num { font-size: .85rem; }

/* ══ ITEM CARDS ══ */
.item-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.item-card {
  background: #f8faff; border: 1.5px solid #e8edf8;
  border-radius: 18px; padding: 16px;
  animation: cardIn .35s ease both; animation-delay: var(--delay, 0s);
  transition: border-color .2s, box-shadow .2s;
}
.item-card:hover { border-color: #c7d2fe; box-shadow: 0 6px 20px rgba(37,99,235,.08); }
@keyframes cardIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.item-top { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.item-index {
  width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg, #2563eb, #4f46e5); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: .8rem; font-weight: 800;
}
.item-info { min-width: 0; }
.item-name { font-size: .88rem; font-weight: 700; color: #0f172a; line-height: 1.3; margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-meta { font-size: .72rem; }

.item-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.item-field-lbl { font-size: .68rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .03em; display: block; margin-bottom: 4px; }
.item-field-val { font-size: .85rem; font-weight: 700; color: #1e293b; }

.item-subtotal {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px; border-top: 1px dashed #e0e7ff;
  font-size: .78rem; color: #64748b;
}
.item-subtotal b { color: #e11d48; font-size: .92rem; }

/* ══ SUMMARY ══ */
.summary {
  display: flex; justify-content: flex-end; align-items: center; gap: 24px;
  padding: 16px 20px; background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border-radius: 16px; margin-bottom: 26px; border: 1px solid #e0e7ff;
}
.summary-item { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.summary-lbl { font-size: .7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; }
.summary-val { font-size: 1.05rem; font-weight: 800; color: #0f172a; }
.summary-val-price { color: #e11d48; font-size: 1.2rem; }
.summary-divider { width: 1px; height: 32px; background: #c7d2fe; }

/* ══ ACTIONS ══ */
.detail-actions { display: flex; gap: 12px; }
.btn-approve, .btn-cancel {
  flex: 1; padding: 14px; border-radius: 14px;
  font-size: .9rem; font-weight: 800; color: white; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  position: relative; overflow: hidden; transition: transform .2s, box-shadow .2s;
}
.action-icon { width: 16px; height: 16px; }
.btn-approve {
  background: linear-gradient(135deg, #15803d, #22c55e);
  box-shadow: 0 6px 18px rgba(21,128,61,.3);
}
.btn-approve:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(21,128,61,.4); }
.btn-cancel {
  background: linear-gradient(135deg, #b91c1c, #ef4444);
  box-shadow: 0 6px 18px rgba(185,28,28,.3);
}
.btn-cancel:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(185,28,28,.4); }
.btn-shine {
  position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
  transform: skewX(-20deg); transition: left .5s;
}
.btn-approve:hover .btn-shine { left: 130%; }

/* ══ LOADING ══ */
.loading-state { text-align: center; padding: 80px 20px; color: #94a3b8; }
.spinner-dark { width: 26px; height: 26px; border: 3px solid #e0e7ff; border-top-color: #4f46e5; border-radius: 50%; animation: spin .7s linear infinite; margin: 0 auto 12px; display: block; }
@keyframes spin { to { transform: rotate(360deg); } }

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
  .hero { padding: 40px 20px 60px; }
  .main-panel { padding: 0 14px 40px; }
  .detail-card { padding: 22px 18px; border-radius: 20px; }
  .meta-grid { grid-template-columns: 1fr; }
  .item-grid { grid-template-columns: 1fr; }
  .summary { flex-direction: column; align-items: stretch; gap: 12px; }
  .summary-item { align-items: flex-start; }
  .summary-divider { display: none; }
  .detail-actions { flex-direction: column; }
}
</style>