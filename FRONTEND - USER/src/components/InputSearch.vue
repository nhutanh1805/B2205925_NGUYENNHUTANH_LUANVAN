<script setup>
import { ref } from "vue";

defineProps({
  modelValue: { type: String, default: "" }
});

const emit = defineEmits(["update:modelValue", "submit"]);

const isListening = ref(false);
let recognition = null;
let hasResult = false;
const debounceTimer = ref(null);

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

    <button
      v-if="modelValue"
      class="clear-btn"
      @click="emit('update:modelValue', ''); emit('submit')"
    >
      ✕
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

.mic-btn {
  background: #f1f5f9;
  border-radius: 999px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  transition: .2s;
  flex-shrink: 0;
  color: #64748b;
  padding: 7px;
}

.mic-btn svg {
  width: 100%;
  height: 100%;
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

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.4); }
  50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
}
</style>