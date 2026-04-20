const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config({ path: '../.env' });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'nf-plantation'
        });
        console.log('Connected to DB');

        const admins = await User.find({ role: 'ADMIN' });
        console.log('Admins found:', admins.length);
        admins.forEach(admin => {
            console.log(`- ID: ${admin.userId}, Email: ${admin.email}, Name: ${admin.name}, Active: ${admin.isActive}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
