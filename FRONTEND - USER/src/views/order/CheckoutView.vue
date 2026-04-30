<template>
  <div class="p-6 max-w-5xl mx-auto">

    <h1 class="text-2xl font-bold mb-6">
      Thanh toán
    </h1>

    <!-- FORM -->
    <div class="space-y-4 mb-6">

      <input
        v-model="form.shippingAddress"
        placeholder="Địa chỉ"
        class="border p-3 w-full rounded"
      />

      <input
        v-model="form.phone"
        placeholder="SĐT"
        class="border p-3 w-full rounded"
      />

      <input
        v-model="form.note"
        placeholder="Ghi chú"
        class="border p-3 w-full rounded"
      />
    </div>

    <hr class="my-6" />

    <!-- SUMMARY -->
    <div class="mb-6">
      <p>Số lượng: {{ cart.totalQuantity }}</p>
      <p class="font-bold text-lg">
        Tổng tiền: {{ formatPrice(cart.totalPrice) }}₫
      </p>
    </div>

    <hr class="my-6" />

    <!-- BUTTONS -->
    <div class="space-y-3">

      <button
        @click="placeOrder"
        :disabled="loading"
        class="w-full bg-black text-white py-3 rounded"
      >
        Đặt hàng COD
      </button>

      <button
        @click="payVNPay"
        :disabled="loading"
        class="w-full bg-blue-600 text-white py-3 rounded"
      >
        Thanh toán VNPay
      </button>

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

// ================= FORMAT =================
const formatPrice = (v) =>
  new Intl.NumberFormat("vi-VN").format(v || 0);

// ================= LOAD CART =================
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
    console.error(err);
    router.push("/cart");
  }
};

onMounted(loadCart);

// ================= VALIDATE =================
const validate = () => {
  if (!form.value.shippingAddress) return alert("Nhập địa chỉ"), false;
  if (!form.value.phone) return alert("Nhập SĐT"), false;
  return true;
};

// ================= NORMALIZE ORDER RESPONSE =================
const normalizeOrder = (res) => {
  return res?.data ?? res;
};

// ================= COD =================
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

    const order = normalizeOrder(res);

    // ✅ FIX CHUẨN
    if (!order?._id) {
      throw new Error("Không tạo được đơn hàng");
    }

    alert("Đặt hàng COD thành công");

    router.push("/orders");

  } catch (err) {
    console.error(err);
    alert(err.message || "Lỗi COD");
  } finally {
    loading.value = false;
  }
};

// ================= VNPay =================
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

    const order = normalizeOrder(res);

    const orderId = order?._id;

    if (!orderId) {
      throw new Error("Không tạo được đơn hàng");
    }

    const paymentRes = await fetch("http://localhost:3000/api/payment/create-vnpay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        orderId,
        amount: cart.value.totalPrice
      })
    });

    const data = await paymentRes.json();

    const paymentUrl = data?.payment_url;

    if (!paymentUrl) {
      throw new Error("Không lấy được link VNPay");
    }

    window.location.href = paymentUrl;

  } catch (err) {
    console.error(err);
    alert(err.message || "VNPay lỗi");
  } finally {
    loading.value = false;
  }
};
</script>