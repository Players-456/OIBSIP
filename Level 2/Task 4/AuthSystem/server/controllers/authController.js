/* ============================================
   AUTHCONTROLLER.JS — Business Logic
   Handles: register, login, getMe, logout
   ============================================ */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/* ── Helper: Sign a JWT ──────────────────────── */
/**
 * Generate a signed JWT for a given user id.
 * @param {string} id  — Mongoose _id
 * @returns {string}   — Signed JWT string
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/* ── Helper: Send token response ─────────────── */
const sendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  // Strip password before sending user object
  const userData = {
    id:        user._id,
    name:      user.name,
    email:     user.email,
    role:      user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userData,
  });
};

/* ────────────────────────────────────────────
   REGISTER
   POST /api/auth/register
─────────────────────────────────────────── */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic presence check (Mongoose handles deeper validation)
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    // 2. Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // 3. Create user — password is hashed by the pre-save hook in User model
    const user = await User.create({ name, email, password });

    // 4. Return token
    sendToken(user, 201, res, 'Account created successfully! Welcome aboard.');

  } catch (error) {
    // Handle Mongoose validation errors (e.g. too short, bad email format)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/* ────────────────────────────────────────────
   LOGIN
   POST /api/auth/login
─────────────────────────────────────────── */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Presence check
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email and password.',
      });
    }

    // 2. Find user — we need the password field (it's select:false by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Compare password using our model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 4. Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // 5. Send token
    sendToken(user, 200, res, `Welcome back, ${user.name}!`);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/* ────────────────────────────────────────────
   GET ME (Protected Route)
   GET /api/auth/me
─────────────────────────────────────────── */
const getMe = async (req, res) => {
  try {
    // req.user is already fetched and attached by the protect middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/* ────────────────────────────────────────────
   LOGOUT
   POST /api/auth/logout
   (JWT is stateless — logout is handled client-side
    but we acknowledge it here for proper UX flow)
─────────────────────────────────────────── */
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

module.exports = { register, login, getMe, logout };