<template>
  <div class="support-page">

    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <button class="back-btn" @click="$router.push('/support')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="back-icon">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Quay lại
        </button>

        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Trung tâm hỗ trợ
        </div>
        <h1 class="hero-title">Chi tiết<br/><em>yêu cầu</em></h1>
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

      <template v-else-if="request">

        <!-- ══ INFO CARD ══ -->
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Loại</span>
            <span class="type-pill" :class="`type-pill--${request.type}`">
              {{ request.type === "warranty" ? "Bảo hành" : "Đổi trả" }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Trạng thái</span>
            <span class="status-pill" :class="`status--${request.status}`">
              {{ statusLabel(request.status) }}
            </span>
          </div>
          <div class="info-row" v-if="request.orderId">
            <span class="info-label">Mã đơn</span>
            <span class="info-value">#{{ shortId(request.orderId) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ngày tạo</span>
            <span class="info-value">{{ formatDate(request.createdAt) }}</span>
          </div>

          <div class="info-block">
            <span class="info-label">Lý do</span>
            <p class="info-reason">{{ request.reason }}</p>
          </div>

          <!-- ══ SẢN PHẨM ĐÍNH KÈM ══ -->
          <div class="info-block" v-if="request.selectedProducts?.length">
            <span class="info-label">Sản phẩm đính kèm</span>
            <div class="product-list">
              <div v-for="(p, i) in request.selectedProducts" :key="i" class="product-item">
                <div class="product-img-wrap">
                  <img v-if="p.image" :src="p.image" class="product-img" :alt="p.name" />
                  <div v-else class="product-img-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                    </svg>
                  </div>
                </div>
                <div class="product-info">
                  <p class="product-name">{{ p.name }}</p>
                  <p class="product-meta" v-if="p.variantInfo">{{ p.variantInfo }}</p>
                  <div class="product-price-row">
                    <span class="product-qty">x{{ p.quantity }}</span>
                    <span class="product-price">{{ formatPrice(p.price) }}₫</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="info-block" v-if="request.adminNote">
            <span class="info-label">Ghi chú từ admin</span>
            <p class="info-admin-note">{{ request.adminNote }}</p>
          </div>

          <div class="info-images" v-if="request.images?.length">
            <div v-for="(url, i) in request.images" :key="i" class="info-img-wrap" @click="lightboxUrl = url">
              <img :src="url" class="info-img" />
            </div>
          </div>
        </div>

        <!-- ══ CHAT CARD ══ -->
        <div class="chat-card">
          <h3 class="chat-title">Tin nhắn trao đổi</h3>

          <div class="chat-messages" ref="chatBox">
            <div v-if="messages.length === 0" class="chat-empty">Chưa có tin nhắn nào.</div>
            <div
              v-for="msg in messages"
              :key="msg._id"
              class="msg-bubble"
              :class="msg.role === 'user' ? 'bubble--user' : 'bubble--admin'"
            >
              <span class="msg-role">{{ msg.senderName || (msg.role === 'user' ? 'Khách' : 'Admin') }}</span>
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
        </div>
      </template>

    </div>

    <div v-if="lightboxUrl" class="lightbox" @click="lightboxUrl = null">
      <img :src="lightboxUrl" class="lightbox-img" />
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

const request     = ref(null);
const messages    = ref([]);
const loading     = ref(false);
const error       = ref(null);
const lightboxUrl = ref(null);
const newMessage  = ref("");
const sending     = ref(false);
const sendError   = ref(null);
const chatBox     = ref(null);

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
  sending.value   = true;
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
  const map = { pending: "Chờ xử lý", processing: "Đang xử lý", done: "Hoàn thành", rejected: "Từ chối", refunded: "Đã hoàn tiền" };
  return map[status] ?? status;
}
function shortId(id) { return id ? String(id).slice(-6).toUpperCase() : ""; }
const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v || 0);
function formatDate(iso) { return new Date(iso).toLocaleString("vi-VN"); }

onMounted(fetchDetail);
</script>

<style scoped>
.support-page { min-height: 100vh; background: #f0f4ff; font-family: 'Segoe UI', system-ui, sans-serif; }

.hero { position: relative; overflow: hidden; background: #0a0f1e; padding: 60px 32px 80px; text-align: center; }
.hero-mesh {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 60% at 20% 0%, rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3), transparent),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,.08), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25); top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.2); bottom: -60px; right: -40px; }
.hero-orb-3 { width: 180px; height: 180px; background: rgba(16,185,129,.15); top: 40%; left: 55%; }
.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }

