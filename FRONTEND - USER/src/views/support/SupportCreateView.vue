<template>
  <div class="support-page">

    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <button class="back-btn" @click="$router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="back-icon">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Quay lại
        </button>

        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Trung tâm hỗ trợ
        </div>
        <h1 class="hero-title">Tạo yêu cầu<br/><em>hỗ trợ</em></h1>
        <p class="hero-sub">Cho chúng tôi biết vấn đề bạn gặp phải</p>
      </div>
    </div>

    <div class="main-panel">
      <div class="support-card">

        <form class="support-form" @submit.prevent="handleSubmit">

          <!-- Loại yêu cầu -->
          <div class="field">
            <label class="field-label">Loại yêu cầu <span class="req">*</span></label>
            <div class="type-toggle">
              <button
                type="button"
                class="type-btn"
                :class="{ active: form.type === 'warranty' }"
                @click="form.type = 'warranty'"
              >
                Bảo hành
              </button>
              <button
                type="button"
                class="type-btn"
                :class="{ active: form.type === 'return' }"
                @click="form.type = 'return'"
              >
                Đổi trả
              </button>
            </div>
          </div>

          <!-- Mã đơn hàng -->
          <div class="field">
            <label class="field-label">Mã đơn hàng <span class="opt">(tuỳ chọn)</span></label>

            <!-- Đã chọn 1 đơn -->
            <div v-if="selectedOrder" class="order-selected">
              <div class="order-selected-info">
                <span class="order-selected-code">Đơn #{{ shortId(selectedOrder._id) }}</span>
                <span class="order-selected-meta">
                  {{ formatDate(selectedOrder.createdAt) }} · {{ formatPrice(selectedOrder.totalPrice) }}₫
                </span>
              </div>
              <button type="button" class="order-change-btn" @click="clearOrder">Đổi đơn hàng</button>
            </div>

            <!-- Chưa chọn -->
            <button
              v-else
              type="button"
              class="order-pick-btn"
              @click="openOrderPicker"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="order-pick-icon">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Chọn đơn hàng của tôi
            </button>
          </div>

          <!-- ══ ORDER PICKER MODAL ══ -->
          <Transition name="modal">
            <div v-if="showOrderPicker" class="modal-backdrop" @click.self="showOrderPicker = false">
              <div class="modal-card">
                <div class="modal-header">
                  <h3 class="modal-title">Chọn đơn hàng</h3>
                  <button type="button" class="modal-close" @click="showOrderPicker = false">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <div class="modal-body">
                  <div v-if="ordersLoading" class="order-state">
                    <div class="spinner"></div>
                    <p>Đang tải đơn hàng...</p>
                  </div>
                  <div v-else-if="ordersError" class="order-state order-state--error">
                    {{ ordersError }}
                  </div>
                  <div v-else-if="orders.length === 0" class="order-state">
                    Bạn chưa có đơn hàng nào.
                  </div>
                  <ul v-else class="order-list">
                    <li
                      v-for="o in orders"
                      :key="o._id"
                      class="order-item"
                      @click="selectOrder(o)"
                    >
                      <div class="order-item-top">
                        <span class="order-item-code">Đơn #{{ shortId(o._id) }}</span>
                        <span class="order-item-status" :class="`order-status--${o.status}`">{{ orderStatusLabel(o.status) }}</span>
                      </div>
                      <p class="order-item-summary">{{ itemsSummary(o.items) }}</p>
                      <div class="order-item-bottom">
                        <span class="order-item-date">{{ formatDate(o.createdAt) }}</span>
                        <span class="order-item-total">{{ formatPrice(o.totalPrice) }}₫</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Lý do -->
          <div class="field">
            <label class="field-label">Lý do <span class="req">*</span></label>
            <textarea
              v-model="form.reason"
              rows="4"
              class="field-input field-textarea"
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
            />
          </div>

          <!-- Ảnh minh chứng -->
          <div class="field">
            <label class="field-label">Ảnh minh chứng <span class="opt">(tuỳ chọn)</span></label>
            <label class="upload-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="upload-icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span class="upload-text">Nhấn để chọn ảnh hoặc kéo thả vào đây</span>
              <input
                type="file"
                accept="image/*"
                multiple
                class="upload-input"
                @change="handleImages"
              />
            </label>
            <div v-if="previewUrls.length" class="preview-grid">
              <div v-for="(url, i) in previewUrls" :key="i" class="preview-item">
                <img :src="url" class="preview-img" />
              </div>
            </div>
          </div>

          <p v-if="error" class="form-error">{{ error }}</p>

          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? "Đang gửi..." : "Gửi yêu cầu" }}
            <span class="btn-shine"></span>
          </button>
        </form>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { SupportAPI } from "@/services/support.service";
