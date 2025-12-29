<template>
  <div class="auth">
    <h2>Đăng ký User</h2>

    <input v-model="name" placeholder="Tên" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <input v-model="phone" placeholder="Số điện thoại" />
    <input v-model="address" placeholder="Địa chỉ" />
    
    <select v-model="gender">
      <option disabled value="">Chọn giới tính</option>
      <option value="male">Nam</option>
      <option value="female">Nữ</option>
      <option value="other">Khác</option>
    </select>

    <input v-model="birthday" type="date" placeholder="Ngày sinh" />

    <button @click="register">Tạo tài khoản</button>

    <p class="message" v-if="message">{{ message }}</p>
    <p class="error" v-if="error">{{ error }}</p>

    <div class="login-link">
      <span>Đã có tài khoản?</span>
      <button @click="goLogin">Đăng nhập</button>
    </div>
  </div>
</template>

<script>
import UserAuthService from "@/services/userAuth.service";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      gender: "",
      birthday: "",
      message: "",
      error: "",
    };
  },
  methods: {
    async register() {
      try {
        const res = await UserAuthService.register({
          name: this.name,
          email: this.email,
          password: this.password,
          phone: this.phone,
          address: this.address,
          gender: this.gender,
          birthday: this.birthday,
        });
        this.message = "Tạo user thành công!";
        this.error = "";
      } catch (err) {
        this.error = err.response?.data?.message || "Tạo user thất bại";
        this.message = "";
      }
    },
    goLogin() {
      this.$router.push("/user/login");
    },
  },
};
</script>

<style scoped>
/* giữ nguyên style cũ */
.auth {
  max-width: 400px;
  margin: 80px auto;
  padding: 32px 28px;
  background: linear-gradient(135deg, #ffffff, #f0f4ff);
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
  text-align: center;
  font-family: 'Inter', sans-serif;
}

h2 { font-size: 2rem; font-weight: 700; color: #1e293b; margin-bottom: 28px; }
input, select { width: 100%; padding: 14px 16px; margin: 14px 0; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 16px; transition: all 0.3s ease; }
input:focus, select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 8px rgba(59,130,246,0.3); }
button { width: 100%; padding: 14px 16px; border-radius: 10px; border: none; background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.3s ease; }
button:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59,130,246,0.4); }

.message { color: #22c55e; margin-top: 14px; font-weight: 600; }
.error { color: #ef4444; margin-top: 14px; font-weight: 600; }

.login-link { margin-top: 20px; display: flex; justify-content: center; align-items: center; gap: 6px; font-size: 14px; }
.login-link span { color: #64748b; }
.login-link button { background: none; color: #3b82f6; font-weight: 600; padding: 0; margin: 0; cursor: pointer; }
.login-link button:hover { text-decoration: underline; }
</style>
