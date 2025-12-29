<template>
  <div class="user-box">
    <span class="user-name" @click="open = !open">
      👋 {{ user.name }} ▾
    </span>

    <div v-if="open" class="user-panel">
      <p class="title">User</p>

      <p><b>Tên:</b> {{ user.name }}</p>
      <p><b>Email:</b> {{ user.email }}</p>

      <button @click="goDashboard">Dashboard</button>
      <button class="logout" @click="logout">Đăng xuất</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["logout"]);

const open = ref(false);
const router = useRouter();

const goDashboard = () => {
  open.value = false;
  router.push("/user");
};

const logout = () => {
  open.value = false;
  emit("logout");
};
</script>

<style scoped>
.user-box {
  position: relative;
}

.user-name {
  cursor: pointer;
  font-weight: 700;
  color: white;
}

.user-panel {
  position: absolute;
  right: 0;
  top: 52px;
  width: 220px;
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,.35);
}

.title {
  font-weight: 800;
  margin-bottom: 8px;
}

button {
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.logout {
  background: #ef4444;
  color: white;
}
</style>
