/* ============================================
   MAIN.JS — TaskFlow Premium To-Do App
   Dharmit Monani · Oasis Infobyte
   ============================================ */

/* ── DOM REFERENCES ──────────────────────────── */
const taskInput       = document.getElementById('taskInput');
const btnAddTask      = document.getElementById('btnAddTask');
const prioritySelect  = document.getElementById('prioritySelect');
const dueDateInput    = document.getElementById('dueDateInput');
const charCount       = document.getElementById('charCount');
const searchInput     = document.getElementById('searchInput');
const filterTabs      = document.querySelectorAll('.filter-tab');
const pendingList     = document.getElementById('pendingList');
const completedList   = document.getElementById('completedList');
const pendingBadge    = document.getElementById('pendingBadge');
const completedBadge  = document.getElementById('completedBadge');
const progressFill    = document.getElementById('progressFill');
const doneCount       = document.getElementById('doneCount');
const totalCount      = document.getElementById('totalCount');
const pendingCount    = document.getElementById('pendingCount');
const completedCount  = document.getElementById('completedCount');
const deleteModal     = document.getElementById('deleteModal');
const modalCancel     = document.getElementById('modalCancel');
const modalConfirm    = document.getElementById('modalConfirm');
const modalTaskPreview= document.getElementById('modalTaskPreview');
const toastContainer  = document.getElementById('toastContainer');

/* ── STATE ───────────────────────────────────── */
const STORAGE_KEY = 'taskflow_tasks';

let tasks      = [];      // main tasks array
let activeFilter = 'all'; // current filter
let searchQuery  = '';    // current search
let deleteTarget = null;  // id of task pending deletion
let dragSrcId    = null;  // id of task being dragged

/* ── HELPERS ─────────────────────────────────── */

/** Generate a unique id */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Format a Date to "DD MMM YYYY, HH:MM" */
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
       + ', '
       + d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12: true });
}

/** Format just the date portion of a due-date string */
function fmtDueDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(y, m-1, d);
  return date.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

/** Return due-date status: 'overdue' | 'due-soon' | 'on-time' */
function dueDateStatus(dateStr) {
  if (!dateStr) return 'on-time';
  const [y, m, d] = dateStr.split('-');
  const due  = new Date(y, m-1, d);
  const today = new Date();
  today.setHours(0,0,0,0);
  const diff = (due - today) / (1000 * 60 * 60 * 24);
  if (diff < 0)  return 'overdue';
  if (diff <= 2) return 'due-soon';
  return 'on-time';
}

/* ── LOCALSTORAGE ────────────────────────────── */

function saveTasks() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch(e) {}
}

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch(e) { return []; }
}

/* ── TASK CRUD ───────────────────────────────── */

/** Add a new task */
function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    showToast('Please enter a task!', 'warning', '⚠️');
    taskInput.focus();
    taskInput.classList.add('shake');
    setTimeout(() => taskInput.classList.remove('shake'), 400);
    return;
  }

  const task = {
    id:          genId(),
    text:        text,
    completed:   false,
    priority:    prioritySelect.value,
    dueDate:     dueDateInput.value || null,
    createdAt:   new Date().toISOString(),
    completedAt: null,
  };

  tasks.unshift(task); // newest first
  saveTasks();
  renderAll();
  updateProgress();

  // Reset form
  taskInput.value = '';
  dueDateInput.value = '';
  prioritySelect.value = 'medium';
  charCount.textContent = '0 / 120';
  charCount.classList.remove('warn');
  taskInput.focus();

  showToast('Task added!', 'success', '✅');
}

/** Toggle task completion */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed   = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;

  saveTasks();
  renderAll();
  updateProgress();

  if (task.completed) {
    showToast('Task completed! 🎉', 'success', '🎯');
  } else {
    showToast('Task moved to pending', 'info', '↩️');
  }
}

