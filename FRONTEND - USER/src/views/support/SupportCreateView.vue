<template>
  <div class="support-create">
    <div class="support-create__header">
      <button class="btn-back" @click="$router.back()">← Quay lại</button>
      <h2>Tạo yêu cầu hỗ trợ</h2>
    </div>

    <form class="support-form" @submit.prevent="handleSubmit">
      <!-- Loại yêu cầu -->
      <div class="form-group">
        <label>Loại yêu cầu <span class="required">*</span></label>
        <div class="radio-group">
          <label class="radio-label">
            <input v-model="form.type" type="radio" value="warranty" />
            Bảo hành
          </label>
          <label class="radio-label">
            <input v-model="form.type" type="radio" value="return" />
            Đổi trả
          </label>
        </div>
      </div>

      <!-- Mã đơn hàng (tuỳ chọn) -->
      <div class="form-group">
        <label>Mã đơn hàng <span class="optional">(tuỳ chọn)</span></label>
        <input
          v-model="form.orderId"
          type="text"
          placeholder="Nhập mã đơn hàng liên quan..."
          class="form-input"
        />
      </div>

      <!-- Lý do -->
      <div class="form-group">
        <label>Lý do <span class="required">*</span></label>
        <textarea
          v-model="form.reason"
          rows="4"
          placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
          class="form-input"
        />
      </div>

      <!-- Ảnh minh chứng -->
      <div class="form-group">
        <label>Ảnh minh chứng <span class="optional">(tuỳ chọn)</span></label>
        <input
          type="file"
          accept="image/*"
          multiple
          class="form-input"
          @change="handleImages"
        />
        <div v-if="previewUrls.length" class="preview-images">
          <img
            v-for="(url, i) in previewUrls"
            :key="i"
            :src="url"
            class="preview-img"
          />
        </div>
      </div>

      <!-- Lỗi -->
      <p v-if="error" class="form-error">{{ error }}</p>

      <!-- Submit -->
      <button type="submit" class="btn btn--primary" :disabled="loading">
        {{ loading ? "Đang gửi..." : "Gửi yêu cầu" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { SupportAPI } from "@/services/support.service";
const router = useRouter();
const userId = JSON.parse(localStorage.getItem("user") || "{}")?._id ?? null;

const loading     = ref(false);
const error       = ref(null);
const previewUrls = ref([]);

const form = reactive({
  type:    "warranty",
  orderId: "",
  reason:  "",
  images:  [], // mảng URL sau khi upload — tuỳ chỉnh upload logic
});

// Xem trước ảnh (chưa upload thật — tuỳ dự án)
function handleImages(e) {
  const files = Array.from(e.target.files);
  previewUrls.value = files.map((f) => URL.createObjectURL(f));
  // TODO: upload lên server/cloud để lấy URL thật rồi gán vào form.images
  // Ví dụ: form.images = await uploadFiles(files);
}

async function handleSubmit() {
  error.value = null;

  if (!form.type)   { error.value = "Vui lòng chọn loại yêu cầu"; return; }
  if (!form.reason.trim()) { error.value = "Vui lòng nhập lý do"; return; }

  loading.value = true;
  try {
    const { data } = await SupportAPI.createRequest(userId, {
      type:    form.type,
      orderId: form.orderId || undefined,
      reason:  form.reason.trim(),
      images:  form.images,
    });
    router.push(`/support/${data.request._id}`);
  } catch (e) {
    error.value = e?.response?.data?.message || "Lỗi gửi yêu cầu, thử lại sau";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.support-create {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.support-create__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.support-create__header h2 {
  font-size: 1.2rem;
  font-weight: 600;
}
.btn-back {
  background: none;
  border: none;
  cursor: pointer;
  color: #2563eb;
  font-size: 0.9rem;
  padding: 0;
}

.support-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}
.required { color: #dc2626; }
.optional  { color: #9ca3af; font-weight: 400; font-size: 0.8rem; }

.form-input {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus { border-color: #2563eb; }

textarea.form-input { resize: vertical; }

.radio-group {
  display: flex;
  gap: 1.5rem;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.preview-images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.preview-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.form-error {
  color: #dc2626;
  font-size: 0.85rem;
  margin: 0;
}

.btn {
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  align-self: flex-start;
}
.btn--primary { background: #2563eb; color: #fff; }
.btn--primary:disabled { background: #93c5fd; cursor: not-allowed; }
</style>