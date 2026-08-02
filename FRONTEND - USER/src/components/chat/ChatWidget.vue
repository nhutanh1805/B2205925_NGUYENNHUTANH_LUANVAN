<template>
  <div class="chat-widget" v-if="userId">

    <!-- Nút mở/đóng -->
    <button class="chat-toggle-btn" @click="toggleOpen" aria-label="Mở khung chat">
      <span class="toggle-ring"></span>
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
          <div class="header-brand">
            <span class="brand-status"></span>
            <span class="brand-text">Trợ giúp</span>
          </div>
          <div class="header-tabs">
            <button
              class="tab-btn"
              :class="{ 'tab-active': activeTab === 'shop' }"
              @click="switchTab('shop')"
            >
              Nhắn Shop
            </button>
            <button
              class="tab-btn"
              :class="{ 'tab-active': activeTab === 'forum' }"
              @click="switchTab('forum')"
            >
              Diễn đàn
            </button>
          </div>
        </div>
        <div class="header-scallop"></div>

        <!-- ══ TAB: CHAT VỚI SHOP ══ -->
        <template v-if="activeTab === 'shop'">
          <div class="chat-body" ref="shopChatBox">
            <div v-if="loadingShop && shopMessages.length === 0" class="chat-loading">
              <div class="spinner-sm"></div>
            </div>
            <div v-else-if="shopMessages.length === 0" class="chat-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="empty-icon">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              Chào bạn! Có câu hỏi gì cứ nhắn cho shop nhé.
            </div>
            <div
              v-for="(msg, i) in shopMessages"
              :key="msg._id"
              class="msg-row"
              :class="msg.role === 'user' ? 'row--me' : 'row--admin'"
              :style="{ animationDelay: (i >= shopMessages.length - 6 ? (shopMessages.length - i) * -0.03 : 0) + 's' }"
            >
              <span v-if="msg.role === 'admin'" class="msg-avatar msg-avatar--admin">{{ initials(msg.senderName || 'Shop') }}</span>
              <div class="msg-bubble" :class="msg.role === 'user' ? 'bubble--me' : 'bubble--admin'">
                <span v-if="msg.role === 'admin'" class="msg-sender">{{ msg.senderName || "Admin" }}</span>
                <p class="msg-content">{{ msg.content }}</p>
                <time class="msg-time">{{ formatTime(msg.createdAt) }}</time>
              </div>
            </div>
          </div>

          <div class="chat-input-row">
            <input
              v-model="shopMessage"
              type="text"
              placeholder="Nhập tin nhắn..."
              class="chat-input-field"
              @keyup.enter="handleSendShop"
            />
            <button class="send-btn" :disabled="sendingShop || !shopMessage.trim()" @click="handleSendShop">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="send-icon" v-if="!sendingShop">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              <span v-else class="send-dots"><i></i><i></i><i></i></span>
            </button>
          </div>
          <p v-if="shopSendError" class="form-error">{{ shopSendError }}</p>
        </template>

        <!-- ══ TAB: DIỄN ĐÀN ══ -->
        <template v-else>
          <div class="chat-body" ref="forumChatBox">
            <div v-if="loadingForum && forumMessages.length === 0" class="chat-loading">
              <div class="spinner-sm"></div>
            </div>
            <div v-else-if="forumMessages.length === 0" class="chat-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="empty-icon">
                <path d="M17 8h3a1 1 0 0 1 1 1v8l-3.5-3H10a1 1 0 0 1-1-1v-1"/>
                <path d="M14 2H4a1 1 0 0 0-1 1v9l3.5-3H14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/>
              </svg>
              Chưa có ai đăng gì cả. Hỏi gì đó đi bạn ơi
            </div>
            <div
              v-for="(msg, i) in forumMessages"
              :key="msg._id"
              class="msg-row"
              :class="{ 'row--me': msg.userId === userId }"
              :style="{ animationDelay: (i >= forumMessages.length - 6 ? (forumMessages.length - i) * -0.03 : 0) + 's' }"
            >
              <span v-if="msg.userId !== userId" class="msg-avatar msg-avatar--forum">{{ initials(msg.userName) }}</span>
              <div class="msg-bubble" :class="{ 'bubble--me': msg.userId === userId }">
                <span class="msg-sender">{{ msg.userName }}</span>
                <p class="msg-content">{{ msg.content }}</p>
                <time class="msg-time">{{ formatTime(msg.createdAt) }}</time>
              </div>
            </div>
          </div>

          <div class="chat-input-row">
            <input
              v-model="forumMessage"
              type="text"
              maxlength="1000"
              placeholder="Đặt câu hỏi hoặc chia sẻ..."
              class="chat-input-field"
              @keyup.enter="handleSendForum"
            />
            <button class="send-btn" :disabled="sendingForum || !forumMessage.trim()" @click="handleSendForum">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="send-icon" v-if="!sendingForum">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              <span v-else class="send-dots"><i></i><i></i><i></i></span>
            </button>
          </div>
          <p v-if="forumSendError" class="form-error">{{ forumSendError }}</p>
        </template>

      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { io } from "socket.io-client";
