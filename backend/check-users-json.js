const mongoose = require('mongoose');
const User = require('./src/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'nf-plantation' });
        const users = await User.find({}, 'userId email role isActive');
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
