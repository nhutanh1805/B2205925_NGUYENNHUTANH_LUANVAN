<template>
  <div class="settings-app">
    <!-- Header -->
    <div class="settings-header">
      <button class="back-btn" @click="$emit('close')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>
      <span class="header-title">{{ activeSection ? sectionTitle : 'Cài đặt' }}</span>
      <div style="width: 34px;"></div>
    </div>

    <!-- PROFILE CARD (only on home) -->
    <transition name="slide-fade">
      <div v-if="!activeSection" class="profile-card" @click="openSection('account')">
        <div class="avatar-ring">
          <div class="avatar-inner">{{ profile.initials }}</div>
        </div>
        <div class="profile-info">
          <p class="profile-name">{{ profile.name }}</p>
          <p class="profile-sub">{{ profile.email }}</p>
        </div>
        <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
    </transition>

    <!-- MAIN MENU -->
    <transition name="slide-fade">
      <div v-if="!activeSection" class="scroll-area no-scrollbar">
        <div v-for="(group, gi) in settingsGroups" :key="gi" class="section-group">
          <div
            v-for="(item, ii) in group"
            :key="ii"
            class="settings-row"
            :class="{ last: ii === group.length - 1 }"
            @click="handleRow(item)"
          >
            <div class="row-icon" :style="{ background: item.color }">
              <i :class="item.icon"></i>
            </div>
            <span class="row-label">{{ item.label }}</span>
            <div class="row-right">
              <!-- Toggle -->
              <div
                v-if="item.toggle !== undefined"
                class="toggle-switch"
                :class="{ active: toggles[item.key] }"
                @click.stop="toggles[item.key] = !toggles[item.key]"
              >
                <div class="toggle-thumb"></div>
              </div>
              <!-- Value + chevron -->
              <template v-else>
                <span v-if="item.value" class="row-value">{{ item.value }}</span>
                <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </template>
            </div>
          </div>
        </div>

        <p class="version-text">iOS Simulator v1.0.0 · Build 2025</p>
      </div>
    </transition>

    <!-- SECTION DETAIL -->
    <transition name="slide-in">
      <div v-if="activeSection" class="scroll-area no-scrollbar section-detail">
        <component :is="sectionComponent" v-bind="sectionProps" @back="activeSection = null" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h } from 'vue'

defineEmits(['close'])

const profile = ref({
  name: 'Nguyễn Nhựt Anh',
  email: 'nhutanh@icloud.com',
  initials: 'NNA'
})

const toggles = ref({
  wifi: true,
  bluetooth: true,
  airdrop: false,
  notifications: true,
  darkMode: false,
  doNotDisturb: false,
  locationServices: true,
  faceId: true,
  analytics: false,
})

const activeSection = ref(null)

const settingsGroups = [
  [
    { label: 'Wi-Fi',      icon: 'bi bi-wifi',          color: '#0a84ff', key: 'wifi',      toggle: true, section: 'wifi'      },
    { label: 'Bluetooth',  icon: 'bi bi-bluetooth',      color: '#0a84ff', key: 'bluetooth', toggle: true, section: 'bluetooth' },
    { label: 'AirDrop',    icon: 'bi bi-broadcast',      color: '#0a84ff', key: 'airdrop',   toggle: true },
    { label: 'Di động',    icon: 'bi bi-reception-4',    color: '#34c759',                   section: 'cellular', value: '4G' },
  ],
  [
    { label: 'Thông báo',  icon: 'bi bi-bell-fill',      color: '#ff3b30', key: 'notifications', toggle: true },
    { label: 'Âm thanh',   icon: 'bi bi-speaker-fill',   color: '#ff9500', section: 'sound',   value: '75%'  },
    { label: 'Chớp tắt',   icon: 'bi bi-moon-fill',      color: '#5e5ce6', key: 'doNotDisturb', toggle: true },
  ],
  [
    { label: 'Màn hình',   icon: 'bi bi-phone-fill',     color: '#30b0c7', section: 'display', value: 'Tự động' },
    { label: 'Hình nền',   icon: 'bi bi-image-fill',     color: '#ff375f', section: 'wallpaper' },
    { label: 'Trợ năng',   icon: 'bi bi-universal-access', color: '#0a84ff', section: 'accessibility' },
  ],
  [
    { label: 'Face ID',    icon: 'bi bi-person-bounding-box', color: '#30b0c7', key: 'faceId', toggle: true },
    { label: 'Quyền riêng tư', icon: 'bi bi-hand-index-thumb-fill', color: '#3a3a3c', section: 'privacy' },
    { label: 'Vị trí',     icon: 'bi bi-geo-alt-fill',   color: '#34c759', key: 'locationServices', toggle: true },
  ],
  [
    { label: 'Bộ nhớ',     icon: 'bi bi-hdd-fill',       color: '#ff9500', section: 'storage', value: '23 GB' },
    { label: 'Pin',        icon: 'bi bi-battery-half',    color: '#34c759', section: 'battery', value: '84%'  },
    { label: 'Cập nhật',   icon: 'bi bi-arrow-repeat',    color: '#0a84ff', section: 'update',  value: 'iOS 18.4' },
  ],
]

