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

        <router-link
          to="/cart"
          class="nav-link cart-link"
          active-class="cart-active"
        >
          Giỏ hàng
        </router-link>

        <!-- USER MENU -->
        <UserMenu v-if="user" :user="user" @logout="handleLogout" />

        <!-- LOGIN -->
        <button
          v-else
          class="login-btn"
          @click="router.push('/user/login')"
        >
          Đăng nhập
        </button>

        <!-- DISPLAY -->
        <div class="display-wrapper">
          <button class="display-btn" @click="open = !open">
            Hiển thị ▾
          </button>

          <div v-if="open" class="display-panel">
            <label>
              <input type="checkbox" v-model="localUI.time" />
              Time On Page
            </label>

            <label>
              <input type="checkbox" v-model="localUI.iphone" />
              iPhone UI
            </label>

            <label>
              <input type="checkbox" v-model="localUI.idle" />
              Idle Toast
            </label>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { reactive, ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import UserMenu from "./usermenu/UserMenu.vue";

const router = useRouter();

const props = defineProps({
  ui: { type: Object, required: true }
});
const emit = defineEmits(["update-ui"]);

const open = ref(false);
const localUI = reactive({ ...props.ui });
const user = ref(null);

const loadUser = () => {
  const data = localStorage.getItem("user");
  user.value = data ? JSON.parse(data) : null;
};

onMounted(() => {
  loadUser();
  window.addEventListener("user-login", loadUser);
});

onUnmounted(() => {
  window.removeEventListener("user-login", loadUser);
});

const handleLogout = () => {
  localStorage.removeItem("user");
  user.value = null;
  router.push("/user/login");
};

watch(
  localUI,
  (val) => emit("update-ui", { ...val }),
  { deep: true }
);
</script>

<style scoped>
.header { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(18px); background: linear-gradient(135deg, rgba(59,130,246,.85), rgba(99,102,241,.85)), radial-gradient(circle at top left, rgba(255,255,255,.25), transparent 60%); box-shadow: 0 20px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.2); }
.header-inner { max-width: 1320px; margin: auto; padding: 0 24px; height: 72px; display: flex; align-items: center; justify-content: space-between; }
.logo { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.logo-badge { width: 42px; height: 42px; border-radius: 14px; background: rgba(255,255,255,.25); }
.logo-text { font-size: 1.5rem; font-weight: 900; letter-spacing: .6px; color: white; }
.nav { display: flex; gap: 24px; align-items: center; }
.nav-link { padding: 8px 14px; border-radius: 999px; font-weight: 600; color: rgba(255,255,255,.85); }
.nav-active { color: white; background: rgba(255,255,255,.22); }
.cart-link { padding: 8px 18px; background: rgba(255,255,255,.25); border-radius: 999px; }
.login-btn, .logout-btn { padding: 8px 16px; border-radius: 999px; border: none; cursor: pointer; font-weight: 600; color: white; background: rgba(255,255,255,.25); }
.display-wrapper { position: relative; }
.display-btn { padding: 8px 14px; border-radius: 999px; border: none; cursor: pointer; font-weight: 600; color: white; background: rgba(255,255,255,.18); }
.display-panel { position: absolute; top: 48px; right: 0; width: 190px; background: #fff; padding: 12px 14px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,.35); z-index: 100; }
.display-panel label { display: flex; gap: 8px; font-size: 14px; margin: 8px 0; }
</style>
