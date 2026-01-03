<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10">
    <div class="max-w-7xl mx-auto px-4">
      <header class="text-center mb-12">
        <h1 class="text-5xl font-black bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
          Đơn hàng của bạn
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-3">Theo dõi & quản lý chi tiết mọi đơn hàng</p>
      </header>

      <div v-if="loading" class="grid gap-8">
        <div v-for="i in 3" :key="i" class="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div>
      </div>

      <section v-else-if="!orders.length" class="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
        <div class="text-8xl mb-6">📦</div>
        <h2 class="text-3xl font-bold mb-4 text-gray-700 dark:text-gray-300">Chưa có đơn hàng nào</h2>
        <router-link to="/products" class="inline-block px-12 py-5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold hover:scale-105 transition">
          🛍️ Mua sắm ngay
        </router-link>
      </section>

      <div v-else class="space-y-12">
        <article v-for="order in orders" :key="order._id" class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-orange-500 to-pink-600 text-white p-8">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p class="text-sm opacity-90">Mã đơn hàng</p>
                <p class="text-3xl font-black">#{{ order._id.slice(-8).toUpperCase() }}</p>
              </div>

              <div class="text-center flex flex-col items-center gap-4">
                <!-- Badge trạng thái -->
                <span class="status-badge" :class="statusClass(order.status)">
                  {{ statusText(order.status) }}
                </span>

                <select
                  v-if="isAdmin"
                  :value="order.status"
                  @change="updateStatus(order._id, $event.target.value)"
                  class="px-8 py-4 rounded-xl text-black font-bold text-lg bg-white/95 hover:bg-white transition shadow-2xl cursor-pointer outline-none"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao</option>
                  <option value="delivered">Đã giao</option>
                  <option value="cancelled">Đã hủy</option>
                </select>

                <p class="text-sm opacity-90">Ngày đặt: {{ formatDate(order.createdAt) }}</p>
              </div>

              <div class="text-right flex flex-col items-end gap-4">
                <div>
                  <p class="text-sm opacity-90">Tổng thanh toán</p>
                  <p class="text-4xl font-black">{{ formatPrice(order.totalPrice) }}₫</p>
                </div>

                <button
                  v-if="!isAdmin && order.status === 'pending'"
                  @click="cancelOrder(order._id)"
                  class="px-10 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-xl hover:scale-105 transition"
                >
                  Hủy đơn hàng
                </button>
              </div>
            </div>
          </div>

          <div class="px-8 pt-12 pb-6">
            <div class="flex justify-between items-center relative">
              <div v-for="(step, index) in statusSteps" :key="index" class="flex-1 text-center relative">
                <div
                  class="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white font-black text-2xl shadow-2xl transition-all"
                  :class="stepClass(order.status, step.value)"
                >
                  {{ index + 1 }}
                </div>
                <p class="mt-6 text-lg font-bold text-gray-700 dark:text-gray-300">{{ step.label }}</p>

                <!-- Dòng nối dày đẹp -->
                <div
                  v-if="index < statusSteps.length - 1"
                  class="absolute top-10 left-1/2 w-full h-3 -translate-x-1/2 rounded-full transition-all"
                  :class="lineClass(order.status, step.value)"
                ></div>
              </div>
            </div>
          </div>

          <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 class="text-2xl font-black mb-6 text-gray-900 dark:text-white">Thông tin giao hàng</h3>
              <div class="space-y-4 text-gray-600 dark:text-gray-400 text-lg">
                <p><strong>Người nhận:</strong> {{ currentUser?.name || 'Khách hàng' }}</p>
                <p><strong>Địa chỉ:</strong> {{ order.shippingAddress }}</p>
                <p><strong>SĐT:</strong> {{ order.phone }}</p>
                <p v-if="order.note"><strong>Ghi chú:</strong> {{ order.note }}</p>
                <p><strong>Số sản phẩm:</strong> {{ order.totalQuantity }} món</p>
              </div>
            </div>

            <div>
              <h3 class="text-2xl font-black mb-6 text-gray-900 dark:text-white">Sản phẩm</h3>
              <div class="space-y-6">
                <div v-for="item in order.items" :key="item.productId" class="flex gap-6 items-center bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 shadow-md">
                  <img :src="item.images?.[0] || placeholder" class="w-28 h-28 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600" />
                  <div class="flex-1">
                    <p class="text-xl font-bold text-gray-900 dark:text-white">{{ item.name }}</p>
                    <p class="text-lg text-gray-500 mt-1">x{{ item.quantity }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-black text-orange-600">{{ formatPrice(item.price * item.quantity) }}₫</p>
                    <p class="text-lg text-gray-500">{{ formatPrice(item.price) }}₫ / cái</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import OrderService from "@/services/order.service";

const orders = ref([]);
const loading = ref(true);
const placeholder = "https://via.placeholder.com/400x400?text=No+Image";

const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin = computed(() => currentUser.role === "admin"); 

const statusSteps = [
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đã xác nhận", value: "confirmed" },
  { label: "Đang giao", value: "shipping" },
  { label: "Đã giao", value: "delivered" },
];

const statusText = (status) => {
  const map = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    delivered: "Đã hoàn thành",
    cancelled: "Đã hủy",
  };
  return map[status] || status;
};

