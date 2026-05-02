<template>
<div class="edit-page">

  <!-- ══ HERO ══ -->
  <div class="hero">
    <div class="hero-mesh"></div>
    <div class="hero-orb hero-orb-1"></div>
    <div class="hero-orb hero-orb-2"></div>
    <div class="hero-content">
      <nav class="breadcrumb">
        <span>Quản trị</span>
        <span class="sep">›</span>
        <span>Sản phẩm</span>
        <span class="sep">›</span>
        <span class="current">Chỉnh sửa sản phẩm</span>
      </nav>
      <div class="hero-title-wrap">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Quản lý kho hàng
        </div>
        <h1 class="hero-title">Chỉnh sửa<br/><em>sản phẩm</em></h1>
      </div>
    </div>
  </div>

  <!-- ══ LOADING ══ -->
  <div v-if="!product" class="form-panel">
    <div class="loading-card">
      <div class="spinner-lg"></div>
      <p class="loading-text">Đang tải sản phẩm...</p>
    </div>
  </div>

  <!-- ══ FORM PANEL ══ -->
  <div v-if="product" class="form-panel">
    <form @submit.prevent="submit" class="form-body">

      <!-- SECTION: Thông tin cơ bản -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">📦</div>
          <div>
            <h2 class="section-title">Thông tin cơ bản</h2>
            <p class="section-sub">Tên, mô tả, thương hiệu và danh mục</p>
          </div>
        </div>
        <div class="field-grid">
          <div class="field-wrap col-2">
            <label class="field-label">Tên sản phẩm <span class="req">*</span></label>
            <input v-model="product.name" required placeholder="VD: AirPods Pro 2nd Gen" class="field-input"/>
          </div>
          <div class="field-wrap col-2">
            <label class="field-label">Slug <span class="req">*</span></label>
            <input v-model="product.slug" required placeholder="VD: airpods-pro-2nd-gen" class="field-input"/>
          </div>
          <div class="field-wrap col-2">
            <label class="field-label">Mô tả ngắn</label>
            <input v-model="product.shortDescription" placeholder="Một câu mô tả ngắn gọn" class="field-input"/>
          </div>
          <div class="field-wrap col-2">
            <label class="field-label">Mô tả chi tiết</label>
            <textarea v-model="product.description" placeholder="Mô tả đầy đủ về sản phẩm..." class="field-input field-textarea"></textarea>
          </div>
          <div class="field-wrap">
            <label class="field-label">Thương hiệu</label>
            <input v-model="product.brand" placeholder="VD: Apple, Samsung..." class="field-input"/>
          </div>
          <div class="field-wrap">
            <label class="field-label">Danh mục</label>
            <select v-model="product.category" class="field-input field-select">
              <option disabled value="">-- Chọn danh mục --</option>
              <option v-for="(cat, key) in CATEGORY_CONFIG" :key="key" :value="key">
                {{ cat.label }}
              </option>
            </select>
          </div>
          <div class="field-wrap">
            <label class="field-label">Xuất xứ</label>
            <input v-model="product.origin" placeholder="VD: Việt Nam" class="field-input"/>
          </div>
          <div class="field-wrap">
            <label class="field-label">Bảo hành (tháng)</label>
            <input v-model.number="product.warrantyMonths" type="number" placeholder="12" class="field-input"/>
          </div>
        </div>
      </div>

      <!-- SECTION: Giá & Kho -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">💰</div>
          <div>
            <h2 class="section-title">Giá & Kho hàng</h2>
            <p class="section-sub">Giá bán, khuyến mãi và số lượng tồn kho</p>
          </div>
        </div>
        <div class="field-grid">
          <div class="field-wrap">
            <label class="field-label">Giá gốc <span class="req">*</span></label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">₫</span>
              <input v-model.number="product.price" type="number" placeholder="0" class="field-input has-prefix"/>
            </div>
          </div>
          <div class="field-wrap">
            <label class="field-label">Giá khuyến mãi</label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">₫</span>
              <input v-model.number="product.salePrice" type="number" placeholder="Để trống nếu không KM" class="field-input has-prefix"/>
            </div>
          </div>
          <div class="field-wrap">
            <label class="field-label">SKU</label>
            <input v-model="product.sku" placeholder="VD: APL-APP2-001" class="field-input"/>
          </div>
          <div class="field-wrap">
            <label class="field-label">Tồn kho</label>
            <input v-model.number="product.stock" type="number" placeholder="0" class="field-input"/>
          </div>
        </div>

        <!-- Discount preview -->
        <div v-if="product.price && product.salePrice && product.salePrice < product.price" class="discount-preview">
          <span class="discount-icon">🏷️</span>
          <span>Giảm <b>{{ discountPercent }}%</b> — Tiết kiệm <b>{{ formatPrice(product.price - product.salePrice) }}₫</b></span>
        </div>
      </div>

      <!-- SECTION: Thiết bị tương thích -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">📱</div>
          <div>
            <h2 class="section-title">Thiết bị tương thích</h2>
            <p class="section-sub">Nhấn Enter để thêm từng thiết bị</p>
          </div>
        </div>
        <div class="field-wrap" style="margin-bottom: 12px;">
          <input
            v-model="compatibilityInput"
            class="field-input"
            placeholder="VD: iPhone 15, Samsung S24..."
            @keydown.enter.prevent="addCompatibility"
          />
        </div>
        <div class="tag-list">
          <span
            v-for="(item, index) in product.compatibility"
            :key="index"
            class="tag"
            @click="removeCompatibility(index)"
          >
            {{ item }} <span class="tag-x">✕</span>
          </span>
          <span v-if="!product.compatibility.length" class="tag-empty">Chưa có thiết bị nào</span>
        </div>
      </div>

      <!-- SECTION: Thông số kỹ thuật -->
      <div v-if="categorySpecs.length" class="section-card">
        <div class="section-header">
          <div class="section-icon">⚙️</div>
          <div>
            <h2 class="section-title">Thông số kỹ thuật</h2>
            <p class="section-sub">Thông số theo danh mục <b>{{ CATEGORY_CONFIG[product.category]?.label }}</b></p>
          </div>
        </div>
        <div class="field-grid">
          <div class="field-wrap" v-for="field in categorySpecs" :key="field.key">
            <label class="field-label">{{ field.label }}</label>
            <input v-model="product.specs[field.key]" :placeholder="field.label" class="field-input"/>
          </div>
        </div>
      </div>

      <!-- SECTION: Ảnh sản phẩm -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">🖼️</div>
          <div>
            <h2 class="section-title">Ảnh sản phẩm</h2>
            <p class="section-sub">Kéo thả hoặc click để chọn ảnh (nhiều ảnh)</p>
          </div>
        </div>

        <div
          class="drop-zone"
          :class="{ 'drag-over': isDragging }"
          @click="$refs.fileInput.click()"
          @drop.prevent="handleDrop"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
        >
          <div class="drop-placeholder" v-if="!product.images.length">
            <div class="drop-icon">📁</div>
            <p class="drop-text">Kéo ảnh vào đây hoặc <span class="drop-link">chọn file</span></p>
            <p class="drop-hint">PNG, JPG, WEBP — Tối đa 20MB mỗi ảnh</p>
          </div>

          <div class="img-preview-list" v-else>
            <div
              v-for="(img, index) in product.images"
              :key="index"
              class="img-preview"
            >
              <img :src="img" />
              <button type="button" class="img-remove" @click.stop="removeImage(index)">✕</button>
              <div class="img-main-badge" v-if="index === 0">Ảnh chính</div>
            </div>
            <div class="img-add-more" @click.stop="$refs.fileInput.click()">
              <span>+</span>
              <p>Thêm ảnh</p>
            </div>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          class="hidden-input"
          @change="handleFileSelect"
        />
      </div>

      <!-- SECTION: Tùy chọn -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-icon">🔧</div>
          <div>
            <h2 class="section-title">Tùy chọn hiển thị</h2>
            <p class="section-sub">Cấu hình trạng thái sản phẩm</p>
          </div>
        </div>
        <div class="toggle-list">
          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-name">Sản phẩm nổi bật</span>
              <span class="toggle-desc">Hiển thị ở trang chủ và banner quảng cáo</span>
            </div>
            <div class="toggle-switch" :class="{ on: product.isFeatured }" @click="product.isFeatured = !product.isFeatured">
              <div class="toggle-knob"></div>
            </div>
          </label>
          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-name">Hiển thị trên cửa hàng</span>
              <span class="toggle-desc">Khách hàng có thể xem và mua sản phẩm này</span>
            </div>
            <div class="toggle-switch" :class="{ on: product.isActive }" @click="product.isActive = !product.isActive">
              <div class="toggle-knob"></div>
            </div>
          </label>
        </div>
      </div>

      <!-- SUBMIT -->
      <div class="submit-bar">
        <button type="button" class="btn-cancel" @click="router.push('/products')">
          Hủy bỏ
        </button>
        <button type="submit" class="btn-submit" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-sm"></span>
          <span v-else>✎</span>
          {{ isSubmitting ? 'Đang cập nhật...' : 'Cập nhật sản phẩm' }}
        </button>
      </div>

    </form>
  </div>

