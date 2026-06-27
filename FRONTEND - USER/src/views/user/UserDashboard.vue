<template>
  <div class="profile-page">

    <div class="hero">
      <div class="hero-mesh"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Tài khoản của bạn
        </div>
        <h1 class="hero-title">Thông tin<br/><em>cá nhân</em></h1>
        <p class="hero-sub" v-if="user">Xin chào, {{ user.name }}</p>
      </div>
    </div>

    <div class="main-panel">
      <div class="profile-card">

        <div class="card-header">
          <h2 class="card-title">{{ isEditing ? "Chỉnh sửa thông tin" : "Thông tin của bạn" }}</h2>
          <button v-if="!isEditing" class="edit-btn" @click="toggleEdit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="edit-icon">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Chỉnh sửa
          </button>
        </div>

        <!-- VIEW MODE -->
        <div v-if="!isEditing && user" class="info-list">
          <div class="info-row">
            <span class="info-label">Tên</span>
            <span class="info-value">{{ user.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value">{{ user.email }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Số điện thoại</span>
            <span class="info-value" :class="{ muted: !user.phone }">{{ user.phone || "Chưa cập nhật" }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Địa chỉ</span>
            <span class="info-value" :class="{ muted: !user.address }">{{ user.address || "Chưa cập nhật" }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Giới tính</span>
            <span class="info-value" :class="{ muted: formattedGender === 'Chưa cập nhật' }">{{ formattedGender }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ngày sinh</span>
            <span class="info-value" :class="{ muted: !formattedBirthday }">{{ formattedBirthday || "Chưa cập nhật" }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Quyền</span>
            <span class="role-badge">{{ user.role }}</span>
          </div>
        </div>

        <!-- EDIT MODE -->
        <form v-if="isEditing" @submit.prevent="handleUpdate" class="edit-form">
          <div class="field">
            <label class="field-label">Họ và tên *</label>
            <input v-model="form.name" type="text" class="field-input" required />
          </div>

          <div class="field">
            <label class="field-label">Email</label>
            <input v-model="form.email" type="email" class="field-input" disabled />
            <small class="field-hint">Email không thể thay đổi</small>
          </div>

          <div class="field-row">
            <div class="field">
              <label class="field-label">Số điện thoại</label>
              <input v-model="form.phone" type="tel" class="field-input" placeholder="0123456789" />
            </div>
            <div class="field">
              <label class="field-label">Ngày sinh</label>
              <input v-model="form.birthday" type="date" class="field-input" />
            </div>
          </div>

          <div class="field">
            <label class="field-label">Địa chỉ</label>
            <input v-model="form.address" type="text" class="field-input" placeholder="Nhập địa chỉ" />
          </div>

          <div class="field">
            <label class="field-label">Giới tính</label>
            <div class="select-wrap">
              <select v-model="form.gender" class="field-select">
                <option value="">Chưa chọn</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div class="actions">
            <button type="submit" class="save-btn" :disabled="loading">
              {{ loading ? "Đang lưu..." : "Lưu thay đổi" }}
              <span class="btn-shine"></span>
            </button>
            <button type="button" class="cancel-btn" @click="cancelEdit">Hủy</button>
          </div>
        </form>

        <div v-if="message" class="message" :class="{ success: isSuccess, error: !isSuccess }">
          {{ message }}
        </div>

        <button class="favorite-link-btn" @click="router.push('/favorites')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="favorite-icon">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Sản phẩm yêu thích
        </button>

        <button class="logout-btn" @click="logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="logout-icon">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Đăng xuất
        </button>

      </div>
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
.profile-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ══ HERO ══ */
.hero {
  position: relative; overflow: hidden;
  background: #0a0f1e; padding: 72px 32px 100px; text-align: center;
}
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%, rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,.3), transparent),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,.08), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25); top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.2); bottom: -60px; right: -40px; }
.hero-orb-3 { width: 180px; height: 180px; background: rgba(16,185,129,.15); top: 40%; left: 55%; }

.hero-content { position: relative; z-index: 2; max-width: 700px; margin: auto; }

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px; padding: 6px 18px;
  font-size: .75rem; font-weight: 700; color: rgba(255,255,255,.8);
  letter-spacing: .08em; text-transform: uppercase;
  margin-bottom: 22px; backdrop-filter: blur(8px);
}
.eyebrow-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #10b981; box-shadow: 0 0 8px #10b981;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}
.hero-title {
  font-size: clamp(2.2rem, 6vw, 3.6rem); font-weight: 900; color: white;
  line-height: 1.1; letter-spacing: -.02em; margin-bottom: 14px;
  text-shadow: 0 2px 30px rgba(0,0,0,.4);
}
.hero-title em {
  font-style: normal;
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size: 1rem; color: rgba(255,255,255,.55); letter-spacing: .06em; }

/* ══ MAIN PANEL ══ */
.main-panel {
  max-width: 640px; margin: -56px auto 0;
  padding: 0 24px 60px; position: relative; z-index: 10;
}

