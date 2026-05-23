
/* ============================================
   DB.JS — MongoDB Connection via Mongoose
   ============================================ */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI in .env
 * Exits the process if connection fails.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options suppress deprecation warnings
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Stop server if DB is unreachable
  }
};

module.exports = connectDB;