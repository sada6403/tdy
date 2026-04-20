const mongoose = require('mongoose');
const User = require('./src/models/User');
const Customer = require('./src/models/Customer');
const Application = require('./src/models/Application');
const Wallet = require('./src/models/Wallet');
require('dotenv').config();

async function checkData() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'nf-plantation' });
    const user = await User.findOne({ name: 'Mathan' }).populate('customerId');
    const cId = user.customerId?._id || user.customerId;
    const wallet = await Wallet.findOne({ customerId: cId }).lean();
    console.log('Wallet:', JSON.stringify(wallet, null, 2));
    if (user && user.customerId) {
        const customer = await Customer.findById(user.customerId._id).populate('branchId');
        console.log('Customer:', JSON.stringify(customer, null, 2));
    }
    await mongoose.disconnect();
}

checkData();
