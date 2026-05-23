const API_URL = '/api/auth';

/**
 * UTILS
 */
const select = (sel) => document.querySelector(sel);
const selectAll = (sel) => document.querySelectorAll(sel);

// Theme Toggle
const initTheme = () => {
  const themeToggle = select('.theme-toggle');
  if (!themeToggle) return;

  const currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') {
    document.body.classList.add('light');
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const newTheme = document.body.classList.contains('light') ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
  });
};

// Navbar Scroll Effect
const initNavbar = () => {
  const navbar = select('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
};

// Toast Notifications
const showToast = (message, type = 'info') => {
  let toastWrap = select('.toast-wrap');
  if (!toastWrap) {
    toastWrap = document.createElement('div');
    toastWrap.className = 'toast-wrap';
    document.body.appendChild(toastWrap);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
  toastWrap.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
};

// Password Toggle
const initPasswordToggle = () => {
  const toggles = selectAll('.btn-eye');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`; // Eye off
      } else {
        input.type = 'password';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`; // Eye
      }
    });
  });
};

// Form Validation Utils
const showError = (input, message) => {
  const formGroup = input.closest('.form-group');
  if (!formGroup) return;
  const errorEl = formGroup.querySelector('.field-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }
  input.classList.add('error-field');
};

const clearError = (input) => {
  const formGroup = input.closest('.form-group');
  if (!formGroup) return;
  const errorEl = formGroup.querySelector('.field-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }
  input.classList.remove('error-field');
};

// Password Strength
const initPasswordStrength = () => {
  const passInput = select('#password');
  if (!passInput) return;
  const bars = selectAll('.strength-bar');
  const label = select('.strength-label');

  if (!bars.length || !label) return;

  passInput.addEventListener('input', (e) => {
    const val = e.target.value;
    let strength = 0;
    if (val.length >= 6) strength++;
    if (val.match(/[A-Z]/)) strength++;
    if (val.match(/[0-9]/)) strength++;
    if (val.match(/[^A-Za-z0-9]/)) strength++;

    bars.forEach(b => b.className = 'strength-bar');
    
    if (val.length === 0) {
      label.textContent = 'Password Strength';
      return;
    }

    if (strength === 1) {
      bars[0].classList.add('active', 'weak');
      label.textContent = 'Weak';
    } else if (strength === 2) {
      bars[0].classList.add('active', 'fair');
      bars[1].classList.add('active', 'fair');
      label.textContent = 'Fair';
    } else if (strength === 3) {
      bars[0].classList.add('active', 'good');
      bars[1].classList.add('active', 'good');
      bars[2].classList.add('active', 'good');
      label.textContent = 'Good';
    } else if (strength >= 4) {
      bars.forEach(b => b.classList.add('active', 'strong'));
      label.textContent = 'Strong';
    }
  });
};

/**
 * AUTHENTICATION
 */

// LocalStorage Handlers
const setToken = (token) => localStorage.setItem('token', token);
const getToken = () => localStorage.getItem('token');
const removeToken = () => localStorage.removeItem('token');

// API call helper
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (err) {
    throw err;
  }
};

// Redirect Logic
const protectRoute = () => {
  const token = getToken();
  if (!token) {
    window.location.href = '/unauthorized.html';
  }
};

const redirectIfLoggedIn = () => {
  const token = getToken();
  if (token) {
    window.location.href = '/dashboard.html';
  }
};

/**
 * PAGE LOGIC
 */

const initRegister = () => {
  const form = select('#register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = select('#name');
    const email = select('#email');
    const password = select('#password');
    const confirmPassword = select('#confirmPassword');
    const submitBtn = select('.btn-submit');
    const alertBox = select('.alert');

    // Reset errors
    [name, email, password, confirmPassword].forEach(clearError);
    if (alertBox) alertBox.className = 'alert';

    let hasError = false;

    if (!name.value.trim()) { showError(name, 'Name is required'); hasError = true; }
    if (!email.value.trim() || !/\S+@\S+\.\S+/.test(email.value)) { showError(email, 'Valid email is required'); hasError = true; }
    if (password.value.length < 6) { showError(password, 'Password must be at least 6 characters'); hasError = true; }
    if (password.value !== confirmPassword.value) { showError(confirmPassword, 'Passwords do not match'); hasError = true; }

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Creating Account...';

    try {
      const data = await fetchAPI('/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.value,
          email: email.value,
          password: password.value
        })
      });

      setToken(data.token);
      showToast('Registration successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);

    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Sign Up';
      
      if (alertBox) {
        alertBox.textContent = err.message;
        alertBox.className = 'alert error show';
      } else {
        showToast(err.message, 'error');
      }

      if (err.message.toLowerCase().includes('email')) {
        showError(email, 'Email already in use');
      }
    }
  });
};