/** Start editing a task inline */
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // Find the rendered item
  const item = document.querySelector(`[data-id="${id}"]`);
  if (!item) return;

  const titleEl = item.querySelector('.task-title');
  const currentText = task.text;

  // Replace title with input
  const input = document.createElement('input');
  input.type  = 'text';
  input.value = currentText;
  input.maxLength = 120;
  input.className = 'task-edit-input';
  titleEl.replaceWith(input);
  input.focus();
  input.select();

  // Disable action buttons while editing
  item.querySelector('.task-btn.edit').disabled = true;

  function saveEdit() {
    const newText = input.value.trim();
    if (newText && newText !== currentText) {
      task.text = newText;
      saveTasks();
      showToast('Task updated', 'info', '✏️');
    }
    renderAll();
  }

  input.addEventListener('blur',   saveEdit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.value = currentText; input.blur(); }
  });
}

/** Show delete confirmation modal */
function confirmDelete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  deleteTarget = id;
  modalTaskPreview.textContent = task.text;
  deleteModal.classList.add('open');
}

/** Actually delete the task */
function deleteTask(id) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (item) {
    item.classList.add('removing');
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderAll();
      updateProgress();
    }, 280);
  } else {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderAll();
    updateProgress();
  }
  showToast('Task deleted', 'error', '🗑️');
}

/* ── RENDERING ───────────────────────────────── */

/** Get filtered + searched tasks */
function getFilteredTasks() {
  let result = [...tasks];

  // Search
  if (searchQuery) {
    result = result.filter(t =>
      t.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filter
  switch (activeFilter) {
    case 'pending':   result = result.filter(t => !t.completed); break;
    case 'completed': result = result.filter(t =>  t.completed); break;
    case 'high':      result = result.filter(t => t.priority === 'high'); break;
  }

  return result;
}

/** Build a task list item element */
function buildTaskEl(task) {
  const li = document.createElement('li');
  li.className = `task-item priority-${task.priority}${task.completed ? ' completed' : ''}`;
  li.dataset.id = task.id;
  li.setAttribute('draggable', 'true');
  li.setAttribute('role', 'listitem');

  // Due date badge
  let dueBadge = '';
  if (task.dueDate && !task.completed) {
    const status = dueDateStatus(task.dueDate);
    const label  = status === 'overdue'
      ? '⚠ Overdue'
      : status === 'due-soon'
      ? '⏰ ' + fmtDueDate(task.dueDate)
      : '📅 ' + fmtDueDate(task.dueDate);
    dueBadge = `<span class="task-due ${status}" title="Due date">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      ${label}
    </span>`;
  }

  // Completed-at line
  const timeLabel = task.completed && task.completedAt
    ? `<span class="task-time" title="Completed at">✔ ${fmtDate(task.completedAt)}</span>`
    : `<span class="task-time" title="Created at">+ ${fmtDate(task.createdAt)}</span>`;

  li.innerHTML = `
    <div class="task-check${task.completed ? ' checked' : ''}" data-id="${task.id}" role="checkbox" aria-checked="${task.completed}" tabindex="0" title="${task.completed ? 'Mark pending' : 'Mark complete'}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <div class="task-body">
      <div class="task-title">${escHtml(task.text)}</div>
      <div class="task-meta">
        <span class="task-priority ${task.priority}" title="Priority">
          ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        ${timeLabel}
        ${dueBadge}
      </div>
    </div>
    <div class="task-actions">
      <button class="task-btn edit" title="Edit task" aria-label="Edit task">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="task-btn delete" title="Delete task" aria-label="Delete task">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  `;

  /* ── Events on task item ── */

  // Checkbox toggle
  li.querySelector('.task-check').addEventListener('click', () => toggleTask(task.id));
  li.querySelector('.task-check').addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleTask(task.id); }
  });

  // Edit
  li.querySelector('.task-btn.edit').addEventListener('click', (e) => {
    e.stopPropagation();
    editTask(task.id);
  });

  // Delete
  li.querySelector('.task-btn.delete').addEventListener('click', (e) => {
    e.stopPropagation();
    confirmDelete(task.id);
  });

  /* ── Drag and drop events ── */
  li.addEventListener('dragstart', e => {
    dragSrcId = task.id;
    li.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
    document.querySelectorAll('.task-item').forEach(el => el.classList.remove('drag-over'));
  });
  li.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    li.classList.add('drag-over');
  });
  li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
  li.addEventListener('drop', e => {
    e.preventDefault();
    li.classList.remove('drag-over');
    if (dragSrcId && dragSrcId !== task.id) {
      reorderTasks(dragSrcId, task.id);
    }
  });

  return li;
}

