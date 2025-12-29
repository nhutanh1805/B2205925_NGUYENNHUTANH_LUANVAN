let timer = null;
let timeout = 5000;
let onIdle = () => {};

const events = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart"
];

function resetTimer() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    onIdle();
  }, timeout);
}

export function initIdleDetector({ idleTime = 5000, onIdleCallback }) {
  timeout = idleTime;
  onIdle = onIdleCallback;

  events.forEach(event =>
    window.addEventListener(event, resetTimer)
  );

  resetTimer();
}

export function stopIdleDetector() {
  events.forEach(event =>
    window.removeEventListener(event, resetTimer)
  );
  clearTimeout(timer);
}
