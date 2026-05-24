<template>
  <div class="checkout-page">

    <!-- POINT ANIMATION OVERLAY -->
    <transition name="point-fade">
      <div v-if="showPointAnim" class="point-overlay">
        <div class="point-card">
          <div class="point-star">⭐</div>
          <div class="point-title">Tích điểm thành công!</div>
          <div class="point-earned">
            <span class="point-plus">+</span>
            <span class="point-num">{{ earnedPoints }}</span>
            <span class="point-lbl">điểm</span>
          </div>
          <div class="point-detail">
            {{ formatPrice(cart.totalPrice) }}₫ × 1đ/1.000₫
          </div>
          <div class="point-bar-wrap">
            <div class="point-bar" :style="{ width: barWidth + '%' }"></div>
          </div>
          <div class="point-sub">Đang chuyển đến đơn hàng...</div>
        </div>
      </div>
    </transition>

    <div class="checkout-card">

      <!-- HEADER -->
      <div class="header">
        <h1>Thanh toán đơn hàng</h1>
        <p>Hoàn tất đơn hàng của bạn chỉ trong vài bước</p>
      </div>

      <div class="content">

        <!-- LEFT -->
        <div class="left">

          <h2>Thông tin giao hàng</h2>

          <input v-model="form.shippingAddress" placeholder="Địa chỉ giao hàng" />
          <input v-model="form.phone" placeholder="Số điện thoại" />
          <input v-model="form.note" placeholder="Ghi chú (tuỳ chọn)" />

          <button class="btn-cod" :disabled="loading" @click="placeOrder">
            {{ loading ? "Đang xử lý..." : "Thanh toán COD" }}
          </button>

          <button class="btn-vnpay" :disabled="loading" @click="payVNPay">
            VNPay
          </button>

        </div>

        <!-- RIGHT -->
        <div class="right">

          <h2>Đơn hàng</h2>

          <div v-for="(item, index) in cart.items" :key="index" class="item">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <b>{{ formatPrice(item.price * item.quantity) }}₫</b>
          </div>

          <div class="total">
            <div>Số lượng: {{ cart.totalQuantity }}</div>
            <div class="price">{{ formatPrice(cart.totalPrice) }}₫</div>
          </div>

          <!-- Điểm sẽ nhận được -->
          <div class="point-preview" v-if="cart.totalPrice > 0">
            <span class="preview-ico">⭐</span>
            <span>Đơn này nhận được <b>{{ Math.floor(cart.totalPrice / 1000).toLocaleString("vi-VN") }} điểm</b></span>
          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import CartService from "@/services/cart.service";
import OrderService from "@/services/order.service";

const router = useRouter();

const cart = ref({ items: [], totalQuantity: 0, totalPrice: 0 });
const loading = ref(false);
const showPointAnim = ref(false);
const earnedPoints = ref(0);
const barWidth = ref(0);

const form = ref({
  shippingAddress: "",
  phone: "",
  note: "",
});

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v || 0);

const loadCart = async () => {
  try {
    const res = await CartService.getCart();
    cart.value = {
      items: res.items || [],
      totalQuantity: res.totalQuantity || 0,
      totalPrice: res.totalPrice || 0,
    };
    if (!cart.value.items.length) {
      alert("Giỏ hàng trống");
      router.push("/cart");
    }
  } catch {
    router.push("/cart");
  }
};

onMounted(loadCart);

const validate = () => {
  if (!form.value.shippingAddress) { alert("Nhập địa chỉ"); return false; }
  if (!form.value.phone) { alert("Nhập SĐT"); return false; }
  return true;
};

const normalize = (r) => r?.data ?? r;

// Hiện animation rồi chuyển trang sau 2.5s
const showPointSuccess = (totalPrice) => {
  earnedPoints.value = Math.floor(totalPrice / 1000);
  showPointAnim.value = true;
  barWidth.value = 0;

  // Animate progress bar
  setTimeout(() => { barWidth.value = 100; }, 50);

  // Chuyển trang sau 2.5s
  setTimeout(() => {
    showPointAnim.value = false;
    router.push("/orders");
  }, 2500);
};

const placeOrder = async () => {
  if (!validate()) return;
  loading.value = true;
  try {
    const res = await OrderService.createOrder({
      ...form.value,
      paymentMethod: "COD",
      items: cart.value.items,
      totalPrice: cart.value.totalPrice,
      totalQuantity: cart.value.totalQuantity,
    });

    const order = normalize(res);
    if (!order?._id) throw new Error("Lỗi tạo đơn");

    showPointSuccess(cart.value.totalPrice);

  } catch (err) {
    alert(err.message);
  } finally {
    loading.value = false;
  }
};

