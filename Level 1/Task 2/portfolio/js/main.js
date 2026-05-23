/* ============================================
   MAIN.JS — Dharmit Monani Portfolio
   ============================================ */

/* ── 1. NAVBAR ───────────────────────────────── */
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  navbar.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
});

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

/* ── 2. SMOOTH SCROLL ────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});

/* ── 3. TYPING ANIMATION ─────────────────────── */
const roles = [
  'Software Engineering Student',
  'Web Developer',
  'MERN Stack Developer',
  'Full Stack Builder',
];
const typedEl = document.querySelector('.typed');
let roleIndex = 0, charIndex = 0, deleting = false;

function type() {
  const current = roles[roleIndex];
  if (deleting) {
    typedEl.textContent = current.slice(0, --charIndex);
  } else {
    typedEl.textContent = current.slice(0, ++charIndex);
  }
  let delay = deleting ? 55 : 95;
  if (!deleting && charIndex === current.length) { delay = 1800; deleting = true; }
  else if (deleting && charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; delay = 350; }
  setTimeout(type, delay);
}
type();

/* ── 4. SCROLL REVEAL ────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── 5. CONTACT FORM ─────────────────────────── */
const form     = document.getElementById('contactForm');
const feedback = document.getElementById('formFeedback');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const msg = form.querySelector('#message').value.trim();

    if (!name || !email || !msg) {
      feedback.textContent = 'Please fill in all fields.';
      feedback.className = 'form__feedback error';
      return;
    }

    feedback.textContent = `Thanks ${name}! Your message has been received. I'll get back to you soon.`;
    feedback.className = 'form__feedback success';
    form.reset();
  });
}

/* ── 6. ACTIVE NAV LINK ON SCROLL ───────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.navbar__links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}`
      ? 'var(--clr-violet-light)'
      : '';
  });
});