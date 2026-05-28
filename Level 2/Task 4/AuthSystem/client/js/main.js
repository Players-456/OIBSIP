const API_URL = 'http://localhost:5001/api/auth';

const select = (sel) => document.querySelector(sel);
const selectAll = (sel) => document.querySelectorAll(sel);

const setToken = (token) => localStorage.setItem('authToken', token);
const getToken = () => localStorage.getItem('authToken');
const removeToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
};

const showToast = (message, type = 'info') => {
  let toastWrap = select('#toastWrap');

  if (!toastWrap) {
    toastWrap = document.createElement('div');
    toastWrap.id = 'toastWrap';
    toastWrap.className = 'toast-wrap';
    document.body.appendChild(toastWrap);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
  toastWrap.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
};

const initTheme = () => {
  const btn = select('.theme-toggle') || select('#themeToggle');
  if (!btn) return;

  const saved = localStorage.getItem('auth_theme') || 'dark';

  if (saved === 'light') {
    document.body.classList.add('light');
  }

  btn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem(
      'auth_theme',
      document.body.classList.contains('light') ? 'light' : 'dark'
    );
  });
};

const initNavbar = () => {
  const nav = select('.navbar') || select('#navbar');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
};

const initPasswordToggle = () => {
  const toggles = selectAll('.btn-eye');

  toggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
};

const initPasswordStrength = () => {
  const passInput = select('#password');
  const bars = selectAll('.strength-bar');
  const label = select('.strength-label');

  if (!passInput || !bars.length || !label) return;

  passInput.addEventListener('input', (e) => {
    const val = e.target.value;
    let strength = 0;

    if (val.length >= 6) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    bars.forEach((b) => (b.className = 'strength-bar'));

    if (!val.length) {
      label.textContent = 'Password Strength';
      return;
    }

    const cls =
      strength === 1
        ? 'weak'
        : strength === 2
        ? 'fair'
        : strength === 3
        ? 'good'
        : 'strong';

    for (let i = 0; i < Math.min(strength, 4); i++) {
      bars[i].classList.add('active', cls);
    }

    label.textContent =
      strength === 1
        ? 'Weak'
        : strength === 2
        ? 'Fair'
        : strength === 3
        ? 'Good'
        : 'Strong';
  });
};

const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {})
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

const redirectIfAuth = () => {
  if (getToken()) {
    window.location.href = 'dashboard.html';
  }
};

const requireAuth = () => {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
};

const initRegister = () => {
  const form = select('#register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = select('#name').value.trim();
    const email = select('#email').value.trim();
    const password = select('#password').value;
    const confirmPassword = select('#confirmPassword').value;

    if (!name || !email || !password || !confirmPassword) {
      showToast('All fields are required', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      const data = await fetchAPI('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });

      setToken(data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      showToast('Registration successful', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
};

const initLogin = () => {
  const form = select('#login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = select('#email').value.trim();
    const password = select('#password').value;

    if (!email || !password) {
      showToast('Email and password required', 'error');
      return;
    }

    try {
      const data = await fetchAPI('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      setToken(data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      showToast('Login successful', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
};

const initDashboard = async () => {
  const dashboard = select('.dashboard-page');
  if (!dashboard) return;

  requireAuth();

  try {
    const data = await fetchAPI('/me');

    const user = data.data || data.user;

    select('.profile-name').textContent = user.name;
    select('.profile-email').textContent = user.email;
    select('.profile-avatar').textContent = user.name.charAt(0).toUpperCase();
    select('.profile-role').innerHTML = `<span class="badge-dot"></span>${user.role || 'User'}`;
    select('#card-user-role').textContent = user.role || 'User';

    if (user.createdAt) {
      select('#card-member-since').textContent = new Date(
        user.createdAt
      ).toLocaleDateString();
    }

    const logoutBtn = select('.btn-logout');

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        removeToken();
        window.location.href = 'login.html';
      });
    }
  } catch (err) {
    removeToken();
    showToast('Session expired', 'error');

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initPasswordToggle();
  initPasswordStrength();

  const path = window.location.pathname;

  if (path.includes('login.html')) {
    redirectIfAuth();
    initLogin();
  }

  if (path.includes('register.html')) {
    redirectIfAuth();
    initRegister();
  }

  if (path.includes('dashboard.html')) {
    initDashboard();
  }
});