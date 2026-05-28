/* ============================================
   USER.JS — Mongoose User Schema & Model
   ============================================ */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

/* ── Schema Definition ───────────────────────── */
const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Full name is required'],
      trim:     true,
      minlength:[2,   'Name must be at least 2 characters'],
      maxlength:[60,  'Name cannot exceed 60 characters'],
    },
    email: {
      type:      String,
      required:  [true,   'Email is required'],
      unique:    true,               // prevent duplicates at DB level
      lowercase: true,               // always store in lowercase
      trim:      true,
      match: [
        /^\S+@\S+\.\S+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6,    'Password must be at least 6 characters'],
      select:    false, // never return password in queries by default
    },
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Forgot-password: hashed reset token stored in DB
    passwordResetToken: {
      type:   String,
      default: null,
      select:  false, // never expose in normal queries
    },
    // Forgot-password: token expiry (10 minutes from request)
    passwordResetExpires: {
      type:   Date,
      default: null,
      select:  false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

/* ── Pre-save Hook: Hash password ────────────── */
userSchema.pre('save', async function (next) {
  // Only hash if the password field was modified (not on other updates)
  if (!this.isModified('password')) return next();

  // bcrypt salt rounds: 12 is secure, higher = slower but safer
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ── Instance Method: Compare password ───────── */
/**
 * Compare a plain-text password with the stored hash.
 * Called as: user.comparePassword(enteredPassword)
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* ── Instance Method: Generate reset token ────── */
/**
 * Creates a plain-text random token, hashes it with SHA-256,
 * stores the HASH in the DB (never the plain token),
 * returns the PLAIN token to be emailed to the user.
 */
userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require('crypto');

  // 1. Generate 32 random bytes → hex string (this goes in the email URL)
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2. Hash it — only the hash lives in the DB
  this.passwordResetToken   = crypto.createHash('sha256').update(resetToken).digest('hex');

  // 3. Expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken; // plain token → goes into the email link
};

module.exports = mongoose.model('User', userSchema);