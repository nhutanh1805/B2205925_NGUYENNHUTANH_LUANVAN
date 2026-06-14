<template>
  <div class="admin-support">
    <div class="admin-support__header">
      <h2>Quản lý yêu cầu CSKH</h2>
    </div>

    <div class="filters">
      <select v-model="filterStatus" class="filter-select" @change="applyFilter">
        <option value="">Tất cả trạng thái</option>
        <option value="pending">Chờ xử lý</option>
        <option value="processing">Đang xử lý</option>
        <option value="done">Hoàn thành</option>
        <option value="rejected">Từ chối</option>
        <option value="refunded">Đã hoàn tiền</option>
      </select>

      <select v-model="filterType" class="filter-select" @change="applyFilter">
        <option value="">Tất cả loại</option>
        <option value="warranty">Bảo hành</option>
        <option value="return">Đổi trả</option>
      </select>
    </div>

    <div v-if="loading" class="state-msg">Đang tải...</div>
    <div v-else-if="error" class="state-msg state-msg--error">{{ error }}</div>

    <template v-else>
      <div class="table-wrap">
        <table class="support-table">
          <thead>
            <tr>
              <th>Loại</th>
              <th>Lý do</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td colspan="5" class="table-empty">Không có yêu cầu nào.</td>
            </tr>
            <tr v-for="req in items" :key="req._id" class="table-row">
              <td>{{ req.type === "warranty" ? "Bảo hành" : "Đổi trả" }}</td>
              <td class="td-reason">{{ req.reason }}</td>
              <td>
                <span :class="['badge', `badge--${req.status}`]">
                  {{ statusLabel(req.status) }}
                </span>
              </td>
              <td class="td-date">{{ formatDate(req.createdAt) }}</td>
              <td>
                <button
                  class="btn btn--sm btn--primary"
                  @click="$router.push(`/support/${req._id}`)"
                >
                  Xem
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page === 1" @click="changePage(page - 1)">←</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page === totalPages" @click="changePage(page + 1)">→</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { AdminSupportAPI } from "@/services/support.service";

const items        = ref([]);
const loading      = ref(false);
const error        = ref(null);
const page         = ref(1);
const totalPages   = ref(1);
const filterStatus = ref("");
const filterType   = ref("");

async function fetchList() {
  loading.value = true;
  error.value   = null;
  try {
    const { data } = await AdminSupportAPI.getAllRequests({
      status: filterStatus.value,
      type:   filterType.value,
      page:   page.value,
    });
    items.value      = data.items;
    totalPages.value = data.totalPages;
  } catch (e) {
    error.value = e?.response?.data?.message || "Không tải được danh sách";
  } finally {
    loading.value = false;
  }
}

function applyFilter() { page.value = 1; fetchList(); }
function changePage(p) { page.value = p; fetchList(); }

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

onMounted(fetchList);
</script>

<style scoped>
.admin-support {
  padding: 1.5rem;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.admin-support__header h2 { font-size: 1.3rem; font-weight: 700; }

.filters { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.filter-select {
  padding: 0.45rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
}
.filter-select:focus { border-color: #2563eb; }

.state-msg { text-align: center; color: #6b7280; padding: 2rem 0; }
.state-msg--error { color: #dc2626; }

.table-wrap { overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 12px; }
.support-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.support-table thead { background: #f9fafb; }
.support-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}
.support-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  vertical-align: middle;
}
.table-row:last-child td { border-bottom: none; }
.table-row:hover td { background: #f9fafb; }
.td-reason { max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-date { white-space: nowrap; color: #6b7280; }
.table-empty { text-align: center; color: #9ca3af; padding: 2rem; }

.badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 500;
  white-space: nowrap;
}
.badge--pending    { background: #fef3c7; color: #92400e; }
.badge--processing { background: #dbeafe; color: #1e40af; }
.badge--done       { background: #d1fae5; color: #065f46; }
.badge--rejected   { background: #fee2e2; color: #991b1b; }
.badge--refunded   { background: #ede9fe; color: #5b21b6; }

.btn { border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn--sm { padding: 0.35rem 0.85rem; font-size: 0.8rem; }
.btn--primary { background: #2563eb; color: #fff; }
.btn--primary:hover { background: #1d4ed8; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; }
.page-btn {
  padding: 0.4rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
}
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn:not(:disabled):hover { background: #f3f4f6; }
.page-info { font-size: 0.875rem; color: #6b7280; }
</style>