/* ══ CARD ══ */
.profile-card {
  background: white; border-radius: 24px; padding: 36px 32px;
  box-shadow: 0 24px 60px rgba(10,15,30,.16);
  border: 1px solid rgba(37,99,235,.1);
}

.card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid #f1f5f9;
}
.card-title { font-size: 1.25rem; font-weight: 800; color: #0f172a; }
.edit-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 12px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #2563eb, #4f46e5); color: white;
  font-weight: 700; font-size: .82rem;
  box-shadow: 0 4px 14px rgba(37,99,235,.3); transition: transform .2s, box-shadow .2s;
}
.edit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,99,235,.4); }
.edit-icon { width: 15px; height: 15px; }

/* ══ INFO VIEW ══ */
.info-list { display: flex; flex-direction: column; }
.info-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 0; border-bottom: 1px solid #f8faff;
}
.info-row:last-child { border-bottom: none; }
.info-label { font-size: .82rem; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: .04em; }
.info-value { font-size: .92rem; font-weight: 600; color: #0f172a; text-align: right; }
.info-value.muted { color: #94a3b8; font-weight: 500; }
.role-badge {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff); border: 1px solid #e0e7ff;
  color: #4f46e5; font-size: .75rem; font-weight: 800; text-transform: uppercase;
  padding: 4px 12px; border-radius: 999px; letter-spacing: .04em;
}

/* ══ EDIT FORM ══ */
.field { margin-bottom: 18px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field-label {
  display: block; font-size: .78rem; font-weight: 700; color: #4f46e5;
  text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px;
}
.field-input, .field-select {
  width: 100%; padding: 13px 16px; border-radius: 12px;
  border: 1.5px solid #e0e7ff; font-size: .92rem; color: #0f172a;
  background: #f8faff; transition: all .2s; box-sizing: border-box;
}
.field-input:focus, .field-select:focus {
  outline: none; border-color: #2563eb; background: white;
  box-shadow: 0 0 0 4px rgba(37,99,235,.12);
}
.field-input:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
.field-hint { display: block; margin-top: 6px; font-size: .75rem; color: #94a3b8; }
.select-wrap { position: relative; }
.field-select { cursor: pointer; appearance: none; }
.select-wrap::after {
  content: ''; position: absolute; right: 16px; top: 50%;
  width: 8px; height: 8px; border-right: 2px solid #4f46e5; border-bottom: 2px solid #4f46e5;
  transform: translateY(-70%) rotate(45deg); pointer-events: none;
}

.actions { display: flex; gap: 10px; margin-top: 8px; }
.save-btn {
  flex: 2; padding: 13px; border-radius: 13px;
  font-size: .9rem; font-weight: 700; color: white;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none; cursor: pointer; position: relative; overflow: hidden;
  box-shadow: 0 4px 14px rgba(16,185,129,.3); transition: transform .2s, box-shadow .2s;
}
.save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(16,185,129,.4); }
.save-btn:disabled { opacity: .65; cursor: not-allowed; }
.btn-shine {
  position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
  transform: skewX(-20deg); transition: left .5s;
}
.save-btn:hover:not(:disabled) .btn-shine { left: 130%; }
.cancel-btn {
  flex: 1; padding: 13px; border-radius: 13px; border: none; cursor: pointer;
  background: #f1f5f9; color: #475569; font-weight: 700; font-size: .9rem;
  transition: background .2s;
}
.cancel-btn:hover { background: #e2e8f0; }

/* ══ MESSAGE ══ */
.message { margin-top: 18px; padding: 12px 16px; border-radius: 12px; font-weight: 700; font-size: .85rem; text-align: center; }
.message.success { background: #d1fae5; color: #065f46; }
.message.error { background: #fee2e2; color: #991b1b; }

/* ══ FAVORITE LINK ══ */
.favorite-link-btn {
  width: 100%; margin-top: 24px; padding: 13px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  border-radius: 13px; border: 1.5px solid #e0e7ff; cursor: pointer;
  background: #f5f3ff; color: #4f46e5; font-weight: 700; font-size: .9rem;
  transition: all .2s;
}
.favorite-link-btn:hover { background: #ede9fe; border-color: #c4b5fd; }
.favorite-icon { width: 16px; height: 16px; }

/* ══ LOGOUT ══ */
.logout-btn {
  width: 100%; margin-top: 12px; padding: 13px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  border-radius: 13px; border: 1.5px solid #fecdd3; cursor: pointer;
  background: #fff1f2; color: #e11d48; font-weight: 700; font-size: .9rem;
  transition: all .2s;
}
.logout-btn:hover { background: #ffe4e6; border-color: #fda4af; }
.logout-icon { width: 16px; height: 16px; }

/* ── MOBILE ── */
@media (max-width: 640px) {
  .hero { padding: 50px 20px 80px; }
  .main-panel { margin-top: -48px; padding: 0 16px 40px; }
  .profile-card { padding: 28px 22px; }
  .field-row { grid-template-columns: 1fr; }
  .card-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .edit-btn { align-self: flex-end; }
}
</style>