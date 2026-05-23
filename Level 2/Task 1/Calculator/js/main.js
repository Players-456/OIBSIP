/* ============================================
   MAIN.JS — Premium Calculator
   Dharmit Monani · Oasis Infobyte
   ============================================ */

/* ── DOM REFS ────────────────────────────────── */
const displayValue  = document.getElementById('displayValue');
const expressionEl  = document.getElementById('expression');
const btnCopy       = document.getElementById('btnCopy');
const btnClearHist  = document.getElementById('btnClearHist');
const historyList   = document.getElementById('historyList');
const historyEmpty  = document.getElementById('historyEmpty');
const modeToggle    = document.getElementById('modeToggle');
const sciPad        = document.getElementById('sciPad');
const toast         = document.getElementById('toast');

/* ── STATE ───────────────────────────────────── */
let currentVal  = '0';   // what's shown on the display
let expression  = '';    // full expression string e.g. "12 + 3"
let operator    = null;  // active operator (+, -, *, /)
let prevVal     = null;  // value before operator was pressed
let justEvaled  = false; // true right after = was pressed
let sciMode     = false; // scientific mode toggle

const STORAGE_KEY  = 'calc_history';
const MAX_HISTORY  = 20;

/* ── DISPLAY HELPERS ─────────────────────────── */

/**
 * Update the main display number.
 * Automatically shrinks font for long numbers.
 */
function setDisplay(val) {
  displayValue.textContent = val;
  displayValue.classList.remove('long', 'longer', 'error');
  const len = String(val).length;
  if (len > 12) displayValue.classList.add('longer');
  else if (len > 8) displayValue.classList.add('long');
}

/** Show the expression line above the number */
function setExpression(expr) {
  expressionEl.textContent = expr;
}

/** Flash animation when = is pressed */
function flashResult() {
  displayValue.classList.remove('result-flash');
  void displayValue.offsetWidth;
  displayValue.classList.add('result-flash');
}

/** Show copy button when there's a real result */
function showCopyBtn(show) {
  btnCopy.classList.toggle('visible', show);
}

/** Show error state with friendly message */
function showError(msg) {
  const friendly = msg === 'Cannot divide by zero'
    ? "Can't ÷ by zero"
    : msg === 'Invalid input'
    ? 'Invalid input'
    : 'Error';
  displayValue.classList.add('error');
  setDisplay(friendly);
  setExpression('⚠ ' + msg);
  showCopyBtn(false);
  currentVal = '0';
  expression = '';
  operator   = null;
  prevVal    = null;
}

/* ── FORMATTING ──────────────────────────────── */

/** Format a number for display — removes floating point noise */
function fmt(num) {
  if (!isFinite(num)) return 'Error';
  // Round to max 10 decimal places to avoid floating point noise
  const rounded = parseFloat(num.toPrecision(12));
  // Show up to 10 decimal places, strip trailing zeros
  return parseFloat(rounded.toFixed(10)).toString();
}

/* ── CORE CALCULATION ────────────────────────── */

/**
 * Evaluate two numbers with a given operator.
 * Returns a number or throws on divide-by-zero.
 */
function calculate(a, op, b) {
  a = parseFloat(a);
  b = parseFloat(b);
  switch (op) {
    case '+':  return a + b;
    case '-':  return a - b;
    case '*':  return a * b;
    case '**': return Math.pow(a, b);
    case '/':
      if (b === 0) throw new Error('Cannot divide by zero');
      return a / b;
    default:
      throw new Error('Unknown operator');
  }
}

/* ── BUTTON ACTIONS ──────────────────────────── */

/** Append a digit or decimal point */
function inputNumber(digit) {
  // After = was pressed, start fresh
  if (justEvaled) {
    currentVal = digit === '.' ? '0.' : digit;
    justEvaled = false;
    setExpression('');
  } else if (digit === '.') {
    // Only one decimal point allowed
    if (currentVal.includes('.')) return;
    currentVal += '.';
  } else if (currentVal === '0' && digit !== '.') {
    currentVal = digit;
  } else {
    // Limit to 15 characters
    if (currentVal.replace(/[^0-9]/g, '').length >= 15) return;
    currentVal += digit;
  }
  setDisplay(currentVal);
  showCopyBtn(false);
}