const sectionTitle = computed(() => {
  const map = {
    account: 'Tài khoản', wifi: 'Wi-Fi', bluetooth: 'Bluetooth',
    cellular: 'Di động', sound: 'Âm thanh & Rung', display: 'Màn hình',
    wallpaper: 'Hình nền', privacy: 'Quyền riêng tư', storage: 'Bộ nhớ',
    battery: 'Pin', update: 'Cập nhật phần mềm', accessibility: 'Trợ năng'
  }
  return map[activeSection.value] || ''
})

/* ---------- inline sub-screens ---------- */

const WifiSection = defineComponent({
  props: ['toggles'],
  setup(props) {
    const networks = ref([
      { name: 'Nhà mình 🏠', strength: 4, secured: true, connected: true },
      { name: 'Hàng xóm_2.4G', strength: 3, secured: true,  connected: false },
      { name: 'CoffeeShop_Free', strength: 2, secured: false, connected: false },
      { name: 'VNPT_5G_Home',   strength: 3, secured: true,  connected: false },
    ])
    return () => h('div', {}, [
      h('div', { class: 'sub-row' }, [
        h('span', { class: 'sub-label' }, 'Wi-Fi'),
        h('div', { class: 'toggle-switch active', style: 'margin-left:auto' }, [h('div', { class: 'toggle-thumb' })])
      ]),
      h('p', { class: 'section-label' }, 'MẠNG CỦA TÔI'),
      ...networks.value.map(n => h('div', { class: 'sub-row' }, [
        h('div', { style: 'display:flex;align-items:center;gap:10px;flex:1' }, [
          n.connected ? h('i', { class: 'bi bi-wifi', style: 'color:#0a84ff;font-size:1.1rem' }) : h('i', { class: 'bi bi-wifi-2', style: 'font-size:1.1rem;color:rgba(255,255,255,.4)' }),
          h('span', { class: 'sub-label' }, n.name),
          n.secured ? h('i', { class: 'bi bi-lock-fill', style: 'color:rgba(255,255,255,.4);font-size:.75rem' }) : null,
        ]),
        n.connected ? h('span', { style: 'color:#0a84ff;font-size:.8rem' }, 'Đã kết nối') : null,
      ]))
    ])
  }
})

const SoundSection = defineComponent({
  setup() {
    const volume = ref(75)
    const ringtone = ref('Mặc định')
    return () => h('div', {}, [
      h('p', { class: 'section-label' }, 'ÂM LƯỢNG'),
      h('div', { class: 'slider-row' }, [
        h('i', { class: 'bi bi-volume-down-fill', style: 'color:rgba(255,255,255,.5)' }),
        h('input', {
          type: 'range', min: 0, max: 100, value: volume.value,
          onInput: e => volume.value = +e.target.value,
          style: 'flex:1;accent-color:#fff'
        }),
        h('i', { class: 'bi bi-volume-up-fill', style: 'color:#fff' }),
      ]),
      h('div', { class: 'sub-row' }, [
        h('span', { class: 'sub-label' }, 'Nhạc chuông'),
        h('span', { style: 'color:rgba(255,255,255,.45);font-size:.8rem' }, ringtone.value)
      ]),
      h('div', { class: 'sub-row' }, [
        h('span', { class: 'sub-label' }, 'Âm bàn phím'),
        h('div', { class: 'toggle-switch active' }, [h('div', { class: 'toggle-thumb' })])
      ]),
      h('div', { class: 'sub-row' }, [
        h('span', { class: 'sub-label' }, 'Rung khi đổ chuông'),
        h('div', { class: 'toggle-switch' }, [h('div', { class: 'toggle-thumb' })])
      ]),
    ])
  }
})

