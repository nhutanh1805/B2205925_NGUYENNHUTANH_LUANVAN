<template>
  <div class="checkout-page">

    <!-- ORDER SUCCESS ANIMATION OVERLAY -->
    <transition name="point-fade">
      <div v-if="showSuccessAnim" class="point-overlay">
        <div class="point-card">
          <div class="point-star"></div>
          <div class="point-title">Đặt hàng thành công!</div>

          <template v-if="lastPointsUsed > 0">
            <div class="point-msg">
              Bạn đã dùng <b>{{ lastPointsUsed.toLocaleString("vi-VN") }} điểm</b>
              để giảm <b>{{ formatPrice(lastDiscount) }}₫</b>
            </div>
          </template>

          <div class="point-msg" style="margin-top:6px">
            Điểm thưởng sẽ được cộng sau khi đơn hàng giao thành công
          </div>
          <div class="point-detail">
            Ước tính <b>+{{ Math.floor((lastOriginalPrice) / 1000).toLocaleString("vi-VN") }} điểm</b>
            cho đơn {{ formatPrice(lastOriginalPrice) }}₫
          </div>

          <div class="point-bar-wrap">
            <div class="point-bar" :style="{ width: barWidth + '%' }"></div>
          </div>
          <div class="point-sub">Đang chuyển đến đơn hàng...</div>
        </div>
      </div>
    </transition>

    <div class="checkout-card">

      <!-- HEADER -->
      <div class="header">
        <h1>Thanh toán đơn hàng</h1>
        <p>Hoàn tất đơn hàng của bạn chỉ trong vài bước</p>
      </div>

      <div class="content">

        <!-- LEFT -->
        <div class="left">
          <h2>Thông tin giao hàng</h2>

          <!-- ĐỊA CHỈ TỪ HỒ SƠ -->
          <div v-if="profile && (profile.address || profile.phone)" class="profile-pick">
            <button
              type="button"
              class="profile-card"
              :class="{ selected: addressMode === 'profile' }"
              @click="useProfileAddress"
            >
              <span class="profile-radio"></span>
              <span class="profile-info">
                <span class="profile-name">{{ profile.fullName || "Địa chỉ trong hồ sơ" }}</span>
                <span class="profile-phone">{{ profile.phone || "Chưa có số điện thoại" }}</span>
                <span class="profile-address">{{ profile.address || "Chưa có địa chỉ" }}</span>
              </span>
            </button>

            <button
              type="button"
              class="profile-manual-link"
              :class="{ active: addressMode === 'manual' }"
              @click="useManualAddress"
            >
              {{ addressMode === "manual" ? "Đang nhập địa chỉ khác" : "Nhập địa chỉ khác" }}
            </button>
          </div>

          <template v-if="addressMode === 'manual' || !profile || (!profile.address && !profile.phone)">
            <input v-model="form.shippingAddress" placeholder="Địa chỉ giao hàng" />
            <input v-model="form.phone" placeholder="Số điện thoại" />
          </template>

          <input v-model="form.note" placeholder="Ghi chú (tuỳ chọn)" />

          <button class="btn-cod" :disabled="loading" @click="placeOrder">
            {{ loading ? "Đang xử lý..." : "Thanh toán COD" }}
          </button>

          <button class="btn-vnpay" :disabled="loading" @click="payVNPay">
            VNPay
          </button>
        </div>

        <!-- RIGHT -->
        <div class="right">
          <h2>Sản phẩm đã chọn ({{ checkoutItems.length }})</h2>

          <div v-for="(item, index) in checkoutItems" :key="index" class="item">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <b>{{ formatPrice(item.price * item.quantity) }}₫</b>
          </div>

          <!-- DÙNG ĐIỂM -->
          <div class="point-redeem-box" v-if="userBalance > 0">
            <div class="redeem-header">
              <label class="redeem-toggle">
                <input type="checkbox" v-model="usePoints" @change="onTogglePoints" />
                <span>Dùng điểm giảm giá</span>
              </label>
              <span class="redeem-balance">
                Bạn có <b>{{ userBalance.toLocaleString("vi-VN") }}</b> điểm
              </span>
            </div>

            <div v-if="usePoints" class="redeem-input-row">
              <input
                type="number"
                v-model.number="pointsInput"
                :max="maxPoints"
                :min="0"
                placeholder="Nhập số điểm muốn dùng"
                class="redeem-input"
                @input="clampPoints"
              />
              <button class="redeem-max" @click="pointsInput = maxPoints">
                Tối đa
              </button>
            </div>

            <div v-if="usePoints && redeemPreview.pointsUsed > 0" class="redeem-result">
              Dùng <b>{{ redeemPreview.pointsUsed.toLocaleString("vi-VN") }} điểm</b>
              → giảm <b>{{ formatPrice(redeemPreview.discount) }}₫</b>
            </div>

            <div v-if="usePoints && pointsInput > 0 && redeemPreview.pointsUsed < pointsInput" class="redeem-warn">
              Chỉ được dùng tối đa {{ maxPoints.toLocaleString("vi-VN") }} điểm (20% giá trị đơn)
            </div>
          </div>

          <!-- TỔNG TIỀN -->
          <div class="total">
            <div class="total-row">
              <span>Tạm tính:</span>
              <span>{{ formatPrice(checkoutTotal) }}₫</span>
            </div>
            <div class="total-row discount" v-if="redeemPreview.discount > 0">
              <span>Giảm điểm ({{ redeemPreview.pointsUsed }} điểm):</span>
              <span>-{{ formatPrice(redeemPreview.discount) }}₫</span>
            </div>
            <div class="total-row final">
              <span>Thành tiền:</span>
              <span class="price">{{ formatPrice(finalTotal) }}₫</span>
            </div>
          </div>

          <!-- ĐIỂM ƯỚC TÍNH SAU ĐƠN -->
          <div class="point-preview" v-if="checkoutTotal > 0">
            <span class="preview-ico"></span>
            <span>
              Nhận <b>+{{ Math.floor(checkoutTotal / 1000).toLocaleString("vi-VN") }} điểm</b>
              sau khi đơn giao thành công
            </span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import OrderService from "@/services/order.service";