import OrderService from "@/services/order.service"; // gọi OrderService.getOrdersByUser(userId)

const router = useRouter();
const userId = JSON.parse(localStorage.getItem("user") || "{}")?._id ?? null;

const loading     = ref(false);
const error       = ref(null);
const previewUrls = ref([]);

const form = reactive({
  type:    "warranty",
  orderId: "",
  reason:  "",
  images:  [], // mảng URL sau khi upload — tuỳ chỉnh upload logic
});

// ── Chọn đơn hàng ──
const orders          = ref([]);
const ordersLoading    = ref(false);
const ordersError      = ref(null);
const ordersLoaded     = ref(false);
const showOrderPicker  = ref(false);

const selectedOrder = computed(() =>
  orders.value.find((o) => o._id === form.orderId) || null
);

async function fetchOrders() {
  if (ordersLoaded.value) return; // chỉ tải 1 lần
  ordersLoading.value = true;
  ordersError.value   = null;
  try {
    const { data } = await OrderService.getOrdersByUser(userId);
    orders.value = data.orders || data; // tuỳ controller bọc { orders } hay trả mảng thẳng
    ordersLoaded.value = true;
  } catch (e) {
    ordersError.value = e?.response?.data?.message || "Không tải được danh sách đơn hàng";
  } finally {
    ordersLoading.value = false;
  }
}

function openOrderPicker() {
  showOrderPicker.value = true;
  fetchOrders();
}

function selectOrder(order) {
  form.orderId = order._id;
  showOrderPicker.value = false;
}

function clearOrder() {
  form.orderId = "";
}

// status theo OrderService: COD đi qua pending→confirmed→preparing→shipping→delivered→completed
// non-COD đi qua pending→paid→preparing→shipping→delivered→completed (hoặc cancelled)
function orderStatusLabel(status) {
  const map = {
    pending:   "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    paid:      "Đã thanh toán",
    preparing: "Đang chuẩn bị",
    shipping:  "Đang giao",
    delivered: "Đã giao",
    completed: "Hoàn thành",
    cancelled: "Đã huỷ",
  };
  return map[status] ?? status;
}

function shortId(id) {
  return id ? String(id).slice(-6).toUpperCase() : "";
}

function itemsSummary(items) {
  if (!items?.length) return "";
  const first = items[0].name;
  return items.length > 1 ? `${first} và ${items.length - 1} sản phẩm khác` : first;
}

const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v || 0);
const formatDate  = (iso) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "");

// Xem trước ảnh (chưa upload thật — tuỳ dự án)
function handleImages(e) {
  const files = Array.from(e.target.files);
  previewUrls.value = files.map((f) => URL.createObjectURL(f));
  // TODO: upload lên server/cloud để lấy URL thật rồi gán vào form.images
  // Ví dụ: form.images = await uploadFiles(files);
}

async function handleSubmit() {
  error.value = null;

  if (!form.type)   { error.value = "Vui lòng chọn loại yêu cầu"; return; }
  if (!form.reason.trim()) { error.value = "Vui lòng nhập lý do"; return; }

  loading.value = true;
  try {
    const { data } = await SupportAPI.createRequest(userId, {
      type:    form.type,
      orderId: form.orderId || undefined,
      reason:  form.reason.trim(),
      images:  form.images,
    });
    router.push(`/support/${data.request._id}`);
  } catch (e) {
    error.value = e?.response?.data?.message || "Lỗi gửi yêu cầu, thử lại sau";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.support-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ══ HERO ══ */
.hero {
  position: relative; overflow: hidden;
  background: #0a0f1e; padding: 60px 32px 90px; text-align: center;
}
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%, rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3), transparent),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,.08), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25); top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.2); bottom: -60px; right: -40px; }
.hero-orb-3 { width: 180px; height: 180px; background: rgba(16,185,129,.15); top: 40%; left: 55%; }

