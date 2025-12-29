<template>
  <div class="time-on-page">
    ⏱ {{ formattedTime }}

    <!-- Lời thoại -->
    <transition name="fade-up">
      <div v-if="showQuote" class="quote">
        {{ currentQuote }}
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "TimeOnPage",
  data() {
    return {
      seconds: 0,
      timer: null,

      showQuote: false,
      currentQuote: "",

      quotes: [
        "Vẫn đang tập trung đó chứ?",
        "Nghỉ tí cho đỡ mỏi mắt nè",
        "Vào guồng rồi đó!",
        "Não đang load kiến thức...",
        "Thời gian trôi nhanh ghê",
        "Đang làm việc rất chăm!",
      ],
    };
  },
  computed: {
    formattedTime() {
      const m = Math.floor(this.seconds / 60);
      const s = this.seconds % 60;
      return `${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    },
  },
  methods: {
    showRandomQuote() {
      const index = Math.floor(Math.random() * this.quotes.length);
      this.currentQuote = this.quotes[index];
      this.showQuote = true;

      clearTimeout(this._quoteTimer);
      this._quoteTimer = setTimeout(() => {
        this.showQuote = false;
      }, 3000);
    },
  },
  mounted() {
    this.timer = setInterval(() => {
      this.seconds++;

      // mỗi 1 phút
      if (this.seconds % 60 === 0) {
        this.showRandomQuote();
      }
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
    clearTimeout(this._quoteTimer);
  },
};
</script>

<style scoped>
.time-on-page {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9999;

  background: linear-gradient(135deg, #111827, #1f2933);
  color: #f9fafb;

  padding: 10px 18px;
  border-radius: 999px;

  font-weight: 700;
  font-size: 0.9rem;

  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);

  transition: transform 0.25s, box-shadow 0.25s;
}

.time-on-page:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 18px 45px rgba(99, 102, 241, 0.6);
}

/* Quote bubble */
.quote {
  position: absolute;
  bottom: 110%;
  left: 0;

  background: #111827;
  padding: 8px 14px;
  border-radius: 12px;

  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;

  box-shadow: 0 10px 25px rgba(0,0,0,.4);
}

/* Animation */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity .25s, transform .25s;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
