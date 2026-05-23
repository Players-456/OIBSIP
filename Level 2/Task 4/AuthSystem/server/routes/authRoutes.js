/* ============================================
   AUTHROUTES.JS — API Route Definitions
   Base path: /api/auth
   ============================================ */

const express    = require('express');
const router     = express.Router();

const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/* ── Public Routes ───────────────────────────── */
// No authentication required

router.post('/register', register);  // Create a new account
router.post('/login',    login);     // Authenticate and get token

/* ── Protected Routes ────────────────────────── */
// protect middleware verifies JWT before handler runs

router.get('/me',     protect, getMe);   // Get current user's data
router.post('/logout',protect, logout);  // Acknowledge logout

module.exports = router;