<template>
  <div class="chat-widget" v-if="userId">

    <!-- Nút mở/đóng -->
    <button class="chat-toggle-btn" @click="toggleOpen">
      <svg v-if="!isOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toggle-icon">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="toggle-icon">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      <span v-if="unreadHint && !isOpen" class="unread-dot"></span>
    </button>

    <!-- Panel chat -->
    <Transition name="panel">
      <div v-if="isOpen" class="chat-panel">
        <div class="chat-header">
          <div class="header-info">
            <span class="header-avatar">🛍️</span>
            <div>
              <p class="header-title">Hỗ trợ trực tuyến</p>
              <p class="header-sub">
                <span class="status-dot"></span> Đang hoạt động
              </p>
            </div>
          </div>
        </div>

        <div class="chat-body" ref="chatBox">
          <div v-if="loading && messages.length === 0" class="chat-loading">
            <div class="spinner-sm"></div>
          </div>
          <div v-else-if="messages.length === 0" class="chat-empty">
            Chào bạn! Có câu hỏi gì cứ nhắn cho shop nhé.
          </div>
          <div
            v-for="msg in messages"
            :key="msg._id"
            class="msg-row"
            :class="msg.role === 'user' ? 'row--me' : 'row--admin'"
          >
            <div class="msg-bubble" :class="msg.role === 'user' ? 'bubble--me' : 'bubble--admin'">
              <span v-if="msg.role === 'admin'" class="msg-sender">{{ msg.senderName || "Admin" }}</span>
              <p class="msg-content">{{ msg.content }}</p>
              <time class="msg-time">{{ formatTime(msg.createdAt) }}</time>
            </div>
          </div>
        </div>

        <div class="chat-input-row">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Nhập tin nhắn..."
            class="chat-input-field"
            @keyup.enter="handleSend"
          />
          <button class="send-btn" :disabled="sending || !newMessage.trim()" @click="handleSend">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="send-icon" v-if="!sending">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            <span v-else class="send-dots">...</span>
          </button>
        </div>
        <p v-if="sendError" class="form-error">{{ sendError }}</p>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { ChatAPI } from "@/services/chat.service";

const user      = JSON.parse(localStorage.getItem("user") || "{}");
const userId    = user?._id ?? null;
const userName  = user?.name ?? "Khách";

const isOpen      = ref(false);
const messages    = ref([]);
const loading     = ref(false);
const newMessage  = ref("");
const sending     = ref(false);
const sendError   = ref(null);
const unreadHint  = ref(false);
const chatBox     = ref(null);

let pollTimer = null;

async function fetchMessages(showLoading = false) {
  if (!userId) return;
  if (showLoading) loading.value = true;
  try {
    const { data } = await ChatAPI.getMyMessages(userId);
    const oldCount = messages.value.length;
    messages.value = data.messages;
    if (!isOpen.value && data.messages.length > oldCount) unreadHint.value = true;
    if (isOpen.value) scrollToBottom();
  } catch (e) {
    // im lặng bỏ qua lỗi polling, tránh spam UI
  } finally {
    loading.value = false;
  }
}

async function handleSend() {
  const content = newMessage.value.trim();
  if (!content || !userId) return;
  sending.value   = true;
  sendError.value = null;
  try {
    const { data } = await ChatAPI.sendMessage(userId, userName, content);
    messages.value.push(data.message);
    newMessage.value = "";
    scrollToBottom();
  } catch (e) {
    sendError.value = e?.response?.data?.message || "Gửi tin nhắn thất bại";
  } finally {
    sending.value = false;
  }
}

function toggleOpen() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    unreadHint.value = false;
    fetchMessages(true);
    scrollToBottom();
  }
}

