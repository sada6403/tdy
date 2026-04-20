const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'nf-plantation'
    });
    console.log('[MongoDB] Connected');
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const User = require('./src/models/User');

const checkAdmin = async () => {
    await connectDB();
    const admin = await User.findOne({ userId: 'NF_ADMIN_01' });
    if (!admin) {
        console.log('NF_ADMIN_01 not found');
    } else {
        console.log('Found Admin:', admin.userId);
        console.log('isActive:', admin.isActive);
        console.log('loginAttempts:', admin.loginAttempts);
        console.log('lockoutUntil:', admin.lockoutUntil);
        console.log('role:', admin.role);
    }
    process.exit(0);
};

checkAdmin();