.back-btn { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); border-radius: 999px; padding: 7px 16px 7px 12px; color: rgba(255,255,255,.75); font-size: .82rem; font-weight: 600; cursor: pointer; margin-bottom: 26px; transition: all .2s; }
.back-btn:hover { background: rgba(255,255,255,.14); color: white; }
.back-icon { width: 15px; height: 15px; }
.hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); border-radius: 999px; padding: 6px 18px; font-size: .75rem; font-weight: 700; color: rgba(255,255,255,.8); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 22px; backdrop-filter: blur(8px); }
.eyebrow-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: blink 1.8s ease-in-out infinite; }
@keyframes blink { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(1.5); } }
.hero-title { font-size: clamp(2.1rem, 6vw, 3.4rem); font-weight: 900; color: white; line-height: 1.1; letter-spacing: -.02em; text-shadow: 0 2px 30px rgba(0,0,0,.4); }
.hero-title em { font-style: normal; background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.main-panel { max-width: 680px; margin: -32px auto 0; padding: 0 24px 60px; position: relative; z-index: 10; display: flex; flex-direction: column; gap: 18px; }

.state-box { background: white; border-radius: 22px; padding: 60px 20px; text-align: center; color: #94a3b8; font-size: .95rem; border: 1.5px solid #e8edf8; }
.state-icon { font-size: 2.6rem; margin-bottom: 12px; display: block; }
.state-box--error p { color: #e11d48; font-weight: 600; }
.spinner { width: 34px; height: 34px; margin: 0 auto 16px; border: 3px solid #e0e7ff; border-top-color: #2563eb; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.info-card { background: white; border-radius: 22px; padding: 26px 28px; border: 1.5px solid #e8edf8; box-shadow: 0 4px 24px rgba(37,99,235,.06); }
.info-row { display: flex; align-items: center; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid #f8faff; }
.info-label { font-size: .76rem; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: .04em; }
.info-value { font-size: .9rem; font-weight: 600; color: #0f172a; }

.type-pill, .status-pill { font-size: .76rem; font-weight: 700; padding: 4px 12px; border-radius: 999px; }
.type-pill--warranty { background: #eff6ff; color: #2563eb; }
.type-pill--return    { background: #f5f3ff; color: #7c3aed; }
.status--pending    { background: #fef3c7; color: #92400e; }
.status--processing { background: #dbeafe; color: #1e40af; }
.status--done       { background: #d1fae5; color: #065f46; }
.status--rejected   { background: #fee2e2; color: #991b1b; }
.status--refunded   { background: #ede9fe; color: #5b21b6; }

.info-block { padding: 16px 0 0; }
.info-reason { margin: 8px 0 0; font-size: .9rem; color: #334155; line-height: 1.6; }
.info-admin-note { margin: 8px 0 0; font-size: .88rem; color: #713f12; line-height: 1.6; background: #fef9c3; border-left: 3px solid #facc15; padding: 10px 14px; border-radius: 10px; }

/* ══ PRODUCT LIST ══ */
.product-list { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
.product-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; border: 1.5px solid #e0e7ff; background: #f8faff; }
.product-img-wrap { width: 52px; height: 52px; border-radius: 10px; overflow: hidden; border: 1px solid #e0e7ff; flex-shrink: 0; background: #f1f5f9; }
.product-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.product-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #cbd5e1; }
.product-img-placeholder svg { width: 20px; height: 20px; }
.product-info { flex: 1; min-width: 0; }
.product-name { font-size: .86rem; font-weight: 700; color: #0f172a; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-meta { font-size: .73rem; color: #64748b; margin: 0 0 4px; }
.product-price-row { display: flex; align-items: center; gap: 8px; }
.product-qty { font-size: .74rem; color: #94a3b8; font-weight: 600; }
.product-price { font-size: .8rem; font-weight: 700; color: #e11d48; }

.info-images { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.info-img-wrap { width: 76px; height: 76px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e0e7ff; cursor: zoom-in; transition: transform .2s; }
.info-img-wrap:hover { transform: scale(1.05); }
.info-img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* ══ CHAT CARD ══ */
.chat-card { background: white; border-radius: 22px; padding: 26px 28px; border: 1.5px solid #e8edf8; box-shadow: 0 4px 24px rgba(37,99,235,.06); }
.chat-title { font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0 0 16px; }
.chat-messages { display: flex; flex-direction: column; gap: 10px; max-height: 360px; overflow-y: auto; padding-right: 4px; margin-bottom: 16px; }
.chat-empty { text-align: center; color: #94a3b8; font-size: .85rem; padding: 24px 0; }
.msg-bubble { display: flex; flex-direction: column; gap: 3px; max-width: 78%; padding: 10px 14px; border-radius: 14px; }
.bubble--user  { background: #eff6ff; border: 1px solid #dbeafe; align-self: flex-end; border-bottom-right-radius: 4px; }
.bubble--admin { background: #f8faff; border: 1px solid #f1f5f9; align-self: flex-start; border-bottom-left-radius: 4px; }
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

.lightbox { position: fixed; inset: 0; z-index: 300; background: rgba(10,15,30,.85); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; cursor: zoom-out; }
.lightbox-img { max-width: 90vw; max-height: 90vh; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,.4); }

@media (max-width: 640px) {
  .hero { padding: 40px 20px 60px; }
  .main-panel { margin-top: -24px; padding: 0 14px 40px; }
  .info-card, .chat-card { padding: 20px 18px; }
  .msg-bubble { max-width: 90%; }
}
</style>