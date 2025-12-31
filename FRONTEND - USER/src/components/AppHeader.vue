<template>
  <header class="header">
    <div class="header-inner">
      <div class="logo" @click="router.push('/')">
        <div class="logo-badge"></div>
        <span class="logo-text">NHUTANHSTORE</span>
      </div>

      <nav class="nav">
        <router-link to="/" class="nav-link" active-class="nav-active">
          Trang chủ
        </router-link>

        <router-link to="/products" class="nav-link" active-class="nav-active">
          Sản phẩm
        </router-link>

        <router-link to="/cart" class="nav-link cart-link" active-class="cart-active">
          Giỏ hàng
        </router-link>

        <UserMenu v-if="user" :user="user" @logout="handleLogout" />

        <button v-else class="login-btn" @click="router.push('/user/login')">
          Đăng nhập
        </button>

        <div class="settings-wrapper" ref="settingsWrapper">
          <button class="settings-btn" @click="toggleSettings">
            <i class="fas fa-cog settings-icon" :class="{ spin: settingsOpen }"></i>
          </button>

          <transition name="panel">
            <div v-if="settingsOpen" class="settings-panel">
              <div class="setting-item" @click.stop>
                <span class="setting-label">Chế độ tối</span>
                <DarkModeToggle 
                  :is-dark="localUI.dark" 
                  @toggle-dark="toggleDarkMode"
                />
              </div>

              <div class="setting-item" @click.stop>
                <span class="setting-label">Ngôn ngữ</span>
                <LanguageSwitcher 
                  :current-lang="localUI.lang" 
                  @change-lang="changeLanguage"
                />
              </div>

              <div class="divider"></div>

              <div class="display-options">
                <label class="display-label">
                  <input type="checkbox" v-model="localUI.time" />
                  Time On Page
                </label>
                <label class="display-label">
                  <input type="checkbox" v-model="localUI.iphone" />
                  iPhone UI
                </label>
                <label class="display-label">
                  <input type="checkbox" v-model="localUI.idle" />
                  Idle Toast
                </label>
              </div>
            </div>
          </transition>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { reactive, ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import UserMenu from "./usermenu/UserMenu.vue";
import DarkModeToggle from "@/components/darkmodetoggle/DarkModeToggle.vue";
import LanguageSwitcher from "@/components/languageswitcher/LanguageSwitcher.vue";

const router = useRouter();

const props = defineProps({
  ui: { type: Object, required: true }
});
const emit = defineEmits(["update-ui"]);

const settingsOpen = ref(false);
const settingsWrapper = ref(null);

const localUI = reactive({
  time: props.ui.time ?? true,
  iphone: props.ui.iphone ?? true,
  idle: props.ui.idle ?? true,
  dark: props.ui.dark ?? localStorage.getItem("darkMode") === "true",
  lang: props.ui.lang ?? localStorage.getItem("language") ?? "vi",
});

const user = ref(null);

const loadUser = () => {
  const data = localStorage.getItem("user");
  user.value = data ? JSON.parse(data) : null;
};

const toggleSettings = () => {
  settingsOpen.value = !settingsOpen.value;
};

const handleClickOutside = (event) => {
  if (settingsWrapper.value && !settingsWrapper.value.contains(event.target)) {
    settingsOpen.value = false;
  }
};

const handleLogout = () => {
  localStorage.removeItem("user");
  user.value = null;
  router.push("/user/login");
};

const toggleDarkMode = () => {
  localUI.dark = !localUI.dark;
};

const changeLanguage = (lang) => {
  localUI.lang = lang;
};

onMounted(() => {
  loadUser();
  window.addEventListener("user-login", loadUser);
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("user-login", loadUser);
  document.removeEventListener("click", handleClickOutside);
});

watch(localUI, (val) => emit("update-ui", { ...val }), { deep: true });
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(18px);
  background: linear-gradient(135deg, rgba(59,130,246,.85), rgba(99,102,241,.85)),
              radial-gradient(circle at top left, rgba(255,255,255,.25), transparent 60%);
  box-shadow: 0 20px 40px rgba(0,0,0,.35),
              inset 0 1px 0 rgba(255,255,255,.2);
}

.header-inner {
  max-width: 1320px;
  margin: auto;
  padding: 0 24px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-badge {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(255,255,255,.25);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: .6px;
  color: white;
}

.nav {
  display: flex;
  gap: 24px;
  align-items: center;
}

.nav-link {
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 600;
  color: rgba(255,255,255,.85);
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: rgba(255,255,255,.15);
}

.nav-active {
  color: white;
  background: rgba(255,255,255,.22);
}

.cart-link {
  padding: 8px 18px;
  background: rgba(255,255,255,.25);
  border-radius: 999px;
}

.login-btn {
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: white;
  background: rgba(255,255,255,.25);
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: rgba(255,255,255,.35);
}

.settings-wrapper {
  position: relative;
}

.settings-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,.22);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.settings-btn:hover {
  background: rgba(255,255,255,.35);
  transform: rotate(30deg);
}

.settings-icon {
  font-size: 20px;
  color: white;
  transition: transform 0.5s ease;
}

.settings-icon.spin {
  transform: rotate(360deg);
}

.settings-panel {
  position: absolute;
  top: 64px;
  right: 0;
  width: 320px;
  background: rgba(255,255,255,.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 25px 50px rgba(0,0,0,.4);
  z-index: 100;
}

.dark .settings-panel {
  background: rgba(30,40,60,.95);
  color: white;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.setting-label {
  font-weight: 600;
  color: #1e293b;
}

.dark .setting-label {
  color: #e2e8f0;
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 16px 0;
}

.dark .divider {
  background: #475569;
}

.display-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.display-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.dark .display-label {
  color: #cbd5e1;
}

.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>