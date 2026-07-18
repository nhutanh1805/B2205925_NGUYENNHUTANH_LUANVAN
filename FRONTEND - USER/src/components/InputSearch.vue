<script setup>
import { ref, computed } from "vue";
import Fuse from "fuse.js";

const props = defineProps({
  modelValue: { type: String, default: "" },
  products: { type: Array, default: () => [] }
});

const emit = defineEmits(["update:modelValue", "submit"]);

const isListening = ref(false);
const isAnalyzing = ref(false);
let recognition = null;
let hasResult = false;
const debounceTimer = ref(null);
const fileInput = ref(null);
const aiMessage = ref("");

// ─── Fuzzy search (chịu lỗi chính tả + không dấu) ──────
function removeDiacritics(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

const searchableProducts = computed(() =>
  props.products.map(p => ({
    ...p,
    _searchName: removeDiacritics(p.name) // chuỗi đầy đủ, không dấu, viết thường
  }))
);

// 3 mức Fuse theo độ dài từ: từ càng ngắn càng cần khoan dung hơn
// (vì threshold của Fuse tính theo tỉ lệ độ dài, từ ngắn dễ bị "quá khắt khe")
const fuseStrict = computed(() => new Fuse(searchableProducts.value, {
  keys: ["_searchName"],
  threshold: 0.4,        // từ dài (5+ ký tự): chặt, tránh match linh tinh
  ignoreLocation: true,  // fuzzy match ở bất kỳ vị trí nào trong chuỗi
  minMatchCharLength: 2,
  includeScore: true,
  distance: 100
}));

const fuseMedium = computed(() => new Fuse(searchableProducts.value, {
  keys: ["_searchName"],
  threshold: 0.5,        // từ vừa (3-4 ký tự): khoan dung hơn
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeScore: true,
  distance: 100
}));

const fuseLenient = computed(() => new Fuse(searchableProducts.value, {
  keys: ["_searchName"],
  threshold: 0.7,        // từ ngắn (1-2 ký tự): rất khoan dung, tránh tắt gợi ý khi mới gõ/xóa dở
  ignoreLocation: true,
  minMatchCharLength: 1,
  includeScore: true,
  distance: 100
}));

function getFuseForWord(word) {
  if (word.length <= 2) return fuseLenient.value;
  if (word.length <= 4) return fuseMedium.value;
  return fuseStrict.value;
}

const suggestions = ref([]);
const showSuggestions = ref(false);

function updateSuggestions(value) {
  const trimmed = (value || "").trim();
  if (trimmed.length < 2) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  // Tách query thành từng từ, mỗi từ fuzzy-search riêng trên TOÀN BỘ tên sản phẩm.
  // Dùng OR có tính điểm ưu tiên: sản phẩm khớp CÀNG NHIỀU từ càng lên đầu,
  // nhưng chỉ cần khớp ÍT NHẤT 1 từ cũng vẫn hiện ra — nên gõ nhiều từ có dấu cách
  // vẫn tìm được, dù không phải từ nào cũng khớp hoàn hảo (khác AND cũ: bắt buộc
  // khớp HẾT tất cả các từ mới hiện, dễ bị 0 kết quả khi 1 từ bị lệch).
  const queryWords = removeDiacritics(trimmed).split(/\s+/).filter(Boolean);

  // Map<item, { matchedCount, totalScore }>
  const scoreMap = new Map();

  for (const word of queryWords) {
    const activeFuse = getFuseForWord(word);
    const results = activeFuse.search(word);

    for (const r of results) {
      const existing = scoreMap.get(r.item);
      if (existing) {
        existing.matchedCount++;
        existing.totalScore += r.score;
      } else {
        scoreMap.set(r.item, { matchedCount: 1, totalScore: r.score });
      }
    }
  }

  const scored = Array.from(scoreMap.entries())
    .map(([item, { matchedCount, totalScore }]) => ({
      item,
      matchedCount,
      avgScore: totalScore / matchedCount
    }))
    .sort((a, b) => {
      // ưu tiên khớp được NHIỀU từ hơn trước (khớp cả 2/3 từ > chỉ khớp 1 từ)
      if (b.matchedCount !== a.matchedCount) return b.matchedCount - a.matchedCount;
      // nếu số từ khớp bằng nhau, ưu tiên điểm càng thấp (càng chính xác) càng trước
      return a.avgScore - b.avgScore;
    });

  suggestions.value = scored.slice(0, 5).map(s => s.item);
  showSuggestions.value = suggestions.value.length > 0;
}

function pickSuggestion(product) {
  emit("update:modelValue", product.name);
  showSuggestions.value = false;
  suggestions.value = [];
  emit("submit");
}

function hideSuggestionsDelayed() {
  // delay để kịp xử lý click vào item trước khi blur ẩn dropdown
  setTimeout(() => { showSuggestions.value = false; }, 150);
}

// ─── API keys fallback ─────────────────────────────────
const API_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY,
  import.meta.env.VITE_GROQ_API_KEY_2,
].filter(Boolean);
const currentKeyIndex = ref(0);