const statusClass = (status) => {
  const classes = {
    pending: "bg-yellow-500 shadow-yellow-600/60",
    confirmed: "bg-blue-500 shadow-blue-600/60",
    shipping: "bg-purple-500 shadow-purple-600/60",
    delivered: "bg-green-500 shadow-green-600/60",
    cancelled: "bg-red-500 shadow-red-600/60",
  };
  return classes[status] || "bg-gray-500";
};

const stepClass = (currentStatus, stepValue) => {
  if (currentStatus === "cancelled") return "bg-gray-400 scale-100";
  const order = ["pending", "confirmed", "shipping", "delivered"];
  const currentIndex = order.indexOf(currentStatus);
  const stepIndex = order.indexOf(stepValue);
  if (stepIndex < currentIndex) return "bg-green-600 scale-110";
  if (stepIndex === currentIndex) return "bg-orange-500 scale-125 shadow-2xl";
  return "bg-gray-400";
};

const lineClass = (currentStatus, stepValue) => {
  if (currentStatus === "cancelled") return "bg-gray-400";
  const order = ["pending", "confirmed", "shipping", "delivered"];
  const currentIndex = order.indexOf(currentStatus);
  const stepIndex = order.indexOf(stepValue);
  return stepIndex < currentIndex ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600";
};

const formatPrice = (value) => new Intl.NumberFormat("vi-VN").format(value);
const formatDate = (date) => new Date(date).toLocaleString("vi-VN", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit"
});

const loadOrders = async () => {
  loading.value = true;
  try {
    orders.value = await OrderService.getOrders();
  } catch (err) {
    alert("Không tải được đơn hàng: " + err.message);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (orderId, newStatus) => {
  const order = orders.value.find(o => o._id === orderId);
  if (newStatus === order.status) return;
  if (!confirm(`Chuyển trạng thái đơn hàng sang "${statusText(newStatus)}"?\nMã đơn: #${orderId.slice(-8).toUpperCase()}`)) return;

  try {
    await OrderService.updateOrderStatus(orderId, newStatus);
    alert("Cập nhật trạng thái thành công!");
    await loadOrders();
  } catch (err) {
    alert("Cập nhật thất bại: " + (err.response?.data?.message || err.message));
  }
};

const cancelOrder = async (orderId) => {
  if (!confirm("Bạn chắc chắn muốn hủy đơn hàng này?\nHành động này không thể hoàn tác!")) return;
  try {
    await OrderService.updateOrderStatus(orderId, "cancelled");
    alert("Đơn hàng đã được hủy!");
    await loadOrders();
  } catch (err) {
    alert("Hủy đơn thất bại: " + (err.response?.data?.message || err.message));
  }
};

onMounted(loadOrders);
</script>

<style scoped>
.status-badge {
  @apply inline-block px-10 py-5 rounded-full text-white font-black text-2xl shadow-2xl;
}
</style>