<template>
  <div class="review-wrap">

    <!-- ================= RATING SUMMARY ================= -->
    <div class="summary-box">
      <div class="avg-score">
        <span class="avg-number">{{ summary.avg || 0 }}</span>
        <div class="stars">
          <span
            v-for="s in 5"
            :key="s"
            :class="s <= Math.round(summary.avg) ? 'star on' : 'star'"
          >★</span>
        </div>
        <p class="total-text">{{ summary.total }} đánh giá</p>
      </div>

      <div class="bar-list">
        <div v-for="star in [5,4,3,2,1]" :key="star" class="bar-row">
          <span class="bar-label">{{ star }} ★</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{
                width: summary.total
                  ? (summary[star] / summary.total * 100) + '%'
                  : '0%'
              }"
            ></div>
          </div>
          <span class="bar-count">{{ summary[star] || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- ================= FORM ĐÁNH GIÁ ================= -->
    <div class="form-box">
      <h3 class="form-title">Viết đánh giá của bạn</h3>

      <!-- Chọn sao -->
      <div class="star-pick">
        <span
          v-for="s in 5"
          :key="s"
          class="star-pick-item"
          :class="{ on: s <= hoverStar || s <= form.rating }"
          @mouseover="hoverStar = s"
          @mouseleave="hoverStar = 0"
          @click="form.rating = s"
        >★</span>
      </div>

      <input
        v-model="form.title"
        class="inp"
        placeholder="Tiêu đề (tuỳ chọn)"
      />

      <textarea
        v-model="form.comment"
        class="inp textarea"
        placeholder="Chia sẻ trải nghiệm của bạn..."
        rows="4"
      ></textarea>

      <p v-if="formError" class="msg-err">{{ formError }}</p>
      <p v-if="formSuccess" class="msg-ok">{{ formSuccess }}</p>

      <button
        class="btn-submit"
        :disabled="submitting"
        @click="submitReview"
      >
        {{ submitting ? "Đang gửi..." : "Gửi đánh giá" }}
      </button>
    </div>

    <!-- ================= DANH SÁCH REVIEW ================= -->
    <div class="review-list">
      <p v-if="reviews.length === 0" class="empty">
        Chưa có đánh giá nào. Hãy là người đầu tiên! 🌟
      </p>

      <div
        v-for="review in reviews"
        :key="review._id"
        class="review-card"
      >
        <!-- Header -->
        <div class="review-header">
          <div class="avatar">
            {{ review.userInfo?.name?.charAt(0)?.toUpperCase() || "U" }}
          </div>
          <div class="review-meta">
            <p class="reviewer-name">{{ review.userInfo?.name || "Người dùng" }}</p>
            <p class="review-date">{{ formatDate(review.createdAt) }}</p>
          </div>
          <div class="review-stars">
            <span
              v-for="s in 5"
              :key="s"
              :class="s <= review.rating ? 'star on' : 'star'"
            >★</span>
          </div>
        </div>

        <!-- Nội dung -->
        <p v-if="review.title" class="review-title">{{ review.title }}</p>
        <p class="review-comment">{{ review.comment }}</p>

        <!-- Actions -->
        <div class="review-actions">
          <button
            class="btn-helpful"
            :class="{ voted: review.votedByMe }"
            @click="toggleHelpful(review)"
          >
            👍 Hữu ích ({{ review.helpfulVotes?.length || 0 }})
          </button>

          <button
            v-if="review.userId?.toString() === currentUserId"
            class="btn-delete"
            @click="deleteReview(review)"
          >
            🗑 Xóa
          </button>
        </div>
      </div>

      <!-- Phân trang -->
      <div v-if="pagination.totalPages > 1" class="pagination">
        <button
          v-for="p in pagination.totalPages"
          :key="p"
          class="page-btn"
          :class="{ active: p === pagination.page }"
          @click="loadReviews(p)"
        >
          {{ p }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ReviewService from "@/services/review.service";

const props = defineProps({
  productId: { type: String, required: true },
  currentUserId: { type: String, default: "" },
});

const reviews = ref([]);
const summary = ref({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, avg: 0, total: 0 });
const pagination = ref({ page: 1, totalPages: 1 });
const hoverStar = ref(0);
const submitting = ref(false);
const formError = ref("");
const formSuccess = ref("");
const form = ref({ rating: 0, title: "", comment: "" });

onMounted(async () => {
  await Promise.all([loadReviews(1), loadSummary()]);
});

async function loadReviews(page = 1) {
  try {
    const res = await ReviewService.getByProduct(props.productId, {
      page,
      limit: 5,
    });
    reviews.value = res.reviews;
    pagination.value = res.pagination;
  } catch {
    reviews.value = [];
  }
}

async function loadSummary() {
  try {
    const res = await ReviewService.getRatingSummary(props.productId);
    summary.value = res.data;
  } catch {
    //
  }
}

async function submitReview() {
  formError.value = "";
  formSuccess.value = "";

  if (!form.value.rating) {
    formError.value = "Vui lòng chọn số sao";
    return;
  }
  if (!form.value.comment.trim()) {
    formError.value = "Vui lòng nhập nội dung đánh giá";
    return;
  }
  if (!props.currentUserId) {
    formError.value = "Bạn cần đăng nhập để đánh giá";
    return;
  }

  submitting.value = true;
  try {
    await ReviewService.create(props.productId, {
      userId: props.currentUserId,
      ...form.value,
    });
    formSuccess.value = "Đánh giá của bạn đã được ghi nhận! 🎉";
    form.value = { rating: 0, title: "", comment: "" };
    await Promise.all([loadReviews(1), loadSummary()]);
  } catch (err) {
    formError.value = err.response?.data?.message || "Gửi thất bại, thử lại sau";
  } finally {
    submitting.value = false;
  }
}

async function toggleHelpful(review) {
  if (!props.currentUserId) return;
  try {
    const res = await ReviewService.toggleHelpful(
      props.productId,
      review._id,
      props.currentUserId
    );
    review.helpfulVotes = { length: res.data.helpful };
    review.votedByMe = res.data.voted;
  } catch {
    //
  }
}

async function deleteReview(review) {
  if (!confirm("Bạn có chắc muốn xóa đánh giá này không?")) return;
  try {
    await ReviewService.delete(props.productId, review._id, props.currentUserId);
    await Promise.all([loadReviews(1), loadSummary()]);
  } catch {
    alert("Xóa thất bại!");
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
</script>

<style scoped>
.review-wrap { padding: 10px 0; }

/* Summary */
.summary-box {
  display: flex;
  gap: 40px;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}
.avg-score { text-align: center; min-width: 100px; }
.avg-number { font-size: 52px; font-weight: 800; color: #2563eb; line-height: 1; }
.total-text { font-size: 13px; color: #6b7280; margin-top: 4px; }
.bar-list { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.bar-row { display: flex; align-items: center; gap: 10px; }
.bar-label { font-size: 13px; color: #374151; width: 30px; }
.bar-track {
  flex: 1; height: 8px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  border-radius: 99px;
  transition: width 0.6s ease;
}
.bar-count { font-size: 13px; color: #6b7280; width: 20px; text-align: right; }

/* Stars */
.star { color: #e5e7eb; font-size: 20px; }
.star.on { color: #facc15; }

/* Form */
.form-box {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}
.form-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
.star-pick { display: flex; gap: 6px; margin-bottom: 16px; }
.star-pick-item {
  font-size: 36px;
  color: #e5e7eb;
  cursor: pointer;
  transition: transform 0.2s;
}
.star-pick-item:hover, .star-pick-item.on { color: #facc15; transform: scale(1.2); }
.inp {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  margin-bottom: 12px;
  outline: none;
  transition: border 0.2s;
  box-sizing: border-box;
}
.inp:focus { border-color: #2563eb; }
.textarea { resize: none; }
.msg-err { color: #ef4444; font-size: 13px; margin-bottom: 10px; }
.msg-ok { color: #16a34a; font-size: 13px; margin-bottom: 10px; }
.btn-submit {
  padding: 12px 32px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* Review list */
.review-list { display: flex; flex-direction: column; gap: 16px; }
.empty { text-align: center; color: #9ca3af; font-style: italic; padding: 40px 0; }
.review-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: box-shadow 0.2s;
}
.review-card:hover { box-shadow: 0 4px 20px rgba(37,99,235,0.1); }
.review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 16px;
  flex-shrink: 0;
}
.review-meta { flex: 1; }
.reviewer-name { font-weight: 700; font-size: 14px; }
.review-date { font-size: 12px; color: #9ca3af; }
.review-stars { display: flex; gap: 2px; }
.review-title { font-weight: 600; margin-bottom: 6px; }
.review-comment { color: #374151; font-size: 14px; line-height: 1.6; margin-bottom: 12px; }
.review-actions { display: flex; gap: 10px; }
.btn-helpful {
  font-size: 13px;
  padding: 6px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-helpful:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
.btn-helpful.voted { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
.btn-delete {
  font-size: 13px;
  padding: 6px 14px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: white;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-delete:hover { background: #fef2f2; }

/* Pagination */
.pagination { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
.page-btn {
  width: 36px; height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.page-btn:hover { border-color: #2563eb; color: #2563eb; }
.page-btn.active {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  border-color: transparent;
}

@media (max-width: 600px) {
  .summary-box { flex-direction: column; }
}
</style>