<template>
  <div class="chat-detail-page">

    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>

      <div class="hero-content">
        <button class="back-btn" @click="$router.push({ name: 'chat.list' })">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="back-icon">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Quay lại
        </button>

        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Nhắn tin với khách
        </div>
        <h1 class="hero-title">{{ userName }}</h1>
        <p v-if="userEmail" class="hero-email">{{ userEmail }}</p>
      </div>
    </div>

    <div class="main-panel">
      <div class="chat-card">

        <div v-if="loading" class="state-box">
          <div class="spinner"></div>
          <p>Đang tải...</p>
        </div>
        <div v-else-if="error" class="state-box state-box--error">
          <div class="state-icon">⚠</div>
          <p>{{ error }}</p>
        </div>

        <template v-else>
          <div class="chat-messages" ref="chatBox">
            <div v-if="messages.length === 0" class="chat-empty">Chưa có tin nhắn nào.</div>
            <div
              v-for="msg in messages"
              :key="msg._id"
              class="msg-bubble"
              :class="msg.role === 'admin' ? 'bubble--admin' : 'bubble--user'"
            >
              <span class="msg-role" v-if="msg.role === 'admin'">{{ msg.senderName || 'Admin' }}</span>
              <p class="msg-content">{{ msg.content }}</p>
              <time class="msg-time">{{ formatDate(msg.createdAt) }}</time>
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
        </template>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute } from "vue-router";
import { io } from "socket.io-client";
import { AdminChatAPI } from "@/services/chat.service";

const route  = useRoute();
const userId = route.params.userId;

const admin     = JSON.parse(localStorage.getItem("admin") || "{}");
const adminId   = admin?._id ?? null;
const adminName = admin?.name ?? "Admin";

const messages   = ref([]);
const userName   = ref("Khách");
const userEmail  = ref("");
const loading    = ref(false);
const error      = ref(null);
const newMessage = ref("");
const sending    = ref(false);
const sendError  = ref(null);
const chatBox    = ref(null);

const socket = io("http://localhost:3000");

async function fetchMessages(showLoading = false) {
  if (showLoading) loading.value = true;
  error.value = null;
  try {
    const { data } = await AdminChatAPI.getMessagesByUser(userId);
    messages.value = data.messages;
    if (data.user) {
      userName.value  = data.user.name  || "Khách";
      userEmail.value = data.user.email || "";
    }
    scrollToBottom();
  } catch (e) {
    if (showLoading) error.value = e?.response?.data?.message || "Lỗi tải tin nhắn";
  } finally {
    loading.value = false;
  }
}

async function handleSend() {
  const content = newMessage.value.trim();
  if (!content) return;
  if (!adminId) { sendError.value = "Không xác định được tài khoản admin"; return; }
  sending.value   = true;
  sendError.value = null;
  try {
    await AdminChatAPI.sendMessage(userId, adminId, adminName, content);
    newMessage.value = "";
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

function formatDate(iso) { return new Date(iso).toLocaleString("vi-VN"); }

function handleNewMessage(message) {
  if (messages.value.some((m) => m._id === message._id)) return;
  messages.value.push(message);
  scrollToBottom();
}

onMounted(() => {
  fetchMessages(true);
  socket.emit("chat:join-user", userId);
  socket.on("chat:new-message", handleNewMessage);
});

onBeforeUnmount(() => {
  socket.off("chat:new-message", handleNewMessage);
  socket.disconnect();
});
</script>

<style scoped>
.chat-detail-page { min-height: 100vh; background: #f0f4ff; font-family: 'Segoe UI', system-ui, sans-serif; }

.hero { position: relative; overflow: hidden; background: #0a0f1e; padding: 60px 32px 80px; text-align: center; }
.hero-mesh { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 20% 0%, rgba(37,99,235,.35), transparent), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3), transparent); }
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25); top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.2); bottom: -60px; right: -40px; }
.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }

.back-btn { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); border-radius: 999px; padding: 7px 16px 7px 12px; color: rgba(255,255,255,.75); font-size: .82rem; font-weight: 600; cursor: pointer; margin-bottom: 26px; transition: all .2s; }
.back-btn:hover { background: rgba(255,255,255,.14); color: white; }
.back-icon { width: 15px; height: 15px; }
.hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); border-radius: 999px; padding: 6px 18px; font-size: .75rem; font-weight: 700; color: rgba(255,255,255,.8); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 22px; backdrop-filter: blur(8px); }
.eyebrow-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: blink 1.8s ease-in-out infinite; }
@keyframes blink { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(1.5); } }
.hero-title { font-size: clamp(1.8rem, 5vw, 2.6rem); font-weight: 900; color: white; letter-spacing: -.02em; text-shadow: 0 2px 30px rgba(0,0,0,.4); }
.hero-email { margin: 8px 0 0; font-size: .85rem; color: rgba(255,255,255,.65); font-weight: 500; }

.main-panel { max-width: 680px; margin: -32px auto 0; padding: 0 24px 60px; position: relative; z-index: 10; }

.chat-card { background: white; border-radius: 22px; padding: 24px 26px; border: 1.5px solid #e8edf8; box-shadow: 0 4px 24px rgba(37,99,235,.06); }

.state-box { padding: 60px 20px; text-align: center; color: #94a3b8; font-size: .95rem; }
.state-icon { font-size: 2.6rem; margin-bottom: 12px; display: block; }
.state-box--error p { color: #e11d48; font-weight: 600; }
.spinner { width: 34px; height: 34px; margin: 0 auto 16px; border: 3px solid #e0e7ff; border-top-color: #2563eb; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.chat-messages { display: flex; flex-direction: column; gap: 10px; max-height: 460px; overflow-y: auto; padding-right: 4px; margin-bottom: 16px; }
.chat-empty { text-align: center; color: #94a3b8; font-size: .85rem; padding: 24px 0; }
.msg-bubble { display: flex; flex-direction: column; gap: 3px; max-width: 78%; padding: 10px 14px; border-radius: 14px; }
.bubble--admin { background: #eff6ff; border: 1px solid #dbeafe; align-self: flex-end; border-bottom-right-radius: 4px; }
.bubble--user  { background: #f8faff; border: 1px solid #f1f5f9; align-self: flex-start; border-bottom-left-radius: 4px; }
.msg-role { font-size: .7rem; font-weight: 700; color: #4f46e5; text-transform: uppercase; }
.msg-content { margin: 0; font-size: .88rem; color: #0f172a; line-height: 1.5; }
.msg-time { font-size: .68rem; color: #94a3b8; }
.chat-input-row { display: flex; gap: 10px; }
.chat-input-field { flex: 1; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #e0e7ff; font-size: .9rem; color: #0f172a; background: #f8faff; transition: all .2s; }
.chat-input-field:focus { outline: none; border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,.12); }
.send-btn { width: 46px; height: 46px; flex-shrink: 0; border-radius: 12px; border: none; cursor: pointer; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(37,99,235,.3); transition: transform .2s, box-shadow .2s; }
.send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,99,235,.4); }
.send-btn:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; }
.send-icon { width: 18px; height: 18px; }
.send-dots { font-weight: 900; }
.form-error { color: #e11d48; font-size: .82rem; font-weight: 700; margin: 10px 0 0; text-align: center; }

@media (max-width: 640px) {
  .hero { padding: 40px 20px 60px; }
  .main-panel { margin-top: -24px; padding: 0 14px 40px; }
  .chat-card { padding: 20px 18px; }
  .msg-bubble { max-width: 90%; }
}
</style>