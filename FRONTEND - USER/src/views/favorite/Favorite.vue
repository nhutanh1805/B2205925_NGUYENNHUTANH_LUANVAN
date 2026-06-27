<template>
  <div class="favorite-page">

    <!-- ══ HERO ══ -->
    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Danh sách của bạn
        </div>

        <h1 class="hero-title">Sản phẩm<br /><em>yêu thích</em></h1>

        <p class="hero-sub">Những sản phẩm bạn đã lưu lại · Xem lại bất cứ lúc nào</p>

        <div class="hero-stats">
          <div class="hero-stat">
            <span class="stat-num">{{ favorites.length }}</span>
            <span class="stat-lbl">Đã lưu</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">100%</span>
            <span class="stat-lbl">Chính hãng</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">♥</span>
            <span class="stat-lbl">Yêu thích</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MAIN PANEL ══ -->
    <div class="main-panel">

      <!-- Loading -->
      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>Đang tải danh sách yêu thích…</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-box state-box--error">
        <div class="state-icon">⚠</div>
        <p>{{ error }}</p>
      </div>

      <!-- Empty -->
      <div v-else-if="favorites.length === 0" class="empty-state">
        <div class="empty-icon">🤍</div>
        <p>Bạn chưa có sản phẩm yêu thích nào.</p>
        <router-link to="/products" class="explore-btn">
          Khám phá sản phẩm
        </router-link>
      </div>

      <!-- Grid -->
      <div v-else class="product-grid">
        <div
          v-for="(item, idx) in favorites"
          :key="item._id"
          class="pcard"
          :style="`--delay:${idx * 0.04}s`"
        >
          <span v-if="item.product.salePrice" class="pbadge pbadge-sale">
            -{{ calcDiscount(item.product) }}%
          </span>
          <span v-else-if="item.product.stock === 0" class="pbadge pbadge-out">Hết</span>

          <router-link
            :to="{ name: 'product.detail', params: { id: item.product._id } }"
            class="pcard-img-wrap"
          >
            <img
              :src="item.product.images?.[0] || '/no-image.png'"
              :alt="item.product.name"
              class="pcard-img"
              loading="lazy"
            />
            <div class="pcard-img-overlay"></div>
          </router-link>

          <div class="pcard-body">
            <p class="pcard-brand">{{ item.product.brand }}</p>
            <router-link
              :to="{ name: 'product.detail', params: { id: item.product._id } }"
              class="pcard-name"
            >
              {{ item.product.name }}
            </router-link>

            <div class="pcard-price-row">
              <span class="pcard-price">
                {{ formatPrice(item.product.salePrice || item.product.price) }}₫
              </span>
              <span v-if="item.product.salePrice" class="pcard-origin">
                {{ formatPrice(item.product.price) }}₫
              </span>
            </div>

            <div class="pcard-stock-row">
              <span class="stock-indicator" :class="{ out: item.product.stock === 0 }"></span>
              <span class="stock-txt" :class="{ out: item.product.stock === 0 }">
                {{ item.product.stock === 0 ? 'Hết hàng' : `Còn ${item.product.stock}` }}
              </span>
            </div>

            <button
              class="pcard-btn pcard-btn--remove"
              :disabled="removingId === item.product._id"
              @click="handleRemove(item.product._id)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="btn-icon">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {{ removingId === item.product._id ? 'Đang xóa…' : 'Bỏ yêu thích' }}
              <span class="btn-shine"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.totalPages > 1" class="pagination">
        <button
          :disabled="pagination.page <= 1"
          @click="changePage(pagination.page - 1)"
          class="page-btn"
        >← Trước</button>
        <span class="page-info">Trang {{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button
          :disabled="pagination.page >= pagination.totalPages"
          @click="changePage(pagination.page + 1)"
          class="page-btn"
        >Sau →</button>
      </div>

    </div>

    <!-- ══ TOAST ══ -->
    <Transition name="toast">
      <div v-if="showToast" class="toast">
        <div class="toast-icon">✓</div>
        <div class="toast-text">
          <span class="toast-title">Đã bỏ yêu thích</span>
          <span class="toast-name">{{ toastMessage }}</span>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script>
import favoriteService from "@/services/favorite.service";

export default {
  name: "FavoritePage",
  data() {
    return {
      favorites: [],
      pagination: null,
      loading: false,
      error: "",
      removingId: null,
      page: 1,
      limit: 12,
      showToast: false,
      toastMessage: "",
    };
  },
  computed: {
    userId() {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return user._id || user.id || "";
      } catch {
        return "";
      }
    },
  },
  created() {
    this.fetchFavorites();
  },
  methods: {
    async fetchFavorites() {
      if (!this.userId) {
        this.error = "Vui lòng đăng nhập để xem danh sách yêu thích";
        return;
      }
      this.loading = true;
      this.error = "";
      try {
        const result = await favoriteService.getByUser(this.userId, {
          page: this.page,
          limit: this.limit,
        });
        this.favorites = result.favorites || [];
        this.pagination = result.pagination || null;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Đã xảy ra lỗi khi tải danh sách yêu thích";
      } finally {
        this.loading = false;
      }
    },

    async handleRemove(productId) {
      this.removingId = productId;
      const removed = this.favorites.find(i => i.product._id === productId);
      try {
        await favoriteService.remove(this.userId, productId);
        this.favorites = this.favorites.filter(i => i.product._id !== productId);
        if (removed) {
          this.toastMessage = removed.product.name;
          this.showToast = true;
          setTimeout(() => { this.showToast = false; }, 3500);
        }
      } catch (err) {
        this.error =
          err.response?.data?.message || "Không thể xóa sản phẩm yêu thích";
      } finally {
        this.removingId = null;
      }
    },

    changePage(newPage) {
      this.page = newPage;
      this.fetchFavorites();
    },

    formatPrice(value) {
      if (value === null || value === undefined) return "";
      return new Intl.NumberFormat("vi-VN").format(value);
    },

    calcDiscount(product) {
      return product.salePrice
        ? Math.round(100 - (product.salePrice / product.price) * 100)
        : 0;
    },
  },
};
</script>

<style scoped>
.favorite-page {
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
    radial-gradient(ellipse 80% 60% at 20% 0%, rgba(225,29,72,.3), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.28), transparent),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,.07), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(225,29,72,.2); top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.18); bottom: -60px; right: -40px; }
