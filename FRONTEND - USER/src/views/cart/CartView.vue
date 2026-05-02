<template>
  <div class="cart-page">

    <!-- ══ HERO ══ -->
    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Đơn hàng của bạn
        </div>

        <h1 class="hero-title">Giỏ<br/><em>hàng</em></h1>

        <p class="hero-sub">Kiểm tra sản phẩm trước khi thanh toán</p>

        <div class="hero-stats" v-if="!loading">
          <div class="hero-stat">
            <span class="stat-num">{{ cart.items.length }}</span>
            <span class="stat-lbl">Loại SP</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num">{{ cart.totalQuantity }}</span>
            <span class="stat-lbl">Số lượng</span>
          </div>
          <div class="stat-divider"></div>
          <div class="hero-stat">
            <span class="stat-num price-stat">{{ formatPrice(cart.totalPrice) }}₫</span>
            <span class="stat-lbl">Tổng tiền</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MAIN ══ -->
    <div class="main-panel">

      <!-- EMPTY -->
      <section v-if="!loading && !cart.items.length" class="empty-box">
        <div class="empty-glow"></div>
        <div class="empty-icon">🛍️</div>
        <h2 class="empty-title">Giỏ hàng đang trống</h2>
        <p class="empty-desc">Hãy thêm sản phẩm yêu thích của bạn</p>
        <router-link to="/products" class="btn-shop">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Tiếp tục mua sắm
        </router-link>
      </section>

      <!-- SKELETON -->
      <section v-if="loading" class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="sk-img"></div>
          <div class="sk-lines">
            <div class="sk-line w70"></div>
            <div class="sk-line w40"></div>
            <div class="sk-line w55"></div>
          </div>
        </div>
      </section>

      <!-- CART CONTENT -->
      <section v-else-if="cart.items.length" class="cart-layout">

        <!-- LEFT: Items -->
        <div class="items-col">
          <div class="col-header">
            <span class="col-label">Sản phẩm ({{ cart.items.length }})</span>
            <button class="clear-all-btn" @click="clearCart">
              🗑 Xóa tất cả
            </button>
          </div>

          <transition-group name="cart" tag="div" class="items-list">
            <div
              v-for="item in cart.items"
              :key="item.productId"
              class="item-card"
            >
              <!-- Badge -->
              <span v-if="item.salePrice" class="item-badge">SALE</span>

              <!-- Image -->
              <div class="item-img-wrap">
                <img :src="item.images?.[0] || placeholder" class="item-img" />
              </div>

              <!-- Info -->
              <div class="item-info">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-price">{{ formatPrice(item.price) }}₫</p>

                <div class="item-controls">
                  <div class="qty-group">
                    <button
                      class="qty-btn"
                      :disabled="item.quantity <= 1"
                      @click="updateQuantity(item.productId, item.quantity - 1)"
                    >−</button>
                    <span class="qty-val">{{ item.quantity }}</span>
                    <button
                      class="qty-btn qty-plus"
                      @click="updateQuantity(item.productId, item.quantity + 1)"
                    >+</button>
                  </div>

                  <button class="remove-btn" @click="removeItem(item.productId)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
                    </svg>
                    Xóa
                  </button>
                </div>
              </div>

              <!-- Subtotal -->
              <div class="item-subtotal">
                <span class="subtotal-label">Thành tiền</span>
                <span class="subtotal-value">{{ formatPrice(item.price * item.quantity) }}₫</span>
              </div>
            </div>
          </transition-group>
        </div>

        <!-- RIGHT: Checkout -->
        <aside class="checkout-col">
          <div class="checkout-card">
            <div class="checkout-header">
              <span class="checkout-icon">🚀</span>
              <h2 class="checkout-title">Thanh toán</h2>
            </div>

            <div class="checkout-lines">
              <div class="checkout-row">
                <span>Số loại sản phẩm</span>
                <b>{{ cart.items.length }}</b>
              </div>
              <div class="checkout-row">
                <span>Tổng số lượng</span>
                <b>{{ cart.totalQuantity }}</b>
              </div>
              <div class="checkout-divider"></div>
              <div class="checkout-row total-row">
                <span>Tổng tiền</span>
                <span class="total-price">{{ formatPrice(cart.totalPrice) }}₫</span>
              </div>
            </div>

            <router-link to="/checkout" class="checkout-btn">
              <span>Thanh toán ngay</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              <span class="btn-shine"></span>
            </router-link>

            <router-link to="/products" class="continue-btn">
              ← Tiếp tục mua sắm
            </router-link>
          </div>

          <!-- Trust badges -->
          <div class="trust-badges">
            <div class="badge-item">
              <span class="badge-ico">🔒</span>
              <span>Thanh toán an toàn</span>
            </div>
            <div class="badge-item">
              <span class="badge-ico">🚚</span>
              <span>Giao hàng nhanh</span>
            </div>
            <div class="badge-item">
              <span class="badge-ico">↩️</span>
              <span>Đổi trả dễ dàng</span>
            </div>
          </div>
        </aside>

      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import CartService from "@/services/cart.service"

