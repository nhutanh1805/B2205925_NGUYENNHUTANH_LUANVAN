<template>
  <div class="control-panel">
    <h4>⚙ Hiển thị Component</h4>

    <label v-for="(value, key) in controls" :key="key">
      <input type="checkbox" v-model="controls[key]" />
      {{ labels[key] }}
    </label>
  </div>
</template>

<script>
export default {
  name: "ComponentControlPanel",
  props: {
    controls: Object,
  },
  data() {
    return {
      labels: {
        header: "Header",
        time: "Time On Page",
        iphone: "iPhone UI",
        idle: "Idle Toast",
      },
    };
  },
};
</script>

<style scoped>
.control-panel {
  position: fixed;
  top: 80px;
  right: 16px;
  width: 220px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,.15);
  z-index: 9999;
}
.control-panel label {
  display: flex;
  gap: 8px;
  margin: 8px 0;
  cursor: pointer;
}
</style>
