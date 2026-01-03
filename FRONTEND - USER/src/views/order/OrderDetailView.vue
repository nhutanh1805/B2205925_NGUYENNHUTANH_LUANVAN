<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
    <div class="max-w-5xl mx-auto px-6">
      <button @click="router.back()" class="mb-10 flex items-center gap-3 text-orange-600 hover:text-orange-700 font-bold text-lg transition">
        <span class="text-2xl">←</span>
        Quay lại danh sách đơn hàng
      </button>

      <div v-if="loading" class="text-center py-32">
        <div class="text-8xl animate-spin text-orange-500">⟳</div>
        <p class="mt-6 text-xl text-gray-600 dark:text-gray-400">Đang tải chi tiết đơn hàng...</p>
      </div>

      <div v-else-if="!order" class="text-center py-32 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl">
        <div class="text-9xl mb-8 opacity-80">❓</div>
        <h2 class="text-4xl font-black text-gray-800 dark:text-gray-200 mb-6">Không tìm thấy đơn hàng</h2>
        <p class="text-gray-600 dark:text-gray-400 text-lg">Vui lòng kiểm tra lại hoặc quay về danh sách</p>
      </div>

      <article v-else class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        <div class="relative bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-12 text-white">
          <div class="absolute inset-0 bg-black opacity-10"></div>
          <div class="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div>
              <p class="text-sm opacity-90 tracking-wider uppercase">Mã đơn hàng</p>
              <p class="text-5xl font-black mt-2 tracking-widest">#{{ order._id.slice(-8).toUpperCase() }}</p>
            </div>

            <div class="text-center space-y-6 flex-1">
              <div class="relative">
                <span class="status-badge" :class="statusClass(order.status)">
                  {{ statusText(order.status) }}
                </span>
                <div class="absolute -inset-3 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
              </div>

              <select
                v-if="isAdmin"
                :value="order.status"
                @change="updateStatus(order._id, $event.target.value)"
                class="px-10 py-5 rounded-2xl text-black font-black text-xl bg-white shadow-2xl cursor-pointer outline-none hover:ring-4 hover:ring-white/40 transition"
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="shipping">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
              </select>

              <p class="text-base opacity-90">Đặt lúc {{ formatDate(order.createdAt) }}</p>
            </div>

            <div class="text-right space-y-4">
              <p class="text-sm opacity-90 uppercase tracking-wider">Tổng thanh toán</p>
              <p class="text-6xl font-black">{{ formatPrice(order.totalPrice) }}₫</p>

              <button
                v-if="!isAdmin && order.status === 'pending'"
                @click.stop="cancelOrder(order._id)"
                class="px-14 py-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xl shadow-2xl hover:scale-110 transition"
              >
                Hủy đơn hàng
              </button>
            </div>
          </div>
        </div>

        <div class="px-12 py-20 bg-gray-50 dark:bg-gray-900/30">
          <div class="flex justify-between items-center relative">
            <div v-for="(step, index) in statusSteps" :key="index" class="flex-1 text-center relative">
              <div
                class="w-28 h-28 mx-auto rounded-full flex items-center justify-center text-white font-black text-4xl shadow-2xl transition-all duration-700 z-10"
                :class="stepClass(order.status, step.value)"
              >
                {{ index + 1 }}
                <div class="absolute inset-0 rounded-full animate-ping" :class="step.value === order.status ? 'bg-orange-400 opacity-40' : ''"></div>
              </div>
              <p class="mt-10 text-2xl font-bold text-gray-800 dark:text-gray-200">{{ step.label }}</p>

              <div
                v-if="index < statusSteps.length - 1"
                class="absolute top-14 left-1/2 w-full h-5 -translate-x-1/2 rounded-full transition-all duration-700"
                :class="lineClass(order.status, step.value)"
              ></div>
            </div>
          </div>
        </div>

        <div class="px-12 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div class="space-y-8">
            <h3 class="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-4">
              <span class="text-5xl">🚚</span> Thông tin giao hàng
            </h3>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-3xl p-10 space-y-6 text-xl shadow-inner">
              <p><span class="font-bold text-gray-700 dark:text-gray-300">Người nhận:</span> {{ currentUser?.name || 'Khách hàng' }}</p>
              <p><span class="font-bold text-gray-700 dark:text-gray-300">Địa chỉ:</span> {{ order.shippingAddress }}</p>
              <p><span class="font-bold text-gray-700 dark:text-gray-300">Số điện thoại:</span> {{ order.phone }}</p>
              <p v-if="order.note"><span class="font-bold text-gray-700 dark:text-gray-300">Ghi chú:</span> {{ order.note }}</p>
              <p><span class="font-bold text-gray-700 dark:text-gray-300">Số sản phẩm:</span> {{ order.totalQuantity }} món</p>
            </div>
          </div>

          <div class="space-y-8">
            <h3 class="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-4">
              <span class="text-5xl">📱</span> Sản phẩm đã đặt
            </h3>
            <div class="space-y-8">
              <div
                v-for="item in order.items"
                :key="item.productId"
                class="flex gap-8 items-center bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all"
              >
                <img
                  :src="item.images?.[0] || placeholder"
                  class="w-40 h-40 object-cover rounded-3xl border-4 border-white dark:border-gray-700 shadow-2xl"
                />
                <div class="flex-1">
                  <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ item.name }}</p>
                  <p class="text-2xl text-gray-600 dark:text-gray-400 mt-3">Số lượng: {{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="text-4xl font-black text-orange-600">{{ formatPrice(item.price * item.quantity) }}₫</p>
                  <p class="text-xl text-gray-500 mt-2">({{ formatPrice(item.price) }}₫ / sản phẩm)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import OrderService from "@/services/order.service";

const route = useRoute();
const router = useRouter();
const order = ref(null);
const loading = ref(true);

const orderId = route.params.orderId;

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
    pending: "bg-gradient-to-r from-yellow-500 to-amber-600 shadow-yellow-600/70",
    confirmed: "bg-gradient-to-r from-blue-500 to-cyan-600 shadow-blue-600/70",
    shipping: "bg-gradient-to-r from-purple-500 to-pink-600 shadow-purple-600/70",
    delivered: "bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-600/70",
    cancelled: "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-600/70",
  };
  return classes[status] || "bg-gray-500";
};

