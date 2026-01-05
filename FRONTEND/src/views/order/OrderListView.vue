<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
        <div>
          <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            📦 Đơn hàng
            <span class="text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {{ orders.length }}
            </span>
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Theo dõi & quản lý tất cả đơn hàng
          </p>
        </div>

        <router-link
          to="/products"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03] transition"
        >
          🛒 Mua sắm thêm
        </router-link>
      </div>

      <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10">
        <div class="space-y-6 animate-pulse">
          <div class="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div class="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div class="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>

      <div v-else-if="!orders.length" class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-20 text-center">
        <div class="text-8xl mb-8">📭</div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Chưa có đơn hàng</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-10">Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên</p>
        <router-link
          to="/products"
          class="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03] transition"
        >
          🚀 Khám phá sản phẩm
        </router-link>
      </div>

      <div v-else class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 dark:bg-gray-900/40">
              <tr>
                <th class="px-6 py-5 text-left font-semibold text-gray-600 dark:text-gray-400">Mã</th>
                <th class="px-6 py-5 text-left font-semibold text-gray-600 dark:text-gray-400">Trạng thái</th>
                <th class="px-6 py-5 text-left font-semibold text-gray-600 dark:text-gray-400">Số lượng</th>
                <th class="px-6 py-5 text-left font-semibold text-gray-600 dark:text-gray-400">Tổng tiền</th>
                <th class="px-6 py-5 text-left font-semibold text-gray-600 dark:text-gray-400">Ngày đặt</th>
                <th class="px-6 py-5 text-right font-semibold text-gray-600 dark:text-gray-400">Hành động</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="order in orders" :key="order._id" class="group hover:bg-blue-50/60 dark:hover:bg-gray-700/40 transition">
                <td class="px-6 py-5 font-semibold text-gray-900 dark:text-white">
                  <button @click="goToDetail(order._id)" class="hover:text-blue-600 transition">
                    #{{ order._id.slice(-8).toUpperCase() }}
                  </button>
                </td>

                <td class="px-6 py-5">
                  <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" :class="statusClass(order.status)">
                    <span class="w-2 h-2 rounded-full bg-current"></span>
                    {{ statusText(order.status) }}
                  </span>
                </td>

                <td class="px-6 py-5 text-gray-900 dark:text-white">{{ order.totalQuantity }}</td>

                <td class="px-6 py-5 font-bold text-gray-900 dark:text-white">{{ formatPrice(order.totalPrice) }}₫</td>

                <td class="px-6 py-5 text-gray-600 dark:text-gray-400">{{ formatDate(order.createdAt) }}</td>

                <td class="px-6 py-5">
                  <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                    <select :value="order.status" @change="updateStatus(order._id, $event.target.value)" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium">
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="shipping">Đang giao</option>
                      <option value="delivered">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>

                    <button v-if="order.status === 'pending'" @click="cancelOrder(order._id)" class="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">
                      Hủy
                    </button>

                    <button @click="goToDetail(order._id)" class="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                      Chi tiết
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-900/20">
          <button :disabled="pagination.page === 1" @click="changePage(pagination.page - 1)" class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            ← Trước
          </button>
          <span class="px-3 py-1">{{ pagination.page }} / {{ pagination.totalPages }}</span>
          <button :disabled="pagination.page === pagination.totalPages" @click="changePage(pagination.page + 1)" class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Sau →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import OrderService from "@/services/order.service"

const router = useRouter()
const orders = ref([])
const loading = ref(true)
const pagination = ref({ page: 1, totalPages: 1 })

const statusText = (s) => ({
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Hoàn thành",
  cancelled: "Đã hủy",
}[s] || s)

const statusClass = (s) => ({
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  shipping: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}[s] || "bg-gray-100 text-gray-700")

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v)
const formatDate = (d) => new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })

const loadOrders = async (page = 1) => {
  loading.value = true
  try {
    const res = await OrderService.getAllOrders({ page, limit: 10 })
    orders.value = res.data
    pagination.value = res.pagination
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => router.push(`/orders/${id}`)

const updateStatus = async (id, status) => {
  await OrderService.updateOrderStatus(id, status)
  await loadOrders(pagination.value.page)
}

const cancelOrder = async (id) => {
  await OrderService.updateOrderStatus(id, "cancelled")
  await loadOrders(pagination.value.page)
}

const changePage = (page) => loadOrders(page)

onMounted(() => loadOrders(1))
</script>
