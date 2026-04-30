<template>
  <!-- Nút mở chat -->
  <button @click="toggleChat" class="chatbot-btn" :class="{ active: isOpen }">
    <span v-if="!isOpen">💬</span>
    <span v-else>✕</span>
    <span v-if="unread > 0" class="badge">{{ unread }}</span>
  </button>

  <!-- Popup -->
  <Transition name="slide">
    <div v-if="isOpen" class="chatbot-popup">
      <!-- Header -->
      <div class="chat-header">
        <div class="header-info">
          <span class="avatar">🤖</span>
          <div>
            <div class="name">Trợ lý tư vấn</div>
            <div class="status">● Đang hoạt động</div>
          </div>
        </div>
        <button @click="clearChat" class="clear-btn" title="Xóa đoạn chat">🗑</button>
      </div>

      <!-- Messages -->
      <div class="chat-messages" ref="messagesEl">
        <div class="message bot">
          Xin chào! Tôi có thể tư vấn sản phẩm phụ kiện điện thoại cho bạn. Bạn cần hỗ trợ gì? 😊
        </div>
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="message"
          :class="msg.role"
        >
          {{ msg.content }}
        </div>
        <div v-if="loading" class="message bot typing">
          <span></span><span></span><span></span>
        </div>
      </div>

      <!-- Gợi ý nhanh -->
      <div v-if="messages.length === 0" class="suggestions">
        <button
          v-for="s in suggestions"
          :key="s"
          @click="sendQuick(s)"
          class="suggest-btn"
        >{{ s }}</button>
      </div>

      <!-- Input -->
      <div class="chat-input">
        <input
          v-model="input"
          @keydown.enter="send"
          :disabled="loading"
          placeholder="Nhập tin nhắn..."
          ref="inputEl"
        />
        <button @click="send" :disabled="loading || !input.trim()">➤</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, nextTick } from "vue";
import chatbotService from "@/services/chatbot.service";

const isOpen = ref(false);
const input = ref("");
const messages = ref([]);
const loading = ref(false);
const unread = ref(0);
const messagesEl = ref(null);
const inputEl = ref(null);

const suggestions = [
  "Tai nghe nào tốt nhất?",
  "Sản phẩm dưới 500k?",
  "Chính sách đổi trả?",
  "Có khuyến mãi không?",
];

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    unread.value = 0;
    nextTick(() => inputEl.value?.focus());
  }
};

const clearChat = () => { messages.value = []; };

const scrollBottom = async () => {
  await nextTick();
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
  }
};

const sendQuick = (text) => {
  input.value = text;
  send();
};

const send = async () => {
  const text = input.value.trim();
  if (!text || loading.value) return;

  messages.value.push({ role: "user", content: text });
  input.value = "";
  loading.value = true;
  await scrollBottom();

  try {
    const data = await chatbotService.ask(text);
    messages.value.push({ role: "bot", content: data.reply });
    if (!isOpen.value) unread.value++;
  } catch {
    messages.value.push({
      role: "bot",
      content: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau!",
    });
  } finally {
    loading.value = false;
    await scrollBottom();
  }
};
</script>

<style scoped>
.chatbot-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  font-size: 22px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
  z-index: 1000;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chatbot-btn:hover { background: #1d4ed8; transform: scale(1.05); }
.chatbot-btn.active { background: #64748b; }
.badge {
  position: absolute;
  top: -4px; right: -4px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  width: 20px; height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chatbot-popup {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 360px;
  height: 520px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  z-index: 999;
  overflow: hidden;
}

.chat-header {
  background: #2563eb;
  color: white;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-info { display: flex; align-items: center; gap: 10px; }
.avatar { font-size: 28px; }
.name { font-weight: 600; font-size: 15px; }
.status { font-size: 12px; opacity: 0.85; }
.clear-btn {
  background: none; border: none;
  color: white; cursor: pointer;
  font-size: 16px; opacity: 0.7;
}
.clear-btn:hover { opacity: 1; }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8fafc;
}
.message {
  max-width: 82%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}
.user {
  align-self: flex-end;
  background: #2563eb;
  color: white;
  border-bottom-right-radius: 4px;
}
.bot {
  align-self: flex-start;
  background: white;
  color: #1e293b;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}
.typing span {
  width: 7px; height: 7px;
  background: #94a3b8;
  border-radius: 50%;
  display: inline-block;
  animation: bounce 1.2s infinite;
}
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

.suggestions {
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
.suggest-btn {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  color: #2563eb;
  transition: all 0.15s;
}
.suggest-btn:hover { background: #eff6ff; border-color: #2563eb; }

.chat-input {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #e2e8f0;
  background: white;
}
.chat-input input {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 9px 16px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}
.chat-input input:focus { border-color: #2563eb; }
.chat-input button {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.15s;
  flex-shrink: 0;
}
.chat-input button:hover:not(:disabled) { background: #1d4ed8; }
.chat-input button:disabled { background: #94a3b8; cursor: not-allowed; }

.slide-enter-active, .slide-leave-active { transition: all 0.25s ease; }
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}
</style>