/** Handle an operator (+, -, *, /) */
function inputOperator(op) {
  justEvaled = false;

  if (operator && prevVal !== null) {
    // Chain: evaluate pending operation first
    try {
      const result = calculate(prevVal, operator, currentVal);
      currentVal = fmt(result);
      setDisplay(currentVal);
    } catch (e) {
      showError(e.message); return;
    }
  }

  prevVal    = currentVal;
  operator   = op;
  expression = `${currentVal} ${opSymbol(op)}`;
  setExpression(expression);
  currentVal = '0';
  showCopyBtn(false);
}

/** Map operator token to display symbol */
function opSymbol(op) {
  return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] || op;
}

/** Compute percentage */
function inputPercent() {
  const num = parseFloat(currentVal);
  if (isNaN(num)) return;
  // If chained (e.g. 200 + 5%) → 5% of 200 = 10
  if (prevVal !== null) {
    currentVal = fmt((parseFloat(prevVal) * num) / 100);
  } else {
    currentVal = fmt(num / 100);
  }
  setDisplay(currentVal);
}

/** Delete last character */
function inputDelete() {
  if (justEvaled) { clear(); return; }
  if (currentVal.length <= 1) {
    currentVal = '0';
  } else {
    currentVal = currentVal.slice(0, -1);
  }
  setDisplay(currentVal);
}

/** AC — clear everything */
function clear() {
  currentVal = '0';
  expression = '';
  operator   = null;
  prevVal    = null;
  justEvaled = false;
  setDisplay('0');
  setExpression('');
  showCopyBtn(false);
  displayValue.classList.remove('error');
}

/** Press equals */
function pressEquals() {
  if (operator === null || prevVal === null) return;

  const exprFull = `${prevVal} ${opSymbol(operator)} ${currentVal}`;
  let result;

  try {
    result = calculate(prevVal, operator, currentVal);
  } catch (e) {
    showError(e.message); return;
  }

  const resultStr = fmt(result);

  setExpression(`${exprFull} =`);
  setDisplay(resultStr);
  flashResult();
  showCopyBtn(true);
  addHistory(exprFull, resultStr);

  currentVal = resultStr;
  operator   = null;
  prevVal    = null;
  justEvaled = true;
}

/* ── SCIENTIFIC FUNCTIONS ────────────────────── */
function handleSci(fn) {
  const num = parseFloat(currentVal);
  if (isNaN(num)) return;

  let result;
  const label = { sin:'sin', cos:'cos', tan:'tan', sqrt:'√', log:'log', ln:'ln' }[fn];

  try {
    switch (fn) {
      case 'sin':  result = Math.sin(num * Math.PI / 180); break; // degrees
      case 'cos':  result = Math.cos(num * Math.PI / 180); break;
      case 'tan':  result = Math.tan(num * Math.PI / 180); break;
      case 'sqrt':
        if (num < 0) throw new Error('Invalid input');
        result = Math.sqrt(num); break;
      case 'log':
        if (num <= 0) throw new Error('Invalid input');
        result = Math.log10(num); break;
      case 'ln':
        if (num <= 0) throw new Error('Invalid input');
        result = Math.log(num); break;
      case 'pow':
        // Store current value as base, wait for exponent input
        prevVal    = currentVal;
        operator   = '**';
        expression = `${currentVal} ^`;
        setExpression(`${currentVal} ^`);
        currentVal = '0';
        justEvaled = false;
        showCopyBtn(false);
        return;
      case 'pi':
        currentVal = Math.PI.toString();
        setDisplay(currentVal);
        return;
      default: return;
    }

    const resultStr = fmt(result);
    setExpression(`${label}(${num}) =`);
    setDisplay(resultStr);
    flashResult();
    showCopyBtn(true);
    addHistory(`${label}(${num})`, resultStr);
    currentVal = resultStr;
    justEvaled = true;

  } catch (e) {
    showError(e.message);
  }
}

/* ── HISTORY ─────────────────────────────────── */

function loadHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveHistory(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch {}
}

let history = loadHistory();

function addHistory(expr, result) {
  // Prevent duplicate consecutive entries
  if (history[0]?.expr === expr && history[0]?.result === result) return;

  history.unshift({ expr, result });
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  saveHistory(history);
  renderHistory();
}

