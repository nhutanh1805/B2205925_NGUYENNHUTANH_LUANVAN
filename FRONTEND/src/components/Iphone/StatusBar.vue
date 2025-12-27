<template>
  <div class="status-icons-top">
    <div class="icons-row">
      <i class="bi bi-wifi"></i>
      <i class="bi bi-battery-full"></i>
    </div>
    <div class="status-bar-line"></div>
  </div>
</template>

<style scoped>
.status-icons-top {
  position: absolute;
  top: 7px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  color: white;
}

.icons-row {
  display: flex;
  gap: 8px;
}

.icons-row i {
  font-size: 0.8rem;
}

.status-bar-line {
  width: 30px;
  height: 1px;
  background: rgba(255,255,255,.9);
  border-radius: 2px;
}
</style>