import { ChatAPI } from "@/services/chat.service";
import { ForumAPI } from "@/services/forum.service";

const user      = JSON.parse(localStorage.getItem("user") || "{}");
const userId    = user?._id ?? null;
const userName  = user?.name ?? "Khách";

const isOpen     = ref(false);
const activeTab  = ref("shop");
const unreadHint = ref(false);

const socket = userId ? io("http://localhost:3000") : null;

const shopMessages  = ref([]);
const loadingShop    = ref(false);
const shopMessage    = ref("");
const sendingShop     = ref(false);
const shopSendError   = ref(null);
const shopChatBox     = ref(null);

const forumMessages     = ref([]);
const loadingForum       = ref(false);
const forumMessage       = ref("");
const sendingForum        = ref(false);
const forumSendError      = ref(null);
const forumChatBox        = ref(null);

function toggleOpen() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    unreadHint.value = false;
    if (activeTab.value === "shop" && shopMessages.value.length === 0) fetchShopMessages();
    if (activeTab.value === "forum" && forumMessages.value.length === 0) fetchForumInitial();
  }
}

function switchTab(tab) {
  activeTab.value = tab;
  if (tab === "shop" && shopMessages.value.length === 0) fetchShopMessages();
  if (tab === "forum" && forumMessages.value.length === 0) fetchForumInitial();
  scrollToBottom(tab === "shop" ? shopChatBox : forumChatBox);
}

async function scrollToBottom(boxRef) {
  await nextTick();
  if (boxRef.value) boxRef.value.scrollTop = boxRef.value.scrollHeight;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function initials(name) {
  if (!name) return "?";
  return name.trim().split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
}

async function fetchShopMessages() {
  if (!userId) return;
  loadingShop.value = true;
  try {
    const { data } = await ChatAPI.getMyMessages(userId);
    shopMessages.value = data.messages;
    if (isOpen.value && activeTab.value === "shop") scrollToBottom(shopChatBox);
  } catch (e) {
    // im lặng
  } finally {
    loadingShop.value = false;
  }
}

async function handleSendShop() {
  const content = shopMessage.value.trim();
  if (!content || !userId) return;
  sendingShop.value  = true;
  shopSendError.value = null;
  try {
    await ChatAPI.sendMessage(userId, userName, content);
    shopMessage.value = "";
  } catch (e) {
    shopSendError.value = e?.response?.data?.message || "Gửi tin nhắn thất bại";
  } finally {
    sendingShop.value = false;
  }
}

function handleShopNewMessage(message) {
  if (shopMessages.value.some((m) => m._id === message._id)) return;
  shopMessages.value.push(message);
  if (isOpen.value && activeTab.value === "shop") {
    scrollToBottom(shopChatBox);
  } else if (message.role === "admin") {
    unreadHint.value = true;
  }
}

async function fetchForumInitial() {
  loadingForum.value = true;
  try {
    const { data } = await ForumAPI.getMessages();
    forumMessages.value = data.messages;
    scrollToBottom(forumChatBox);
  } catch (e) {
    // im lặng
  } finally {
    loadingForum.value = false;
  }
}

async function handleSendForum() {
  const content = forumMessage.value.trim();
  if (!content || !userId) return;
  sendingForum.value  = true;
  forumSendError.value = null;
  try {
    await ForumAPI.createMessage(userId, userName, content);
    forumMessage.value = "";
  } catch (e) {
    forumSendError.value = e?.response?.data?.message || "Đăng tin nhắn thất bại";
  } finally {
    sendingForum.value = false;
  }
}

function handleForumNewMessage(message) {
  if (forumMessages.value.some((m) => m._id === message._id)) return;
  forumMessages.value.push(message);
  if (isOpen.value && activeTab.value === "forum") scrollToBottom(forumChatBox);
}

onMounted(() => {
  if (!userId || !socket) return;

  fetchShopMessages();

  socket.emit("chat:join-user", userId);
  socket.on("chat:new-message", handleShopNewMessage);
  socket.on("forum:new-message", handleForumNewMessage);
});

onBeforeUnmount(() => {
  if (!socket) return;
  socket.off("chat:new-message", handleShopNewMessage);
  socket.off("forum:new-message", handleForumNewMessage);
  socket.disconnect();
});
</script>

<style scoped>
.chat-widget {
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
  position: fixed; bottom: 24px; right: 24px; z-index: 500;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.chat-toggle-btn {
  width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
  background: linear-gradient(155deg, var(--teal), var(--teal-dark));
  color: var(--amber);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 26px rgba(15,107,98,.38), inset 0 0 0 1px rgba(245,165,36,.25);
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s;
  position: relative;
}
.chat-toggle-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 14px 32px rgba(15,107,98,.46), inset 0 0 0 1px rgba(245,165,36,.4); }
.chat-toggle-btn:focus-visible { outline: 2px solid var(--amber); outline-offset: 3px; }
.toggle-ring {
  position: absolute; inset: -6px; border-radius: 50%;
  border: 1.5px solid rgba(245,165,36,.35);
  animation: ring-pulse 2.6s ease-out infinite;
}
@keyframes ring-pulse { 0% { transform: scale(.86); opacity: .8; } 100% { transform: scale(1.18); opacity: 0; } }
.toggle-icon { width: 25px; height: 25px; position: relative; z-index: 1; }
.unread-dot {
  position: absolute; top: 3px; right: 3px; width: 13px; height: 13px; border-radius: 50%;
  background: var(--rose); border: 2.5px solid var(--paper);
  animation: blink 1.6s ease-in-out infinite;
}
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:.35; } }

