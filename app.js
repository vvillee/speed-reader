const textInput = document.getElementById("textInput");
const reader = document.getElementById("reader");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const wpmSlider = document.getElementById("wpmSlider");
const wpmLabel = document.getElementById("wpmLabel");

let words = [];
let index = 0;
let timeoutId = null;
let isPlaying = false;
let wpm = parseInt(wpmSlider.value);

// Update WPM label
wpmSlider.addEventListener("input", () => {
  wpm = parseInt(wpmSlider.value);
  wpmLabel.textContent = wpm;
});

// Convert WPM → delay in milliseconds
function getDelay() {
  return 60000 / wpm;
}

const ORP_RATIO = 0.35;
const LETTER_RE = /[a-zA-Z]/;

// Escape HTML special characters to prevent XSS when using innerHTML
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Return the index (into the word's letters only) to highlight (ORP)
function getOrpIndex(word) {
  let letterCount = 0;
  for (const ch of word) {
    if (LETTER_RE.test(ch)) letterCount++;
  }
  if (letterCount <= 2) return 0;
  return Math.floor(letterCount * ORP_RATIO);
}

// Return an HTML string with three spans for a stable ORP fixation point
function renderWord(word) {
  const orpIndex = getOrpIndex(word);
  let letterCount = 0;
  let highlightPos = -1;
  for (let i = 0; i < word.length; i++) {
    if (LETTER_RE.test(word[i])) {
      if (letterCount === orpIndex) {
        highlightPos = i;
        break;
      }
      letterCount++;
    }
  }
  if (highlightPos === -1) return escapeHtml(word);
  const left = escapeHtml(word.slice(0, highlightPos));
  const highlighted = escapeHtml(word[highlightPos]);
  const right = escapeHtml(word.slice(highlightPos + 1));
  return `<span class="orp-left">${left}</span>` +
         `<span class="orp">${highlighted}</span>` +
         `<span class="orp-right">${right}</span>`;
}

function showNextWord() {
  if (!isPlaying || index >= words.length) return;

  reader.innerHTML = renderWord(words[index]);
  index++;

  timeoutId = setTimeout(showNextWord, getDelay());
}

// Start reading
startBtn.addEventListener("click", () => {
  if (isPlaying) return;

  if (words.length === 0) {
    const text = textInput.value.trim();
    if (!text) {
      alert("Please paste some text first.");
      return;
    }
    words = text.split(/\s+/);
  }

  isPlaying = true;
  showNextWord();
});

// Pause reading
pauseBtn.addEventListener("click", () => {
  isPlaying = false;
  clearTimeout(timeoutId);
});

// Reset reader
resetBtn.addEventListener("click", () => {
  isPlaying = false;
  clearTimeout(timeoutId);
  index = 0;
  words = [];
  reader.textContent = "Ready";
});

