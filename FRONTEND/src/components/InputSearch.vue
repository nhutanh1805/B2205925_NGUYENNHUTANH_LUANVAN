<template>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <input
      type="text"
      v-model="searchQuery"
      @input="handleInput"
      placeholder="Tìm kiếm sản phẩm (tên, hãng, dung lượng...)"
      class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["search"]);
const searchQuery = ref("");
let timeoutId = null;

const handleInput = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    emit("search", searchQuery.value.trim());
  }, 500);
};
</script>

<style scoped>
</style>