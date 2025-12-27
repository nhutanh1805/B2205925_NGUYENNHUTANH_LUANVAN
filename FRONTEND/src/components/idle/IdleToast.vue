<template>
  <transition name="fade">
    <div v-if="visible" class="idle-toast">
      <div class="content">
        <span class="eye"></span>
        <span class="text">Bạn vẫn đang xem chứ?? Nếu bạn đang đứng im có lẽ là shop chúng mình quá chán chăng??</span>
      </div>
      <div class="progress"></div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "IdleToast",
  data() {
    return {
      visible: false,
      _t: null,
    };
  },
  methods: {
    show() {
      this.visible = true;
      clearTimeout(this._t);

      this._t = setTimeout(() => {
        this.visible = false;
      }, 5000);
    },
  },
};
</script>

<style scoped>
.idle-toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  min-width: 260px;
  padding: 14px 18px 18px;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    rgba(17,24,39,.9),
    rgba(30,41,59,.9)
  );
  backdrop-filter: blur(12px);
  color: white;
  font-weight: 600;
  z-index: 9999;
  box-shadow:
    0 20px 40px rgba(0,0,0,.35),
    inset 0 0 0 1px rgba(255,255,255,.06);
  overflow: hidden;
}

/* CONTENT */
.content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.eye {
  font-size: 1.3rem;
  animation: blink 1.8s infinite;
}

.text {
  font-size: .95rem;
  opacity: .95;
}

/* PROGRESS BAR */
.progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  background: linear-gradient(
    90deg,
    #3b82f6,
    #8b5cf6,
    #ec4899
  );
  animation: progress 3s linear forwards;
  opacity: .85;
}

/* ANIMATIONS */
@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

@keyframes blink {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* TRANSITION */
.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s ease, transform .3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(.96);
}
</style>
