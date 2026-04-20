const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Customer = require('../src/models/Customer');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ role: 'CUSTOMER' });
        console.log('--- Users (Customers) ---');
        for (const u of users) {
            console.log(`User: ${u.name}, ID: ${u._id}, CustomerId: ${u.customerId}`);
            if (u.customerId) {
                const c = await Customer.findById(u.customerId);
                if (c) {
                    console.log(`  Customer Record Found: ${c.fullName}`);
                    console.log(`  Bank Details: ${JSON.stringify(c.bankDetails)}`);
                } else {
                    console.log(`  Customer Record NOT FOUND for ID: ${u.customerId}`);
                }
            } else {
                // Try finding customer by userId
                const c = await Customer.findOne({ userId: u._id });
                if (c) {
                    console.log(`  Customer Found by userId: ${c.fullName}`);
                    console.log(`  Bank Details: ${JSON.stringify(c.bankDetails)}`);
                } else {
                    console.log(`  No Customer linked by userId either.`);
                }
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