const router = useRouter()

const cart = ref({ items: [], totalQuantity: 0, totalPrice: 0 })
const loading = ref(true)
const placeholder = "https://via.placeholder.com/120x160?text=No+Image"

const loadCart = async () => {
  loading.value = true
  try {
    const res = await CartService.getCart()
    cart.value = res || cart.value
  } catch (err) {
    if (err.message === "Chưa đăng nhập") {
      alert("Bạn cần đăng nhập")
      router.push("/user/login")
    }
  } finally {
    loading.value = false
  }
}

const updateQuantity = async (productId, quantity) => {
  if (quantity < 1) return
  await CartService.updateQuantity({ productId, quantity })
  await loadCart()
}

const removeItem = async (productId) => {
  if (!confirm("Xóa sản phẩm này?")) return
  await CartService.removeItem(productId)
  await loadCart()
}

const clearCart = async () => {
  if (!confirm("Xóa toàn bộ giỏ hàng?")) return
  await CartService.clearCart()
  await loadCart()
}

const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v)

onMounted(loadCart)
</script>

<style scoped>
/* ══ PAGE ══ */
.cart-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ══ HERO ══ */
.hero {
  position: relative; overflow: hidden;
  background: #0a0f1e; padding: 64px 32px 80px; text-align: center;
}
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%,  rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3), transparent),
    radial-gradient(ellipse 50% 40% at 50% 50%,  rgba(249,115,22,.06), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25);  top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.2);  bottom: -60px; right: -40px; }
.hero-orb-3 { width: 180px; height: 180px; background: rgba(249,115,22,.15); top: 40%; left: 55%; }

.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px; padding: 6px 18px;
  font-size: .75rem; font-weight: 700; color: rgba(255,255,255,.8);
  letter-spacing: .08em; text-transform: uppercase;
  margin-bottom: 20px; backdrop-filter: blur(8px);
}
.eyebrow-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #f97316; box-shadow: 0 0 8px #f97316;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}

