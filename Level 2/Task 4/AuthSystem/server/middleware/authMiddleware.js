/* ============================================
   AUTHMIDDLEWARE.JS — JWT Protection Layer
   ============================================ */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — Express middleware that:
 *   1. Reads the JWT from the Authorization header
 *   2. Verifies the token is valid and not expired
 *   3. Attaches the user document to req.user
 *   4. Calls next() if everything is fine
 *   5. Returns 401 if token is missing, invalid, or expired
 *
 * Usage: router.get('/protected', protect, handler)
 */
const protect = async (req, res, next) => {
  let token;

  // JWT is expected in: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]; // extract just the token part
  }

  // No token found
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in.',
    });
  }

  try {
    // Verify the token against our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach fresh user data (without password) to the request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists. Please log in again.',
      });
    }

    next(); // token is valid — proceed to the route handler

  } catch (error) {
    // Token was tampered with, malformed, or expired
    let message = 'Invalid token. Please log in again.';
    if (error.name === 'TokenExpiredError') {
      message = 'Session expired. Please log in again.';
    }
    return res.status(401).json({ success: false, message });
  }
};

module.exports = { protect };