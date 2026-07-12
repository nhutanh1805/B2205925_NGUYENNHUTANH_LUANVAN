<template>
  <div class="review-block">
    <div class="section-header">
      <h2 class="section-title">Quản lý đánh giá</h2>
      <div class="section-line"></div>
    </div>

    <!-- CẢNH BÁO ĐÁNH GIÁ TIÊU CỰC -->
    <div v-if="negativeNotifications.length" class="negative-alert-box">
      <div class="negative-alert-header">
        <span> {{ negativeNotifications.length }} đánh giá tiêu cực cần xử lý</span>
        <button class="btn-mark-all" @click="markAllNotificationsRead">Đánh dấu đã xử lý hết</button>
      </div>
      <div
        v-for="n in negativeNotifications"
        :key="n._id"
        class="negative-alert-item"
        @click="goToReview(n)"
      >
        <span>{{ n.message }}</span>
        <button class="btn-mark-one" @click.stop="markNotificationRead(n)">Đã xử lý</button>
      </div>
    </div>

    <div class="review-stats-row">
      <div class="rstat-card">
        <span class="rstat-label">Tổng đánh giá</span>
        <span class="rstat-value">{{ reviewStats.total ?? "—" }}</span>
      </div>
      <div class="rstat-card">
        <span class="rstat-label">Đã duyệt</span>
        <span class="rstat-value ok">{{ reviewStats.byStatus?.approved ?? 0 }}</span>
      </div>
      <div class="rstat-card">
        <span class="rstat-label">Đã ẩn</span>
        <span class="rstat-value muted">{{ reviewStats.byStatus?.hidden ?? 0 }}</span>
      </div>
      <div class="rstat-card rating-card">
        <span class="rstat-label">Phân bố sao</span>
        <div class="rating-bars">
          <div v-for="n in [5,4,3,2,1]" :key="n" class="rating-bar-row">
            <span class="rating-num">{{ n }}★</span>
            <div class="rating-bar-track">
              <div class="rating-bar-fill" :style="{ width: reviewRatingPercent(n) + '%' }"></div>
            </div>
            <span class="rating-count">{{ reviewStats.byRating?.[n] ?? 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="review-toolbar">
      <select v-model="reviewFilters.status" @change="fetchReviews(1)" class="filter-select">
        <option value="">Tất cả trạng thái</option>
        <option value="approved">Đã duyệt</option>
        <option value="hidden">Đã ẩn</option>
      </select>
      <select v-model="reviewFilters.rating" @change="fetchReviews(1)" class="filter-select">
        <option value="">Tất cả sao</option>
        <option v-for="n in [5,4,3,2,1]" :key="n" :value="n">{{ n }} sao</option>
      </select>
    </div>

    <div class="review-table-card">
      <div v-if="reviewsLoading" class="loading-row">
        <div class="spinner-sm-lg"></div> Đang tải...
      </div>

      <table v-else-if="reviews.length" class="review-table">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Sao</th>
            <th>Nội dung</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in reviews"
            :key="r._id"
            :id="`review-row-${r._id}`"
            :class="{ 'row-highlight': highlightedReviewId === r._id }"
          >
            <td>
              <div class="user-cell">
                <b>{{ r.userInfo?.name || "Ẩn danh" }}</b>
                <span class="user-email">{{ r.userInfo?.email }}</span>
              </div>
            </td>
            <td>
              <span class="stars-cell">
                <span v-for="i in 5" :key="i" class="star" :class="{ lit: i <= r.rating }">★</span>
              </span>
            </td>
            <td class="comment-cell">
              <b v-if="r.title" class="review-title">{{ r.title }}</b>
              <p>{{ r.comment }}</p>

              <!-- ADMIN REPLY DISPLAY -->
              <div v-if="r.adminReply && replyingId !== r._id" class="admin-reply-box">
                <span class="admin-reply-label">Phản hồi từ shop</span>
                <p>{{ r.adminReply.content }}</p>
                <div class="admin-reply-actions">
                  <button class="btn-reply-edit" @click="openReplyForm(r)">Sửa</button>
                  <button class="btn-reply-remove" @click="removeReply(r)">Xóa phản hồi</button>
                </div>
              </div>

              <!-- REPLY FORM -->
              <div v-if="replyingId === r._id" class="admin-reply-form">
                <textarea
                  v-model="replyContent"
                  class="admin-reply-input"
                  rows="2"
                  placeholder="Nhập phản hồi cho khách hàng..."
                ></textarea>
                <div class="admin-reply-form-actions">
                  <button class="btn-reply-cancel" @click="cancelReply">Hủy</button>
                  <button class="btn-reply-save" @click="submitReply(r)" :disabled="isReplying">
                    {{ isReplying ? "Đang gửi..." : "Gửi phản hồi" }}
                  </button>
                </div>
              </div>

              <button
                v-if="!r.adminReply && replyingId !== r._id"
                class="btn-reply-open"
                @click="openReplyForm(r)"
              >
                + Phản hồi
              </button>
            </td>
            <td>
              <span class="status-badge" :class="r.status">
                {{ r.status === "approved" ? "Đã duyệt" : "Đã ẩn" }}
              </span>
            </td>
            <td class="date-cell">{{ formatDate(r.createdAt) }}</td>
            <td>
              <div class="review-actions">
                <button
                  class="btn-review-toggle"
                  :class="{ hidden: r.status === 'hidden' }"
                  @click="toggleVisibility(r)"
                  :disabled="togglingId === r._id"
                  :title="r.status === 'hidden' ? 'Hiện đánh giá' : 'Ẩn đánh giá'"
                >
                  <svg v-if="r.status !== 'hidden'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
                <button class="btn-review-delete" @click="askDeleteReview(r)" title="Xóa đánh giá">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <p>Sản phẩm này chưa có đánh giá nào phù hợp bộ lọc</p>
      </div>

      <div v-if="reviewPagination.totalPages > 1" class="pagination">
        <button :disabled="reviewPagination.page <= 1" @click="fetchReviews(reviewPagination.page - 1)">‹ Trước</button>
        <span class="page-info">Trang {{ reviewPagination.page }} / {{ reviewPagination.totalPages }}</span>
        <button :disabled="reviewPagination.page >= reviewPagination.totalPages" @click="fetchReviews(reviewPagination.page + 1)">Sau ›</button>
      </div>
    </div>

    <!-- CONFIRM MODAL (xóa đánh giá) -->
    <Transition name="modal">
      <div v-if="deleteReviewTarget" class="modal-overlay" @click.self="deleteReviewTarget = null">
        <div class="modal-box">
          <div class="modal-icon-wrap"></div>
          <h3 class="modal-title">Xóa đánh giá?</h3>
          <p class="modal-desc">
            Đánh giá của <strong>{{ deleteReviewTarget.userInfo?.name || "người dùng này" }}</strong> sẽ bị xóa vĩnh viễn.
          </p>
          <div class="modal-actions">
            <button class="modal-cancel" @click="deleteReviewTarget = null">Hủy</button>
            <button class="modal-confirm" @click="confirmDeleteReview" :disabled="isDeletingReview">
              {{ isDeletingReview ? "Đang xóa..." : "Xác nhận xóa" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import ReviewService from "@/services/review.service";

const props = defineProps({
  productId: { type: String, required: true },
});

const reviews = ref([]);
const reviewStats = ref({});
const reviewsLoading = ref(false);
const deleteReviewTarget = ref(null);
const isDeletingReview = ref(false);
const togglingId = ref(null);

const replyingId = ref(null);
const replyContent = ref("");
const isReplying = ref(false);

const negativeNotifications = ref([]);
const highlightedReviewId = ref(null);

const reviewFilters = reactive({
  status: "",
  rating: "",
});

const reviewPagination = reactive({
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 1,
});

function reviewRatingPercent(n) {
  const total = reviewStats.value.total || 0;
  if (!total) return 0;
  return Math.round(((reviewStats.value.byRating?.[n] || 0) / total) * 100);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

async function fetchReviews(page = 1) {
  reviewsLoading.value = true;
  try {
    const res = await ReviewService.adminGetAll({
      page,
      limit: reviewPagination.limit,
      productId: props.productId,
      status: reviewFilters.status || undefined,
      rating: reviewFilters.rating || undefined,
    });
    reviews.value = res.reviews;
    Object.assign(reviewPagination, res.pagination);
  } catch (err) {
    console.error("Lỗi khi tải danh sách đánh giá:", err);
  } finally {
    reviewsLoading.value = false;
  }
}

async function fetchReviewStats() {
  try {
    const res = await ReviewService.adminGetStats(props.productId);
    reviewStats.value = res.data;
  } catch (err) {
    console.error("Lỗi khi tải thống kê đánh giá:", err);
  }
}

async function fetchNegativeNotifications() {
  try {
    const res = await ReviewService.adminGetNotifications({
      productId: props.productId,
      isRead: "false",
      limit: 20,
    });
    negativeNotifications.value = res.notifications || [];
  } catch (err) {
    console.error("Lỗi khi tải cảnh báo đánh giá tiêu cực:", err);
  }
}

async function goToReview(n) {
  reviewFilters.status = "";
  reviewFilters.rating = "";

  const originalLimit = reviewPagination.limit;
  reviewPagination.limit = 50;
  await fetchReviews(1);
  reviewPagination.limit = originalLimit;

  await nextTick();
  const el = document.getElementById(`review-row-${n.reviewId}`);

  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    highlightedReviewId.value = n.reviewId;
    setTimeout(() => {
      highlightedReviewId.value = null;
    }, 2500);
  } else {
    alert("Không tìm thấy đánh giá này trong 50 đánh giá gần nhất, có thể nó đã bị xóa hoặc ở trang xa hơn.");
  }
}

async function markNotificationRead(n) {
  try {
    await ReviewService.adminMarkNotificationRead(n._id);
    negativeNotifications.value = negativeNotifications.value.filter((x) => x._id !== n._id);
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Cập nhật thất bại");
  }
}

async function markAllNotificationsRead() {
  try {
    await ReviewService.adminMarkAllNotificationsRead();
    negativeNotifications.value = [];
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Cập nhật thất bại");
  }
}

function askDeleteReview(review) {
  deleteReviewTarget.value = review;
}

async function confirmDeleteReview() {
  if (!deleteReviewTarget.value) return;
  isDeletingReview.value = true;
  try {
    await ReviewService.adminDelete(deleteReviewTarget.value._id);
    deleteReviewTarget.value = null;
    await Promise.all([fetchReviews(reviewPagination.page), fetchReviewStats()]);
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Xóa thất bại");
  } finally {
    isDeletingReview.value = false;
  }
}

async function toggleVisibility(review) {
  togglingId.value = review._id;
  try {
    const res = await ReviewService.adminToggleVisibility(review._id);
    review.status = res.data.status;
    await fetchReviewStats();
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Cập nhật thất bại");
  } finally {
    togglingId.value = null;
  }
}

function openReplyForm(review) {
  replyingId.value = review._id;
  replyContent.value = review.adminReply?.content || "";
}

function cancelReply() {
  replyingId.value = null;
  replyContent.value = "";
}

async function submitReply(review) {
  if (!replyContent.value.trim()) return;
  isReplying.value = true;
  try {
    const res = await ReviewService.adminReply(review._id, replyContent.value);
    review.adminReply = res.data.adminReply;
    cancelReply();
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Gửi phản hồi thất bại");
  } finally {
    isReplying.value = false;
  }
}

async function removeReply(review) {
  if (!confirm("Xóa phản hồi này?")) return;
  try {
    await ReviewService.adminDeleteReply(review._id);
    review.adminReply = null;
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Xóa thất bại");
  }
}

onMounted(() => {
  fetchReviews(1);
  fetchReviewStats();
  fetchNegativeNotifications();
});
</script>

<style scoped>
.review-block {
  max-width: 1200px; margin: 24px auto 48px;
  padding: 0 24px;
}
.section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
.section-title { font-size: 1.15rem; font-weight: 800; color: #0f172a; white-space: nowrap; }
.section-line { flex: 1; height: 2px; background: linear-gradient(90deg, #e0e7ff, transparent); }

.negative-alert-box {
  background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 16px;
  padding: 14px 18px; margin-bottom: 18px;
}
.negative-alert-header {
  display: flex; justify-content: space-between; align-items: center;
  font-weight: 700; color: #b91c1c; margin-bottom: 8px;
}
.btn-mark-all, .btn-mark-one {
  background: white; border: 1px solid #fecaca; color: #b91c1c;
  border-radius: 8px; padding: 4px 10px; font-size: .76rem; font-weight: 600; cursor: pointer;
}
.negative-alert-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 0; font-size: .84rem; color: #7f1d1d;
  border-top: 1px dashed #fecaca;
  cursor: pointer;
}
.negative-alert-item:hover {
  background: #fee2e2;
}

.row-highlight {
  animation: rowFlash 2.5s ease;
}
@keyframes rowFlash {
  0%   { background: #fef9c3; }
  70%  { background: #fef9c3; }
  100% { background: transparent; }
}

.review-stats-row {
  display: grid; grid-template-columns: repeat(3, 1fr) 1.6fr;
  gap: 16px; margin-bottom: 20px;
}
.rstat-card {
  background: white; border-radius: 18px; padding: 18px 20px;
  border: 1.5px solid #e8edf8; box-shadow: 0 10px 30px rgba(10,15,30,.08);
  display: flex; flex-direction: column; gap: 6px;
}
.rstat-label { font-size: .78rem; color: #94a3b8; font-weight: 600; }
.rstat-value { font-size: 1.7rem; font-weight: 900; color: #0f172a; }
.rstat-value.ok { color: #10b981; }
.rstat-value.muted { color: #94a3b8; }

.rating-card { gap: 10px; }
.rating-bars { display: flex; flex-direction: column; gap: 5px; }
.rating-bar-row { display: flex; align-items: center; gap: 8px; font-size: .74rem; }
.rating-num { width: 24px; color: #64748b; font-weight: 700; }
.rating-bar-track { flex: 1; height: 6px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.rating-bar-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #fbbf24); border-radius: 999px; }
.rating-count { width: 22px; text-align: right; color: #94a3b8; }

.review-toolbar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.filter-select {
  padding: 11px 14px; border-radius: 12px; border: 1.5px solid #e2e8f0;
  font-size: .85rem; background: white; color: #374151; cursor: pointer;
}

.review-table-card {
  background: white; border-radius: 20px; border: 1.5px solid #e8edf8;
  box-shadow: 0 10px 30px rgba(10,15,30,.07); overflow: hidden;
}
.review-table { width: 100%; border-collapse: collapse; }
.review-table th {
  text-align: left; padding: 14px 18px; font-size: .74rem; font-weight: 700;
  color: #94a3b8; text-transform: uppercase; letter-spacing: .04em;
  border-bottom: 1.5px solid #f1f5f9; background: #f8faff;
}
.review-table td { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; font-size: .86rem; vertical-align: top; }
.review-table tr:last-child td { border-bottom: none; }
.review-table tr:hover td { background: #f8faff; }

.user-cell { display: flex; flex-direction: column; gap: 2px; }
.user-cell b { color: #0f172a; font-size: .86rem; }
.user-email { color: #94a3b8; font-size: .74rem; }

.stars-cell .star { color: #e2e8f0; font-size: .9rem; }
.stars-cell .star.lit { color: #f59e0b; }

.comment-cell { max-width: 360px; }
.review-title { display: block; color: #0f172a; margin-bottom: 3px; }
.comment-cell p { margin: 0; color: #475569; line-height: 1.5; }

.status-badge { padding: 4px 12px; border-radius: 999px; font-size: .74rem; font-weight: 700; }
.status-badge.approved { background: #dcfce7; color: #16a34a; }
.status-badge.hidden { background: #f1f5f9; color: #64748b; }

.date-cell { color: #94a3b8; white-space: nowrap; }

.review-actions { display: flex; gap: 6px; }

.btn-review-toggle {
  width: 34px; height: 34px; border-radius: 10px;
  background: #eff6ff; border: 1px solid #dbeafe; color: #2563eb;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.btn-review-toggle svg { width: 15px; height: 15px; }
.btn-review-toggle:hover:not(:disabled) { background: #2563eb; color: white; }
.btn-review-toggle.hidden { background: #f1f5f9; border-color: #e2e8f0; color: #94a3b8; }
.btn-review-toggle.hidden:hover:not(:disabled) { background: #94a3b8; color: white; }
.btn-review-toggle:disabled { opacity: .5; cursor: not-allowed; }

.btn-review-delete {
  width: 34px; height: 34px; border-radius: 10px;
  background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.btn-review-delete svg { width: 15px; height: 15px; }
.btn-review-delete:hover { background: #dc2626; color: white; }

.admin-reply-box {
  margin-top: 10px; padding: 10px 12px;
  background: #eff6ff; border-left: 3px solid #2563eb;
  border-radius: 8px;
}
.admin-reply-label { font-size: .72rem; font-weight: 700; color: #2563eb; display: block; margin-bottom: 4px; }
.admin-reply-box p { margin: 0; color: #1e3a8a; font-size: .84rem; line-height: 1.5; }
.admin-reply-actions { display: flex; gap: 10px; margin-top: 6px; }
.btn-reply-edit, .btn-reply-remove {
  background: none; border: none; cursor: pointer;
  font-size: .74rem; font-weight: 600; padding: 0;
}
.btn-reply-edit { color: #2563eb; }
.btn-reply-remove { color: #dc2626; }
.btn-reply-edit:hover, .btn-reply-remove:hover { text-decoration: underline; }

.btn-reply-open {
  margin-top: 8px; background: none; border: 1px dashed #cbd5e1;
  color: #64748b; font-size: .76rem; font-weight: 600;
  padding: 5px 12px; border-radius: 8px; cursor: pointer; transition: all .2s;
}
.btn-reply-open:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }

.admin-reply-form {
  margin-top: 10px; padding: 10px;
  background: #f8faff; border: 1.5px solid #e0e7ff; border-radius: 10px;
}
.admin-reply-input {
  width: 100%; box-sizing: border-box; resize: vertical;
  border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;
  font-size: .82rem; font-family: inherit; outline: none;
}
.admin-reply-input:focus { border-color: #2563eb; }
.admin-reply-form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
.btn-reply-cancel {
  padding: 6px 14px; border-radius: 8px; background: #f1f5f9;
  color: #475569; font-weight: 600; font-size: .78rem; border: none; cursor: pointer;
}
.btn-reply-cancel:hover { background: #e2e8f0; }
.btn-reply-save {
  padding: 6px 16px; border-radius: 8px;
  background: linear-gradient(135deg, #2563eb, #4f46e5); color: white;
  font-weight: 700; font-size: .78rem; border: none; cursor: pointer;
}
.btn-reply-save:hover:not(:disabled) { transform: translateY(-1px); }
.btn-reply-save:disabled { opacity: .6; cursor: not-allowed; }

.loading-row, .empty-state {
  padding: 50px; text-align: center; color: #94a3b8;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.spinner-sm-lg {
  width: 30px; height: 30px; border: 3px solid #e2e8f0;
  border-top-color: #2563eb; border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; border-top: 1px solid #f1f5f9; }
.pagination button {
  padding: 8px 16px; border-radius: 10px; border: 1.5px solid #e2e8f0;
  background: white; font-weight: 600; font-size: .82rem; cursor: pointer; transition: all .2s;
}
.pagination button:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; }
.pagination button:disabled { opacity: .4; cursor: not-allowed; }
.page-info { font-size: .82rem; color: #64748b; font-weight: 600; }

.modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(10,15,30,.7);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box {
  background: white; border-radius: 24px;
  padding: 36px 32px; max-width: 400px; width: 100%;
  text-align: center;
  box-shadow: 0 30px 70px rgba(0,0,0,.3);
  animation: modalPop .3s cubic-bezier(.175,.885,.32,1.275);
}
@keyframes modalPop { from { opacity:0; transform:scale(.9); } to { opacity:1; transform:scale(1); } }
.modal-icon-wrap { font-size: 2.8rem; margin-bottom: 14px; }
.modal-title { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
.modal-desc { font-size: .9rem; color: #64748b; line-height: 1.7; margin-bottom: 26px; }
.modal-actions { display: flex; gap: 12px; }
.modal-cancel {
  flex: 1; padding: 12px; border-radius: 12px;
  background: #f1f5f9; color: #475569;
  font-weight: 700; border: none; cursor: pointer; transition: background .2s;
}
.modal-cancel:hover { background: #e2e8f0; }
.modal-confirm {
  flex: 1; padding: 12px; border-radius: 12px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white; font-weight: 700; border: none; cursor: pointer;
  box-shadow: 0 4px 14px rgba(220,38,38,.35);
  transition: all .2s;
}
.modal-confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(220,38,38,.45); }
.modal-confirm:disabled { opacity: .6; cursor: not-allowed; }
.modal-enter-active, .modal-leave-active { transition: opacity .25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .review-stats-row { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  .review-block { padding: 0 14px; }
  .review-stats-row { grid-template-columns: 1fr; }
  .review-table-card { overflow-x: auto; }
  .review-table { min-width: 700px; }
}
</style>