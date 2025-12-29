<template>
  <div class="admin-box">
    <span class="admin-name" @click="open = !open">
      👋 {{ admin.name }} ▾
    </span>

    <div v-if="open" class="admin-panel">
      <p class="title">Admin</p>

      <p><b>Tên:</b> {{ admin.name }}</p>
      <p><b>Email:</b> {{ admin.email }}</p>

      <button @click="goDashboard">Dashboard</button>
      <button class="logout" @click="logout">Đăng xuất</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

defineProps({
  admin: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["logout"]);

const open = ref(false);
const router = useRouter();

const goDashboard = () => {
  open.value = false;
  router.push("/admin");
};

const logout = () => {
  open.value = false;
  emit("logout");
};
</script>

<style scoped>
.admin-box {
  position: relative;
}

.admin-name {
  cursor: pointer;
  font-weight: 700;
  color: white;
}

.admin-panel {
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
