<template>
  <div class="success-page">

    <div v-if="loading" class="card">
      <div class="spinner"></div>
      <p class="muted">Đang xác nhận thanh toán...</p>
    </div>

    <div v-else class="card">

      <div class="check-wrap">
        <svg viewBox="0 0 52 52" width="56" height="56">
          <circle class="check-circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="check-tick" fill="none" d="M14 27l8 8 16-16"/>
        </svg>
      </div>

      <h1 class="title">Thanh toán thành công</h1>
      <p class="muted">Đơn hàng của bạn đã được xác nhận</p>

      <!-- Thông báo điểm sẽ cộng sau khi giao — không hiện số điểm ngay -->
      <div class="point-badge">
        Điểm thưởng sẽ được cộng sau khi đơn hàng giao thành công
      </div>

      <div class="actions">
        <router-link to="/orders" class="btn-primary">Xem đơn hàng</router-link>
        <router-link to="/products" class="btn-secondary">Tiếp tục mua sắm</router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const loading = ref(true);

onMounted(() => {
  // Không cần đọc points từ query nữa vì điểm chưa được tích tại thời điểm này
  loading.value = false;
});
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: #f5f5f5;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 40px 36px;
  text-align: center;
  width: 100%; max-width: 400px;
  box-shadow: 0 4px 20px rgba(0,0,0,.08);
}

/* SPINNER */
.spinner {
  width: 40px; height: 40px; border-radius: 50%;
  border: 3px solid #e5e7eb;
  border-top-color: #22c55e;
  animation: spin .8s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* CHECKMARK */
.check-wrap { margin-bottom: 16px; }

.check-circle {
  stroke: #22c55e; stroke-width: 2;
  stroke-dasharray: 157; stroke-dashoffset: 157;
  animation: drawCircle .5s ease forwards;
}
@keyframes drawCircle { to { stroke-dashoffset: 0; } }

.check-tick {
  stroke: #22c55e; stroke-width: 3;
  stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 40; stroke-dashoffset: 40;
  animation: drawTick .3s ease .4s forwards;
}
@keyframes drawTick { to { stroke-dashoffset: 0; } }

.title { font-size: 1.3rem; font-weight: 700; color: #111; margin-bottom: 6px; }
.muted { color: #9ca3af; font-size: .85rem; margin-bottom: 20px; }

/* POINT */
.point-badge {
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: .9rem;
  color: #92400e;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* ACTIONS */
.actions { display: flex; flex-direction: column; gap: 8px; }

.btn-primary {
  display: block; padding: 12px;
  background: #22c55e; color: white;
  font-weight: 700; border-radius: 10px;
  transition: background .2s;
}
.btn-primary:hover { background: #16a34a; }

.btn-secondary {
  display: block; padding: 11px;
  background: white;
  border: 1px solid #e5e7eb; color: #6b7280;
  font-weight: 600; border-radius: 10px;
  transition: background .2s;
}
.btn-secondary:hover { background: #f9fafb; }
</style>