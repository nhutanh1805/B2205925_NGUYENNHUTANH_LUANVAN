<template>
  <div
    class="screen"
    @mousedown="onStart"
    @mousemove="onMove"
    @mouseup="onEnd"
    @mouseleave="onEnd"
    @touchstart="onStart"
    @touchmove="onMove"
    @touchend="onEnd"
  >
    <div class="lock-screen" :style="lockStyle">
      <div class="time">{{ time }}</div>
      <div class="date">{{ date }}</div>
    </div>

    <div class="unlock-hint" :style="hintStyle">
      <span class="hint-arrow">↑</span> Vuốt lên để mở khoá
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// 'start-face-id' truyền kèm unlockCallback để DynamicIsland gọi lại khi xong
const emit = defineEmits(["unlock", "start-face-id"]);

defineProps({ time: String, date: String });

const startY  = ref(0);
const offsetY = ref(0);
const dragging = ref(false);
const pending  = ref(false); // đang chờ Face ID → khoá swipe

/* ── Style động ── */
const lockStyle = computed(() => ({
  transform: `translateY(${-offsetY.value}px) scale(${1 - offsetY.value / 900})`,
  opacity: 1 - offsetY.value / 220,
  transition: dragging.value ? "none" : "transform 0.3s ease, opacity 0.3s ease",
}));

const hintStyle = computed(() => ({
  opacity: Math.max(0, 0.65 - offsetY.value / 100),
  transition: dragging.value ? "none" : "opacity 0.3s ease",
}));

/* ── Helpers ── */
const getY = (e) => e.touches ? e.touches[0].clientY : e.clientY;

/* ── Events ── */
const onStart = (e) => {
  if (pending.value) return;
  dragging.value = true;
  startY.value = getY(e);
};

const onMove = (e) => {
  if (!dragging.value) return;
  const delta = startY.value - getY(e);
  if (delta > 0) offsetY.value = Math.min(delta, 260);
};

const onEnd = () => {
  if (!dragging.value) return;
  dragging.value = false;

  if (offsetY.value > 140) {
    pending.value = true;

    // Emit lên LeftSidebar kèm callback:
    // DynamicIsland sẽ gọi callback này khi Face ID thành công → unlock
    emit("start-face-id", () => {
      emit("unlock");
      pending.value = false;
      offsetY.value = 0;
    });
  } else {
    offsetY.value = 0;
  }
};
</script>

<style scoped>
.screen {
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
}

.lock-screen {
  margin-top: 70px;
  text-align: center;
  color: white;
  will-change: transform;
}

.time {
  font-size: 3.4rem;
  font-weight: 600;
  letter-spacing: -0.6px;
}

.date {
  font-size: 1.05rem;
  opacity: 0.95;
  margin-top: 4px;
}

/* Hint */
.unlock-hint {
  position: absolute;
  bottom: 48px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: white;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hint-arrow {
  animation: hintBounce 1.6s ease-in-out infinite;
}

@keyframes hintBounce {
  0%,100% { opacity: 0.35; transform: translateY(0); }
  50%     { opacity: 0.9;  transform: translateY(-4px); }
}
</style>