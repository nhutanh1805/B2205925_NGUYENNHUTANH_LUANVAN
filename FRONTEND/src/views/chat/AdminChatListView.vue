<template>
  <div class="chat-list-page">

    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Nhắn tin với khách
        </div>
        <h1 class="hero-title">Hội thoại<br/><em>khách hàng</em></h1>
      </div>
    </div>

    <div class="main-panel">

      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>Đang tải...</p>
      </div>
      <div v-else-if="error" class="state-box state-box--error">
        <div class="state-icon">⚠</div>
        <p>{{ error }}</p>
      </div>
      <div v-else-if="conversations.length === 0" class="state-box">
        <div class="state-icon">💬</div>
        <p>Chưa có hội thoại nào.</p>
      </div>

      <div v-else class="conv-list">
        <div
          v-for="c in conversations"
          :key="c.userId"
          class="conv-item"
          :class="{ 'conv-item--unread': c.unreadCount > 0 }"
          @click="goToChat(c.userId)"
        >
          <div class="conv-avatar">{{ initials(c.userName) }}</div>
          <div class="conv-info">
            <div class="conv-top">
              <span class="conv-name">{{ c.userName }}</span>
              <span class="conv-time">{{ formatTime(c.lastCreatedAt) }}</span>
            </div>
            <div class="conv-bottom">
              <p class="conv-last">
                <span v-if="c.lastRole === 'admin'" class="conv-prefix">Bạn: </span>
                {{ c.lastMessage }}
              </p>
              <span v-if="c.unreadCount > 0" class="unread-badge">{{ c.unreadCount }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { AdminChatAPI } from "@/services/chat.service";

const router = useRouter();

const conversations = ref([]);
const loading = ref(false);
const error = ref(null);

let pollTimer = null;

async function fetchConversations(showLoading = false) {
  if (showLoading) loading.value = true;
  error.value = null;
  try {
    const { data } = await AdminChatAPI.getConversations();
    conversations.value = data.conversations;
  } catch (e) {
    if (showLoading) error.value = e?.response?.data?.message || "Lỗi tải danh sách hội thoại";
  } finally {
    loading.value = false;
  }
}

function goToChat(userId) {
  router.push({ name: "chat.detail", params: { userId } });
}

function initials(name) {
  if (!name) return "?";
  return name.trim().split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("vi-VN");
}

onMounted(() => {
  fetchConversations(true);
  pollTimer = setInterval(() => fetchConversations(false), 8000);
});
onBeforeUnmount(() => { if (pollTimer) clearInterval(pollTimer); });
</script>

<style scoped>
.chat-list-page { min-height: 100vh; background: #f0f4ff; font-family: 'Segoe UI', system-ui, sans-serif; }

.hero { position: relative; overflow: hidden; background: #0a0f1e; padding: 60px 32px 80px; text-align: center; }
.hero-mesh { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 20% 0%, rgba(37,99,235,.35), transparent), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3), transparent); }
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25); top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.2); bottom: -60px; right: -40px; }
.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }
.hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); border-radius: 999px; padding: 6px 18px; font-size: .75rem; font-weight: 700; color: rgba(255,255,255,.8); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 22px; backdrop-filter: blur(8px); }
.eyebrow-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: blink 1.8s ease-in-out infinite; }
@keyframes blink { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(1.5); } }
.hero-title { font-size: clamp(2.1rem, 6vw, 3.4rem); font-weight: 900; color: white; line-height: 1.1; letter-spacing: -.02em; text-shadow: 0 2px 30px rgba(0,0,0,.4); }
.hero-title em { font-style: normal; background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.main-panel { max-width: 720px; margin: -32px auto 0; padding: 0 24px 60px; position: relative; z-index: 10; }

.state-box { background: white; border-radius: 22px; padding: 60px 20px; text-align: center; color: #94a3b8; font-size: .95rem; border: 1.5px solid #e8edf8; }
.state-icon { font-size: 2.6rem; margin-bottom: 12px; display: block; }
.state-box--error p { color: #e11d48; font-weight: 600; }
.spinner { width: 34px; height: 34px; margin: 0 auto 16px; border: 3px solid #e0e7ff; border-top-color: #2563eb; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.conv-list { background: white; border-radius: 22px; border: 1.5px solid #e8edf8; box-shadow: 0 4px 24px rgba(37,99,235,.06); overflow: hidden; }
.conv-item { display: flex; align-items: center; gap: 14px; padding: 16px 20px; cursor: pointer; border-bottom: 1px solid #f8faff; transition: background .15s; }
.conv-item:last-child { border-bottom: none; }
.conv-item:hover { background: #f8faff; }
.conv-item--unread { background: #eff6ff; }
.conv-item--unread:hover { background: #e0e9ff; }

.conv-avatar { width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .85rem; flex-shrink: 0; }
.conv-info { flex: 1; min-width: 0; }
.conv-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.conv-name { font-size: .92rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-time { font-size: .72rem; color: #94a3b8; flex-shrink: 0; }
.conv-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 3px; }
.conv-last { margin: 0; font-size: .82rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-prefix { color: #94a3b8; }
.unread-badge { flex-shrink: 0; background: #ef4444; color: white; font-size: .68rem; font-weight: 700; min-width: 18px; height: 18px; border-radius: 999px; display: flex; align-items: center; justify-content: center; padding: 0 5px; }

@media (max-width: 640px) {
  .hero { padding: 40px 20px 60px; }
  .main-panel { margin-top: -24px; padding: 0 14px 40px; }
  .conv-item { padding: 14px 16px; }
}
</style>