.chat-panel {
  position: absolute; bottom: 76px; right: 0; width: 350px; max-width: 88vw;
  background: var(--paper); border-radius: 20px; overflow: hidden;
  box-shadow: 0 24px 60px rgba(11,23,32,.24);
  border: 1px solid var(--line);
  display: flex; flex-direction: column;
}

.chat-header {
  background: linear-gradient(160deg, var(--ink), var(--teal-dark));
  padding: 16px 16px 12px;
}
.header-brand { display: flex; align-items: center; gap: 7px; margin-bottom: 12px; padding: 0 2px; }
.brand-status { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 6px #4ade80; }
.brand-text { font-weight: 800; font-size: .8rem; color: #fbf3e2; letter-spacing: .04em; text-transform: uppercase; }

.header-tabs { display: flex; gap: 4px; background: rgba(0,0,0,.18); border-radius: 12px; padding: 3px; }
.tab-btn {
  flex: 1; padding: 9px 10px; background: transparent; border: none; color: rgba(251,243,226,.55);
  font-size: .78rem; font-weight: 700; cursor: pointer; border-radius: 9px; transition: all .2s;
}
.tab-btn:hover { color: rgba(251,243,226,.85); }
.tab-btn:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }
.tab-active { background: var(--amber); color: var(--ink); box-shadow: 0 3px 10px rgba(245,165,36,.35); }

/* Dấu ấn riêng: viền răng cưa kiểu vé chợ, tách header khỏi khung tin nhắn */
.header-scallop {
  height: 9px;
  background: var(--teal-dark);
  background-image: radial-gradient(circle at 9px 0, var(--paper) 6px, transparent 6.5px);
  background-repeat: repeat-x;
  background-size: 18px 9px;
  background-position: 4px 0;
}

.chat-body {
  padding: 14px; height: 320px; overflow-y: auto;
  background:
    radial-gradient(circle at 100% 0%, rgba(15,107,98,.05), transparent 55%),
    radial-gradient(rgba(15,107,98,.06) 1px, transparent 1px) 0 0/16px 16px,
    var(--cream);
  display: flex; flex-direction: column; gap: 9px;
}
.chat-body::-webkit-scrollbar { width: 6px; }
.chat-body::-webkit-scrollbar-thumb { background: rgba(15,107,98,.25); border-radius: 6px; }
.chat-body::-webkit-scrollbar-track { background: transparent; }

.chat-loading { display: flex; align-items: center; justify-content: center; height: 100%; }
.chat-empty {
  text-align: center; color: var(--slate); font-size: .82rem; padding: 26px 16px; line-height: 1.55;
  display: flex; flex-direction: column; align-items: center; gap: 10px; margin: auto 0;
}
.empty-icon { width: 30px; height: 30px; color: var(--teal); opacity: .55; }

.msg-row {
  display: flex; align-items: flex-end; gap: 7px;
  animation: msg-in .28s ease backwards;
}
@keyframes msg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.row--me { justify-content: flex-end; }
.row--admin { justify-content: flex-start; }

.msg-avatar {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  font-size: .62rem; font-weight: 800; display: flex; align-items: center; justify-content: center;
}
.msg-avatar--admin { background: linear-gradient(150deg, var(--teal), var(--teal-dark)); color: var(--amber); box-shadow: inset 0 0 0 1px rgba(245,165,36,.3); }
.msg-avatar--forum { background: var(--paper); color: var(--teal-dark); border: 1.5px solid var(--line); }

.msg-bubble { max-width: 74%; padding: 9px 13px; border-radius: 15px; }
.bubble--me { background: linear-gradient(150deg, var(--teal), var(--teal-dark)); color: #fdfaf2; border-bottom-right-radius: 4px; }
.bubble--admin { background: white; border: 1px solid var(--line); border-bottom-left-radius: 4px; }
.msg-sender { display: block; font-size: .67rem; font-weight: 800; color: var(--amber-dark); margin-bottom: 2px; }
.msg-content { margin: 0; font-size: .84rem; line-height: 1.45; word-break: break-word; }
.msg-time { display: block; font-size: .64rem; margin-top: 3px; opacity: .65; }
.bubble--me .msg-time { color: rgba(253,250,242,.75); text-align: right; }
.bubble--admin .msg-time { color: #9aa5a0; }

.chat-input-row { display: flex; gap: 8px; padding: 12px 14px; border-top: 1px solid var(--line); background: var(--paper); }
.chat-input-field {
  flex: 1; padding: 10px 14px; border-radius: 12px; border: 1.5px solid var(--line);
  font-size: .85rem; background: var(--cream); transition: all .2s; color: var(--ink);
}
.chat-input-field::placeholder { color: #9aa5a0; }
.chat-input-field:focus { outline: none; border-color: var(--teal); background: white; box-shadow: 0 0 0 3px rgba(15,107,98,.14); }
.send-btn {
  width: 40px; height: 40px; flex-shrink: 0; border-radius: 11px; border: none; cursor: pointer;
  background: linear-gradient(150deg, var(--amber), var(--amber-dark)); color: var(--ink);
  display: flex; align-items: center; justify-content: center; transition: transform .2s, box-shadow .2s;
  box-shadow: 0 4px 10px rgba(245,165,36,.35);
}
.send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(245,165,36,.45); }
.send-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.send-btn:disabled { background: #d9d2c1; box-shadow: none; cursor: not-allowed; color: #a19f96; }
.send-icon { width: 16px; height: 16px; }
.send-dots { display: flex; gap: 3px; align-items: center; }
.send-dots i { width: 4px; height: 4px; border-radius: 50%; background: var(--ink); animation: dot-bounce 1s ease-in-out infinite; }
.send-dots i:nth-child(2) { animation-delay: .15s; }
.send-dots i:nth-child(3) { animation-delay: .3s; }
@keyframes dot-bounce { 0%,60%,100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-3px); opacity: 1; } }

.spinner-sm { width: 26px; height: 26px; border: 3px solid var(--line); border-top-color: var(--teal); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.form-error { color: var(--rose); font-size: .75rem; font-weight: 700; text-align: center; padding: 6px 0; margin: 0; }

.panel-enter-active { transition: opacity .25s ease, transform .3s cubic-bezier(.34,1.56,.64,1); }
.panel-leave-active { transition: opacity .18s ease, transform .18s ease; }
.panel-enter-from, .panel-leave-to { opacity: 0; transform: translateY(14px) scale(.96); }

@media (prefers-reduced-motion: reduce) {
  .toggle-ring, .brand-status, .unread-dot, .msg-row, .send-dots i { animation: none; }
}

@media (max-width: 480px) {
  .chat-widget { bottom: 16px; right: 16px; }
  .chat-panel { width: calc(100vw - 32px); }
}
</style>