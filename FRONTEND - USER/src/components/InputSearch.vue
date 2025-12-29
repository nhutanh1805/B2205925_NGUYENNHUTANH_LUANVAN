<script setup>
defineProps({
  modelValue: { type: String, default: "" }
});

const emit = defineEmits(["update:modelValue", "submit"]);

function onInput(e) {
  emit("update:modelValue", e.target.value);
}

function submit() {
  emit("submit");
}
</script>

<template>
  <div class="search-wrapper">
    <i class="icon-search">🔍</i>

    <input
      type="text"
      class="search-input"
      placeholder="Tìm theo tên, hãng, IMEI..."
      :value="modelValue"
      @input="onInput"
      @keyup.enter="submit"
    />

    <button
      v-if="modelValue"
      class="clear-btn"
      @click="emit('update:modelValue', '')"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,.08);
  border: 2px solid transparent;
  transition: .25s;
}

.search-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 12px 30px rgba(59,130,246,.35);
}

.icon-search {
  font-size: 1.1rem;
  opacity: .5;
  margin-right: 10px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: .95rem;
  font-weight: 500;
}

.clear-btn {
  background: #f1f5f9;
  border-radius: 999px;
  width: 26px;
  height: 26px;
  font-size: .75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: .2s;
}

.clear-btn:hover {
  background: #ef4444;
  color: white;
}
</style>