// ─── Text search ───────────────────────────────────────
function onInput(e) {
  const value = e.target.value;
  emit("update:modelValue", value);
  aiMessage.value = "";
  updateSuggestions(value);
  clearTimeout(debounceTimer.value);
  debounceTimer.value = setTimeout(() => {
    emit("submit");
  }, 300);
}

function submit() {
  showSuggestions.value = false;
  emit("submit");
}

// ─── Voice search ──────────────────────────────────────
function toggleVoice() {
  if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    alert("Trình duyệt không hỗ trợ nhận giọng nói!");
    return;
  }
  if (isListening.value) {
    recognition?.stop();
    return;
  }
  startRecognition();
}

function startRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "vi-VN";
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.maxAlternatives = 1;

  hasResult = false;

  recognition.onstart = () => { isListening.value = true; };

  recognition.onend = () => {
    if (isListening.value && !hasResult) {
      recognition.start();
    } else {
      isListening.value = false;
    }
  };

  recognition.onresult = (e) => {
    let interim = "";
    let final = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        final += e.results[i][0].transcript;
      } else {
        interim += e.results[i][0].transcript;
      }
    }
    const value = final || interim;
    emit("update:modelValue", value);
    emit("submit");
    if (final) {
      hasResult = true;
      recognition?.stop();
    }
  };

  recognition.onerror = (e) => {
    if (e.error === "no-speech") return;
    isListening.value = false;
  };

  recognition.start();
}

// ─── Image search ──────────────────────────────────────
function openImagePicker() {
  fileInput.value.click();
}

