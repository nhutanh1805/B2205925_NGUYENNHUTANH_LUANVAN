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
        <p class="hero-sub">Nơi mọi thắc mắc đều có người trả lời</p>
      </div>
    </div>

    <div class="main-panel">
      <div class="forum-card">
        <div class="card-scallop"></div>

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
            v-for="(msg, i) in messages"
            :key="msg._id"
            class="msg-row"
            :class="{ 'row--me': msg.userId === userId }"
            :style="{ animationDelay: (i >= messages.length - 8 ? (messages.length - i) * -0.03 : 0) + 's' }"
          >
            <div class="msg-avatar" :class="{ 'msg-avatar--me': msg.userId === userId }">{{ initials(msg.userName) }}</div>
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
            <span v-else class="send-dots"><i></i><i></i><i></i></span>
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
.forum-page {
  --ink: #0b1720;
  --teal: #0f6b62;
  --teal-dark: #0a4c45;
  --amber: #f5a524;
  --amber-dark: #d4880f;
  --cream: #fbf7ef;
  --paper: #fffdf8;
  --line: #e7ddc9;
  --slate: #5b6a6a;
  --rose: #e11d48;
  min-height: 100vh; background: var(--cream); font-family: 'Segoe UI', system-ui, sans-serif;
}

.hero { position: relative; overflow: hidden; background: var(--ink); padding: 56px 32px 78px; text-align: center; }
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 70% 55% at 15% -5%, rgba(15,107,98,.55), transparent),
    radial-gradient(ellipse 55% 50% at 85% 105%, rgba(245,165,36,.28), transparent);
}
.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.16); border-radius: 999px;
  padding: 6px 18px; font-size: .74rem; font-weight: 700; color: rgba(251,243,226,.85);
  letter-spacing: .08em; text-transform: uppercase; margin-bottom: 20px;
}
.eyebrow-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--amber); box-shadow: 0 0 8px var(--amber); animation: blink 1.8s ease-in-out infinite; }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:.4; } }
.hero-title { font-size: clamp(2.1rem, 5.5vw, 3.3rem); font-weight: 900; color: #fbf3e2; letter-spacing: -.02em; line-height: 1.12; }
.hero-title em { font-style: normal; color: var(--amber); }
.hero-sub { margin-top: 14px; color: rgba(251,243,226,.6); font-size: .92rem; }

.main-panel { max-width: 720px; margin: -32px auto 0; padding: 0 24px 60px; position: relative; z-index: 10; }

.forum-card { background: var(--paper); border-radius: 22px; border: 1px solid var(--line); box-shadow: 0 20px 50px rgba(11,23,32,.1); display: flex; flex-direction: column; overflow: hidden; }

/* Dấu ấn riêng: viền răng cưa kiểu vé chợ, cắt giữa phần trên card và khung tin nhắn */
.card-scallop {
  height: 10px;
  background: var(--paper);
  background-image: radial-gradient(circle at 10px 0, var(--cream) 6.5px, transparent 7px);
  background-repeat: repeat-x;
  background-size: 20px 10px;
  border-bottom: 1px dashed var(--line);
}

.forum-messages {
  padding: 20px; height: 480px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;
  background: radial-gradient(rgba(15,107,98,.05) 1px, transparent 1px) 0 0/18px 18px;
}
.forum-messages::-webkit-scrollbar { width: 6px; }
.forum-messages::-webkit-scrollbar-thumb { background: rgba(15,107,98,.25); border-radius: 6px; }
.forum-messages::-webkit-scrollbar-track { background: transparent; }

.state-box { margin: auto; text-align: center; color: var(--slate); font-size: .9rem; }
.spinner { width: 30px; height: 30px; margin: 0 auto 12px; border: 3px solid var(--line); border-top-color: var(--teal); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.msg-row { display: flex; gap: 10px; animation: msg-in .3s ease backwards; }
@keyframes msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.msg-row.row--me { flex-direction: row-reverse; }
.msg-avatar {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(150deg, var(--teal), var(--teal-dark)); color: var(--amber);
  font-size: .7rem; font-weight: 800; display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(245,165,36,.3);
}
.msg-avatar--me { background: linear-gradient(150deg, var(--amber), var(--amber-dark)); color: var(--ink); box-shadow: none; }
.msg-bubble { max-width: 70%; background: var(--cream); border: 1px solid var(--line); padding: 9px 14px; border-radius: 15px; border-top-left-radius: 4px; }
.msg-bubble.bubble--me { background: #eef7f5; border-color: #cfe6e1; border-top-left-radius: 15px; border-top-right-radius: 4px; }
.msg-name { display: block; font-size: .7rem; font-weight: 800; color: var(--amber-dark); margin-bottom: 2px; }
.msg-content { margin: 0; font-size: .86rem; color: var(--ink); line-height: 1.5; word-break: break-word; }
.msg-time { display: block; font-size: .66rem; color: #9aa5a0; margin-top: 4px; }

.forum-input-row { display: flex; gap: 10px; padding: 14px 18px; border-top: 1px solid var(--line); }
.forum-input-field {
  flex: 1; padding: 11px 16px; border-radius: 12px; border: 1.5px solid var(--line);
  font-size: .88rem; background: var(--cream); color: var(--ink); transition: all .2s;
}
.forum-input-field::placeholder { color: #9aa5a0; }
.forum-input-field:focus { outline: none; border-color: var(--teal); background: white; box-shadow: 0 0 0 4px rgba(15,107,98,.13); }
.send-btn {
  width: 44px; height: 44px; flex-shrink: 0; border-radius: 12px; border: none; cursor: pointer;
  background: linear-gradient(150deg, var(--amber), var(--amber-dark)); color: var(--ink);
  display: flex; align-items: center; justify-content: center; transition: transform .2s, box-shadow .2s;
  box-shadow: 0 5px 12px rgba(245,165,36,.35);
}
.send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 7px 16px rgba(245,165,36,.45); }
.send-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.send-btn:disabled { background: #d9d2c1; box-shadow: none; cursor: not-allowed; color: #a19f96; }
.send-icon { width: 17px; height: 17px; }
.send-dots { display: flex; gap: 3px; align-items: center; }
.send-dots i { width: 4px; height: 4px; border-radius: 50%; background: var(--ink); animation: dot-bounce 1s ease-in-out infinite; }
.send-dots i:nth-child(2) { animation-delay: .15s; }
.send-dots i:nth-child(3) { animation-delay: .3s; }
@keyframes dot-bounce { 0%,60%,100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-3px); opacity: 1; } }
.form-error { color: var(--rose); font-size: .78rem; font-weight: 700; text-align: center; padding: 0 0 10px; margin: 0; }

@media (prefers-reduced-motion: reduce) {
  .eyebrow-dot, .msg-row, .send-dots i { animation: none; }
}

@media (max-width: 640px) {
  .hero { padding: 40px 20px 54px; }
  .main-panel { margin-top: -22px; padding: 0 14px 40px; }
  .msg-bubble { max-width: 82%; }
}
</style>