/* ============================================
   MAIN.JS — Temperature Converter
   Dharmit Monani · Oasis Infobyte 2025
   ============================================ */

/* ── DOM REFERENCES ──────────────────────────── */
const tempInput       = document.getElementById('tempInput');
const fromUnit        = document.getElementById('fromUnit');
const toUnit          = document.getElementById('toUnit');
const btnConvert      = document.getElementById('btnConvert');
const btnSwap         = document.getElementById('btnSwap');
const btnReset        = document.getElementById('btnReset');
const btnClearHistory = document.getElementById('btnClearHistory');
const resultCard      = document.getElementById('resultCard');
const resultValue     = document.getElementById('resultValue');
const resultUnit      = document.getElementById('resultUnit');
const errorMsg        = document.getElementById('errorMsg');
const errorText       = document.getElementById('errorText');
const historyList     = document.getElementById('historyList');
const historyEmpty    = document.getElementById('historyEmpty');
const chipCVal        = document.getElementById('chipCVal');
const chipFVal        = document.getElementById('chipFVal');
const chipKVal        = document.getElementById('chipKVal');

/* ── UNIT CONFIG ─────────────────────────────── */
const UNIT_LABELS = {
  celsius:    { symbol: '°C', full: 'Celsius' },
  fahrenheit: { symbol: '°F', full: 'Fahrenheit' },
  kelvin:     { symbol: 'K',  full: 'Kelvin' },
};

/* ── CONVERSION LOGIC ────────────────────────── */

/**
 * Convert any temperature to Celsius first (base unit).
 * @param {number} val
 * @param {string} from — 'celsius' | 'fahrenheit' | 'kelvin'
 * @returns {number} value in Celsius
 */
function toCelsius(val, from) {
  switch (from) {
    case 'celsius':    return val;
    case 'fahrenheit': return (val - 32) * (5 / 9);
    case 'kelvin':     return val - 273.15;
  }
}

/**
 * Convert from Celsius to any target unit.
 * @param {number} celsius
 * @param {string} to
 * @returns {number}
 */
function fromCelsius(celsius, to) {
  switch (to) {
    case 'celsius':    return celsius;
    case 'fahrenheit': return celsius * (9 / 5) + 32;
    case 'kelvin':     return celsius + 273.15;
  }
}

/**
 * Convert directly between any two units.
 * @param {number} val
 * @param {string} from
 * @param {string} to
 * @returns {number}
 */
function convert(val, from, to) {
  if (from === to) return val;
  return fromCelsius(toCelsius(val, from), to);
}

/**
 * Format a number for display (up to 4 decimal places, no trailing zeros).
 */
function fmt(num) {
  if (Number.isInteger(num)) return num.toString();
  return parseFloat(num.toFixed(4)).toString();
}

/* ── VALIDATION ──────────────────────────────── */
function validate(val, from) {
  if (val === '' || val === null || isNaN(Number(val))) {
    return 'Please enter a valid number.';
  }
  const num = Number(val);
  // Kelvin cannot be negative
  if (from === 'kelvin' && num < 0) {
    return 'Kelvin cannot be negative (absolute zero = 0 K).';
  }
  // Absolute zero checks
  if (from === 'celsius' && num < -273.15) {
    return 'Below absolute zero (min: −273.15 °C).';
  }
  if (from === 'fahrenheit' && num < -459.67) {
    return 'Below absolute zero (min: −459.67 °F).';
  }
  return null; // valid
}

/* ── UI HELPERS ──────────────────────────────── */
function showError(msg) {
  errorText.textContent = msg;
  errorMsg.classList.add('visible');
  tempInput.classList.add('error');
}

function clearError() {
  errorMsg.classList.remove('visible');
  tempInput.classList.remove('error');
  errorText.textContent = '';
}

function hideResult() {
  resultCard.classList.remove('visible');
}

/* ── HISTORY + LOCALSTORAGE ──────────────────── */

const STORAGE_KEY = 'tempConverter_history';
const MAX_HISTORY = 10;

/**
 * Load history array from localStorage.
 * Returns an empty array if nothing is saved yet.
 */
function loadHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    // If JSON is corrupted, start fresh
    return [];
  }
}

/**
 * Save the current history array to localStorage.
 */
function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    // localStorage unavailable (e.g. private mode quota) — fail silently
  }
}

// Load persisted history on startup
let history = loadHistory();

function addToHistory(val, from, result, to) {
  const now  = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Prevent duplicate: skip if last entry is identical value+units
  const last = history[0];
  if (
    last &&
    last.val  === val  &&
    last.from === from &&
    last.to   === to
  ) return;

  // Add newest entry at the top
  history.unshift({ val, from, result, to, time });

  // Keep only the last MAX_HISTORY entries
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);

  // Persist to localStorage
  saveHistory();

  renderHistory();
}