async function callGroqAPI(base64, fileType, productList, signal) {
  const key = API_KEYS[currentKeyIndex.value];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify({
      model: "qwen/qwen3.6-27b",
      reasoning_effort: "none",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${fileType};base64,${base64}` }
            },
            {
              type: "text",
              text: `Hãy phân tích ảnh này và xác định đây là sản phẩm gì (thương hiệu, dòng sản phẩm, model, màu sắc...).

Danh sách sản phẩm trong hệ thống:
${productList}

Tìm sản phẩm trong danh sách TƯƠNG TỰ NHẤT với ảnh dựa trên loại sản phẩm, thương hiệu, dòng sản phẩm.
Không cần khớp 100% — ví dụ ảnh chụp iPhone 14 ngoài đường có thể match "Apple iPhone 14 128GB" trong danh sách.
Hãy cố gắng tìm sản phẩm gần nhất có thể, chỉ trả về null nếu thực sự không liên quan gì.

Chỉ trả về JSON duy nhất, không giải thích, không markdown, không text thêm:
{"match": "Tên sản phẩm trong danh sách", "confidence": 85, "description": "Hình ảnh của bạn có thể là [mô tả ngắn gọn sản phẩm trong ảnh]"}
Nếu không có sản phẩm nào liên quan: {"match": null, "confidence": 0, "description": "Hình ảnh của bạn không khớp với sản phẩm nào trong hệ thống"}`
            }
          ]
        }
      ],
      max_tokens: 500
    })
  });

  // Nếu bị rate limit và còn key dự phòng → chuyển key và retry
  if (response.status === 429 && currentKeyIndex.value < API_KEYS.length - 1) {
    currentKeyIndex.value++;
    return callGroqAPI(base64, fileType, productList, signal);
  }

  return response;
}

async function onImageSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  e.target.value = "";
  isAnalyzing.value = true;
  aiMessage.value = "";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const base64 = await toBase64(file);
    const productList = props.products.map((p, i) => `${i + 1}. ${p.name}`).join("\n");

    const response = await callGroqAPI(base64, file.type, productList, controller.signal);

    clearTimeout(timeout);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        aiMessage.value = "Tất cả API key đang bị giới hạn request, vui lòng chờ 1-2 phút rồi thử lại!";
      } else {
        aiMessage.value = `Lỗi: ${data.error?.message || "Unknown error"}`;
      }
      return;
    }

    const raw = data.choices[0].message.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      aiMessage.value = "Không thể phân tích ảnh này, vui lòng thử lại!";
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.match) {
      aiMessage.value = ` ${parsed.description || "Không tìm thấy sản phẩm tương tự trong hệ thống!"}`;
      return;
    }

    aiMessage.value = ` ${parsed.description} Mình đã tìm thấy sản phẩm tương tự: "${parsed.match}"!`;

    emit("update:modelValue", parsed.match);
    emit("submit");

  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      aiMessage.value = "Phân tích quá lâu, vui lòng thử lại!";
    } else {
      aiMessage.value = "Lỗi phân tích ảnh, vui lòng thử lại!";
    }
  } finally {
    isAnalyzing.value = false;
  }
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
</script>

<template>
  <div class="search-container">
    <div class="search-wrapper">
      <i class="icon-search"></i>

      <input
        type="text"
        class="search-input"
        placeholder="Tìm theo tên, hãng, IMEI..."
        :value="modelValue"
        @input="onInput"
        @keyup.enter="submit"
        @focus="updateSuggestions(modelValue)"
        @blur="hideSuggestionsDelayed"
      />

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="onImageSelected"
      />

      <button
        v-if="modelValue"
        class="clear-btn"
        @click="emit('update:modelValue', ''); emit('submit'); aiMessage = ''; suggestions = []; showSuggestions = false"
      >
        ✕
      </button>

      <button class="img-btn" :class="{ loading: isAnalyzing }" :disabled="isAnalyzing" @click="openImagePicker">
        <svg v-if="!isAnalyzing" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <svg v-else class="spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </button>

      <button class="mic-btn" :class="{ active: isListening }" @click="toggleVoice">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="9" y1="22" x2="15" y2="22" />
        </svg>
      </button>

      <!-- Fuzzy suggestions dropdown -->
      <transition name="fade">
        <ul v-if="showSuggestions" class="suggestions-dropdown">
          <li
            v-for="item in suggestions"
            :key="item._id || item.name"
            @mousedown.prevent="pickSuggestion(item)"
          >
            {{ item.name }}
          </li>
        </ul>
      </transition>
    </div>

    <!-- AI message -->
    <transition name="fade">
      <div v-if="aiMessage" class="ai-message">
        <span>{{ aiMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.search-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,.08);
  border: 2px solid transparent;
  transition: .25s;
}

.search-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 12px 30px rgba(59,130,246,.35);
}

.icon-search {
  font-size: 1.1rem;
  opacity: .5;
  margin-right: 10px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: .95rem;
  font-weight: 500;
}

.clear-btn {
  background: #f1f5f9;
  border-radius: 999px;
  width: 26px;
  height: 26px;
  font-size: .75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: .2s;
}

.clear-btn:hover {
  background: #ef4444;
  color: white;
}

.img-btn,
.mic-btn {
  border-radius: 999px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  transition: .2s;
  flex-shrink: 0;
  padding: 7px;
  background: #f1f5f9;
  color: #64748b;
}

.img-btn svg,
.mic-btn svg {
  width: 100%;
  height: 100%;
}

.img-btn:hover,
.img-btn.loading {
  background: #8b5cf6;
  color: white;
}

.img-btn:disabled {
  cursor: not-allowed;
  opacity: .8;
}

.mic-btn:hover {
  background: #3b82f6;
  color: white;
}

.mic-btn.active {
  background: #ef4444;
  color: white;
  animation: pulse 1s infinite;
}

.ai-message {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: .875rem;
  color: #3730a3;
  line-height: 1.5;
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,.12);
  list-style: none;
  padding: 6px;
  margin: 0;
  z-index: 20;
  max-height: 220px;
  overflow-y: auto;
}

.suggestions-dropdown li {
  padding: 8px 10px;
  border-radius: 8px;
  font-size: .875rem;
  cursor: pointer;
  transition: .15s;
}

.suggestions-dropdown li:hover {
  background: #eff6ff;
  color: #3b82f6;
}

.spin {
  animation: spin 1s linear infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: all .3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.4); }
  50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
}
</style>