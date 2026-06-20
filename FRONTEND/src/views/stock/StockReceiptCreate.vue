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

        <h1 class="hero-title">Tạo phiếu<br/><em>nhập kho</em></h1>

        <p class="hero-sub">Chọn sản phẩm · Nhập số lượng · Xác nhận</p>
      </div>
    </div>

    <!-- ══ MAIN PANEL ══ -->
    <div class="main-panel">

      <div class="form-card">

        <div class="form-row">
          <div class="form-group">
            <label>Nhà cung cấp <span class="required">*</span></label>
            <input v-model="supplierName" placeholder="Tên nhà cung cấp" class="field-input" />
          </div>
          <div class="form-group">
            <label>Ghi chú</label>
            <input v-model="note" placeholder="Ghi chú (không bắt buộc)" class="field-input" />
          </div>
        </div>

        <!-- Items section -->
        <div class="items-section">
          <div class="items-header">
            <div class="items-title-wrap">
              <h3 class="items-title">Danh sách sản phẩm</h3>
              <span class="required">*</span>
              <span v-if="items.length" class="result-pill"><span class="result-num">{{ items.length }}</span> sản phẩm</span>
            </div>
            <button class="btn-add" @click="openModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="plus-icon">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Thêm sản phẩm
            </button>
          </div>

          <div v-if="items.length === 0" class="empty-items">
            <div class="empty-icon"></div>
            <p>Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để chọn.</p>
          </div>

          <div v-else class="item-grid">
            <div
              v-for="(item, i) in items"
              :key="item.productId"
              class="item-card"
              :style="`--delay:${i * 0.04}s`"
            >
              <button class="item-remove" @click="removeItem(i)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              <div class="item-top">
                <img v-if="item.image" :src="item.image" class="item-thumb" />
                <div v-else class="item-thumb-placeholder"></div>
                <div class="item-info">
                  <p class="item-name">{{ item.name }}</p>
                  <p class="item-meta">
                    <span class="mono">{{ item.sku || '—' }}</span>
                    <span class="dot">·</span>
                    <span>Tồn: {{ item.stock }}</span>
                  </p>
                </div>
              </div>

              <div class="item-fields">
                <div class="item-field">
                  <label>Số lượng</label>
                  <input v-model.number="item.quantity" type="number" min="1" class="input-num" />
                </div>
                <div class="item-field">
                  <label>Giá nhập (đ)</label>
                  <input v-model.number="item.importPrice" type="number" min="0" class="input-num" />
                </div>
              </div>

              <div class="item-subtotal">
                <span>Thành tiền</span>
                <b>{{ formatPrice(item.quantity * item.importPrice) }}</b>
              </div>
            </div>
          </div>
        </div>

        <div class="summary" v-if="items.length > 0">
          <div class="summary-item">
            <span class="summary-lbl">Tổng số lượng</span>
            <span class="summary-val">{{ totalQuantity }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item">
            <span class="summary-lbl">Tổng tiền</span>
            <span class="summary-val summary-val-price">{{ formatPrice(totalCost) }}</span>
          </div>
        </div>

        <Transition name="msg">
          <p class="msg msg-error" v-if="error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="msg-icon">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error }}
          </p>
        </Transition>
        <Transition name="msg">
          <p class="msg msg-success" v-if="success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="msg-icon">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {{ success }}
          </p>
        </Transition>

        <button class="btn-submit" @click="submit" :disabled="loading">
          <span v-if="!loading">Tạo phiếu nhập</span>
          <span v-else class="loading-wrap"><span class="spinner"></span> Đang tạo...</span>
          <span class="btn-shine"></span>
        </button>
      </div>

    </div>

    <!-- ══ MODAL CHỌN SẢN PHẨM ══ -->
    <Transition name="modal">
      <div class="modal-backdrop" v-if="showModal" @click.self="showModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Chọn sản phẩm</h3>
            <button class="btn-close" @click="showModal = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-search-wrap">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="search"
              placeholder="Tìm theo tên hoặc SKU..."
              class="modal-search-input"
              @input="filterProducts"
            />
          </div>

          <div class="modal-body">
            <div v-if="loadingProducts" class="modal-empty">
              <span class="spinner spinner-dark"></span>
              <p>Đang tải sản phẩm...</p>
            </div>
            <div v-else-if="filteredProducts.length === 0" class="modal-empty">
              <div class="empty-icon"></div>
              <p>Không tìm thấy sản phẩm</p>
            </div>

            <div
              v-for="p in filteredProducts"
              :key="p._id"
              class="product-row"
              :class="{ selected: isSelected(p._id) }"
              @click="toggleSelect(p)"
            >
              <img v-if="p.images && p.images[0]" :src="p.images[0]" class="item-thumb" />
              <div v-else class="item-thumb-placeholder"></div>

              <div class="prod-info">
                <div class="prod-name">{{ p.name }}</div>
                <div class="prod-meta">
                  <span class="meta-sku">{{ p.sku || 'Không có SKU' }}</span>
                  <span class="meta-stock">Tồn: {{ p.stock ?? 0 }}</span>
                  <span class="meta-price">Giá bán: {{ formatPrice(p.price) }}</span>
                </div>
              </div>

              <div class="prod-check" :class="{ active: isSelected(p._id) }">
                <svg v-if="isSelected(p._id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <span class="selected-count">Đã chọn: <b>{{ tempSelected.length }}</b> sản phẩm</span>
            <div class="modal-footer-actions">
              <button class="modal-secondary" @click="showModal = false">Hủy</button>
              <button class="modal-confirm" @click="confirmSelection">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="rbtn-icon">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

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
          this.error = "Lỗi tải danh sách sản phẩm";
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
.hero-sub { font-size: 1rem; color: rgba(255,255,255,.55); letter-spacing: .06em; }

/* ══ MAIN PANEL ══ */
.main-panel {
  max-width: 920px; margin: -36px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

/* ══ FORM CARD ══ */
.form-card {
  background: white; border-radius: 24px; padding: 32px;
  box-shadow: 0 8px 40px rgba(10,15,30,.12);
  border: 1px solid rgba(37,99,235,.1);
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 8px; }
.form-group { margin-bottom: 20px; }
label { display: block; font-weight: 700; color: #374151; margin-bottom: 8px; font-size: .85rem; }
.required { color: #e11d48; }
.field-input {
  width: 100%; padding: 12px 14px; border: 1.5px solid #e0e7ff;
  border-radius: 12px; font-size: .9rem; box-sizing: border-box;
  outline: none; transition: border-color .2s, box-shadow .2s;
}
.field-input:focus { border-color: #a5b4fc; box-shadow: 0 0 0 4px rgba(37,99,235,.08); }

/* ══ ITEMS SECTION ══ */
.items-section { margin-bottom: 22px; }
.items-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.items-title-wrap { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.items-title { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.result-pill {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #e0e7ff; color: #4f46e5;
  font-size: .75rem; font-weight: 700;
  padding: 4px 13px; border-radius: 999px; white-space: nowrap;
}
.result-num { font-size: .85rem; }

.btn-add {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 12px;
  font-size: .82rem; font-weight: 700; color: #4f46e5;
  background: #eff6ff; border: 1.5px solid #bfdbfe; cursor: pointer;
  transition: all .2s;
}
.btn-add:hover { background: #dbeafe; border-color: #93c5fd; }
.plus-icon { width: 15px; height: 15px; }

.empty-items {
  text-align: center; padding: 48px 20px; color: #94a3b8;
  border: 2px dashed #e0e7ff; border-radius: 16px; font-size: .9rem;
}
.empty-icon { font-size: 2.6rem; margin-bottom: 10px; display: block; }

/* ══ ITEM CARDS ══ */
.item-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.item-card {
  position: relative; background: #f8faff; border: 1.5px solid #e8edf8;
  border-radius: 18px; padding: 16px;
  animation: cardIn .35s ease both; animation-delay: var(--delay, 0s);
  transition: border-color .2s, box-shadow .2s;
}
.item-card:hover { border-color: #c7d2fe; box-shadow: 0 6px 20px rgba(37,99,235,.08); }
@keyframes cardIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.item-remove {
  position: absolute; top: 10px; right: 10px;
  width: 26px; height: 26px; border-radius: 50%;
  background: #fee2e2; color: #b91c1c; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s, transform .2s;
}
.item-remove:hover { background: #fecaca; transform: scale(1.08); }
.item-remove svg { width: 13px; height: 13px; }

.item-top { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding-right: 26px; }
.item-thumb { width: 44px; height: 44px; object-fit: cover; border-radius: 10px; flex-shrink: 0; }
.item-thumb-placeholder {
  width: 44px; height: 44px; border-radius: 10px; background: #eef2ff;
  display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
}
.item-info { min-width: 0; }
.item-name { font-size: .88rem; font-weight: 700; color: #0f172a; line-height: 1.3; margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-meta { font-size: .72rem; color: #94a3b8; display: flex; align-items: center; gap: 5px; }
.mono { font-family: monospace; }
.dot { opacity: .6; }

.item-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.item-field label { font-size: .68rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .03em; margin-bottom: 5px; }
.input-num {
  width: 100%; padding: 8px 10px; border: 1.5px solid #e0e7ff; border-radius: 9px;
  font-size: .82rem; box-sizing: border-box; outline: none; transition: border-color .2s;
  background: white;
}
.input-num:focus { border-color: #a5b4fc; }

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
  border-radius: 16px; margin-bottom: 22px; border: 1px solid #e0e7ff;
}
.summary-item { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.summary-lbl { font-size: .7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; }
.summary-val { font-size: 1.05rem; font-weight: 800; color: #0f172a; }
.summary-val-price { color: #e11d48; font-size: 1.2rem; }
.summary-divider { width: 1px; height: 32px; background: #c7d2fe; }

/* ══ MESSAGES ══ */
.msg {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: 12px; font-size: .85rem; font-weight: 600;
  margin-bottom: 16px;
}
.msg-icon { width: 17px; height: 17px; flex-shrink: 0; }
.msg-error   { background: #fee2e2; color: #b91c1c; }
.msg-success { background: #dcfce7; color: #15803d; }
.msg-enter-active, .msg-leave-active { transition: opacity .2s, transform .2s; }
.msg-enter-from, .msg-leave-to { opacity: 0; transform: translateY(-6px); }

/* ══ SUBMIT ══ */
.btn-submit {
  width: 100%; padding: 15px; border-radius: 14px;
  font-size: .95rem; font-weight: 800; color: white;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  border: none; cursor: pointer; position: relative; overflow: hidden;
  box-shadow: 0 6px 18px rgba(37,99,235,.32); transition: transform .2s, box-shadow .2s;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(37,99,235,.4); }
.btn-submit:disabled { opacity: .65; cursor: not-allowed; }
.btn-shine {
  position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
  transform: skewX(-20deg); transition: left .5s;
}
.btn-submit:hover:not(:disabled) .btn-shine { left: 130%; }

.loading-wrap { display: inline-flex; align-items: center; gap: 8px; }
.spinner {
  width: 15px; height: 15px; border-radius: 50%;
  border: 2.5px solid rgba(255,255,255,.4); border-top-color: white;
  animation: spin .7s linear infinite;
}
.spinner-dark { border: 2.5px solid #e0e7ff; border-top-color: #4f46e5; width: 22px; height: 22px; margin-bottom: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ MODAL CHỌN SẢN PHẨM ══ */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(10,15,30,.65); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-card {
  background: white; border-radius: 24px; overflow: hidden;
  max-width: 600px; width: 100%; max-height: 84vh;
  box-shadow: 0 30px 70px rgba(0,0,0,.25);
  display: flex; flex-direction: column;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 22px 24px 0; }
.modal-title { font-size: 1.15rem; font-weight: 800; color: #0f172a; }
.btn-close {
  width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9;
  border: none; cursor: pointer; color: #64748b;
  display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.btn-close:hover { background: #e2e8f0; }
.btn-close svg { width: 15px; height: 15px; }

.modal-search-wrap {
  display: flex; align-items: center; gap: 10px;
  margin: 16px 24px 0; padding: 11px 16px;
  background: #f8faff; border: 1.5px solid #e0e7ff; border-radius: 12px;
}
.search-icon { width: 17px; height: 17px; color: #94a3b8; flex-shrink: 0; }
.modal-search-input { flex: 1; border: none; outline: none; background: transparent; font-size: .88rem; }

.modal-body { flex: 1; overflow-y: auto; padding: 14px 24px; margin-top: 8px; }
.modal-empty { text-align: center; color: #94a3b8; padding: 40px 0; font-size: .88rem; }

.product-row {
  display: flex; align-items: center; gap: 14px; padding: 12px;
  border-radius: 14px; cursor: pointer; border: 2px solid transparent;
  transition: all .15s; margin-bottom: 6px;
}
.product-row:hover    { background: #f8faff; }
.product-row.selected { background: #eff6ff; border-color: #a5b4fc; }
.prod-info { flex: 1; min-width: 0; }
.prod-name { font-weight: 700; color: #0f172a; font-size: .88rem; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.prod-meta { display: flex; gap: 12px; font-size: .72rem; color: #64748b; flex-wrap: wrap; }
.meta-sku { font-family: monospace; }
.meta-stock { color: #0369a1; font-weight: 600; }
.meta-price { color: #15803d; font-weight: 600; }

.prod-check {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  background: #e2e8f0; color: transparent;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.prod-check.active { background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; }
.prod-check svg { width: 13px; height: 13px; }

.modal-footer {
  padding: 16px 24px; border-top: 1px solid #e8edf8;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
}
.selected-count { font-size: .82rem; color: #64748b; }
.selected-count b { color: #4f46e5; }
.modal-footer-actions { display: flex; gap: 10px; }
.modal-secondary { padding: 11px 20px; border-radius: 12px; background: #f1f5f9; color: #475569; font-weight: 700; border: none; cursor: pointer; transition: background .2s; }
.modal-secondary:hover { background: #e2e8f0; }
.modal-confirm {
  padding: 11px 22px; border-radius: 12px; display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; font-weight: 700;
  border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(37,99,235,.35); transition: all .2s;
}
.modal-confirm:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,99,235,.45); }
.rbtn-icon { width: 14px; height: 14px; }

.modal-enter-active, .modal-leave-active { transition: opacity .25s, transform .25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card, .modal-leave-to .modal-card { transform: scale(.94) translateY(20px); }

/* ── MOBILE ── */
@media (max-width: 640px) {
  .hero { padding: 40px 20px 60px; }
  .main-panel { padding: 0 14px 40px; }
  .form-card { padding: 22px 18px; border-radius: 20px; }
  .form-row { grid-template-columns: 1fr; gap: 0; }
  .item-grid { grid-template-columns: 1fr; }
  .summary { flex-direction: column; align-items: stretch; gap: 12px; }
  .summary-item { align-items: flex-start; }
  .summary-divider { display: none; }
  .modal-card { max-height: 90vh; }
}
</style>