</div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductService from "@/services/product.service";

const route = useRoute();
const router = useRouter();

const product = ref(null);
const isSubmitting = ref(false);
const isDragging = ref(false);
const categorySpecs = ref([]);
const compatibilityInput = ref("");

/* ══ CATEGORY CONFIG ══ */
const CATEGORY_CONFIG = {
  tai_nghe: { label: "Tai nghe", specs: [{key:"loai",label:"Loại"},{key:"ket_noi",label:"Kết nối"},{key:"thoi_luong_pin",label:"Thời lượng pin"},{key:"chong_on",label:"Chống ồn"},{key:"kich_thuoc_driver",label:"Driver"},{key:"day_tan_so",label:"Dải tần"},{key:"tro_khang",label:"Trở kháng"},{key:"micro",label:"Micro"},{key:"phien_ban_bluetooth",label:"Bluetooth"},{key:"trong_luong",label:"Trọng lượng"}] },
  op_lung: { label: "Ốp lưng", specs: [{key:"chat_lieu",label:"Chất liệu"},{key:"tuong_thich_model",label:"Model"},{key:"mau_sac",label:"Màu sắc"},{key:"do_day",label:"Độ dày"},{key:"chong_soc",label:"Chống sốc"},{key:"chong_tray",label:"Chống trầy"},{key:"trong_luong",label:"Trọng lượng"},{key:"kieu_dang",label:"Kiểu dáng"},{key:"do_bam",label:"Độ bám"},{key:"tan_nhiet",label:"Tản nhiệt"}] },
  cu_sac: { label: "Củ sạc", specs: [{key:"cong_suat",label:"Công suất"},{key:"so_cong",label:"Số cổng"},{key:"ho_tro_sac_nhanh",label:"Sạc nhanh"},{key:"dien_ap_vao",label:"Điện áp vào"},{key:"dien_ap_ra",label:"Điện áp ra"},{key:"chat_lieu",label:"Chất liệu"},{key:"chuan_sac",label:"Chuẩn sạc"},{key:"an_toan",label:"An toàn"},{key:"kich_thuoc",label:"Kích thước"},{key:"trong_luong",label:"Trọng lượng"}] },
  cap_sac: { label: "Cáp sạc", specs: [{key:"do_dai",label:"Độ dài"},{key:"loai_dau_cam",label:"Đầu cắm"},{key:"ho_tro_sac_nhanh",label:"Sạc nhanh"},{key:"toc_do_truyen",label:"Tốc độ truyền"},{key:"chat_lieu",label:"Chất liệu"},{key:"do_ben",label:"Độ bền"},{key:"chong_dut",label:"Chống đứt"},{key:"tuong_thich",label:"Tương thích"},{key:"loi_day",label:"Lõi dây"},{key:"cong_suat_toi_da",label:"Công suất tối đa"}] },
  pin_du_phong: { label: "Pin dự phòng", specs: [{key:"dung_luong",label:"Dung lượng"},{key:"cong_suat_ra",label:"Công suất ra"},{key:"ho_tro_sac_nhanh",label:"Sạc nhanh"},{key:"so_cong",label:"Số cổng"},{key:"dung_luong_thuc",label:"Dung lượng thực"},{key:"loai_pin",label:"Loại pin"},{key:"cong_sac_vao",label:"Cổng sạc vào"},{key:"den_led",label:"Đèn LED"},{key:"trong_luong",label:"Trọng lượng"},{key:"an_toan",label:"An toàn"}] },
  kinh_cuong_luc: { label: "Kính cường lực", specs: [{key:"do_cung",label:"Độ cứng"},{key:"do_day",label:"Độ dày"},{key:"chong_vet_van_tay",label:"Chống vân tay"},{key:"tuong_thich_model",label:"Model"},{key:"do_trong_suot",label:"Độ trong suốt"},{key:"chong_vo",label:"Chống vỡ"},{key:"phu_oleophobic",label:"Phủ oleophobic"},{key:"vien_kinh",label:"Viền kính"},{key:"do_phu_man_hinh",label:"Độ phủ màn"},{key:"do_cong",label:"Độ cong"}] },
  sac_khong_day: { label: "Sạc không dây", specs: [{key:"cong_suat",label:"Công suất"},{key:"chuan_sac",label:"Chuẩn sạc"},{key:"ho_tro_magsafe",label:"MagSafe"},{key:"hieu_suat",label:"Hiệu suất"},{key:"khoang_cach_sac",label:"Khoảng cách sạc"},{key:"nhiet_do_hoat_dong",label:"Nhiệt độ"},{key:"den_bao",label:"Đèn báo"},{key:"chat_lieu",label:"Chất liệu"},{key:"tuong_thich",label:"Tương thích"},{key:"toc_do_sac",label:"Tốc độ sạc"}] },
};

