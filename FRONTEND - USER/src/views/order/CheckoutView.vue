<template>
  <div class="checkout-page">

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

          <button class="btn-cod" @click="placeOrder">
            Thanh toán COD
          </button>

          <button class="btn-vnpay" @click="payVNPay">
            VNPay
          </button>

        </div>

        <!-- RIGHT -->
        <div class="right">

          <h2>Đơn hàng</h2>

          <div
            v-for="(item, index) in cart.items"
            :key="index"
            class="item"
          >
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <b>{{ formatPrice(item.price * item.quantity) }}₫</b>
          </div>

          <div class="total">
            <div>Số lượng: {{ cart.totalQuantity }}</div>
            <div class="price">
              {{ formatPrice(cart.totalPrice) }}₫
            </div>
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

const form = ref({
  shippingAddress: "",
  phone: "",
  note: "",
});

const formatPrice = (v) =>
  new Intl.NumberFormat("vi-VN").format(v || 0);

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

  } catch (err) {
    router.push("/cart");
  }
};

onMounted(loadCart);

const validate = () => {
  if (!form.value.shippingAddress) return alert("Nhập địa chỉ"), false;
  if (!form.value.phone) return alert("Nhập SĐT"), false;
  return true;
};

const normalize = (r) => r?.data ?? r;

const placeOrder = async () => {
  if (!validate()) return;

  loading.value = true;

  try {
    const res = await OrderService.createOrder({
      ...form.value,
      items: cart.value.items,
      totalPrice: cart.value.totalPrice,
      totalQuantity: cart.value.totalQuantity,
    });

    const order = normalize(res);

    if (!order?._id) throw new Error("Lỗi tạo đơn");

    alert("Đặt hàng COD thành công");
    router.push("/orders");

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
      body: JSON.stringify({
        orderId,
        amount: cart.value.totalPrice
      })
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

/* ===== PAGE CENTER FIX ===== */
.checkout-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  background: linear-gradient(135deg, #c7d2fe, #fbcfe8, #ddd6fe);
  position: relative;
  overflow: hidden;
}

/* background glow */
.checkout-page::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 40%),
    radial-gradient(circle at 80% 30%, rgba(236,72,153,0.25), transparent 40%),
    radial-gradient(circle at 50% 80%, rgba(34,197,94,0.2), transparent 40%);
  z-index: 0;
}

/* ===== CARD ===== */
.checkout-card {
  width: 100%;
  max-width: 900px;

  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(25px);

  border-radius: 24px;
  overflow: hidden;

  box-shadow: 0 30px 80px rgba(0,0,0,0.25);

  position: relative;
  z-index: 10;
}

/* HEADER */
.header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  color: white;
}

/* CONTENT */
.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

/* LEFT */
.left {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.left input {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ddd;
  transition: 0.2s;
}

.left input:focus {
  outline: none;
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99,102,241,0.2);
}

/* BUTTONS */
.btn-cod {
  background: #000;
  color: white;
  padding: 10px;
  border-radius: 12px;
  transition: 0.2s;
}

.btn-cod:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.btn-vnpay {
  background: linear-gradient(90deg, #22c55e, #10b981);
  color: white;
  padding: 10px;
  border-radius: 12px;
  transition: 0.2s;
}

.btn-vnpay:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16,185,129,0.3);
}

/* RIGHT */
.right {
  padding: 20px;
  background: #f8fafc;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  transition: 0.2s;
}

.item:hover {
  transform: translateX(4px);
}

.total {
  margin-top: 10px;
  font-weight: bold;
}

.price {
  color: #ef4444;
  font-size: 20px;
}

/* MOBILE */
@media (max-width: 768px) {
  .content {
    grid-template-columns: 1fr;
  }
}

</style>