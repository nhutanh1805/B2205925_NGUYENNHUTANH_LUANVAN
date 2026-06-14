<template>
  <div class="support-list">
    <div class="support-list__header">
      <h2>Yêu cầu hỗ trợ của tôi</h2>
      <router-link to="/support/create" class="btn btn--primary">
        + Tạo yêu cầu mới
      </router-link>
    </div>

    <div v-if="loading" class="support-list__loading">Đang tải...</div>
    <div v-else-if="error" class="support-list__error">{{ error }}</div>
    <div v-else-if="requests.length === 0" class="support-list__empty">
      Bạn chưa có yêu cầu nào.
    </div>

    <ul v-else class="support-list__items">
      <li
        v-for="req in requests"
        :key="req._id"
        class="support-card"
        @click="$router.push(`/support/${req._id}`)"
      >
        <div class="support-card__top">
          <span class="support-card__type">
            {{ req.type === "warranty" ? "Bảo hành" : "Đổi trả" }}
          </span>
          <span :class="['support-card__status', `status--${req.status}`]">
            {{ statusLabel(req.status) }}
          </span>
        </div>
        <p class="support-card__reason">{{ req.reason }}</p>
        <time class="support-card__date">{{ formatDate(req.createdAt) }}</time>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { SupportAPI } from "@/services/support.service";

const userId   = JSON.parse(localStorage.getItem("user") || "{}")?._id ?? null;
const requests = ref([]);
const loading  = ref(false);
const error    = ref(null);

async function fetchRequests() {
  loading.value = true;
  error.value   = null;
  try {
    const { data } = await SupportAPI.getMyRequests(userId);
    requests.value = data.requests;
  } catch (e) {
    error.value = e?.response?.data?.message || "Không tải được danh sách";
  } finally {
    loading.value = false;
  }
}

function statusLabel(status) {
  const map = {
    pending:    "Chờ xử lý",
    processing: "Đang xử lý",
    done:       "Hoàn thành",
    rejected:   "Từ chối",
    refunded:   "Đã hoàn tiền",
  };
  return map[status] ?? status;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("vi-VN");
}

onMounted(fetchRequests);
</script>

<style scoped>
.support-list {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}
.support-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.support-list__header h2 { font-size: 1.25rem; font-weight: 600; }

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;
}
.btn--primary { background: #2563eb; color: #fff; }

.support-list__loading,
.support-list__empty { text-align: center; color: #6b7280; padding: 2rem 0; }
.support-list__error { color: #dc2626; text-align: center; padding: 1rem; }

.support-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.support-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem;
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.support-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.support-card__top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.support-card__type { font-weight: 500; font-size: 0.9rem; }
.support-card__status {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 500;
}
.status--pending    { background: #fef3c7; color: #92400e; }
.status--processing { background: #dbeafe; color: #1e40af; }
.status--done       { background: #d1fae5; color: #065f46; }
.status--rejected   { background: #fee2e2; color: #991b1b; }
.status--refunded   { background: #ede9fe; color: #5b21b6; }

.support-card__reason {
  font-size: 0.875rem;
  color: #374151;
  margin: 0 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.support-card__date { font-size: 0.75rem; color: #9ca3af; }
</style>