<script setup>
import { ref } from "vue";

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

// ─── Text search ───────────────────────────────────────
function onInput(e) {
  emit("update:modelValue", e.target.value);
  clearTimeout(debounceTimer.value);
  debounceTimer.value = setTimeout(() => {
    emit("submit");
  }, 300);
}

function submit() {
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
    emit("update:modelValue", final || interim);
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

async function onImageSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  e.target.value = "";
  isAnalyzing.value = true;

  try {
    const base64 = await toBase64(file);

    const productList = props.products.map(p => p.name).join(", ");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${file.type};base64,${base64}` }
              },
              {
                type: "text",
                text: `Đây là ảnh sản phẩm gì?
Danh sách sản phẩm hiện có: ${productList}

Nếu ảnh khớp với sản phẩm nào trong danh sách, trả về đúng tên sản phẩm đó.
Nếu ảnh KHÔNG khớp với bất kỳ sản phẩm nào, trả về chính xác: KHÔNG_TÌM_THẤY
Chỉ trả về tên sản phẩm hoặc KHÔNG_TÌM_THẤY, không giải thích.`
              }
            ]
          }
        ],
        max_tokens: 100
      })
    });

    const data = await response.json();
    console.log("Groq response:", data);

    if (!response.ok) {
      console.error("Groq error:", data);
      alert(`Lỗi: ${data.error?.message || "Unknown error"}`);
      return;
    }

    const keyword = data.choices[0].message.content.trim();

    if (keyword === "KHÔNG_TÌM_THẤY") {
      alert("Không tìm thấy sản phẩm phù hợp với ảnh này!");
      return;
    }

    emit("update:modelValue", keyword);
    emit("submit");
  } catch (err) {
    console.error("Fetch error:", err);
    alert(`Lỗi: ${err.message}`);
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
  <div class="search-wrapper">
    <i class="icon-search">🔍</i>

    <input
      type="text"
      class="search-input"
      placeholder="Tìm theo tên, hãng, IMEI..."
      :value="modelValue"
      @input="onInput"
      @keyup.enter="submit"
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
      @click="emit('update:modelValue', ''); emit('submit')"
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
  </div>
</template>

<style scoped>
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

.spin {
  animation: spin 1s linear infinite;
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