const payVNPay = async () => {
  if (!validate()) return;
  loading.value = true;
  try {
    const res = await OrderService.createOrder({
      ...form.value,
      paymentMethod: "VNPAY",
      items: cart.value.items,
      totalPrice: cart.value.totalPrice,
      totalQuantity: cart.value.totalQuantity,
    });

    const order = normalize(res);
    const orderId = order?._id;
    if (!orderId) throw new Error("Không tạo đơn");

    const paymentRes = await fetch("http://localhost:3000/api/payment/create-vnpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, amount: cart.value.totalPrice }),
    });

    const data = await paymentRes.json();
    if (!data?.payment_url) throw new Error("VNPay lỗi");

    window.location.href = data.payment_url;

  } catch (err) {
    alert(err.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>

/* ===== POINT OVERLAY ===== */
.point-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
}

.point-card {
  background: white;
  border-radius: 28px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 32px 80px rgba(0,0,0,0.25);
  min-width: 320px;
  animation: popIn .4s cubic-bezier(.34,1.56,.64,1);
}

@keyframes popIn {
  from { transform: scale(.7); opacity: 0; }
  to   { transform: scale(1);  opacity: 1; }
}

.point-star {
  font-size: 3.5rem;
  animation: spin 1s ease-out;
  display: block; margin-bottom: 12px;
}

@keyframes spin {
  from { transform: rotate(-180deg) scale(0); opacity: 0; }
  to   { transform: rotate(0deg) scale(1);   opacity: 1; }
}

.point-title {
  font-size: 1.2rem; font-weight: 900; color: #0f172a; margin-bottom: 20px;
}

.point-earned {
  display: flex; align-items: baseline; justify-content: center;
  gap: 4px; margin-bottom: 8px;
}

.point-plus {
  font-size: 2rem; font-weight: 900; color: #eab308;
}

.point-num {
  font-size: 3.5rem; font-weight: 900;
  color: #eab308;
  animation: countUp .6s ease-out;
}

@keyframes countUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.point-lbl {
  font-size: 1.2rem; font-weight: 700; color: #92400e;
}

.point-detail {
  font-size: .8rem; color: #94a3b8; margin-bottom: 24px;
}

.point-bar-wrap {
  height: 6px; background: #f1f5f9;
  border-radius: 999px; overflow: hidden; margin-bottom: 16px;
}

.point-bar {
  height: 100%;
  background: linear-gradient(90deg, #eab308, #f97316);
  border-radius: 999px;
  transition: width 2.4s ease;
}

.point-sub {
  font-size: .8rem; color: #94a3b8;
}

/* ===== TRANSITION ===== */
.point-fade-enter-active, .point-fade-leave-active { transition: opacity .3s; }
.point-fade-enter-from, .point-fade-leave-to { opacity: 0; }

/* ===== PAGE ===== */
.checkout-page {
  min-height: 100vh;
  display: flex; justify-content: center; align-items: center;
  background: linear-gradient(135deg, #c7d2fe, #fbcfe8, #ddd6fe);
  position: relative; overflow: hidden;
}

.checkout-page::before {
  content: "";
  position: absolute; inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 40%),
    radial-gradient(circle at 80% 30%, rgba(236,72,153,0.25), transparent 40%),
    radial-gradient(circle at 50% 80%, rgba(34,197,94,0.2),   transparent 40%);
  z-index: 0;
}

/* ===== CARD ===== */
.checkout-card {
  width: 100%; max-width: 900px;
  background: rgba(255,255,255,0.75); backdrop-filter: blur(25px);
  border-radius: 24px; overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.25);
  position: relative; z-index: 10;
}

.header {
  text-align: center; padding: 20px;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  color: white;
}

.content { display: grid; grid-template-columns: 1fr 1fr; }

.left {
  padding: 20px; display: flex; flex-direction: column; gap: 10px;
}

.left input {
  padding: 10px; border-radius: 10px; border: 1px solid #ddd; transition: 0.2s;
}
.left input:focus {
  outline: none; border-color: #6366f1;
  transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99,102,241,0.2);
}

.btn-cod {
  background: #000; color: white;
  padding: 10px; border-radius: 12px; transition: 0.2s;
}
.btn-cod:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
.btn-cod:disabled { opacity: .6; cursor: not-allowed; }

.btn-vnpay {
  background: linear-gradient(90deg, #22c55e, #10b981);
  color: white; padding: 10px; border-radius: 12px; transition: 0.2s;
}
.btn-vnpay:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(16,185,129,0.3); }
.btn-vnpay:disabled { opacity: .6; cursor: not-allowed; }

.right { padding: 20px; background: #f8fafc; }

.item {
  display: flex; justify-content: space-between;
  padding: 10px; background: white; border-radius: 12px;
  margin-bottom: 8px; transition: 0.2s;
}
.item:hover { transform: translateX(4px); }

.total { margin-top: 10px; font-weight: bold; }
.price { color: #ef4444; font-size: 20px; }

/* Điểm preview */
.point-preview {
  margin-top: 14px; padding: 10px 14px;
  background: #fefce8; border: 1.5px solid #fde68a;
  border-radius: 12px; font-size: .85rem; color: #92400e;
  display: flex; align-items: center; gap: 8px;
}
.preview-ico { font-size: 1.1rem; }

@media (max-width: 768px) {
  .content { grid-template-columns: 1fr; }
}
</style>