const StorageSection = defineComponent({
  setup() {
    const apps = ref([
      { name: 'Photos',   size: 5.8, color: '#ff9500' },
      { name: 'TikTok',   size: 3.2, color: '#000' },
      { name: 'YouTube',  size: 2.4, color: '#ff0000' },
      { name: 'Shipper',  size: 1.1, color: '#4f46e5' },
      { name: 'Messages', size: 0.8, color: '#34c759' },
      { name: 'Khác',     size: 9.7, color: '#636366' },
    ])
    const total = 23
    const used = apps.value.reduce((a, b) => a + b.size, 0)
    return () => h('div', {}, [
      h('div', { class: 'storage-bar' },
        apps.value.map(a => h('div', {
          style: `width:${(a.size / 64 * 100).toFixed(1)}%;background:${a.color};height:100%;border-radius:2px`
        }))
      ),
      h('div', { class: 'storage-stats' }, [
        h('div', { class: 'stat-item' }, [
          h('p', { class: 'stat-val' }, used.toFixed(1) + ' GB'),
          h('p', { class: 'stat-key' }, 'Đã dùng'),
        ]),
        h('div', { class: 'stat-item' }, [
          h('p', { class: 'stat-val' }, (64 - used).toFixed(1) + ' GB'),
          h('p', { class: 'stat-key' }, 'Còn trống'),
        ]),
        h('div', { class: 'stat-item' }, [
          h('p', { class: 'stat-val' }, '64 GB'),
          h('p', { class: 'stat-key' }, 'Tổng'),
        ]),
      ]),
      h('p', { class: 'section-label' }, 'DUNG LƯỢNG ỨNG DỤNG'),
      ...apps.value.map(a => h('div', { class: 'sub-row' }, [
        h('div', { style: `width:10px;height:10px;border-radius:2px;background:${a.color};margin-right:12px;flex-shrink:0` }),
        h('span', { class: 'sub-label' }, a.name),
        h('span', { style: 'margin-left:auto;color:rgba(255,255,255,.45);font-size:.8rem' }, a.size.toFixed(1) + ' GB'),
      ]))
    ])
  }
})

const BatterySection = defineComponent({
  setup() {
    const level = ref(84)
    const history = ref([78, 82, 91, 75, 84, 88, 84])
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    return () => h('div', {}, [
      h('div', { class: 'battery-display' }, [
        h('i', { class: 'bi bi-battery-half', style: 'font-size:2.5rem;color:#34c759' }),
        h('p', { class: 'battery-pct' }, level.value + '%'),
        h('p', { style: 'color:rgba(255,255,255,.5);font-size:.8rem' }, 'Ước tính còn ~5 giờ 20 phút'),
      ]),
      h('p', { class: 'section-label' }, 'MỨC PIN 7 NGÀY QUA'),
      h('div', { class: 'bar-chart' },
        history.value.map((v, i) => h('div', { class: 'bar-col' }, [
          h('div', { class: 'bar-fill', style: `height:${v}%;background:${v < 20 ? '#ff3b30' : '#34c759'}` }),
          h('span', { class: 'bar-label' }, days[i]),
        ]))
      ),
      h('div', { class: 'sub-row' }, [
        h('span', { class: 'sub-label' }, 'Chế độ tiết kiệm pin'),
        h('div', { class: 'toggle-switch' }, [h('div', { class: 'toggle-thumb' })])
      ]),
      h('div', { class: 'sub-row' }, [
        h('span', { class: 'sub-label' }, 'Pin tối ưu hóa'),
        h('div', { class: 'toggle-switch active' }, [h('div', { class: 'toggle-thumb' })])
      ]),
    ])
  }
})

const GenericSection = defineComponent({
  props: ['name'],
  setup(props) {
    return () => h('div', { style: 'padding:40px 0;text-align:center;color:rgba(255,255,255,.4);font-size:.9rem' }, [
      h('i', { class: 'bi bi-gear-fill', style: 'font-size:2.5rem;display:block;margin-bottom:16px;color:rgba(255,255,255,.2)' }),
      h('p', {}, props.name + ' chưa được triển khai'),
    ])
  }
})

const sectionComponent = computed(() => {
  const map = { wifi: WifiSection, sound: SoundSection, storage: StorageSection, battery: BatterySection }
  return map[activeSection.value] || GenericSection
})
const sectionProps = computed(() => {
  if (activeSection.value === 'battery' || activeSection.value === 'wifi') return { toggles: toggles.value }
  return { name: sectionTitle.value }
})

const openSection = (key) => { activeSection.value = key }

const handleRow = (item) => {
  if (item.section) openSection(item.section)
}
</script>

<style scoped>
/* ── Base ── */
.settings-app {
  position: absolute;
  inset: 0;
  background: #1c1c1e;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, 'SF Pro Text', sans-serif;
  color: #fff;
  overflow: hidden;
}

/* ── Header ── */
.settings-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  background: rgba(28,28,30,0.92);
  backdrop-filter: blur(16px);
  border-bottom: 0.5px solid rgba(255,255,255,.1);
  flex-shrink: 0;
  z-index: 10;
}

