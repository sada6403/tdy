const mongoose = require('mongoose');
const User = require('./src/models/User');
const AuthService = require('./src/services/auth/AuthService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'nf-plantation' });
        console.log('Connected to DB');

        const user_id = 'NF_ADMIN_01';
        const password = 'Ops@Admin123';

        console.log(`Testing login for ${user_id}...`);
        const { user, token } = await AuthService.login({ user_id, password });
        console.log('✅ Login Successful!');
        console.log('User Role:', user.role);
        process.exit(0);
    } catch (err) {
        console.error('❌ Login Failed:', err.message);
        process.exit(1);
    }
};

test();
