/* ============================================
   SERVER.JS — Express App Entry Point
   AuthSystem · Dharmit Monani · Oasis Infobyte
   ============================================ */

// Load environment variables from .env first
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const connectDB    = require('./config/db');
const authRoutes   = require('./routes/authRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Connect to Database ─────────────────────── */
connectDB();

/* ── Middleware ──────────────────────────────── */

// Parse incoming JSON bodies
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: false }));

// CORS — allow requests from our client origin
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false                   // same-origin in production
    : 'http://localhost:5000', // dev
  credentials: true,
}));

// Serve static files from the client folder
// This makes all HTML, CSS, JS files accessible
app.use(express.static(path.join(__dirname, '../client')));

/* ── API Routes ──────────────────────────────── */
// All auth API endpoints live under /api/auth
app.use('/api/auth', authRoutes);

/* ── Health Check ────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AuthSystem API is running',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

/* ── Catch-All: Serve client pages ───────────── */
// Any unmatched route returns the landing page
// (SPA-style fallback — each HTML page handles its own auth check)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

/* ── Global Error Handler ────────────────────── */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again.'
      : err.message,
  });
});

/* ── Start Server ────────────────────────────── */
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 AuthSystem Server running');
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});