/* ══ COMPUTED ══ */
const discountPercent = computed(() => {
  if (!product.value?.price || !product.value?.salePrice) return 0;
  return Math.round(100 - (product.value.salePrice / product.value.price) * 100);
});
const formatPrice = v => new Intl.NumberFormat("vi-VN").format(v);

/* ══ LOAD PRODUCT ══ */
onMounted(async () => {
  const data = await ProductService.get(route.params.id);
  data.images ||= [];
  data.specs ||= {};
  data.compatibility ||= [];
  product.value = data;
  initSpecs(data.category);
});

/* ══ INIT SPECS ══ */
const initSpecs = (category) => {
  const config = CATEGORY_CONFIG[category];
  if (!config) { categorySpecs.value = []; return; }
  categorySpecs.value = config.specs;
  config.specs.forEach(s => {
    if (!product.value.specs[s.key]) product.value.specs[s.key] = "";
  });
};

/* ══ WATCH CATEGORY ══ */
watch(() => product.value?.category, (newCat) => {
  if (!product.value) return;
  product.value.specs = {};
  initSpecs(newCat);
});

/* ══ COMPATIBILITY ══ */
const addCompatibility = () => {
  if (!compatibilityInput.value.trim()) return;
  product.value.compatibility.push(compatibilityInput.value.trim());
  compatibilityInput.value = "";
};
const removeCompatibility = i => product.value.compatibility.splice(i, 1);

