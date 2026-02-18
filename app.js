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

function showNextWord() {
  if (!isPlaying || index >= words.length) return;

  reader.textContent = words[index];
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

