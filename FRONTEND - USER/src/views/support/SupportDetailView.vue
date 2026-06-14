<template>
  <div class="support-detail">
    <div class="support-detail__header">
      <button class="btn-back" @click="$router.push('/support')">← Quay lại</button>
      <h2>Chi tiết yêu cầu</h2>
    </div>

    <div v-if="loading" class="state-msg">Đang tải...</div>
    <div v-else-if="error" class="state-msg state-msg--error">{{ error }}</div>

    <template v-else-if="request">
      <!-- Thông tin yêu cầu -->
      <div class="info-card">
        <div class="info-card__row">
          <span class="info-label">Loại</span>
          <span>{{ request.type === "warranty" ? "Bảo hành" : "Đổi trả" }}</span>
        </div>
        <div class="info-card__row">
          <span class="info-label">Trạng thái</span>
          <span :class="['badge', `badge--${request.status}`]">
            {{ statusLabel(request.status) }}
          </span>
        </div>
        <div v-if="request.orderId" class="info-card__row">
          <span class="info-label">Mã đơn</span>
          <span>{{ request.orderId }}</span>
        </div>
        <div class="info-card__row">
          <span class="info-label">Ngày tạo</span>
          <span>{{ formatDate(request.createdAt) }}</span>
        </div>
        <div class="info-card__row info-card__row--full">
          <span class="info-label">Lý do</span>
          <p class="info-reason">{{ request.reason }}</p>
        </div>
        <div v-if="request.adminNote" class="info-card__row info-card__row--full">
          <span class="info-label">Ghi chú từ admin</span>
          <p class="info-admin-note">{{ request.adminNote }}</p>
        </div>
        <div v-if="request.images?.length" class="info-images">
          <img
            v-for="(url, i) in request.images"
            :key="i"
            :src="url"
            class="info-img"
            @click="lightboxUrl = url"
          />
        </div>
      </div>

      <!-- Tin nhắn -->
      <div class="chat-card">
        <h3 class="chat-title">Tin nhắn trao đổi</h3>

        <div class="chat-messages" ref="chatBox">
          <div v-if="messages.length === 0" class="chat-empty">
            Chưa có tin nhắn nào.
          </div>
          <div
            v-for="msg in messages"
            :key="msg._id"
            :class="['msg-bubble', msg.role === 'user' ? 'bubble--user' : 'bubble--admin']"
          >
            <span class="msg-role">{{ msg.senderName || (msg.role === 'user' ? 'Khách' : 'Admin') }}</span>
            <p class="msg-content">{{ msg.content }}</p>
            <time class="msg-time">{{ formatDate(msg.createdAt) }}</time>
          </div>
        </div>

        <div class="chat-input">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Nhập tin nhắn..."
            class="chat-input__field"
            @keyup.enter="handleSend"
          />
          <button
            class="btn btn--primary"
            :disabled="sending || !newMessage.trim()"
            @click="handleSend"
          >
            {{ sending ? "..." : "Gửi" }}
          </button>
        </div>
        <p v-if="sendError" class="form-error">{{ sendError }}</p>
      </div>
    </template>

    <div v-if="lightboxUrl" class="lightbox" @click="lightboxUrl = null">
      <img :src="lightboxUrl" class="lightbox__img" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { SupportAPI } from "@/services/support.service";

const route     = useRoute();
const requestId = route.params.id;
const userId    = JSON.parse(localStorage.getItem("user") || "{}")?._id ?? null;
const userName  = JSON.parse(localStorage.getItem("user") || "{}")?.name ?? "Khách";

const request    = ref(null);
const messages   = ref([]);
const loading    = ref(false);
const error      = ref(null);
const lightboxUrl = ref(null);

const newMessage = ref("");
const sending    = ref(false);
const sendError  = ref(null);
const chatBox    = ref(null);

async function fetchDetail() {
  loading.value = true;
  error.value   = null;
  try {
    const { data } = await SupportAPI.getRequestDetail(requestId, userId);
    request.value  = data.request;
    messages.value = data.messages;
    scrollToBottom();
  } catch (e) {
    error.value = e?.response?.data?.message || "Không tải được chi tiết yêu cầu";
  } finally {
    loading.value = false;
  }
}

async function handleSend() {
  const content = newMessage.value.trim();
  if (!content) return;

  sending.value  = true;
  sendError.value = null;
  try {
    const { data } = await SupportAPI.sendMessage(requestId, userId, userName, content);
    messages.value.push(data.message);
    newMessage.value = "";
    scrollToBottom();
  } catch (e) {
    sendError.value = e?.response?.data?.message || "Gửi tin nhắn thất bại";
  } finally {
    sending.value = false;
  }
}

async function scrollToBottom() {
  await nextTick();
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;
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

onMounted(fetchDetail);
</script>

<style scoped>
.support-detail {
  max-width: 680px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.support-detail__header {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.support-detail__header h2 { font-size: 1.2rem; font-weight: 600; }
.btn-back {
  background: none;
  border: none;
  cursor: pointer;
  color: #2563eb;
  font-size: 0.9rem;
  padding: 0;
}

.state-msg { text-align: center; color: #6b7280; padding: 2rem 0; }
.state-msg--error { color: #dc2626; }

/* Info card */
.info-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.info-card__row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
}
.info-card__row--full { flex-direction: column; gap: 0.25rem; }
.info-label { color: #6b7280; min-width: 80px; }
.info-reason { margin: 0; color: #374151; line-height: 1.5; }
.info-admin-note {
  margin: 0;
  background: #fef9c3;
  border-left: 3px solid #facc15;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
}
.info-images { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem; }
.info-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  cursor: zoom-in;
}

/* Badge */
.badge {
  display: inline-block;
  font-size: 0.78rem;
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 500;
}
.badge--pending    { background: #fef3c7; color: #92400e; }
.badge--processing { background: #dbeafe; color: #1e40af; }
.badge--done       { background: #d1fae5; color: #065f46; }
.badge--rejected   { background: #fee2e2; color: #991b1b; }
.badge--refunded   { background: #ede9fe; color: #5b21b6; }

/* Chat */
.chat-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.chat-title { font-size: 0.95rem; font-weight: 600; margin: 0; }

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 0.25rem;
}
.chat-empty { text-align: center; color: #9ca3af; font-size: 0.85rem; padding: 1rem 0; }

.msg-bubble {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-width: 80%;
  padding: 0.55rem 0.85rem;
  border-radius: 10px;
}
.bubble--user {
  background: #eff6ff;
  border-left: 3px solid #2563eb;
  align-self: flex-end;
}
.bubble--admin {
  background: #f9fafb;
  border-left: 3px solid #d1d5db;
  align-self: flex-start;
}
.msg-content { margin: 0; font-size: 0.875rem; color: #111827; line-height: 1.45; }
.msg-time { font-size: 0.7rem; color: #9ca3af; }

.chat-input {
  display: flex;
  gap: 0.5rem;
}
.chat-input__field {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
}
.chat-input__field:focus { border-color: #2563eb; }

.btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}
.btn--primary { background: #2563eb; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #1d4ed8; }
.btn--primary:disabled { background: #93c5fd; cursor: not-allowed; }

.form-error { color: #dc2626; font-size: 0.82rem; margin: 0; }

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: zoom-out;
}
.lightbox__img { max-width: 90vw; max-height: 90vh; border-radius: 8px; }
</style>