function renderHistory() {
  if (history.length === 0) {
    historyEmpty.style.display = 'block';
    historyList.innerHTML = '';
    return;
  }

  historyEmpty.style.display = 'none';
  historyList.innerHTML = history.map(item => `
    <li class="history-item">
      <span class="history-item__from">${fmt(item.val)} ${UNIT_LABELS[item.from].symbol}</span>
      <span class="history-item__arrow">→</span>
      <span class="history-item__to">${fmt(item.result)} ${UNIT_LABELS[item.to].symbol}</span>
      <span class="history-item__time">${item.time}</span>
    </li>
  `).join('');
}

/* ── MAIN CONVERT ACTION ─────────────────────── */
function doConvert() {
  clearError();

  const raw  = tempInput.value.trim();
  const from = fromUnit.value;
  const to   = toUnit.value;

  // Validate
  const err = validate(raw, from);
  if (err) {
    showError(err);
    hideResult();
    return;
  }

  const num    = Number(raw);
  const output = convert(num, from, to);

  // All 3 values
  const celsius    = toCelsius(num, from);
  const fahrenheit = fromCelsius(celsius, 'fahrenheit');
  const kelvin     = fromCelsius(celsius, 'kelvin');

  // Update chips
  chipCVal.textContent = fmt(celsius);
  chipFVal.textContent = fmt(fahrenheit);
  chipKVal.textContent = fmt(kelvin);

  // Update main result
  resultValue.textContent = fmt(output);
  resultValue.className   = `result-value ${to}`;
  resultUnit.textContent  = `${UNIT_LABELS[to].full} (${UNIT_LABELS[to].symbol})`;

  // Prominent summary line  e.g.  34 °C  =  93.2 °F
  const summaryEl = document.getElementById('resultSummary');
  if (summaryEl) {
    summaryEl.textContent =
      `${fmt(num)} ${UNIT_LABELS[from].symbol}  =  ${fmt(output)} ${UNIT_LABELS[to].symbol}`;
  }

  // Show result with animation
  resultCard.classList.remove('visible');
  void resultCard.offsetWidth; // force reflow for re-animation
  resultCard.classList.add('visible');

  // Add to history
  addToHistory(num, from, output, to);
}

/* ── SWAP ────────────────────────────────────── */
function doSwap() {
  const temp     = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value   = temp;

  // If there's a value, reconvert automatically
  if (tempInput.value.trim() !== '') doConvert();
}

/* ── RESET ───────────────────────────────────── */
function doReset() {
  tempInput.value = '';
  fromUnit.value  = 'celsius';
  toUnit.value    = 'fahrenheit';
  clearError();
  hideResult();
  tempInput.focus();
}

/* ── EVENT LISTENERS ─────────────────────────── */
btnConvert.addEventListener('click', doConvert);
btnSwap.addEventListener('click', doSwap);
btnReset.addEventListener('click', doReset);

btnClearHistory.addEventListener('click', () => {
  history = [];
  localStorage.removeItem(STORAGE_KEY); // also wipe from localStorage
  renderHistory();
});

// Enter key to convert, Escape to reset
tempInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doConvert();
  if (e.key === 'Escape') doReset();
});

// Live clear error on typing
tempInput.addEventListener('input', () => {
  if (tempInput.value.trim() !== '') clearError();
});

// Prevent same from/to unit — robust
const ALL_UNITS = ['celsius', 'fahrenheit', 'kelvin'];

fromUnit.addEventListener('change', () => {
  if (fromUnit.value === toUnit.value)
    toUnit.value = ALL_UNITS.find(u => u !== fromUnit.value);
});

toUnit.addEventListener('change', () => {
  if (toUnit.value === fromUnit.value)
    fromUnit.value = ALL_UNITS.find(u => u !== toUnit.value);
});

/* ── INIT ────────────────────────────────────── */
renderHistory();
tempInput.focus();

/* ── THEME TOGGLE ────────────────────────────── */
const themeToggle = document.getElementById('themeToggle');
const sunIcon = themeToggle.querySelector('.sun-icon');
const moonIcon = themeToggle.querySelector('.moon-icon');
const THEME_KEY = 'tempConverter_theme';

function setTheme(theme) {
  if (theme === 'light') {
    document.body.setAttribute('data-theme', 'light');
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    document.body.removeAttribute('data-theme');
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
  localStorage.setItem(THEME_KEY, theme);
}

const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
setTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  });
}