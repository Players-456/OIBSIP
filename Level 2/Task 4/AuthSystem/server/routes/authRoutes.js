/* ============================================
   AUTHROUTES.JS — API Route Definitions
   Base path: /api/auth
   ============================================ */

const express    = require('express');
const router     = express.Router();

const { register, login, getMe, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/* ── Public Routes ───────────────────────────── */
router.post('/register',              register);
router.post('/login',                 login);
router.post('/forgot-password',       forgotPassword);        // send reset email
router.post('/reset-password/:token', resetPassword);         // submit new password

/* ── Protected Routes ────────────────────────── */
router.get('/me',      protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;