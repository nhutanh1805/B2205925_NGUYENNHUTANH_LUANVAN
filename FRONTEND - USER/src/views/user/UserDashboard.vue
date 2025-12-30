<template>
  <div class="user-dashboard">
    <h1>Thông tin cá nhân</h1>

    <div class="card">
      <div class="header">
        <h2 v-if="!isEditing">Thông tin của bạn</h2>
        <h2 v-else>Chỉnh sửa thông tin</h2>
        <button @click="toggleEdit" class="edit-btn" v-if="!isEditing">
          <i class="fas fa-edit"></i> Chỉnh sửa
        </button>
      </div>

      <div v-if="!isEditing && user">
        <p><b>Tên:</b> {{ user.name }}</p>
        <p><b>Email:</b> {{ user.email }}</p>
        <p><b>Số điện thoại:</b> {{ user.phone || "Chưa cập nhật" }}</p>
        <p><b>Địa chỉ:</b> {{ user.address || "Chưa cập nhật" }}</p>
        <p><b>Giới tính:</b> {{ formattedGender }}</p>
        <p><b>Ngày sinh:</b> {{ formattedBirthday || "Chưa cập nhật" }}</p>
        <p><b>Quyền:</b> {{ user.role }}</p>
      </div>

      <form @submit.prevent="handleUpdate" v-if="isEditing">
        <div class="form-group">
          <label>Họ và tên *</label>
          <input v-model="form.name" type="text" required />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" disabled />
          <small>Email không thể thay đổi</small>
        </div>

        <div class="form-group">
          <label>Số điện thoại</label>
          <input v-model="form.phone" type="tel" placeholder="0123456789" />
        </div>

        <div class="form-group">
          <label>Địa chỉ</label>
          <input v-model="form.address" type="text" placeholder="Nhập địa chỉ" />
        </div>

        <div class="form-group">
          <label>Giới tính</label>
          <select v-model="form.gender">
            <option value="">Chưa chọn</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ngày sinh</label>
          <input v-model="form.birthday" type="date" />
        </div>

        <div class="actions">
          <button type="submit" :disabled="loading">
            {{ loading ? "Đang lưu..." : "Lưu thay đổi" }}
          </button>
          <button type="button" @click="cancelEdit" class="cancel-btn">
            Hủy
          </button>
        </div>
      </form>

      <div v-if="message" class="message" :class="{ success: isSuccess, error: !isSuccess }">
        {{ message }}
      </div>

      <button @click="logout" class="logout-btn">Đăng xuất</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import UserAuthService from "@/services/userAuth.service"; 

const router = useRouter();
const user = ref(null);
const isEditing = ref(false);
const loading = ref(false);
const message = ref("");
const isSuccess = ref(false);

const form = ref({
  name: "",
  phone: "",
  address: "",
  gender: "",
  birthday: "",
  email: "",
});

const loadUser = () => {
  const data = localStorage.getItem("user");
  if (!data) {
    router.push("/user/login");
    return;
  }
  user.value = JSON.parse(data);
  resetForm();
};

const resetForm = () => {
  if (user.value) {
    form.value = {
      name: user.value.name || "",
      email: user.value.email || "",
      phone: user.value.phone || "",
      address: user.value.address || "",
      gender: user.value.gender || "",
      birthday: user.value.birthday ? user.value.birthday.slice(0, 10) : "", 
    };
  }
};

const toggleEdit = () => {
  isEditing.value = true;
  resetForm();
};

const cancelEdit = () => {
  isEditing.value = false;
  message.value = "";
};

const handleUpdate = async () => {
  loading.value = true;
  message.value = "";

  try {
    const updatedUser = await UserAuthService.updateProfile(user.value._id, form.value);

    localStorage.setItem("user", JSON.stringify(updatedUser));

    user.value = updatedUser;

    window.dispatchEvent(new Event("user-login"));

    isEditing.value = false;
    message.value = "Cập nhật thông tin thành công!";
    isSuccess.value = true;
    setTimeout(() => (message.value = ""), 3000);
  } catch (err) {
    message.value = err.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại!";
    isSuccess.value = false;
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  localStorage.removeItem("user");
  user.value = null;
  window.dispatchEvent(new Event("user-logout"));
  router.push("/user/login");
};

const formattedBirthday = computed(() => {
  if (!user.value?.birthday) return "";
  const d = new Date(user.value.birthday);
  return d.toLocaleDateString("vi-VN");
});

const formattedGender = computed(() => {
  const map = { Nam: "Nam", Nữ: "Nữ", Khác: "Khác" };
  return map[user.value?.gender] || "Chưa cập nhật";
});

onMounted(() => {
  loadUser();
  window.addEventListener("user-login", loadUser);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

.user-dashboard {
  max-width: 700px;
  margin: 60px auto;
  padding: 0 20px;
  font-family: 'Inter', sans-serif;
}

h1 {
  text-align: center;
  font-size: 2.4rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 40px;
}

.card {
  padding: 40px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff, #f8fbff);
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 16px;
}

.header h2 {
  font-size: 1.8rem;
  color: #1e293b;
  margin: 0;
}

.edit-btn {
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn:hover {
  background: #2563eb;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

input, select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

input:disabled {
  background: #f1f5f9;
  color: #64748b;
}

small {
  color: #64748b;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.actions button {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.actions button[type="submit"] {
  background: #10b981;
  color: white;
  flex: 1;
}

.actions button[type="submit"]:hover:not(:disabled) {
  background: #059669;
}

.cancel-btn {
  background: #e2e8f0;
  color: #475569;
}

.cancel-btn:hover {
  background: #cbd5e1;
}

.message {
  margin: 20px 0;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 500;
  text-align: center;
}

.success {
  background: #d1fae5;
  color: #065f46;
}

.error {
  background: #fee2e2;
  color: #991b1b;
}

.logout-btn {
  margin-top: 32px;
  width: 100%;
  padding: 14px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
}

.logout-btn:hover {
  background: #dc2626;
}

p {
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: #334155;
}

p b {
  color: #1e293b;
}
</style>