.hero-orb-3 { width: 180px; height: 180px; background: rgba(251,113,133,.12); top: 40%; left: 55%; }

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
  background: #fb7185; box-shadow: 0 0 8px #fb7185;
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
  background: linear-gradient(90deg, #fb7185, #a78bfa, #f97316);
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
  max-width: 1400px; margin: -24px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

/* ══ STATES ══ */
.state-box {
  background: white; border-radius: 20px; padding: 60px 20px;
  text-align: center; color: #94a3b8;
  box-shadow: 0 8px 40px rgba(10,15,30,.08);
  border: 1px solid rgba(37,99,235,.08);
}
.state-box--error { color: #e11d48; }
.state-icon { font-size: 2rem; margin-bottom: 12px; }
.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid #e0e7ff; border-top-color: #e11d48;
  margin: 0 auto 14px; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  background: white; border-radius: 20px;
  text-align: center; padding: 80px 20px;
  color: #94a3b8; font-size: 1rem;
  box-shadow: 0 8px 40px rgba(10,15,30,.08);
  border: 1px solid rgba(37,99,235,.08);
}
.empty-icon { font-size: 3rem; margin-bottom: 14px; display: block; }
.explore-btn {
  display: inline-block; margin-top: 18px; padding: 12px 28px;
  background: linear-gradient(135deg, #e11d48, #a855f7);
  color: white; font-weight: 700; font-size: .9rem;
  border-radius: 12px; text-decoration: none;
  box-shadow: 0 4px 16px rgba(225,29,72,.3);
  transition: transform .2s, box-shadow .2s;
}
.explore-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(225,29,72,.4); }

/* ══ GRID ══ */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

/* ══ CARD ══ */
.pcard {
  position: relative; background: white;
  border-radius: 22px; overflow: hidden;
  border: 1.5px solid #e8edf8;
  transition: transform .3s cubic-bezier(.175,.885,.32,1.275), box-shadow .3s, border-color .3s;
  animation: cardIn .4s ease both;
  animation-delay: var(--delay, 0s);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.pcard:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 24px 50px rgba(225,29,72,.12);
  border-color: #fda4af;
}

.pbadge {
  position: absolute; top: 10px; left: 10px; z-index: 3;
  font-size: .62rem; font-weight: 800; padding: 3px 9px;
  border-radius: 999px; color: white; letter-spacing: .04em;
}
.pbadge-sale { background: linear-gradient(135deg, #e11d48, #f97316); box-shadow: 0 3px 10px rgba(225,29,72,.4); }
.pbadge-out  { background: #94a3b8; }

.pcard-img-wrap {
  display: block; position: relative; overflow: hidden;
  cursor: pointer; height: 200px; background: #f8faff;
}
.pcard-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s ease; }
.pcard:hover .pcard-img { transform: scale(1.08); }
.pcard-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(10,15,30,.06));
}

.pcard-body { padding: 14px 14px 16px; }
.pcard-brand { font-size: .68rem; font-weight: 700; color: #e11d48; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 4px; }
.pcard-name {
  display: block; font-size: .88rem; font-weight: 700; color: #0f172a;
  height: 2.6em; overflow: hidden; line-height: 1.3;
  text-decoration: none; margin-bottom: 10px; transition: color .2s;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.pcard-name:hover { color: #e11d48; }
.pcard-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 6px; }
.pcard-price { font-size: 1rem; font-weight: 800; color: #e11d48; }
.pcard-origin { font-size: .75rem; color: #cbd5e1; text-decoration: line-through; }
.pcard-stock-row { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
.stock-indicator {
  width: 7px; height: 7px; border-radius: 50%;
  background: #10b981; box-shadow: 0 0 6px #10b981;
  animation: blink 2s ease-in-out infinite;
}
.stock-indicator.out { background: #cbd5e1; box-shadow: none; animation: none; }
.stock-txt { font-size: .72rem; font-weight: 600; color: #10b981; }
.stock-txt.out { color: #94a3b8; }

.pcard-btn {
  width: 100%; padding: 10px 8px; border-radius: 13px;
  font-size: .82rem; font-weight: 700; color: white;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  position: relative; overflow: hidden;
  transition: transform .2s, box-shadow .2s;
}
.pcard-btn--remove {
  background: linear-gradient(135deg, #e11d48, #a855f7);
  box-shadow: 0 4px 14px rgba(225,29,72,.28);
}
.pcard-btn--remove:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(225,29,72,.4);
}
.pcard-btn:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }
.btn-icon { width: 14px; height: 14px; flex-shrink: 0; }
.btn-shine {
  position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent);
  transform: skewX(-20deg); transition: left .5s;
}
.pcard-btn:hover:not(:disabled) .btn-shine { left: 130%; }

/* ══ PAGINATION ══ */
.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; margin-top: 32px;
}
.page-btn {
  padding: 10px 20px; border-radius: 12px;
  background: white; border: 1.5px solid #e0e7ff;
  color: #4f46e5; font-weight: 700; font-size: .85rem;
  cursor: pointer; transition: all .2s;
  box-shadow: 0 2px 8px rgba(37,99,235,.06);
}
.page-btn:hover:not(:disabled) { background: #eff6ff; border-color: #a5b4fc; }
.page-btn:disabled { opacity: .45; cursor: not-allowed; }
.page-info {
  background: white; border: 1.5px solid #e0e7ff;
  border-radius: 12px; padding: 10px 18px;
  font-size: .85rem; font-weight: 700; color: #64748b;
}

/* ══ TOAST ══ */
.toast {
  position: fixed; top: 24px; right: 24px; z-index: 200;
  background: #0a0f1e; color: white; border-radius: 16px;
  padding: 14px 20px; display: flex; align-items: center; gap: 14px;
  box-shadow: 0 12px 40px rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.08);
  min-width: 260px;
}
.toast-icon {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #e11d48, #a855f7);
  display: flex; align-items: center; justify-content: center;
  font-size: .9rem; font-weight: 900; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(225,29,72,.4);
}
.toast-text { display: flex; flex-direction: column; gap: 2px; }
.toast-title { font-size: .75rem; font-weight: 700; color: #fb7185; letter-spacing: .04em; text-transform: uppercase; }
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
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
</style>