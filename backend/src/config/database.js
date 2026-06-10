const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'nf-plantation',
      // Connection pool: 50 concurrent DB ops handles ~5000 concurrent HTTP users
      maxPoolSize: 50,
      minPoolSize: 5,
      // Fail fast on config errors rather than hanging forever
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);

    // Reconnection events
    mongoose.connection.on('disconnected', () => console.warn('[MongoDB] Disconnected. Mongoose will auto-reconnect.'));
    mongoose.connection.on('error', (err) => console.error('[MongoDB] Connection error:', err.message));
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
