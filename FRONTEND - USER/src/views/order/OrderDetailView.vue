<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="max-w-5xl mx-auto px-6 py-12">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">
          📦 Chi tiết đơn hàng
        </h1>
        <button @click="goBack" class="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          ← Quay lại
        </button>
      </div>

      <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10">
        <div class="space-y-6 animate-pulse">
          <div class="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div class="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>

      <div v-else-if="order" class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">

        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Mã đơn: #{{ order._id.slice(-8).toUpperCase() }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">Người đặt: {{ order.userName }}</p>
            <p class="text-gray-600 dark:text-gray-400">Ngày đặt: {{ formatDate(order.createdAt) }}</p>
            <p class="text-gray-600 dark:text-gray-400">Địa chỉ giao hàng: {{ order.shippingAddress }}</p>
            <p class="text-gray-600 dark:text-gray-400">Số điện thoại: {{ order.phone }}</p>
            <p v-if="order.note" class="text-gray-600 dark:text-gray-400">Ghi chú: {{ order.note }}</p>
          </div>

          <!-- ❌ KHÔNG CHO THAY ĐỔI TRẠNG THÁI -->
          <div class="flex flex-col gap-2">
            <div class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200">
              {{ getStatusLabel(order.status) }}
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 dark:bg-gray-900/40">
              <tr>
                <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 w-[45%]">Sản phẩm</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Giá</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Số lượng</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Tổng</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="item in order.items" :key="item.productId">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4 group">
                    <div class="relative">
                      <img :src="item.images?.[0] || placeholder" class="order-mini-img" />
                      <div class="absolute inset-0 rounded-xl bg-black opacity-0 group-hover:opacity-20 transition"></div>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
                        {{ item.name }}
                      </span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        x{{ item.quantity }}
                      </span>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 text-gray-900 dark:text-white">{{ formatPrice(item.price) }}₫</td>
                <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.quantity }}</td>
                <td class="px-6 py-4 font-bold text-gray-900 dark:text-white">
                  {{ formatPrice(item.price * item.quantity) }}₫
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end mt-6">
          <div class="text-right">
            <p class="text-gray-600 dark:text-gray-400">Tổng số lượng: {{ order.totalQuantity }}</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">
              Tổng tiền: {{ formatPrice(order.totalPrice) }}₫
            </p>
          </div>
        </div>

      </div>

      <div v-else class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-20 text-center">
        <div class="text-8xl mb-8">❌</div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Đơn hàng không tồn tại
        </h2>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import OrderService from "@/services/order.service"

const route = useRoute()
const router = useRouter()

const order = ref(null)
const loading = ref(true)
const placeholder = "https://via.placeholder.com/120x160?text=No+Image"

const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v)

const formatDate = d =>
  new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

const loadOrder = async () => {
  loading.value = true
  try {
    order.value = await OrderService.getOrder(route.params.orderId)
  } catch {
    order.value = null
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

// 🔥 chỉ hiển thị label trạng thái
const getStatusLabel = (status) => {
  switch (status) {
    case "pending": return "Chờ xác nhận"
    case "confirmed": return "Đã xác nhận"
    case "shipping": return "Đang giao"
    case "delivered": return "Hoàn thành"
    case "cancelled": return "Đã hủy"
    default: return status
  }
}

onMounted(loadOrder)
</script>

<style scoped>
.order-mini-img {
  width: 64px;
  height: 88px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.group:hover .order-mini-img {
  transform: scale(1.05);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.18);
}
</style>