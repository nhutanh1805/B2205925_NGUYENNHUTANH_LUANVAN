<template>
  <div class="languageswitcher" ref="wrapper">
    <button class="switcher-btn" @click="toggleDropdown">
      <span class="flag">{{ currentFlag }}</span>
      <span class="lang-name">{{ currentLangName }}</span>
      <i class="fas fa-chevron-down arrow" :class="{ rotated: isOpen }"></i>
    </button>

    <transition name="dropdown">
      <div class="dropdown-menu" v-show="isOpen">
        <div
          class="dropdown-item"
          v-for="lang in languages"
          :key="lang.code"
          @click="select(lang.code)"
          :class="{ active: lang.code === currentLang }"
        >
          <span class="flag">{{ lang.flag }}</span>
          <span class="lang-name">{{ lang.name }}</span>
          <i class="fas fa-check check" v-if="lang.code === currentLang"></i>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showSuccess" class="success-noti">
        <i class="fas fa-check-circle"></i>
        Đã chuyển sang {{ currentLangName }}
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "LanguageSwitcher",
  props: {
    currentLang: {
      type: String,
      required: true,
      default: "vi",
    },
  },
  data() {
    return {
      isOpen: false,
      showSuccess: false,
      languages: [
        { code: "vi", flag: "🇻🇳", name: "Tiếng Việt" },
        { code: "en", flag: "🇬🇧", name: "English" },
      ],
    };
  },
  computed: {
    currentFlag() {
      return this.languages.find(l => l.code === this.currentLang)?.flag || "🌍";
    },
    currentLangName() {
      return this.languages.find(l => l.code === this.currentLang)?.name || this.currentLang.toUpperCase();
    },
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    select(code) {
      if (code === this.currentLang) {
        this.isOpen = false;
        return;
      }

      this.$emit("change-lang", code);
      this.isOpen = false;

      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, 2000);
    },
    handleClickOutside(event) {
      if (this.$refs.wrapper && !this.$refs.wrapper.contains(event.target)) {
        this.isOpen = false;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style scoped>
.languageswitcher {
  position: relative;
  display: inline-block;
  user-select: none;
}

.switcher-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.9);
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.switcher-btn:hover {
  border-color: #94a3b8;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.dark .switcher-btn {
  background: rgba(30, 41, 59, 0.9);
  border-color: #475569;
  color: #e2e8f0;
}

.dark .switcher-btn:hover {
  border-color: #64748b;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.flag {
  font-size: 1.6rem;
}

.lang-name {
  flex: 1;
  text-align: left;
}

.arrow {
  font-size: 12px;
  transition: transform 0.3s ease;
  margin-left: 8px;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
  border: 1px solid #e2e8f0;
}

.dark .dropdown-menu {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: #f0f9ff;
}

.dark .dropdown-item:hover {
  background: #334155;
}

.dropdown-item.active {
  background: #ebf8ff;
  font-weight: 600;
}

.dark .dropdown-item.active {
  background: #334155;
}

.check {
  margin-left: auto;
  color: #3b82f6;
  font-weight: bold;
}

.success-noti {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 12px 20px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: popUp 0.5s ease;
  z-index: 1001;
}

.success-noti i {
  font-size: 18px;
}

@keyframes popUp {
  0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>