.header-title {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.back-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,.1);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .15s;
}
.back-btn:active { background: rgba(255,255,255,.2); }

/* ── Profile card ── */
.profile-card {
  margin: 14px 16px 4px;
  background: #2c2c2e;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: background .15s;
  flex-shrink: 0;
}
.profile-card:active { background: #3a3a3c; }

.avatar-ring {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0a84ff, #30b0c7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-inner {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #1c1c1e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #0a84ff;
}

.profile-info { flex: 1; }
.profile-name { font-size: .95rem; font-weight: 600; margin: 0 0 2px; }
.profile-sub  { font-size: .75rem; color: rgba(255,255,255,.45); margin: 0; }

.chevron { color: rgba(255,255,255,.3); flex-shrink: 0; }

/* ── Scroll area ── */
.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0 24px;
}
.no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }

/* ── Section group ── */
.section-group {
  margin: 0 16px 10px;
  background: #2c2c2e;
  border-radius: 14px;
  overflow: hidden;
}

.settings-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background .1s;
  border-bottom: 0.5px solid rgba(255,255,255,.07);
}
.settings-row.last { border-bottom: none; }
.settings-row:active { background: rgba(255,255,255,.05); }

.row-icon {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.row-icon i { font-size: .95rem; color: #fff; }

.row-label { flex: 1; font-size: .88rem; font-weight: 400; }

.row-right { display: flex; align-items: center; gap: 6px; }

.row-value { font-size: .82rem; color: rgba(255,255,255,.4); }

/* ── Toggle ── */
.toggle-switch {
  width: 44px;
  height: 26px;
  border-radius: 13px;
  background: rgba(255,255,255,.15);
  position: relative;
  cursor: pointer;
  transition: background .25s;
  flex-shrink: 0;
}
.toggle-switch.active { background: #34c759; }

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  transition: transform .25s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 1px 4px rgba(0,0,0,.35);
}
.toggle-switch.active .toggle-thumb { transform: translateX(18px); }

/* ── Version ── */
.version-text {
  text-align: center;
  font-size: .72rem;
  color: rgba(255,255,255,.2);
  margin: 16px 0 0;
}

/* ── Section detail ── */
.section-detail { padding: 8px 0 24px; }

/* ── Sub rows (used inside detail sections) ── */
:deep(.sub-row) {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 0.5px solid rgba(255,255,255,.07);
  gap: 8px;
}
:deep(.sub-label) { font-size: .88rem; }
:deep(.section-label) {
  font-size: .7rem;
  color: rgba(255,255,255,.35);
  padding: 14px 16px 6px;
  letter-spacing: .5px;
}

/* Slider row */
:deep(.slider-row) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px 16px;
}
:deep(.slider-row input) { flex: 1; }

/* ── Storage ── */
:deep(.storage-bar) {
  display: flex;
  gap: 2px;
  margin: 16px 16px 6px;
  height: 14px;
  border-radius: 4px;
  overflow: hidden;
}
:deep(.storage-stats) {
  display: flex;
  justify-content: space-around;
  padding: 10px 16px 4px;
}
:deep(.stat-item) { text-align: center; }
:deep(.stat-val) { font-size: 1rem; font-weight: 600; margin: 0 0 2px; }
:deep(.stat-key) { font-size: .7rem; color: rgba(255,255,255,.4); margin: 0; }

/* ── Battery ── */
:deep(.battery-display) {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 16px;
  gap: 6px;
}
:deep(.battery-pct) { font-size: 2.5rem; font-weight: 700; margin: 0; }
:deep(.bar-chart) {
  display: flex;
  gap: 6px;
  padding: 8px 16px 16px;
  height: 110px;
  align-items: flex-end;
}
:deep(.bar-col) {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
}
:deep(.bar-fill) { width: 100%; border-radius: 3px; }
:deep(.bar-label) { font-size: .65rem; color: rgba(255,255,255,.4); }

/* ── Transitions ── */
.slide-fade-enter-active { transition: all .25s ease; }
.slide-fade-leave-active { transition: all .18s ease; }
.slide-fade-enter-from   { opacity: 0; transform: translateY(6px); }
.slide-fade-leave-to     { opacity: 0; transform: translateY(-6px); }

.slide-in-enter-active   { transition: all .28s cubic-bezier(.4,0,.2,1); }
.slide-in-leave-active   { transition: all .2s ease; }
.slide-in-enter-from     { opacity: 0; transform: translateX(24px); }
.slide-in-leave-to       { opacity: 0; transform: translateX(-24px); }
</style>