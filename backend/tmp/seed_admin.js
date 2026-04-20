const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');

const run = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'nf-plantation'
        });
        console.log('Connected.');

        const admin = await User.findOne({ userId: 'NF_ADMIN_01' });
        if (admin) {
            console.log('Admin user found:', admin.userId);
            process.exit(0);
        } else {
            console.log('Admin user NF_ADMIN_01 not found. Creating it...');
            const newAdmin = new User({
                name: 'Main Admin',
                email: 'admin@nfplantation.lk',
                userId: 'NF_ADMIN_01',
                password: 'adminpassword123',
                role: 'ADMIN',
                isActive: true
            });
            await newAdmin.save();
            console.log('Admin user created. Password: adminpassword123');
            process.exit(0);
        }
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

run();