.hero-title {
  font-size: clamp(2.6rem, 7vw, 4.2rem); font-weight: 900; color: white;
  line-height: 1.05; letter-spacing: -.02em; margin-bottom: 12px;
  text-shadow: 0 2px 30px rgba(0,0,0,.4);
}
.hero-title em {
  font-style: normal;
  background: linear-gradient(90deg, #f97316, #ec4899, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size: 1rem; color: rgba(255,255,255,.5); letter-spacing: .05em; margin-bottom: 32px; }

.hero-stats {
  display: inline-flex; align-items: center; gap: 24px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  border-radius: 20px; padding: 16px 28px; backdrop-filter: blur(16px);
}
.hero-stat { text-align: center; }
.stat-num { display: block; font-size: 1.5rem; font-weight: 900; color: white; line-height: 1; }
.stat-num.price-stat { font-size: 1.1rem; color: #fb923c; }
.stat-lbl { font-size: .68rem; color: rgba(255,255,255,.45); letter-spacing: .07em; text-transform: uppercase; margin-top: 3px; display: block; }
.stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,.15); }

/* ══ MAIN ══ */
.main-panel {
  max-width: 1300px; margin: -24px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

/* ══ EMPTY ══ */
.empty-box {
  position: relative; overflow: hidden;
  text-align: center; padding: 80px 40px;
  background: white; border-radius: 28px;
  box-shadow: 0 20px 60px rgba(37,99,235,.1);
  border: 1.5px solid #e8edf8;
}
.empty-glow {
  position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(249,115,22,.08), transparent 70%);
}
.empty-icon { font-size: 90px; display: block; margin-bottom: 16px; position: relative; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.empty-title { font-size: 1.8rem; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
.empty-desc  { color: #94a3b8; margin-bottom: 28px; }
.btn-shop {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; font-weight: 700; font-size: .95rem;
  box-shadow: 0 6px 20px rgba(37,99,235,.35);
  transition: transform .2s, box-shadow .2s;
}
.btn-shop:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(37,99,235,.45); }

/* ══ SKELETON ══ */
.skeleton-list { display: flex; flex-direction: column; gap: 16px; }
.skeleton-card {
  display: flex; gap: 20px; align-items: center;
  background: white; border-radius: 20px; padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,.06);
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%,100% { opacity:1; } 50% { opacity:.5; }
}
.sk-img { width: 90px; height: 110px; border-radius: 14px; background: #e8edf8; flex-shrink: 0; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.sk-line { height: 14px; border-radius: 8px; background: #e8edf8; }
.w70 { width: 70%; } .w40 { width: 40%; } .w55 { width: 55%; }

/* ══ LAYOUT ══ */
.cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }

/* ══ ITEMS COL ══ */
.items-col { display: flex; flex-direction: column; gap: 0; }
.col-header {
  display: flex; justify-content: space-between; align-items: center;
  background: white; border-radius: 20px 20px 0 0;
  padding: 18px 22px; border-bottom: 1.5px solid #f0f4ff;
  box-shadow: 0 -2px 20px rgba(37,99,235,.05);
}
.col-label { font-weight: 800; font-size: 1rem; color: #0f172a; }
.clear-all-btn {
  font-size: .8rem; font-weight: 700; color: #ef4444;
  background: #fff1f1; border: 1.5px solid #fecaca;
  padding: 6px 14px; border-radius: 10px;
  transition: all .2s; cursor: pointer;
}
.clear-all-btn:hover { background: #ef4444; color: white; border-color: #ef4444; }

.items-list { display: flex; flex-direction: column; }

/* ══ ITEM CARD ══ */
.item-card {
  display: flex; align-items: center; gap: 18px;
  background: white; padding: 18px 22px;
  border-bottom: 1.5px solid #f0f4ff;
  position: relative;
  transition: background .2s, transform .25s;
}
.item-card:last-child {
  border-bottom: none;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 12px 40px rgba(37,99,235,.08);
}
.item-card:hover { background: #f8faff; }

.item-badge {
  position: absolute; top: 12px; left: 12px;
  background: linear-gradient(135deg, #e11d48, #f97316);
  color: white; font-size: .6rem; font-weight: 800;
  padding: 3px 8px; border-radius: 999px;
  box-shadow: 0 3px 10px rgba(225,29,72,.35);
}

.item-img-wrap { flex-shrink: 0; }
.item-img {
  width: 86px; height: 108px; object-fit: cover;
  border-radius: 14px; display: block;
  box-shadow: 0 6px 18px rgba(0,0,0,.1);
  transition: transform .3s;
}
.item-card:hover .item-img { transform: scale(1.04); }

.item-info { flex: 1; }
.item-name { font-weight: 800; font-size: 1rem; color: #0f172a; margin-bottom: 4px; line-height: 1.3; }
.item-price { color: #e11d48; font-weight: 700; font-size: .9rem; margin-bottom: 14px; }

.item-controls { display: flex; align-items: center; gap: 14px; }

.qty-group { display: flex; align-items: center; gap: 0; background: #f0f4ff; border-radius: 12px; overflow: hidden; border: 1.5px solid #e0e7ff; }
.qty-btn {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1rem; cursor: pointer;
  background: transparent; color: #334155; transition: background .15s;
}
.qty-btn:hover:not(:disabled) { background: #e0e7ff; }
.qty-btn:disabled { color: #cbd5e1; cursor: not-allowed; }
.qty-btn.qty-plus { background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; }
.qty-btn.qty-plus:hover { background: linear-gradient(135deg, #1d4ed8, #4338ca); }
.qty-val { width: 36px; text-align: center; font-weight: 800; font-size: 1rem; color: #0f172a; }

.remove-btn {
  display: inline-flex; align-items: center; gap: 5px;
  color: #ef4444; font-weight: 600; font-size: .8rem;
  background: #fff1f1; border: 1.5px solid #fecaca;
  padding: 6px 12px; border-radius: 10px; cursor: pointer;
  transition: all .2s;
}
.remove-btn:hover { background: #ef4444; color: white; border-color: #ef4444; }

.item-subtotal {
  text-align: right; flex-shrink: 0; min-width: 110px;
}
.subtotal-label { display: block; font-size: .68rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
.subtotal-value { font-weight: 900; font-size: 1.05rem; color: #f97316; }

/* ══ CHECKOUT COL ══ */
.checkout-col { position: sticky; top: 24px; display: flex; flex-direction: column; gap: 16px; }

.checkout-card {
  background: white; border-radius: 24px; padding: 28px;
  box-shadow: 0 20px 60px rgba(37,99,235,.15);
  border: 1.5px solid #e0e7ff;
}
.checkout-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.checkout-icon { font-size: 1.6rem; }
.checkout-title { font-size: 1.4rem; font-weight: 900; color: #0f172a; }

.checkout-lines { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
.checkout-row { display: flex; justify-content: space-between; align-items: center; font-size: .9rem; color: #475569; }
.checkout-divider { height: 1.5px; background: linear-gradient(90deg, #e0e7ff, #fce7f3); border-radius: 999px; margin: 4px 0; }
.total-row { font-size: 1rem; font-weight: 800; color: #0f172a; }
.total-price { color: #f97316; font-size: 1.3rem; font-weight: 900; }

.checkout-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 16px;
  border-radius: 14px; font-weight: 800; font-size: 1rem; color: white;
  background: linear-gradient(135deg, #f97316, #ec4899);
  box-shadow: 0 8px 24px rgba(249,115,22,.4);
  transition: transform .25s, box-shadow .25s;
  position: relative; overflow: hidden; margin-bottom: 10px;
}
.checkout-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 14px 32px rgba(249,115,22,.5); }
.btn-shine {
  position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
  transform: skewX(-20deg); transition: left .6s;
}
.checkout-btn:hover .btn-shine { left: 130%; }

.continue-btn {
  display: block; text-align: center; width: 100%; padding: 12px;
  border-radius: 12px; font-weight: 700; font-size: .88rem;
  color: #4f46e5; background: #eff6ff; border: 1.5px solid #e0e7ff;
  transition: background .2s, color .2s;
}
.continue-btn:hover { background: #e0e7ff; color: #2563eb; }

/* ══ TRUST BADGES ══ */
.trust-badges {
  background: white; border-radius: 18px; padding: 18px 20px;
  box-shadow: 0 8px 30px rgba(37,99,235,.08);
  border: 1.5px solid #e8edf8;
  display: flex; flex-direction: column; gap: 12px;
}
.badge-item {
  display: flex; align-items: center; gap: 10px;
  font-size: .82rem; font-weight: 600; color: #475569;
}
.badge-ico { font-size: 1.1rem; }

/* ══ ANIMATIONS ══ */
.cart-enter-active, .cart-leave-active { transition: all .4s cubic-bezier(.4,0,.2,1); }
.cart-enter-from { opacity: 0; transform: translateX(-20px); }
.cart-leave-to   { opacity: 0; transform: scale(.85); }

/* ══ MOBILE ══ */
@media (max-width: 900px) {
  .cart-layout { grid-template-columns: 1fr; }
  .checkout-col { position: static; }
}
@media (max-width: 640px) {
  .hero { padding: 48px 16px 60px; }
  .hero-stats { gap: 14px; padding: 12px 18px; }
  .main-panel { padding: 0 12px 40px; }
  .item-card { flex-wrap: wrap; }
  .item-subtotal { width: 100%; text-align: left; padding-top: 8px; border-top: 1px solid #f0f4ff; }
}
</style>