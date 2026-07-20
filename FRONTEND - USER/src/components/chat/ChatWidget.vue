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

        <!-- ══ TAB: CHAT VỚI SHOP ══ -->
        <template v-if="activeTab === 'shop'">
          <div class="chat-body" ref="shopChatBox">
            <div v-if="loadingShop && shopMessages.length === 0" class="chat-loading">
              <div class="spinner-sm"></div>
            </div>
            <div v-else-if="shopMessages.length === 0" class="chat-empty">
              Chào bạn! Có câu hỏi gì cứ nhắn cho shop nhé.
            </div>
            <div
              v-for="msg in shopMessages"
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
              <span v-else class="send-dots">...</span>
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
              Chưa có ai đăng gì cả. Hỏi gì đó đi bạn ơi
            </div>
            <div
              v-for="msg in forumMessages"
              :key="msg._id"
              class="msg-row"
              :class="{ 'row--me': msg.userId === userId }"
            >
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
              <span v-else class="send-dots">...</span>
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
import { ChatAPI } from "@/services/chat.service";
import { ForumAPI } from "@/services/forum.service";

const user      = JSON.parse(localStorage.getItem("user") || "{}");
const userId    = user?._id ?? null;
const userName  = user?.name ?? "Khách";

const isOpen     = ref(false);
const activeTab  = ref("shop"); // "shop" | "forum"
const unreadHint = ref(false);

// ══ CHAT VỚI SHOP ══
const shopMessages  = ref([]);
const loadingShop    = ref(false);
const shopMessage    = ref("");
const sendingShop     = ref(false);
const shopSendError   = ref(null);
const shopChatBox     = ref(null);
let shopPollTimer = null;

// ══ DIỄN ĐÀN ══
const forumMessages     = ref([]);
const loadingForum       = ref(false);
const forumMessage       = ref("");
const sendingForum        = ref(false);
const forumSendError      = ref(null);
const forumChatBox        = ref(null);
let forumLastFetchTime = null;
let forumPollTimer = null;

// ══ CHUNG ══
function toggleOpen() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    unreadHint.value = false;
    if (activeTab.value === "shop") fetchShopMessages(true);
    else fetchForumInitial();
  }
}

function switchTab(tab) {
  activeTab.value = tab;
  if (tab === "shop" && shopMessages.value.length === 0) fetchShopMessages(true);
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

// ══ LOGIC CHAT SHOP ══
async function fetchShopMessages(showLoading = false) {
  if (!userId) return;
  if (showLoading) loadingShop.value = true;
  try {
    const { data } = await ChatAPI.getMyMessages(userId);
    const oldCount = shopMessages.value.length;
    shopMessages.value = data.messages;
    if (!isOpen.value && data.messages.length > oldCount) unreadHint.value = true;
    if (isOpen.value && activeTab.value === "shop") scrollToBottom(shopChatBox);
  } catch (e) {
    // im lặng bỏ qua lỗi polling
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
    const { data } = await ChatAPI.sendMessage(userId, userName, content);
    shopMessages.value.push(data.message);
    shopMessage.value = "";
    scrollToBottom(shopChatBox);
  } catch (e) {
    shopSendError.value = e?.response?.data?.message || "Gửi tin nhắn thất bại";
  } finally {
    sendingShop.value = false;
  }
}

// ══ LOGIC DIỄN ĐÀN ══
async function fetchForumInitial() {
  loadingForum.value = true;
  try {
    const { data } = await ForumAPI.getMessages();
    forumMessages.value = data.messages;
    forumLastFetchTime = new Date().toISOString();
    scrollToBottom(forumChatBox);
  } catch (e) {
    // im lặng bỏ qua lỗi
  } finally {
    loadingForum.value = false;
  }
}

async function fetchForumNew() {
  if (!forumLastFetchTime) return;
  try {
    const { data } = await ForumAPI.getMessagesSince(forumLastFetchTime);
    if (data.messages.length > 0) {
      forumMessages.value.push(...data.messages);
      forumLastFetchTime = new Date().toISOString();
      if (isOpen.value && activeTab.value === "forum") scrollToBottom(forumChatBox);
    }
  } catch (e) {
    // im lặng bỏ qua lỗi polling
  }
}

async function handleSendForum() {
  const content = forumMessage.value.trim();
  if (!content || !userId) return;
  sendingForum.value  = true;
  forumSendError.value = null;
  try {
    const { data } = await ForumAPI.createMessage(userId, userName, content);
    forumMessages.value.push(data.message);
    forumMessage.value = "";
    forumLastFetchTime = new Date().toISOString();
    scrollToBottom(forumChatBox);
  } catch (e) {
    forumSendError.value = e?.response?.data?.message || "Đăng tin nhắn thất bại";
  } finally {
    sendingForum.value = false;
  }
}

onMounted(() => {
  if (!userId) return;
  fetchShopMessages();
  shopPollTimer  = setInterval(() => fetchShopMessages(false), 5000);
  forumPollTimer = setInterval(fetchForumNew, 5000);
});

onBeforeUnmount(() => {
  if (shopPollTimer)  clearInterval(shopPollTimer);
  if (forumPollTimer) clearInterval(forumPollTimer);
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

.chat-header { background: linear-gradient(135deg, #0a0f1e, #1e1b4b); padding: 4px; }
.header-tabs { display: flex; gap: 4px; }
.tab-btn { flex: 1; padding: 12px 10px; background: transparent; border: none; color: rgba(255,255,255,.6); font-size: .8rem; font-weight: 700; cursor: pointer; border-radius: 12px; transition: all .2s; }
.tab-btn:hover { color: rgba(255,255,255,.85); }
.tab-active { background: rgba(255,255,255,.12); color: white; }

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