/* ══ IMAGE ══ */
const handleFileSelect = e => processFiles([...e.target.files]);
const handleDrop = e => { isDragging.value = false; processFiles([...e.dataTransfer.files]); };
const processFiles = files => {
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => product.value.images.push(e.target.result);
    reader.readAsDataURL(file);
  });
};
const removeImage = i => product.value.images.splice(i, 1);

/* ══ SUBMIT ══ */
const submit = async () => {
  if (!product.value.images.length) return alert("Phải có ít nhất 1 ảnh");
  isSubmitting.value = true;
  try {
    await ProductService.update(route.params.id, product.value);
    alert("Cập nhật thành công!");
    router.push("/products");
  } catch (err) {
    alert(err.response?.data?.message || err.message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.edit-page {
  min-height: 100vh;
  background: #f0f4ff;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ══ HERO ══ */
.hero {
  position: relative; overflow: hidden;
  background: #0a0f1e;
  padding: 0 0 64px;
}
.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 10% 0%, rgba(37,99,235,.35), transparent),
    radial-gradient(ellipse 60% 50% at 90% 100%, rgba(124,58,237,.3), transparent),
    radial-gradient(ellipse 40% 40% at 50% 50%, rgba(16,185,129,.08), transparent);
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.hero-orb-1 { width: 300px; height: 300px; background: rgba(37,99,235,.25); top: -80px; left: -60px; }
.hero-orb-2 { width: 250px; height: 250px; background: rgba(124,58,237,.2); bottom: -60px; right: -40px; }

.hero-content {
  position: relative; z-index: 2;
  max-width: 1200px; margin: 0 auto;
  padding: 28px 24px 0;
  display: flex; flex-direction: column; gap: 20px;
}
.breadcrumb {
  font-size: .8rem; color: rgba(255,255,255,.45);
  display: flex; align-items: center; gap: 6px;
}
.breadcrumb .sep { color: rgba(255,255,255,.2); }
.breadcrumb .current { color: rgba(255,255,255,.8); font-weight: 600; }

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px; padding: 6px 18px;
  font-size: .72rem; font-weight: 700; color: rgba(255,255,255,.75);
  letter-spacing: .08em; text-transform: uppercase;
  margin-bottom: 12px;
}
.eyebrow-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #f59e0b; box-shadow: 0 0 8px #f59e0b;
  animation: blink 1.8s ease-in-out infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(1.5); }
}
.hero-title {
  font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 900; color: white;
  line-height: 1.15; letter-spacing: -.02em; margin: 0;
}
.hero-title em {
  font-style: normal;
  background: linear-gradient(90deg, #fbbf24, #f97316, #fb923c);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* ══ LOADING ══ */
.loading-card {
  background: white; border-radius: 22px;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 8px 30px rgba(10,15,30,.08);
  padding: 60px 28px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  margin-top: -32px;
}
.spinner-lg {
  width: 40px; height: 40px;
  border: 3px solid #e0e7ff;
  border-top-color: #2563eb; border-radius: 50%;
  animation: spin .7s linear infinite;
}
.loading-text { color: #94a3b8; font-size: .9rem; font-weight: 600; }

/* ══ FORM PANEL ══ */
.form-panel {
  max-width: 1000px; margin: -32px auto 0;
  padding: 0 24px 60px;
  position: relative; z-index: 10;
}
.form-body { display: flex; flex-direction: column; gap: 20px; }

/* ══ SECTION CARD ══ */
.section-card {
  background: white; border-radius: 22px;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 8px 30px rgba(10,15,30,.08);
  padding: 24px 28px;
  animation: cardIn .4s ease both;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.section-header {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 22px;
  padding-bottom: 16px;
  border-bottom: 1.5px solid #f1f5f9;
}
.section-icon { font-size: 1.4rem; line-height: 1; }
.section-title { font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0 0 2px; }
.section-sub { font-size: .78rem; color: #94a3b8; margin: 0; }

/* ══ FIELDS ══ */
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.field-wrap { display: flex; flex-direction: column; gap: 6px; }
.field-wrap.col-2 { grid-column: span 2; }
.field-label {
  font-size: .78rem; font-weight: 700; color: #374151;
  letter-spacing: .02em;
}
.req { color: #e11d48; }

.field-input {
  width: 100%; padding: 11px 14px;
  border: 1.5px solid #e2e8f0; border-radius: 12px;
  font-size: .88rem; color: #0f172a;
  background: #fafbff;
  outline: none; transition: border-color .2s, box-shadow .2s;
  font-family: inherit;
}
.field-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,.1);
  background: white;
}
.field-input::placeholder { color: #cbd5e1; }
.field-textarea { min-height: 90px; resize: vertical; }
.field-select {
  cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; padding-right: 36px;
}

.input-prefix-wrap { position: relative; }
.input-prefix {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  font-size: .85rem; font-weight: 700; color: #94a3b8;
}
.field-input.has-prefix { padding-left: 28px; }

.discount-preview {
  display: flex; align-items: center; gap: 10px;
  background: linear-gradient(135deg, #fff7ed, #fef3c7);
  border: 1px solid #fde68a; border-radius: 12px;
  padding: 12px 16px; margin-top: 12px;
  font-size: .85rem; color: #92400e;
}
.discount-icon { font-size: 1rem; }

/* ══ TAGS ══ */
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; min-height: 32px; }
.tag {
  display: inline-flex; align-items: center; gap: 6px;
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #e0e7ff; color: #4f46e5;
  font-size: .8rem; font-weight: 600;
  padding: 5px 12px; border-radius: 999px;
  cursor: pointer; transition: all .18s;
}
.tag:hover { background: #fef2f2; border-color: #fca5a5; color: #e11d48; }
.tag-x { font-size: .7rem; opacity: .6; }
.tag-empty { font-size: .8rem; color: #cbd5e1; align-self: center; }

/* ══ DROP ZONE ══ */
.drop-zone {
  border: 2px dashed #e0e7ff; border-radius: 16px;
  background: #fafbff; cursor: pointer;
  transition: border-color .2s, background .2s;
  min-height: 140px; padding: 20px;
  display: flex; align-items: center; justify-content: center;
}
.drop-zone:hover, .drop-zone.drag-over {
  border-color: #2563eb;
  background: #eff6ff;
}
.drop-placeholder { text-align: center; }
.drop-icon { font-size: 2.4rem; margin-bottom: 10px; }
.drop-text { font-size: .9rem; color: #475569; margin-bottom: 4px; }
.drop-link { color: #2563eb; font-weight: 700; }
.drop-hint { font-size: .75rem; color: #94a3b8; }

.img-preview-list {
  display: flex; flex-wrap: wrap; gap: 12px;
  width: 100%;
}
.img-preview {
  position: relative; width: 100px; height: 100px;
  border-radius: 12px; overflow: hidden;
  border: 1.5px solid #e8edf8;
}
.img-preview img { width: 100%; height: 100%; object-fit: cover; }
.img-remove {
  position: absolute; top: 4px; right: 4px;
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(220,38,38,.85); color: white;
  border: none; cursor: pointer; font-size: .65rem;
  display: flex; align-items: center; justify-content: center;
  line-height: 1;
}
.img-main-badge {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(37,99,235,.8); color: white;
  font-size: .6rem; font-weight: 700; text-align: center;
  padding: 3px; letter-spacing: .03em;
}
.img-add-more {
  width: 100px; height: 100px; border-radius: 12px;
  border: 2px dashed #e0e7ff; background: #f8faff;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s; gap: 4px;
  color: #94a3b8; font-size: .72rem;
}
.img-add-more span { font-size: 1.4rem; color: #a5b4fc; line-height: 1; }
.img-add-more:hover { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
.img-add-more:hover span { color: #2563eb; }

.hidden-input { display: none; }

/* ══ TOGGLE ══ */
.toggle-list { display: flex; flex-direction: column; gap: 0; }
.toggle-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 0; border-bottom: 1px solid #f1f5f9; cursor: pointer;
}
.toggle-item:last-child { border-bottom: none; }
.toggle-info { display: flex; flex-direction: column; gap: 2px; }
.toggle-name { font-size: .9rem; font-weight: 700; color: #0f172a; }
.toggle-desc { font-size: .76rem; color: #94a3b8; }
.toggle-switch {
  width: 44px; height: 24px; border-radius: 999px;
  background: #e2e8f0; position: relative;
  transition: background .25s; flex-shrink: 0;
  cursor: pointer;
}
.toggle-switch.on { background: linear-gradient(135deg, #2563eb, #4f46e5); }
.toggle-knob {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: white; transition: transform .25s;
  box-shadow: 0 1px 4px rgba(0,0,0,.2);
}
.toggle-switch.on .toggle-knob { transform: translateX(20px); }

/* ══ SUBMIT BAR ══ */
.submit-bar {
  display: flex; gap: 12px; justify-content: flex-end;
  padding: 20px 28px;
  background: white; border-radius: 22px;
  border: 1.5px solid #e8edf8;
  box-shadow: 0 8px 30px rgba(10,15,30,.08);
}
.btn-cancel {
  padding: 12px 28px; border-radius: 13px;
  background: #f1f5f9; color: #475569;
  font-weight: 700; font-size: .9rem;
  border: none; cursor: pointer; transition: background .2s;
}
.btn-cancel:hover { background: #e2e8f0; }
.btn-submit {
  padding: 12px 32px; border-radius: 13px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white; font-weight: 700; font-size: .9rem;
  border: none; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 16px rgba(245,158,11,.35);
  transition: transform .2s, box-shadow .2s;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,158,11,.45); }
.btn-submit:disabled { opacity: .6; cursor: not-allowed; }

.spinner-sm {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: white; border-radius: 50%;
  display: inline-block;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ RESPONSIVE ══ */
@media (max-width: 640px) {
  .form-panel { padding: 0 14px 40px; }
  .section-card { padding: 18px 16px; }
  .field-grid { grid-template-columns: 1fr; }
  .field-wrap.col-2 { grid-column: span 1; }
  .submit-bar { flex-direction: column; }
  .btn-cancel, .btn-submit { width: 100%; justify-content: center; }
}
</style>