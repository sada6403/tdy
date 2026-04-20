const { login } = require('../src/services/auth/AuthService');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'nf-plantation' });
        console.log('Connected to DB');
        
        try {
            const result = await login({ user_id: 'NF_ADMIN_01', password: 'adminpassword123' });
            console.log('Login success:', result.token ? 'Got token' : 'No token');
        } catch (err) {
            console.error('Login error:', err.message);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
