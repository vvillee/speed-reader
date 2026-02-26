const textInput = document.getElementById("textInput");
const reader = document.getElementById("reader");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const wpmSlider = document.getElementById("wpmSlider");
const wpmLabel = document.getElementById("wpmLabel");
const debugToggle = document.getElementById("debugToggle");
const debugControls = document.getElementById("debugControls");
const prevWordBtn = document.getElementById("prevWordBtn");
const nextWordBtn = document.getElementById("nextWordBtn");

// Initialize reader with three-span ORP structure for layout consistency
reader.innerHTML = `<span class="orp-left"></span><span class="orp">&nbsp;</span><span class="orp-right">Ready</span>`;

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
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
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
  if (highlightPos === -1) {
    const escaped = escapeHtml(word);
    return `<span class="orp-left">${escaped}</span>` +
           `<span class="orp">&nbsp;</span>` +
           `<span class="orp-right"></span>`;
  }
  const left = escapeHtml(word.slice(0, highlightPos));
  const highlighted = escapeHtml(word[highlightPos]);
  const right = escapeHtml(word.slice(highlightPos + 1));
  return `<span class="orp-left">${left}</span>` +
         `<span class="orp">${highlighted}</span>` +
         `<span class="orp-right">${right}</span>`;
}

// Ensure words array is populated from the textarea; returns false if no text is available.
function ensureWords() {
  if (words.length > 0) return true;
  const text = textInput.value.trim();
  if (!text) {
    alert("Please paste some text first.");
    return false;
  }
  words = text.split(/\s+/);
  return true;
}

function showNextWord() {
  if (!isPlaying || index >= words.length) {
    // Mark playback as stopped when the end of the word list is reached
    isPlaying = false;
    return;
  }

  reader.innerHTML = renderWord(words[index]);
  index++;

  timeoutId = setTimeout(showNextWord, getDelay());
}

// Start reading
startBtn.addEventListener("click", () => {
  if (isPlaying) return;
  if (!ensureWords()) return;

  // If we've reached the end, restart from the beginning
  if (index >= words.length) index = 0;

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
  reader.innerHTML = `<span class="orp-left"></span><span class="orp">&nbsp;</span><span class="orp-right">Ready</span>`;
});

// Sync debug controls visibility on load in case the checkbox is pre-checked
// (e.g. via browser form-state restore)
debugControls.classList.toggle("visible", debugToggle.checked);

// Toggle debug mode: show/hide the debug step controls
debugToggle.addEventListener("change", () => {
  debugControls.classList.toggle("visible", debugToggle.checked);
});

// Debug: display the word at the given index without advancing the reader loop
function showWordAt(i) {
  if (i < 0 || i >= words.length) return;
  reader.innerHTML = renderWord(words[i]);
}

// Debug: step forward one word (pauses playback if running)
nextWordBtn.addEventListener("click", () => {
  isPlaying = false;
  clearTimeout(timeoutId);
  if (!ensureWords()) return;
  // Cap at the last word so Start can resume from here without needing a reset
  if (index >= words.length) {
    index = words.length - 1;
  }
  showWordAt(index);
  if (index < words.length - 1) {
    index++;
  }
});

// Debug: step backward one word (pauses playback if running)
prevWordBtn.addEventListener("click", () => {
  isPlaying = false;
  clearTimeout(timeoutId);
  if (!ensureWords()) return;
  // index points to the next word to display; the currently shown word is at index-1.
  // Move back two positions so that showWordAt+index++ lands on the word before the current one.
  index = Math.max(0, index - 2);
  showWordAt(index);
  index++;
});

