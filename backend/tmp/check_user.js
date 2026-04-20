
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require(path.join(__dirname, '../src/models/User'));
        
        console.log('Searching for userId: admin123');
        const user = await User.findOne({
            $or: [{ userId: 'admin123' }, { email: 'admin123' }],
            isActive: true
        });

        if (user) {
            console.log('User found!');
            console.log('ID:', user._id);
            console.log('UserId:', user.userId);
            console.log('Email:', user.email);
            console.log('IsActive:', user.isActive);
            console.log('Role:', user.role);

            const match = await user.comparePassword('moni1234');
            console.log('Password "moni1234" match:', match);
        } else {
            console.log('User NOT found with combined query');
            const userById = await User.findOne({ userId: 'admin123' });
            console.log('User with only userId: admin123:', userById ? 'Found' : 'NOT found');
            const userByEmail = await User.findOne({ email: 'admin@nfplantation.com' });
            console.log('User with email admin@nfplantation.com:', userByEmail ? 'Found' : 'NOT found');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

check();
