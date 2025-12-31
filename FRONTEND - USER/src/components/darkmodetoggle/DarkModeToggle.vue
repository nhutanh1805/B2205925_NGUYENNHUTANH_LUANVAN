<template>
  <div class="darkmode-toggle" @click="toggle">
    <input
      type="checkbox"
      :checked="isDark"
      class="toggle-input"
      hidden
      aria-label="Chuyển chế độ sáng/tối"
    />
    <div class="toggle-track">
      <div class="toggle-thumb">
        <i class="icon sun-icon fas fa-sun"></i>
        <i class="icon moon-icon fas fa-moon"></i>
      </div>
      <div class="stars">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DarkModeToggle",
  props: {
    isDark: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    toggle() {
      this.$emit("toggle-dark");
    },
  },
};
</script>

<style scoped>
.darkmode-toggle {
  cursor: pointer;
  display: inline-block;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.toggle-track {
  position: relative;
  width: 70px;
  height: 36px;
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
  border-radius: 50px;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 30px;
  height: 30px;
  background: white;
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.icon {
  font-size: 16px;
  color: #fbbf24;
  transition: all 0.3s ease;
  position: absolute;
}

.sun-icon {
  opacity: 1;
  transform: rotate(0deg);
}

.moon-icon {
  opacity: 0;
  transform: rotate(90deg);
  color: #e2e8f0;
}

input:checked ~ .toggle-track {
  background: linear-gradient(145deg, #1e293b, #0f172a);
}

input:checked ~ .toggle-track .toggle-thumb {
  transform: translateX(34px);
  background: #1e293b;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

input:checked ~ .toggle-track .sun-icon {
  opacity: 0;
  transform: rotate(-90deg);
}

input:checked ~ .toggle-track .moon-icon {
  opacity: 1;
  transform: rotate(0deg);
  color: #94a3b8;
}

.stars {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
}

input:checked ~ .toggle-track .stars {
  opacity: 1;
}

.stars span {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 3s infinite alternate;
}

.stars span:nth-child(1) {
  width: 3px;
  height: 3px;
  top: 8px;
  right: 12px;
  animation-delay: 0s;
}

.stars span:nth-child(2) {
  width: 2px;
  height: 2px;
  top: 18px;
  right: 8px;
  animation-delay: 1s;
}

.stars span:nth-child(3) {
  width: 2.5px;
  height: 2.5px;
  top: 12px;
  right: 20px;
  animation-delay: 2s;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
</style>