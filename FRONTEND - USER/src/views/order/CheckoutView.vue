<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10">
    <div class="max-w-5xl mx-auto px-4">
      <header class="text-center mb-12">
        <h1 class="text-5xl font-black bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
          Thanh toán
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-3">Xác nhận thông tin đơn hàng</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">

        <div class="lg:col-span-2">
          <form @submit.prevent="placeOrder" class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 space-y-8">
            <div>
              <label class="block text-lg font-bold mb-3">Địa chỉ giao hàng</label>
              <input
                v-model="form.shippingAddress"
                required
                class="w-full px-5 py-4 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-4 focus:ring-orange-300"
                placeholder="Ví dụ: Vĩnh Xuân, Vĩnh Long"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-lg font-bold mb-3">Số điện thoại</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  class="w-full px-5 py-4 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  placeholder="0123456789"
                />
              </div>
              <div>
                <label class="block text-lg font-bold mb-3">Ghi chú (tùy chọn)</label>
                <input
                  v-model="form.note"
                  class="w-full px-5 py-4 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  placeholder="Giao giờ hành chính, gọi trước khi đến..."
                />
              </div>
            </div>

            <div class="pt-6 border-t dark:border-gray-700">
              <router-link
                to="/cart"
                class="text-orange-600 hover:underline font-semibold"
              >
                Quay lại giỏ hàng
              </router-link>
            </div>
          </form>
        </div>

        <aside class="sticky top-6 h-fit bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <h2 class="text-2xl font-black mb-6">Tóm tắt đơn hàng</h2>
          <div class="space-y-3 text-gray-600 dark:text-gray-400 mb-6">
            <div class="flex justify-between">
              <span>Số sản phẩm</span>
              <span>{{ cart.totalQuantity }}</span>
            </div>
            <div class="flex justify-between text-2xl font-black text-gray-900 dark:text-white pt-4 border-t dark:border-gray-700">
              <span>Tổng tiền</span>
              <span class="text-orange-600">{{ formatPrice(cart.totalPrice) }}₫</span>
            </div>
          </div>

          <button
            @click="placeOrder"
            :disabled="submitting"
            class="w-full py-5 rounded-xl text-black font-black text-xl shadow-lg
                   bg-gradient-to-r from-orange-500 to-pink-600
                   hover:scale-105 transition disabled:opacity-70"
          >
            {{ submitting ? "Đang xử lý..." : "Xác nhận đặt hàng" }}
          </button>
        </aside>
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
const submitting = ref(false);

const form = ref({
  shippingAddress: "",
  phone: "",
  note: "",
});

const formatPrice = (value) => new Intl.NumberFormat("vi-VN").format(value);

const loadCart = async () => {
  try {
    const res = await CartService.getCart();
    cart.value = res;
    if (cart.value.items.length === 0) {
      alert("Giỏ hàng trống!");
      router.push("/cart");
    }
  } catch (err) {
    alert("Không thể tải giỏ hàng");
    router.push("/cart");
  }
};

const placeOrder = async () => {
  if (!form.value.shippingAddress || !form.value.phone) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  submitting.value = true;
  try {
    const res = await OrderService.createOrder(form.value);
    alert("Đặt hàng thành công! Chuyển đến danh sách đơn hàng...");
    router.push("/orders");
  } catch (err) {
    alert("Đặt hàng thất bại: " + (err.response?.data?.message || err.message));
  } finally {
    submitting.value = false;
  }
};

onMounted(loadCart);
</script>