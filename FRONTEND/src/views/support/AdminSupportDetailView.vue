<template>
  <div class="admin-detail">
    <div class="admin-detail__header">
      <button class="btn-back" @click="$router.push('/support')">← Quay lại</button>
      <h2>Chi tiết yêu cầu</h2>
    </div>

    <div v-if="loading" class="state-msg">Đang tải...</div>
    <div v-else-if="error" class="state-msg state-msg--error">{{ error }}</div>

    <template v-else-if="request">
      <div class="layout">
        <!-- CỘT TRÁI -->
        <div class="col-left">
          <div class="info-card">
            <h3 class="card-title">Thông tin yêu cầu</h3>
            <div class="info-row">
              <span class="info-label">Loại</span>
              <span>{{ request.type === "warranty" ? "Bảo hành" : "Đổi trả" }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Trạng thái</span>
              <span :class="['badge', `badge--${request.status}`]">
                {{ statusLabel(request.status) }}
              </span>
            </div>
            <div v-if="request.orderId" class="info-row">
              <span class="info-label">Mã đơn</span>
              <span>{{ request.orderId }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">User ID</span>
              <span class="text-mono">{{ request.userId }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ngày tạo</span>
              <span>{{ formatDate(request.createdAt) }}</span>
            </div>
            <div class="info-row info-row--full">
              <span class="info-label">Lý do</span>
              <p class="info-text">{{ request.reason }}</p>
            </div>
            <div v-if="request.adminNote" class="info-row info-row--full">
              <span class="info-label">Ghi chú hiện tại</span>
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

          <!-- Cập nhật trạng thái -->
          <div class="update-card">
            <h3 class="card-title">Cập nhật trạng thái</h3>
            <div class="form-group">
              <label class="form-label">Trạng thái mới</label>
              <select v-model="form.status" class="form-select">
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="done">Hoàn thành</option>
                <option value="rejected">Từ chối</option>
                <option v-if="request.type === 'return'" value="refunded">Đã hoàn tiền</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">
                Ghi chú cho khách <span class="optional">(tuỳ chọn)</span>
              </label>
              <textarea
                v-model="form.adminNote"
                rows="3"
                placeholder="Nhập ghi chú gửi cho khách hàng..."
                class="form-textarea"
              />
            </div>
            <p v-if="updateError" class="form-error">{{ updateError }}</p>
            <p v-if="updateSuccess" class="form-success">Cập nhật thành công!</p>
            <button class="btn btn--primary" :disabled="updating" @click="handleUpdate">
              {{ updating ? "Đang lưu..." : "Lưu thay đổi" }}
            </button>
          </div>
        </div>

        <!-- CỘT PHẢI: Tin nhắn -->
        <div class="col-right">
          <div class="messages-card">
            <h3 class="card-title">Tin nhắn trao đổi</h3>

            <div class="messages-list" ref="chatBox">
              <div v-if="messages.length === 0" class="messages-empty">
                Chưa có tin nhắn nào.
              </div>
              <div
                v-for="msg in messages"
                :key="msg._id"
                :class="['msg-bubble', msg.role === 'admin' ? 'bubble--admin' : 'bubble--user']"
              >
                <span class="msg-role">{{ msg.senderName || (msg.role === "admin" ? "Admin" : "Khách") }}</span>
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
        </div>
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
import { AdminSupportAPI } from "@/services/support.service";

const route = useRoute();
const id    = route.params.id;
const userRaw = JSON.parse(localStorage.getItem("user") || "{}");
const adminName = JSON.parse(localStorage.getItem("admin") || "{}")?.name ?? "Admin";

const request       = ref(null);
const messages      = ref([]);
const loading       = ref(false);
const error         = ref(null);
const updating      = ref(false);
const updateError   = ref(null);
const updateSuccess = ref(false);
const lightboxUrl   = ref(null);
const newMessage    = ref("");
const sending       = ref(false);
const sendError     = ref(null);
const chatBox       = ref(null);

const form = ref({ status: "pending", adminNote: "" });

async function fetchDetail() {
  loading.value = true;
  error.value   = null;
  try {
    // Lấy request từ danh sách
    const listRes = await AdminSupportAPI.getAllRequests({ limit: 100 });
    const found   = listRes.data.items.find((r) => r._id === id);
    if (!found) throw new Error("Không tìm thấy yêu cầu");
    request.value        = found;
    form.value.status    = found.status;
    form.value.adminNote = found.adminNote || "";

    // Lấy tin nhắn
    const msgRes   = await AdminSupportAPI.getMessages(id);
    messages.value = msgRes.data.messages;
    scrollToBottom();
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || "Lỗi tải dữ liệu";
  } finally {
    loading.value = false;
  }
}

async function handleUpdate() {
  updating.value      = true;
  updateError.value   = null;
  updateSuccess.value = false;
  try {
    const { data } = await AdminSupportAPI.updateStatus(id, {
      status:    form.value.status,
      adminNote: form.value.adminNote || undefined,
    });
    request.value       = data.request;
    updateSuccess.value = true;
    setTimeout(() => (updateSuccess.value = false), 3000);
  } catch (e) {
    updateError.value = e?.response?.data?.message || "Lỗi cập nhật";
  } finally {
    updating.value = false;
  }
}

async function handleSend() {
  const content = newMessage.value.trim();
  if (!content) return;
  sending.value  = true;
  sendError.value = null;
  try {
    const { data } = await AdminSupportAPI.adminSendMessage(id, adminName, content);
    messages.value.push(data.message);
    newMessage.value = "";
    scrollToBottom();
  } catch (e) {
    console.log("Error response:", e?.response?.data);
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
.admin-detail {
  padding: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.admin-detail__header { display: flex; align-items: center; gap: 1rem; }
.admin-detail__header h2 { font-size: 1.2rem; font-weight: 700; }
.btn-back { background: none; border: none; cursor: pointer; color: #2563eb; font-size: 0.9rem; padding: 0; }

.state-msg { text-align: center; color: #6b7280; padding: 2rem 0; }
.state-msg--error { color: #dc2626; }

.layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: start; }
@media (max-width: 768px) { .layout { grid-template-columns: 1fr; } }

.info-card, .update-card, .messages-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.col-left { display: flex; flex-direction: column; gap: 1.25rem; }
.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.info-row { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.875rem; }
.info-row--full { flex-direction: column; gap: 0.25rem; }
.info-label { color: #6b7280; min-width: 80px; font-size: 0.8rem; }
.info-text { margin: 0; color: #374151; line-height: 1.5; }
.info-admin-note {
  margin: 0;
  background: #fef9c3;
  border-left: 3px solid #facc15;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
}
.text-mono { font-family: monospace; font-size: 0.8rem; color: #6b7280; word-break: break-all; }
.info-images { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.info-img { width: 72px; height: 72px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; cursor: zoom-in; }

.badge { display: inline-block; font-size: 0.75rem; padding: 2px 10px; border-radius: 999px; font-weight: 500; }
.badge--pending    { background: #fef3c7; color: #92400e; }
.badge--processing { background: #dbeafe; color: #1e40af; }
.badge--done       { background: #d1fae5; color: #065f46; }
.badge--rejected   { background: #fee2e2; color: #991b1b; }
.badge--refunded   { background: #ede9fe; color: #5b21b6; }

.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-label { font-size: 0.85rem; font-weight: 500; color: #374151; }
.optional { color: #9ca3af; font-weight: 400; font-size: 0.78rem; }
.form-select, .form-textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.form-select:focus, .form-textarea:focus { border-color: #2563eb; }
.form-textarea { resize: vertical; }
.form-error   { color: #dc2626; font-size: 0.85rem; margin: 0; }
.form-success { color: #059669; font-size: 0.85rem; margin: 0; }

.btn { padding: 0.55rem 1.1rem; border-radius: 8px; border: none; font-size: 0.875rem; font-weight: 500; cursor: pointer; align-self: flex-start; }
.btn--primary { background: #2563eb; color: #fff; }
.btn--primary:hover { background: #1d4ed8; }
.btn--primary:disabled { background: #93c5fd; cursor: not-allowed; }

.messages-card { min-height: 300px; }
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}
.messages-empty { text-align: center; color: #9ca3af; font-size: 0.85rem; padding: 1.5rem 0; }

.msg-bubble { display: flex; flex-direction: column; gap: 0.2rem; padding: 0.6rem 0.85rem; border-radius: 10px; max-width: 85%; }
.bubble--admin { background: #eff6ff; border-left: 3px solid #2563eb; align-self: flex-end; }
.bubble--user  { background: #f9fafb; border-left: 3px solid #d1d5db; align-self: flex-start; }
.msg-role    { font-size: 0.72rem; font-weight: 600; color: #6b7280; }
.msg-content { margin: 0; font-size: 0.875rem; color: #111827; line-height: 1.45; }
.msg-time    { font-size: 0.7rem; color: #9ca3af; }

.chat-input { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
.chat-input__field {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
}
.chat-input__field:focus { border-color: #2563eb; }

.lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 9999; cursor: zoom-out; }
.lightbox__img { max-width: 90vw; max-height: 90vh; border-radius: 8px; }
</style>