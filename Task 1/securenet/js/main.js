/* ============================================
   MAIN.JS — SecureNet
   JavaScript functionality
   ============================================

   Chunks to be added:
   - Chunk 7: Hamburger menu toggle
   - Chunk 7: Navbar scroll effect
   - Chunk 7: Smooth scroll for nav links
   - Chunk 7: Scroll-triggered animations
   - Chunk 7: Stats counter animation

   ============================================ */

// JavaScript will be built in Chunk 7

/* ── 1. HAMBURGER MENU ──────────────────────── */

const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

/* ── 2. NAVBAR SCROLL EFFECT ────────────────── */

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.querySelector('.navbar').classList.add('scrolled');
  } else {
    navbar.querySelector('.navbar').classList.remove('scrolled');
  }
});

/* ── 3. SMOOTH SCROLL ───────────────────────── */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // navbar height offset
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── 4. SCROLL REVEAL ANIMATIONS ────────────── */

const revealElements = document.querySelectorAll(
  '.feature-card, .device-card, .stat-card, .benefit-item, .section-header, .hero__content, .hero__visual, .why-us__content, .why-us__visual, .cta__content'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target); // animate once only
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ── 5. STATS COUNTER ANIMATION ─────────────── */

const statNumbers = document.querySelectorAll('.stat-number');

const countUp = (el) => {
  const target = +el.getAttribute('data-target');
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;

  const update = () => {
    current += step;
    if (current < target) {
      el.textContent = Math.floor(current).toLocaleString();
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString();
    }
  };

  requestAnimationFrame(update);
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      statNumbers.forEach(countUp);
      statsObserver.disconnect(); // run once only
    }
  });
}, { threshold: 0.3 });

const statsSection = document.getElementById('stats');
if (statsSection) statsObserver.observe(statsSection);