.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }

.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px; padding: 7px 16px 7px 12px;
  color: rgba(255,255,255,.75); font-size: .82rem; font-weight: 600;
  cursor: pointer; margin-bottom: 26px; transition: all .2s;
}
.back-btn:hover { background: rgba(255,255,255,.14); color: white; }
.back-icon { width: 15px; height: 15px; }

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px; padding: 6px 18px;
  font-size: .75rem; font-weight: 700; color: rgba(255,255,255,.8);
  letter-spacing: .08em; text-transform: uppercase;
  margin-bottom: 22px; backdrop-filter: blur(8px);
}
.eyebrow-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #10b981; box-shadow: 0 0 8px #10b981;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}
.hero-title {
  font-size: clamp(2.1rem, 6vw, 3.4rem); font-weight: 900; color: white;
  line-height: 1.1; letter-spacing: -.02em; margin-bottom: 14px;
  text-shadow: 0 2px 30px rgba(0,0,0,.4);
}
.hero-title em {
  font-style: normal;
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size: 1rem; color: rgba(255,255,255,.55); letter-spacing: .06em; }

/* ══ MAIN PANEL ══ */
.main-panel {
  max-width: 620px; margin: -48px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

.support-card {
  background: white; border-radius: 24px; padding: 36px 32px;
  box-shadow: 0 24px 60px rgba(10,15,30,.16);
  border: 1px solid rgba(37,99,235,.1);
}

.support-form { display: flex; flex-direction: column; gap: 20px; }

.field-label {
  display: block; font-size: .78rem; font-weight: 700; color: #4f46e5;
  text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px;
}
.req { color: #e11d48; }
.opt { color: #94a3b8; font-weight: 500; text-transform: none; letter-spacing: 0; }

.field-input {
  width: 100%; padding: 13px 16px; border-radius: 12px;
  border: 1.5px solid #e0e7ff; font-size: .92rem; color: #0f172a;
  background: #f8faff; transition: all .2s; box-sizing: border-box;
  font-family: inherit;
}
.field-input:focus {
  outline: none; border-color: #2563eb; background: white;
  box-shadow: 0 0 0 4px rgba(37,99,235,.12);
}
.field-textarea { resize: vertical; min-height: 100px; }

/* ══ TYPE TOGGLE ══ */
.type-toggle { display: flex; gap: 10px; }
.type-btn {
  flex: 1; padding: 11px; border-radius: 12px;
  border: 1.5px solid #e0e7ff; background: white;
  color: #4f46e5; font-weight: 700; font-size: .86rem;
  cursor: pointer; transition: all .2s;
}
.type-btn:hover { background: #eff6ff; border-color: #a5b4fc; }
.type-btn.active {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white; border-color: transparent;
  box-shadow: 0 4px 12px rgba(37,99,235,.3);
}

/* ══ UPLOAD ══ */
.upload-box {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 28px 16px; border-radius: 14px;
  border: 2px dashed #c7d2fe; background: #f8faff;
  cursor: pointer; transition: all .2s; position: relative;
}
.upload-box:hover { border-color: #818cf8; background: #eff6ff; }
.upload-icon { width: 26px; height: 26px; color: #6366f1; }
.upload-text { font-size: .82rem; color: #64748b; font-weight: 600; text-align: center; }
.upload-input {
  position: absolute; inset: 0; opacity: 0; cursor: pointer;
}

.preview-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.preview-item {
  width: 76px; height: 76px; border-radius: 12px; overflow: hidden;
  border: 1.5px solid #e0e7ff;
}
.preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }

.form-error {
  color: #e11d48; font-size: .85rem; font-weight: 700; margin: 0;
  text-align: center;
}

/* ══ ORDER PICK BUTTON ══ */
.order-pick-btn {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 13px 16px; border-radius: 12px;
  border: 1.5px dashed #c7d2fe; background: #f8faff;
  color: #4f46e5; font-weight: 700; font-size: .88rem;
  cursor: pointer; transition: all .2s;
}
.order-pick-btn:hover { background: #eff6ff; border-color: #818cf8; }
.order-pick-icon { width: 18px; height: 18px; flex-shrink: 0; }

/* ══ ORDER SELECTED ══ */
.order-selected {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 13px 16px; border-radius: 12px;
  border: 1.5px solid #c7d2fe; background: #eff6ff;
}
.order-selected-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.order-selected-code { font-size: .9rem; font-weight: 800; color: #1e3a8a; }
.order-selected-meta { font-size: .76rem; color: #64748b; }
.order-change-btn {
  flex-shrink: 0; background: none; border: none; cursor: pointer;
  color: #2563eb; font-weight: 700; font-size: .8rem;
}
.order-change-btn:hover { text-decoration: underline; }

/* ══ ORDER PICKER MODAL ══ */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(10,15,30,.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-card {
  background: white; border-radius: 22px; overflow: hidden;
  max-width: 440px; width: 100%; max-height: 80vh;
  display: flex; flex-direction: column;
  box-shadow: 0 30px 70px rgba(0,0,0,.25);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 22px; border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
}
.modal-title { font-size: 1.05rem; font-weight: 800; color: #0f172a; }
.modal-close {
  width: 30px; height: 30px; border-radius: 50%; border: none; cursor: pointer;
  background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center;
  transition: background .2s;
}
.modal-close:hover { background: #e2e8f0; }
.modal-close svg { width: 15px; height: 15px; }
.modal-body { padding: 16px 18px 20px; overflow-y: auto; }

.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.order-state { text-align: center; padding: 36px 10px; color: #94a3b8; font-size: .88rem; }
.order-state--error { color: #e11d48; font-weight: 600; }
.spinner {
  width: 28px; height: 28px; margin: 0 auto 12px;
  border: 3px solid #e0e7ff; border-top-color: #2563eb;
  border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.order-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.order-item {
  padding: 13px 16px; border-radius: 14px;
  border: 1.5px solid #e8edf8; cursor: pointer; transition: all .2s;
}
.order-item:hover { border-color: #a5b4fc; background: #f8faff; }
.order-item-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.order-item-code { font-size: .88rem; font-weight: 800; color: #0f172a; }
.order-item-status { font-size: .7rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; white-space: nowrap; }
.order-status--pending   { background: #fef3c7; color: #92400e; }
.order-status--confirmed { background: #dbeafe; color: #1e40af; }
.order-status--paid      { background: #cffafe; color: #155e75; }
.order-status--preparing { background: #fae8ff; color: #86198f; }
.order-status--shipping  { background: #e0e7ff; color: #4338ca; }
.order-status--delivered { background: #d1fae5; color: #065f46; }
.order-status--completed { background: #dcfce7; color: #14532d; }
.order-status--cancelled { background: #fee2e2; color: #991b1b; }
.order-item-summary { font-size: .8rem; color: #64748b; margin: 0 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.order-item-bottom { display: flex; align-items: center; justify-content: space-between; }
.order-item-date { font-size: .78rem; color: #94a3b8; }
.order-item-total { font-size: .85rem; font-weight: 700; color: #e11d48; }


.submit-btn {
  padding: 14px; border-radius: 13px;
  font-size: .95rem; font-weight: 700; color: white;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  border: none; cursor: pointer; position: relative; overflow: hidden;
  box-shadow: 0 4px 14px rgba(37,99,235,.3); transition: transform .2s, box-shadow .2s;
}
.submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,99,235,.4); }
.submit-btn:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; }
.btn-shine {
  position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
  transform: skewX(-20deg); transition: left .5s;
}
.submit-btn:hover:not(:disabled) .btn-shine { left: 130%; }

/* ── MOBILE ── */
@media (max-width: 640px) {
  .hero { padding: 40px 20px 70px; }
  .main-panel { margin-top: -40px; padding: 0 16px 40px; }
  .support-card { padding: 28px 22px; }
}
</style>