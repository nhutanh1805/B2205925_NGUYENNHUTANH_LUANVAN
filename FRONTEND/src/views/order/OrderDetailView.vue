<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="max-w-5xl mx-auto px-6 py-12">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">
          📦 Chi tiết đơn hàng
        </h1>
        <button @click="goBack" class="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          ← Quay lại
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10">
        <div class="space-y-6 animate-pulse">
          <div class="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div class="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>

      <!-- Order Info -->
      <div v-else-if="order" class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Mã đơn: #{{ order._id.slice(-8).toUpperCase() }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Ngày đặt: {{ formatDate(order.createdAt) }}
            </p>
            <p class="text-gray-600 dark:text-gray-400">
              Địa chỉ giao hàng: {{ order.shippingAddress }}
            </p>
            <p class="text-gray-600 dark:text-gray-400">
              Số điện thoại: {{ order.phone }}
            </p>
            <p v-if="order.note" class="text-gray-600 dark:text-gray-400">
              Ghi chú: {{ order.note }}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <select v-model="order.status" @change="updateStatus(order._id, order.status)" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium">
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao</option>
              <option value="delivered">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            <button v-if="order.status === 'pending'" @click="cancelOrder(order._id)" class="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">
              Hủy đơn
            </button>
          </div>
        </div>

        <!-- Products Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 dark:bg-gray-900/40">
              <tr>
                <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Sản phẩm</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Giá</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Số lượng</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Tổng</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="item in order.items" :key="item.productId">
                <td class="px-6 py-4 text-gray-900 dark:text-white flex items-center gap-3">
                  <img :src="item.images[0]" alt="" class="w-12 h-12 rounded-lg object-cover">
                  <span>{{ item.name }}</span>
                </td>
                <td class="px-6 py-4 text-gray-900 dark:text-white">{{ formatPrice(item.price) }}₫</td>
                <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.quantity }}</td>
                <td class="px-6 py-4 font-bold text-gray-900 dark:text-white">{{ formatPrice(item.price * item.quantity) }}₫</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Order Summary -->
        <div class="flex justify-end mt-6">
          <div class="text-right">
            <p class="text-gray-600 dark:text-gray-400">Tổng số lượng: {{ order.totalQuantity }}</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">Tổng tiền: {{ formatPrice(order.totalPrice) }}₫</p>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-20 text-center">
        <div class="text-8xl mb-8">❌</div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Đơn hàng không tồn tại</h2>
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

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v)
const formatDate = (d) => new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })

const loadOrder = async () => {
  loading.value = true
  try {
    order.value = await OrderService.getOrder(route.params.orderId)
  } catch (err) {
    console.error(err)
    order.value = null
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

const updateStatus = async (id, status) => {
  await OrderService.updateOrderStatus(id, status)
  await loadOrder()
}

const cancelOrder = async (id) => {
  await OrderService.updateOrderStatus(id, "cancelled")
  await loadOrder()
}

onMounted(loadOrder)
</script>