import PointService from "@/services/point.service";

const router = useRouter();

const loading        = ref(false);
const showSuccessAnim = ref(false);
const barWidth       = ref(0);

// Lưu lại để hiển thị trong overlay thành công
const lastPointsUsed   = ref(0);
const lastDiscount     = ref(0);
const lastOriginalPrice = ref(0);

// ── Sản phẩm checkout ──
const checkoutItems = ref([]);

const checkoutTotal = computed(() =>
  checkoutItems.value.reduce((s, i) => s + i.price * i.quantity, 0)
);
const checkoutQuantity = computed(() =>
  checkoutItems.value.reduce((s, i) => s + i.quantity, 0)
);

// ── Form ──
const form = ref({ shippingAddress: "", phone: "", note: "" });

// ── Địa chỉ / SĐT từ hồ sơ user ──
const profile     = ref(null);      // { fullName, phone, address }
const addressMode = ref("profile"); // "profile" | "manual"

const useProfileAddress = () => {
  if (!profile.value) return;
  form.value.shippingAddress = profile.value.address || "";
  form.value.phone           = profile.value.phone || "";
  addressMode.value = "profile";
};

const useManualAddress = () => {
  addressMode.value = "manual";
  form.value.shippingAddress = "";
  form.value.phone = "";
};

// ── Điểm ──
const userBalance  = ref(0);
const usePoints    = ref(false);
const pointsInput  = ref(0);

const maxPoints = computed(() => {
  const maxByOrder = Math.floor((checkoutTotal.value * 0.2) / 100);
  return Math.min(userBalance.value, maxByOrder);
});

const redeemPreview = computed(() => {
  if (!usePoints.value || pointsInput.value <= 0)
    return { pointsUsed: 0, discount: 0 };
  return PointService.calcRedeem(pointsInput.value, userBalance.value, checkoutTotal.value);
});

const finalTotal = computed(() =>
  Math.max(0, checkoutTotal.value - redeemPreview.value.discount)
);

