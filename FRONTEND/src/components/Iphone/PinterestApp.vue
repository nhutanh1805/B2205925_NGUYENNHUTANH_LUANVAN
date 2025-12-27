<template>
  <div class="pinterest-app">
    <!-- Nút quay về nhỏ (hiện khi hover/chuột di chuyển) -->
    <button class="back-button" @click="$emit('close')">←</button>

    <!-- Masonry grid ảnh - giờ chiếm full chiều cao -->
    <div class="pins-grid" @scroll="handleScroll">
      <div
        class="pin-item"
        v-for="(pin, index) in pins"
        :key="index"
        @click="openFullImage(pin)"
      >
        <img :src="pin" alt="Pin" />
      </div>

      <!-- Loading thêm -->
      <div v-if="loading" class="loading">Đang tải thêm...</div>
    </div>

    <!-- Full screen image overlay -->
    <transition name="fade">
      <div v-if="fullImage" class="full-image-overlay" @click="closeFullImage">
        <button class="full-back-button" @click.stop="$emit('close')">←</button>
        <img :src="fullImage" class="full-image" alt="Full pin" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

defineEmits(["close"]);

const pins = ref([]);
const loading = ref(false);
const fullImage = ref(null); // Ảnh đang mở full
let currentId = 100;

const fetchPins = () => {
  loading.value = true;
  const newPins = [];

  for (let i = 0; i < 15; i++) {
    currentId++;
    const width = Math.floor(Math.random() * 200) + 400;
    const height = Math.floor(Math.random() * 600) + 600;
    const url = `https://picsum.photos/${width}/${height}?random=${currentId}`;
    newPins.push(url);
  }

  pins.value = [...pins.value, ...newPins];
  loading.value = false;
};

const handleScroll = (e) => {
  const element = e.target;
  if (element.scrollHeight - element.scrollTop <= element.clientHeight + 300) {
    if (!loading.value) fetchPins();
  }
};

const openFullImage = (imageUrl) => {
  fullImage.value = imageUrl;
};

const closeFullImage = () => {
  fullImage.value = null;
};

onMounted(() => {
  fetchPins();
});
</script>

<style scoped>
.pinterest-app {
  position: absolute;
  inset: 0;
  background: #fff;
  overflow: hidden;
  z-index: 50;
  display: flex;
  flex-direction: column;
}

/* Nút back chính (góc trái trên) - hiện khi hover */
.back-button {
  position: absolute;
  top: 20px;
  left: 16px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  cursor: pointer;
}

.pinterest-app:hover .back-button {
  opacity: 1;
  pointer-events: auto;
}

/* Masonry grid - giờ full chiều cao vì không còn header */
.pins-grid {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  column-count: 2;
  column-gap: 10px;
  scrollbar-width: none;
}

.pins-grid::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .pins-grid {
    column-count: 3;
  }
}

.pin-item {
  break-inside: avoid;
  margin-bottom: 10px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.pin-item:hover {
  transform: scale(1.03);
}

.pin-item img {
  width: 100%;
  height: auto;
  display: block;
}

/* Loading */
.loading {
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 1rem;
}

/* Full screen image overlay */
.full-image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  cursor: pointer;
}

.full-image {
  max-width: 95%;
  max-height: 95vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
}

.full-back-button {
  position: absolute;
  top: 20px;
  left: 16px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 210;
  cursor: pointer;
}

/* Fade transition cho full image */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>