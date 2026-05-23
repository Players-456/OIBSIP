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

module.exports = mongoose.model('User', userSchema);