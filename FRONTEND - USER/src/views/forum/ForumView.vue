<template>
  <div class="forum-page">

    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Cộng đồng
        </div>
        <h1 class="hero-title">Diễn đàn<br/><em>hỏi đáp</em></h1>
      </div>
    </div>

    <div class="main-panel">
      <div class="forum-card">

        <div class="forum-messages" ref="chatBox">
          <div v-if="loading" class="state-box">
            <div class="spinner"></div>
            <p>Đang tải...</p>
          </div>
          <div v-else-if="messages.length === 0" class="state-box">
            <p>Chưa có ai đăng gì cả. Hỏi gì đó đi bạn ơi 👋</p>
          </div>

          <div
            v-else
            v-for="msg in messages"
            :key="msg._id"
            class="msg-row"
            :class="{ 'row--me': msg.userId === userId }"
          >
            <div class="msg-avatar">{{ initials(msg.userName) }}</div>
            <div class="msg-bubble" :class="{ 'bubble--me': msg.userId === userId }">
              <span class="msg-name">{{ msg.userName }}</span>
              <p class="msg-content">{{ msg.content }}</p>
              <time class="msg-time">{{ formatTime(msg.createdAt) }}</time>
            </div>
          </div>
        </div>

        <div class="forum-input-row">
          <input
            v-model="newMessage"
            type="text"
            maxlength="1000"
            placeholder="Đặt câu hỏi hoặc chia sẻ gì đó..."
            class="forum-input-field"
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { ForumAPI } from "@/services/forum.service";

const user     = JSON.parse(localStorage.getItem("user") || "{}");
const userId   = user?._id ?? null;
const userName = user?.name ?? "Ẩn danh";

const messages   = ref([]);
const loading    = ref(false);
const newMessage = ref("");
const sending    = ref(false);
const sendError  = ref(null);
const chatBox    = ref(null);

let lastFetchTime = null;
let pollTimer = null;

async function fetchInitial() {
  loading.value = true;
  try {
    const { data } = await ForumAPI.getMessages();
    messages.value = data.messages;
    lastFetchTime = new Date().toISOString();
    scrollToBottom();
  } catch (e) {
    // im lặng, giữ trạng thái cũ
  } finally {
    loading.value = false;
  }
}

async function fetchNewMessages() {
  if (!lastFetchTime) return;
  try {
    const { data } = await ForumAPI.getMessagesSince(lastFetchTime);
    if (data.messages.length > 0) {
      messages.value.push(...data.messages);
      lastFetchTime = new Date().toISOString();
      scrollToBottom();
    }
  } catch (e) {
    // bỏ qua lỗi polling
  }
}

async function handleSend() {
  const content = newMessage.value.trim();
  if (!content || !userId) return;
  sending.value   = true;
  sendError.value = null;
  try {
    const { data } = await ForumAPI.createMessage(userId, userName, content);
    messages.value.push(data.message);
    newMessage.value = "";
    lastFetchTime = new Date().toISOString();
    scrollToBottom();
  } catch (e) {
    sendError.value = e?.response?.data?.message || "Đăng tin nhắn thất bại";
  } finally {
    sending.value = false;
  }
}

async function scrollToBottom() {
  await nextTick();
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;
}

function initials(name) {
  if (!name) return "?";
  return name.trim().split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

onMounted(() => {
  fetchInitial();
  pollTimer = setInterval(fetchNewMessages, 5000);
});
onBeforeUnmount(() => { if (pollTimer) clearInterval(pollTimer); });
</script>

<style scoped>
.forum-page { min-height: 100vh; background: #f0f4ff; font-family: 'Segoe UI', system-ui, sans-serif; }

.hero { position: relative; overflow: hidden; background: #0a0f1e; padding: 50px 32px 70px; text-align: center; }
.hero-mesh { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 20% 0%, rgba(37,99,235,.35), transparent), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3), transparent); }
.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }
.hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); border-radius: 999px; padding: 6px 18px; font-size: .75rem; font-weight: 700; color: rgba(255,255,255,.8); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 18px; }
.eyebrow-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: blink 1.8s ease-in-out infinite; }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:.4; } }
.hero-title { font-size: clamp(1.9rem, 5vw, 3rem); font-weight: 900; color: white; letter-spacing: -.02em; }
.hero-title em { font-style: normal; background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.main-panel { max-width: 720px; margin: -28px auto 0; padding: 0 24px 60px; position: relative; z-index: 10; }

.forum-card { background: white; border-radius: 22px; border: 1.5px solid #e8edf8; box-shadow: 0 4px 24px rgba(37,99,235,.06); display: flex; flex-direction: column; overflow: hidden; }

.forum-messages { padding: 20px; height: 480px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
.state-box { margin: auto; text-align: center; color: #94a3b8; font-size: .9rem; }
.spinner { width: 30px; height: 30px; margin: 0 auto 12px; border: 3px solid #e0e7ff; border-top-color: #2563eb; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.msg-row { display: flex; gap: 10px; }
.msg-row.row--me { flex-direction: row-reverse; }
.msg-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; font-size: .7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.msg-bubble { max-width: 70%; background: #f8faff; border: 1px solid #f1f5f9; padding: 9px 14px; border-radius: 14px; border-top-left-radius: 4px; }
.msg-bubble.bubble--me { background: #eff6ff; border-color: #dbeafe; border-top-left-radius: 14px; border-top-right-radius: 4px; }
.msg-name { display: block; font-size: .7rem; font-weight: 700; color: #4f46e5; margin-bottom: 2px; }
.msg-content { margin: 0; font-size: .86rem; color: #0f172a; line-height: 1.5; word-break: break-word; }
.msg-time { display: block; font-size: .66rem; color: #94a3b8; margin-top: 4px; }

.forum-input-row { display: flex; gap: 10px; padding: 14px 18px; border-top: 1px solid #f1f5f9; }
.forum-input-field { flex: 1; padding: 11px 16px; border-radius: 12px; border: 1.5px solid #e0e7ff; font-size: .88rem; background: #f8faff; transition: all .2s; }
.forum-input-field:focus { outline: none; border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,.12); }
.send-btn { width: 44px; height: 44px; flex-shrink: 0; border-radius: 12px; border: none; cursor: pointer; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; display: flex; align-items: center; justify-content: center; transition: transform .2s; }
.send-btn:hover:not(:disabled) { transform: translateY(-2px); }
.send-btn:disabled { background: #cbd5e1; cursor: not-allowed; }
.send-icon { width: 17px; height: 17px; }
.send-dots { font-weight: 900; }
.form-error { color: #e11d48; font-size: .78rem; font-weight: 700; text-align: center; padding: 0 0 10px; margin: 0; }

@media (max-width: 640px) {
  .hero { padding: 36px 20px 50px; }
  .main-panel { margin-top: -20px; padding: 0 14px 40px; }
  .msg-bubble { max-width: 82%; }
}
</style>