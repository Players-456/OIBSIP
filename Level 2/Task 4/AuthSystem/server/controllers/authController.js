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
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user.id);

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

/* ────────────────────────────────────────────
   FORGOT PASSWORD
   POST /api/auth/forgot-password
   Body: { email }

   Flow:
   1. Find user by email
   2. Generate plain token + store its SHA-256 hash in DB
   3. Build reset URL with plain token
   4. Send email with reset link
   5. Respond with success (never reveal if email exists)
─────────────────────────────────────────── */
const crypto    = require('crypto');
const sendEmail = require('../utils/sendEmail');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    // 1. Find user — use +select fields for reset token
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond success — don't reveal if email exists (security)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    // 2. Generate token and save hash to DB
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3. Build reset URL — points to the frontend reset page
    const clientOrigin = process.env.CLIENT_ORIGIN || `http://localhost:${process.env.PORT || 5000}`;
    const resetURL = `${clientOrigin}/reset-password.html?token=${resetToken}`;

    // 4. Send email
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0f1e;color:#f0f0f8;padding:2rem;border-radius:12px;border:1px solid rgba(124,58,237,0.3)">
        <h2 style="margin:0 0 0.5rem;font-size:1.3rem;color:#a78bfa">Password Reset Request</h2>
        <p style="color:#8b8ba7;margin:0 0 1.5rem">Hi ${user.name},</p>
        <p style="color:#8b8ba7;margin:0 0 1.5rem">
          You requested to reset your password. Click the button below.
          This link expires in <strong style="color:#f0f0f8">10 minutes</strong>.
        </p>
        <a href="${resetURL}"
           style="display:inline-block;padding:0.75rem 2rem;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;border-radius:999px;text-decoration:none;font-weight:700;font-size:0.95rem">
          Reset Password
        </a>
        <p style="color:#44445a;font-size:0.75rem;margin-top:1.5rem">
          If you did not request this, ignore this email. Your password will not change.
        </p>
        <p style="color:#44445a;font-size:0.7rem;margin-top:0.5rem;word-break:break-all">
          Or paste: ${resetURL}
        </p>
      </div>
    `;

    try {
      await sendEmail({ to: user.email, subject: 'AuthSystem — Password Reset Link', html });
    } catch (emailErr) {
      // If email fails, clear the stored token so the user can try again
      user.passwordResetToken   = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email send failed:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });

  } catch (error) {
    console.error('ForgotPassword error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/* ────────────────────────────────────────────
   RESET PASSWORD
   POST /api/auth/reset-password/:token
   Body: { password }

   Flow:
   1. Hash the token from the URL
   2. Find user with matching hash AND non-expired token
   3. Set new password (pre-save hook hashes it)
   4. Clear the reset token fields
   5. Return a fresh JWT so the user is logged in immediately
─────────────────────────────────────────── */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // 1. Hash the incoming plain token to compare against DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find user — token must match AND not be expired
    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // still valid
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired. Please request a new one.',
      });
    }

    // 3. Set new password — pre-save hook will hash it
    user.password = password;

    // 4. Clear reset token fields
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 5. Log the user in immediately with a fresh JWT
    sendToken(user, 200, res, 'Password reset successful! You are now logged in.');

  } catch (error) {
    console.error('ResetPassword error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

module.exports = { register, login, getMe, logout, forgotPassword, resetPassword };