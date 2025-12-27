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
    <div
      class="lock-screen"
      :style="lockStyle"
    >
      <div class="time">{{ time }}</div>
      <div class="date">{{ date }}</div>
    </div>

    <div class="unlock-hint">
      ↑ Vuốt lên để mở khóa
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const emit = defineEmits(["unlock"]);

defineProps({
  time: String,
  date: String,
});

const startY = ref(0);
const offsetY = ref(0);
const dragging = ref(false);

/* ===== style động ===== */
const lockStyle = computed(() => ({
  transform: `translateY(${-offsetY.value}px) scale(${1 - offsetY.value / 900})`,
  opacity: 1 - offsetY.value / 220,
}));

/* ===== helpers ===== */
const getY = (e) =>
  e.touches ? e.touches[0].clientY : e.clientY;

/* ===== events ===== */
const onStart = (e) => {
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
    emit("unlock");
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
  transition: transform 0.25s ease, opacity 0.25s ease;
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
  opacity: 0.65;
  animation: hintPulse 1.6s infinite;
}

@keyframes hintPulse {
  0% { opacity: .35; }
  50% { opacity: .9; }
  100% { opacity: .35; }
}
</style>