const stepClass = (currentStatus, stepValue) => {
  if (currentStatus === "cancelled") return "bg-gray-500 opacity-60";
  const order = ["pending", "confirmed", "shipping", "delivered"];
  const currentIndex = order.indexOf(currentStatus);
  const stepIndex = order.indexOf(stepValue);
  if (stepIndex < currentIndex) return "bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl";
  if (stepIndex === currentIndex) return "bg-gradient-to-br from-orange-500 to-pink-600 shadow-2xl scale-125 animate-pulse";
  return "bg-gray-400 opacity-50";
};

const lineClass = (currentStatus, stepValue) => {
  if (currentStatus === "cancelled") return "bg-gray-500 opacity-40";
  const order = ["pending", "confirmed", "shipping", "delivered"];
  const currentIndex = order.indexOf(currentStatus);
  const stepIndex = order.indexOf(stepValue);
  return stepIndex < currentIndex ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gray-400 dark:bg-gray-700 opacity-50";
};

const formatPrice = (value) => new Intl.NumberFormat("vi-VN").format(value);
const formatDate = (date) => new Date(date).toLocaleString("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const loadOrder = async () => {
  loading.value = true;
  try {
    order.value = await OrderService.getOrder(orderId);
  } catch (err) {
    alert("Không tải được chi tiết đơn hàng: " + err.message);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (orderId, newStatus) => {
  const currentStatus = order.value.status;
  if (newStatus === currentStatus) return;
  if (!confirm(`Chuyển trạng thái đơn hàng sang "${statusText(newStatus)}"?`)) return;

  try {
    await OrderService.updateOrderStatus(orderId, newStatus);
    alert("Cập nhật trạng thái thành công!");
    await loadOrder();
  } catch (err) {
    alert("Cập nhật thất bại: " + (err.response?.data?.message || err.message));
  }
};

const cancelOrder = async (orderId) => {
  if (!confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
  try {
    await OrderService.updateOrderStatus(orderId, "cancelled");
    alert("Đơn hàng đã được hủy!");
    await loadOrder();
  } catch (err) {
    alert("Hủy thất bại: " + (err.response?.data?.message || err.message));
  }
};

onMounted(loadOrder);
</script>

<style scoped>
.status-badge {
  @apply inline-block px-14 py-6 rounded-full font-black text-4xl shadow-2xl relative overflow-hidden;
}
.status-badge::before {
  content: '';
  @apply absolute inset-0 bg-white opacity-30 -skew-x-12 translate-x-full;
  animation: shine 4s infinite;
}
@keyframes shine {
  0% { transform: translateX(-200%); }
  100% { transform: translateX(200%); }
}
</style>