function renderHistory() {
  if (history.length === 0) {
    historyEmpty.style.display = 'block';
    historyList.innerHTML = '';
    return;
  }
  historyEmpty.style.display = 'none';
  historyList.innerHTML = history.map((item, i) => `
    <li class="history-item" data-index="${i}" title="Tap to reuse result">
      <span class="history-item__expr">${item.expr}</span>
      <span class="history-item__result">= ${item.result}</span>
    </li>
  `).join('');
}

/** Click history item → load its result */
historyList.addEventListener('click', (e) => {
  const item = e.target.closest('.history-item');
  if (!item) return;
  const idx = parseInt(item.dataset.index);
  currentVal = history[idx].result;
  setDisplay(currentVal);
  setExpression(history[idx].expr + ' =');
  showCopyBtn(true);
  justEvaled = true;
  operator = null;
  prevVal  = null;
});

btnClearHist.addEventListener('click', () => {
  history = [];
  saveHistory(history);
  renderHistory();
});

/* ── COPY ────────────────────────────────────── */
let toastTimer;

btnCopy.addEventListener('click', () => {
  const val = displayValue.textContent;
  if (!val || val === '0') return;

  navigator.clipboard.writeText(val).then(() => {
    btnCopy.classList.add('copied');
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      btnCopy.classList.remove('copied');
    }, 1800);
  }).catch(() => {
    // Fallback for browsers without clipboard API
    const ta = document.createElement('textarea');
    ta.value = val;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  });
});

/* ── SCIENTIFIC MODE TOGGLE ──────────────────── */
modeToggle.addEventListener('click', () => {
  sciMode = !sciMode;
  sciPad.classList.toggle('visible', sciMode);
  modeToggle.style.color      = sciMode ? 'var(--violet-light)' : '';
  modeToggle.style.borderColor = sciMode ? 'var(--border-accent)' : '';
  modeToggle.style.background  = sciMode ? 'rgba(124,58,237,0.08)' : '';
});

/* ── BUTTON CLICK EVENTS ─────────────────────── */
document.querySelector('.keypad').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  handleBtn(btn);
});

document.querySelector('.keypad-sci').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-sci');
  if (!btn) return;
  handleSci(btn.dataset.sci);
  animateBtn(btn);
});

function handleBtn(btn) {
  animateBtn(btn);

  if (btn.dataset.num      !== undefined) inputNumber(btn.dataset.num);
  else if (btn.dataset.op  !== undefined) inputOperator(btn.dataset.op);
  else if (btn.dataset.action) {
    const a = btn.dataset.action;
    if (a === 'clear')   clear();
    if (a === 'delete')  inputDelete();
    if (a === 'percent') inputPercent();
    if (a === 'equals')  pressEquals();
  }
}

function animateBtn(btn) {
  btn.classList.add('key-active');
  setTimeout(() => btn.classList.remove('key-active'), 120);
}

/* ── KEYBOARD SUPPORT ────────────────────────── */
const KEY_MAP = {
  '0':'0','1':'1','2':'2','3':'3','4':'4',
  '5':'5','6':'6','7':'7','8':'8','9':'9',
  '.':'.', ',':'.',
  '+':'+', '-':'-', '*':'*', 'x':'*', 'X':'*',
  '/':'/', '÷':'/',
  'Enter':'=', '=':'=',
  'Backspace':'del', 'Delete':'del',
  'Escape':'clear', 'c':'clear', 'C':'clear',
  '%':'%',
};

document.addEventListener('keydown', (e) => {
  // Don't capture if typing in an input
  if (e.target.tagName === 'INPUT') return;

  const mapped = KEY_MAP[e.key];
  if (!mapped) return;
  e.preventDefault();

  // Find and animate the matching button
  let btn;
  if ('0123456789.'.includes(mapped)) {
    btn = document.querySelector(`[data-num="${mapped}"]`);
    inputNumber(mapped);
  } else if ('+-*/'.includes(mapped)) {
    btn = document.querySelector(`[data-op="${mapped}"]`);
    inputOperator(mapped);
  } else if (mapped === '=') {
    btn = document.querySelector('[data-action="equals"]');
    pressEquals();
  } else if (mapped === 'del') {
    btn = document.querySelector('[data-action="delete"]');
    inputDelete();
  } else if (mapped === 'clear') {
    btn = document.querySelector('[data-action="clear"]');
    clear();
  } else if (mapped === '%') {
    btn = document.querySelector('[data-action="percent"]');
    inputPercent();
  }

  if (btn) animateBtn(btn);
});

/* ── INIT ────────────────────────────────────── */
renderHistory();