// ── Helpers ──
const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v || 0);

const clampPoints = () => {
  if (pointsInput.value > maxPoints.value) pointsInput.value = maxPoints.value;
  if (pointsInput.value < 0) pointsInput.value = 0;
};

const onTogglePoints = () => {
  if (!usePoints.value) pointsInput.value = 0;
};

// ── Mount ──
onMounted(async () => {
  const raw = sessionStorage.getItem("checkoutItems");
  if (!raw) {
    alert("Không có sản phẩm nào được chọn");
    router.push("/cart");
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.length === 0) {
      alert("Không có sản phẩm nào được chọn");
      router.push("/cart");
      return;
    }
    checkoutItems.value = parsed;
  } catch {
    router.push("/cart");
    return;
  }

  // Load số dư điểm
  try {
    const bal = await PointService.getBalance();
    userBalance.value = bal.balance || 0;
  } catch {
    // Không có điểm hoặc chưa đăng nhập → ẩn section điểm
    userBalance.value = 0;
  }

  // Load hồ sơ user đã đăng nhập (giống ProfileView.vue) từ localStorage
  try {
    const raw = localStorage.getItem("user");
    const data = raw ? JSON.parse(raw) : null;
    if (data) {
      profile.value = {
        fullName: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
      };
      if (profile.value.address || profile.value.phone) {
        useProfileAddress();
      } else {
        addressMode.value = "manual";
      }
    } else {
      addressMode.value = "manual";
    }
  } catch {
    profile.value = null;
    addressMode.value = "manual";
  }
});

// ── Validate ──
const validate = () => {
  if (!form.value.shippingAddress) { alert("Vui lòng nhập địa chỉ giao hàng"); return false; }
  if (!form.value.phone)           { alert("Vui lòng nhập số điện thoại");     return false; }
  return true;
};

const normalize = (r) => r?.data ?? r;

// ── Success overlay ──
const showOrderSuccess = () => {
  showSuccessAnim.value = true;
  barWidth.value = 0;
  setTimeout(() => { barWidth.value = 100; }, 50);
  setTimeout(() => {
    sessionStorage.removeItem("checkoutItems");
    showSuccessAnim.value = false;
    router.push("/orders");
  }, 2800);
};

// ── Đặt hàng COD ──
const placeOrder = async () => {
  if (!validate()) return;
  loading.value = true;
  try {
    const pointsToUse = usePoints.value ? redeemPreview.value.pointsUsed : 0;

    const res = await OrderService.createOrder({
      ...form.value,
      paymentMethod: "COD",
      items: checkoutItems.value,
      pointsToUse,
    });

    const order = normalize(res);
    if (!order?._id) throw new Error("Lỗi tạo đơn");

    // Lưu thông tin cho overlay
    lastPointsUsed.value    = pointsToUse;
    lastDiscount.value      = redeemPreview.value.discount;
    lastOriginalPrice.value = checkoutTotal.value;

    showOrderSuccess();
  } catch (err) {
    alert(err.message || "Đặt hàng thất bại");
  } finally {
    loading.value = false;
  }
};

// ── Thanh toán VNPay ──
const payVNPay = async () => {
  if (!validate()) return;
  loading.value = true;
  try {
    const pointsToUse = usePoints.value ? redeemPreview.value.pointsUsed : 0;

    const res = await OrderService.createOrder({
      ...form.value,
      paymentMethod: "VNPAY",
      items: checkoutItems.value,
      pointsToUse,
    });

    const order = normalize(res);
    const orderId = order?._id;
    if (!orderId) throw new Error("Không tạo được đơn hàng");

    sessionStorage.removeItem("checkoutItems");

    const paymentRes = await fetch("http://localhost:3000/api/payment/create-vnpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, amount: finalTotal.value }),
    });

    const data = await paymentRes.json();
    if (!data?.payment_url) throw new Error("Lỗi khởi tạo VNPay");

    window.location.href = data.payment_url;
  } catch (err) {
    alert(err.message || "Thanh toán thất bại");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>

/* ===== ORDER SUCCESS OVERLAY ===== */
.point-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
}