async function scrollToBottom() {
  await nextTick();
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

onMounted(() => {
  if (!userId) return;
  fetchMessages();
  pollTimer = setInterval(() => fetchMessages(false), 5000);
});

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
.chat-widget { position: fixed; bottom: 24px; right: 24px; z-index: 500; font-family: 'Segoe UI', system-ui, sans-serif; }

.chat-toggle-btn {
  width: 58px; height: 58px; border-radius: 50%; border: none; cursor: pointer;
  background: linear-gradient(135deg, #2563eb, #4f46e5); color: white;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(37,99,235,.4); transition: transform .2s, box-shadow .2s;
  position: relative;
}
.chat-toggle-btn:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 12px 30px rgba(37,99,235,.5); }
.toggle-icon { width: 26px; height: 26px; }
.unread-dot { position: absolute; top: 4px; right: 4px; width: 12px; height: 12px; border-radius: 50%; background: #f43f5e; border: 2px solid white; animation: blink 1.6s ease-in-out infinite; }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:.4; } }

.chat-panel {
  position: absolute; bottom: 74px; right: 0; width: 340px; max-width: 88vw;
  background: white; border-radius: 20px; overflow: hidden;
  box-shadow: 0 20px 50px rgba(15,23,42,.2); border: 1.5px solid #e8edf8;
  display: flex; flex-direction: column;
}

.chat-header { background: linear-gradient(135deg, #0a0f1e, #1e1b4b); padding: 16px 18px; }
.header-info { display: flex; align-items: center; gap: 10px; }
.header-avatar { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
.header-title { margin: 0; font-size: .9rem; font-weight: 700; color: white; }
.header-sub { margin: 2px 0 0; font-size: .72rem; color: rgba(255,255,255,.65); display: flex; align-items: center; gap: 5px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px #10b981; }

.chat-body { padding: 14px; height: 320px; overflow-y: auto; background: #f8faff; display: flex; flex-direction: column; gap: 8px; }
.chat-loading { display: flex; align-items: center; justify-content: center; height: 100%; }
.chat-empty { text-align: center; color: #64748b; font-size: .82rem; padding: 30px 10px; line-height: 1.5; }

.msg-row { display: flex; }
.row--me { justify-content: flex-end; }
.row--admin { justify-content: flex-start; }
.msg-bubble { max-width: 78%; padding: 9px 13px; border-radius: 14px; }
.bubble--me { background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; border-bottom-right-radius: 4px; }
.bubble--admin { background: white; border: 1px solid #e8edf8; border-bottom-left-radius: 4px; }
.msg-sender { display: block; font-size: .68rem; font-weight: 700; color: #4f46e5; margin-bottom: 2px; }
.msg-content { margin: 0; font-size: .84rem; line-height: 1.45; }
.msg-time { display: block; font-size: .65rem; margin-top: 3px; opacity: .7; }
.bubble--me .msg-time { color: rgba(255,255,255,.8); text-align: right; }
.bubble--admin .msg-time { color: #94a3b8; }

.chat-input-row { display: flex; gap: 8px; padding: 12px 14px; border-top: 1px solid #f1f5f9; background: white; }
.chat-input-field { flex: 1; padding: 10px 14px; border-radius: 12px; border: 1.5px solid #e0e7ff; font-size: .85rem; background: #f8faff; transition: all .2s; }
.chat-input-field:focus { outline: none; border-color: #2563eb; background: white; box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
.send-btn { width: 40px; height: 40px; flex-shrink: 0; border-radius: 11px; border: none; cursor: pointer; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; display: flex; align-items: center; justify-content: center; transition: transform .2s; }
.send-btn:hover:not(:disabled) { transform: translateY(-2px); }
.send-btn:disabled { background: #cbd5e1; cursor: not-allowed; }
.send-icon { width: 16px; height: 16px; }
.send-dots { font-weight: 900; }
.spinner-sm { width: 26px; height: 26px; border: 3px solid #e0e7ff; border-top-color: #2563eb; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.form-error { color: #e11d48; font-size: .75rem; font-weight: 700; text-align: center; padding: 6px 0; margin: 0; }

.panel-enter-active, .panel-leave-active { transition: opacity .2s, transform .2s; }
.panel-enter-from, .panel-leave-to { opacity: 0; transform: translateY(12px) scale(.97); }

@media (max-width: 480px) {
  .chat-widget { bottom: 16px; right: 16px; }
  .chat-panel { width: calc(100vw - 32px); }
}
</style>