/** Reorder tasks array — move src before target */
function reorderTasks(srcId, targetId) {
  const srcIdx    = tasks.findIndex(t => t.id === srcId);
  const targetIdx = tasks.findIndex(t => t.id === targetId);
  if (srcIdx === -1 || targetIdx === -1) return;

  const [moved] = tasks.splice(srcIdx, 1);
  tasks.splice(targetIdx, 0, moved);
  saveTasks();
  renderAll();
}

/** Escape HTML to prevent XSS */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Render empty state */
function renderEmpty(list, type) {
  const configs = {
    pending:   { icon: '📋', title: 'No pending tasks', sub: 'Add a task above to get started' },
    completed: { icon: '🎉', title: 'Nothing completed yet', sub: 'Complete a task to see it here' },
    search:    { icon: '🔍', title: 'No results found', sub: 'Try a different search term' },
  };
  const cfg = configs[type] || configs.pending;
  list.innerHTML = `
    <li class="empty-state">
      <span class="empty-icon">${cfg.icon}</span>
      <span class="empty-title">${cfg.title}</span>
      <span class="empty-sub">${cfg.sub}</span>
    </li>
  `;
}

/** Main render function */
function renderAll() {
  const filtered = getFilteredTasks();
  const pending  = filtered.filter(t => !t.completed);
  const completed= filtered.filter(t =>  t.completed);

  // Render pending
  pendingList.innerHTML = '';
  if (pending.length === 0) {
    renderEmpty(pendingList, searchQuery ? 'search' : 'pending');
  } else {
    pending.forEach(t => pendingList.appendChild(buildTaskEl(t)));
  }

  // Render completed
  completedList.innerHTML = '';
  if (completed.length === 0) {
    renderEmpty(completedList, searchQuery ? 'search' : 'completed');
  } else {
    completed.forEach(t => completedList.appendChild(buildTaskEl(t)));
  }

  // Update badges
  pendingBadge.textContent   = pending.length;
  completedBadge.textContent = completed.length;
}

/** Update progress bar and counters */
function updateProgress() {
  const total     = tasks.length;
  const done      = tasks.filter(t => t.completed).length;
  const pending   = total - done;
  const pct       = total > 0 ? Math.round((done / total) * 100) : 0;

  progressFill.style.width   = pct + '%';
  doneCount.textContent      = done;
  totalCount.textContent     = total;
  pendingCount.textContent   = pending;
  completedCount.textContent = done;
}

/* ── TOAST NOTIFICATIONS ─────────────────────── */
function showToast(message, type = 'info', icon = '💬') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icon}</span>${message}`;
  toastContainer.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  // Animate out and remove
  setTimeout(() => {
    toast.classList.replace('show', 'hide');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 2800);
}

/* ── MODAL ───────────────────────────────────── */
modalCancel.addEventListener('click', () => {
  deleteModal.classList.remove('open');
  deleteTarget = null;
});

modalConfirm.addEventListener('click', () => {
  if (deleteTarget) deleteTask(deleteTarget);
  deleteModal.classList.remove('open');
  deleteTarget = null;
});

// Close modal on overlay click
deleteModal.addEventListener('click', e => {
  if (e.target === deleteModal) {
    deleteModal.classList.remove('open');
    deleteTarget = null;
  }
});

/* ── EVENT LISTENERS ─────────────────────────── */

// Add task button
btnAddTask.addEventListener('click', addTask);

// Keyboard shortcuts
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter')  addTask();
  if (e.key === 'Escape') { taskInput.value = ''; charCount.textContent = '0 / 120'; charCount.classList.remove('warn'); }
});

// Character counter
taskInput.addEventListener('input', () => {
  const len = taskInput.value.length;
  charCount.textContent = `${len} / 120`;
  charCount.classList.toggle('warn', len >= 90);
});

// Search
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim();
  renderAll();
});

// Filter tabs
filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.dataset.filter;
    renderAll();
  });
});

// Global keyboard shortcut: Ctrl+F → focus search
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  // Escape closes modal
  if (e.key === 'Escape' && deleteModal.classList.contains('open')) {
    deleteModal.classList.remove('open');
    deleteTarget = null;
  }
});

/* ── INIT ────────────────────────────────────── */
tasks = loadTasks();
renderAll();
updateProgress();
taskInput.focus();