const initLogin = () => {
  const form = select('#login-form');
  if (!form) return;

  const rememberMe = select('#rememberMe');
  if (rememberMe && localStorage.getItem('rememberedEmail')) {
    select('#email').value = localStorage.getItem('rememberedEmail');
    rememberMe.checked = true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = select('#email');
    const password = select('#password');
    const submitBtn = select('.btn-submit');
    const alertBox = select('.alert');

    // Reset errors
    [email, password].forEach(clearError);
    if (alertBox) alertBox.className = 'alert';

    let hasError = false;

    if (!email.value.trim()) { showError(email, 'Email is required'); hasError = true; }
    if (!password.value) { showError(password, 'Password is required'); hasError = true; }

    if (hasError) return;

    if (rememberMe && rememberMe.checked) {
      localStorage.setItem('rememberedEmail', email.value);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Authenticating...';

    try {
      const data = await fetchAPI('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.value,
          password: password.value
        })
      });

      setToken(data.token);
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);

    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Sign In';
      
      if (alertBox) {
        alertBox.textContent = err.message;
        alertBox.className = 'alert error show';
      } else {
        showToast(err.message, 'error');
      }

      if (err.message.toLowerCase().includes('password')) {
        showError(password, 'Incorrect password');
      } else if (err.message.toLowerCase().includes('user') || err.message.toLowerCase().includes('email')) {
        showError(email, 'User not found');
      }
    }
  });
};

const initDashboard = async () => {
  const dashboard = select('.dashboard-page');
  if (!dashboard) return;

  protectRoute();

  const nameEl = select('.profile-name');
  const emailEl = select('.profile-email');
  const roleEl = select('.profile-role');
  const avatarEl = select('.profile-avatar');
  
  // New auth card elements
  const cardRoleEl = select('#card-user-role');
  const cardMemberSinceEl = select('#card-member-since');

  try {
    const data = await fetchAPI('/me', { method: 'GET' });

    console.log('ME API RESPONSE:', data);

    // FIX: handle different backend response formats
    const user = data.user || data.data || data;

    if (!user || !user.name || !user.email) {
      throw new Error('Invalid user data');
    }

    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (roleEl) {
      roleEl.innerHTML = `<span class="badge-dot"></span>${user.role || 'User'}`;
    }
    if (avatarEl) {
      avatarEl.textContent = user.name.charAt(0).toUpperCase();
    }

    // Populate auth cards
    if (cardRoleEl) {
      cardRoleEl.textContent = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User';
    }
    if (cardMemberSinceEl && user.createdAt) {
      const date = new Date(user.createdAt);
      cardMemberSinceEl.textContent = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Logout
    const logoutBtn = select('.btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        removeToken();
        window.location.href = '/login.html';
      });
    }

  } catch (err) {
    console.error('Dashboard Error:', err);

    showToast('Session expired. Please login again.', 'error');

    removeToken();

    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1500);
  }
};

/**
 * INITIALIZATION
 */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initPasswordToggle();
  initPasswordStrength();

  // Route specific logic
  const path = window.location.pathname;
  if (path.includes('login.html')) {
    redirectIfLoggedIn();
    initLogin();
  } else if (path.includes('register.html')) {
    redirectIfLoggedIn();
    initRegister();
  } else if (path.includes('dashboard.html')) {
    initDashboard();
  } else if (path === '/' || path.includes('index.html')) {
    redirectIfLoggedIn();
  }
});