.point-card {
  background: white; border-radius: 28px;
  padding: 48px 40px; text-align: center;
  box-shadow: 0 32px 80px rgba(0,0,0,0.25);
  min-width: 320px; max-width: 420px;
  animation: popIn .4s cubic-bezier(.34,1.56,.64,1);
}

@keyframes popIn {
  from { transform: scale(.7); opacity: 0; }
  to   { transform: scale(1);  opacity: 1; }
}

.point-star {
  font-size: 3.5rem; display: block; margin-bottom: 12px;
  animation: spin 1s ease-out;
}

@keyframes spin {
  from { transform: rotate(-180deg) scale(0); opacity: 0; }
  to   { transform: rotate(0deg) scale(1);    opacity: 1; }
}

.point-title { font-size: 1.3rem; font-weight: 900; color: #0f172a; margin-bottom: 12px; }
.point-msg   { font-size: .9rem;  color: #475569; margin-bottom: 6px; }
.point-detail { font-size: .85rem; color: #94a3b8; margin: 12px 0 24px; }

.point-bar-wrap {
  height: 6px; background: #f1f5f9;
  border-radius: 999px; overflow: hidden; margin-bottom: 16px;
}
.point-bar {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 999px;
  transition: width 2.6s ease;
}
.point-sub { font-size: .8rem; color: #94a3b8; }

/* ===== TRANSITION ===== */
.point-fade-enter-active, .point-fade-leave-active { transition: opacity .3s; }
.point-fade-enter-from, .point-fade-leave-to { opacity: 0; }

/* ===== PAGE ===== */
.checkout-page {
  min-height: 100vh;
  display: flex; justify-content: center; align-items: center;
  background: linear-gradient(135deg, #c7d2fe, #fbcfe8, #ddd6fe);
  position: relative; overflow: hidden;
  padding: 40px 16px;
}

.checkout-page::before {
  content: "";
  position: absolute; inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 40%),
    radial-gradient(circle at 80% 30%, rgba(236,72,153,0.25), transparent 40%),
    radial-gradient(circle at 50% 80%, rgba(34,197,94,0.2),   transparent 40%);
  z-index: 0;
}

/* ===== CARD ===== */
.checkout-card {
  width: 100%; max-width: 900px;
  background: rgba(255,255,255,0.75); backdrop-filter: blur(25px);
  border-radius: 24px; overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.25);
  position: relative; z-index: 10;
}

.header {
  text-align: center; padding: 20px;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  color: white;
}
.header h1 { font-size: 1.4rem; font-weight: 900; margin-bottom: 4px; }
.header p  { font-size: .85rem; opacity: .85; }

.content { display: grid; grid-template-columns: 1fr 1fr; }

/* LEFT */
.left {
  padding: 24px; display: flex; flex-direction: column; gap: 12px;
}
.left h2 { font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }

.left input {
  padding: 10px 14px; border-radius: 10px;
  border: 1.5px solid #e2e8f0; transition: .2s;
  font-size: .9rem; outline: none;
}
.left input:focus {
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99,102,241,0.15);
}

/* ĐỊA CHỈ TỪ HỒ SƠ */
.profile-pick { display: flex; flex-direction: column; gap: 8px; }

.profile-card {
  display: flex; align-items: flex-start; gap: 10px;
  text-align: left; width: 100%;
  padding: 12px 14px; border-radius: 12px;
  background: white; border: 1.5px solid #e2e8f0;
  cursor: pointer; transition: .18s;
}
.profile-card:hover { border-color: #a5b4fc; }
.profile-card.selected {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  background: #f5f3ff;
}

.profile-radio {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid #cbd5e1; flex-shrink: 0; margin-top: 2px;
  transition: .18s; position: relative;
}
.profile-card.selected .profile-radio {
  border-color: #6366f1;
}
.profile-card.selected .profile-radio::after {
  content: ""; position: absolute; inset: 3px;
  border-radius: 50%; background: #6366f1;
}

.profile-info { display: flex; flex-direction: column; gap: 2px; }
.profile-name    { font-weight: 700; font-size: .88rem; color: #0f172a; }
.profile-phone   { font-size: .82rem; color: #475569; }
.profile-address { font-size: .82rem; color: #64748b; }

.profile-manual-link {
  align-self: flex-start;
  background: none; border: none;
  color: #6366f1; font-size: .82rem; font-weight: 700;
  cursor: pointer; padding: 2px 0;
}
.profile-manual-link:hover { text-decoration: underline; }
.profile-manual-link.active { color: #0f172a; }

.btn-cod {
  background: #0f172a; color: white;
  padding: 11px; border-radius: 12px;
  border: none; cursor: pointer; font-weight: 700;
  transition: .2s;
}
.btn-cod:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}
.btn-cod:disabled { opacity: .6; cursor: not-allowed; }

.btn-vnpay {
  background: linear-gradient(90deg, #22c55e, #10b981);
  color: white; padding: 11px; border-radius: 12px;
  border: none; cursor: pointer; font-weight: 700;
  transition: .2s;
}
.btn-vnpay:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16,185,129,0.3);
}
.btn-vnpay:disabled { opacity: .6; cursor: not-allowed; }

/* RIGHT */
.right { padding: 24px; background: #f8fafc; display: flex; flex-direction: column; gap: 0; }
.right h2 { font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 14px; }

.item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; background: white; border-radius: 12px;
  margin-bottom: 8px; transition: .2s; font-size: .88rem;
}
.item:hover { transform: translateX(4px); }

/* DÙNG ĐIỂM */
.point-redeem-box {
  margin: 14px 0; padding: 14px 16px;
  background: #fffbeb; border: 1.5px solid #fde68a;
  border-radius: 14px;
}

.redeem-header {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 10px;
}

.redeem-toggle {
  display: flex; align-items: center; gap: 8px;
  font-weight: 700; font-size: .9rem; cursor: pointer;
  color: #78350f;
}
.redeem-toggle input[type="checkbox"] { accent-color: #f59e0b; width: 16px; height: 16px; }

.redeem-balance { font-size: .78rem; color: #92400e; }

.redeem-input-row {
  display: flex; gap: 8px; margin-bottom: 8px;
}
.redeem-input {
  flex: 1; padding: 8px 12px;
  border-radius: 10px; border: 1.5px solid #fcd34d;
  font-size: .9rem; outline: none; background: white;
}
.redeem-input:focus { border-color: #f59e0b; }

.redeem-max {
  padding: 8px 14px; background: #f59e0b; color: white;
  border: none; border-radius: 10px;
  font-size: .82rem; font-weight: 700; cursor: pointer;
  transition: .15s;
}
.redeem-max:hover { background: #d97706; }

.redeem-result {
  font-size: .85rem; color: #065f46;
  background: #d1fae5; border-radius: 8px;
  padding: 6px 10px; margin-top: 4px;
}
.redeem-warn {
  font-size: .82rem; color: #b45309;
  margin-top: 6px;
}

/* TỔNG TIỀN */
.total {
  margin-top: 14px; padding-top: 14px;
  border-top: 1.5px dashed #e2e8f0;
  display: flex; flex-direction: column; gap: 6px;
}
.total-row {
  display: flex; justify-content: space-between;
  font-size: .88rem; color: #475569;
}
.total-row.discount { color: #16a34a; font-weight: 700; }
.total-row.final    { margin-top: 4px; }
.total-row.final span { font-weight: 900; font-size: 1rem; color: #0f172a; }
.price { color: #ef4444 !important; font-size: 1.25rem !important; }

/* ĐIỂM ƯỚC TÍNH */
.point-preview {
  margin-top: 14px; padding: 10px 14px;
  background: #fefce8; border: 1.5px solid #fde68a;
  border-radius: 12px; font-size: .85rem; color: #92400e;
  display: flex; align-items: center; gap: 8px;
}
.preview-ico { font-size: 1.1rem; }

/* MOBILE */
@media (max-width: 768px) {
  .content { grid-template-columns: 1fr; }
  .right { border-top: 1.5px solid #e8edf8; }
}
</style>