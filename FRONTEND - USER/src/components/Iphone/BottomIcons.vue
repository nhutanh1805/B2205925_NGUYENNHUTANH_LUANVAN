<template>
  <div class="bottom-icons">
    <div class="icon-circle" @click="flash">
      <i class="bi bi-lightbulb-fill"></i>
    </div>
    <div class="icon-circle">
      <i class="bi bi-camera-fill"></i>
    </div>
  </div>
</template>

<script setup>
const flash = () => alert("Flashlight ON (mock)");
</script>

<style scoped>
.bottom-icons {
  position: absolute;
  bottom: 22px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
}

.icon-circle {
  width: 36px;
  height: 36px;
  background: rgba(0,0,0,.45);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
</style>
