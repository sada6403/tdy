const mongoose = require('mongoose');
const User = require('./src/models/User');
const Customer = require('./src/models/Customer');
const Notification = require('./src/models/Notification');
const Wallet = require('./src/models/Wallet');
require('dotenv').config();

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nf_plantation');
        console.log('Connected to DB');

        const moniUser = await User.findOne({ name: /MONI/i });
        if (!moniUser) {
            console.log('User MONI not found');
            process.exit(0);
        }
        console.log('User Found:', { id: moniUser._id, userId: moniUser.userId, email: moniUser.email });

        const customer = await Customer.findOne({ _id: moniUser.customerId });
        if (customer) {
            console.log('Customer Found:', { id: customer._id, nic: customer.nic, email: customer.email });
        } else {
            // Try finding customer by email if NOT linked to user object
            const fallbackCust = await Customer.findOne({ email: moniUser.email });
            if (fallbackCust) {
                console.log('Customer Found (fallback by email):', { id: fallbackCust._id, nic: fallbackCust.nic });
            }
        }

        const notifications = await Notification.find({ 
            $or: [
                { customerId: moniUser.customerId },
                { userId: moniUser._id }
            ]
        });
        console.log('Notifications Count:', notifications.length);
        notifications.forEach(n => console.log(`- [${n.type}] ${n.title}: ${n.message}`));

        const wallet = await Wallet.findOne({ customerId: moniUser.customerId });
        console.log('Wallet:', wallet);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
