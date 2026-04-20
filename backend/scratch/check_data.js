const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Wallet = require('../src/models/Wallet');
const CustomerInvestment = require('../src/models/CustomerInvestment');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const wallets = await Wallet.find().populate('customerId');
        console.log('--- Wallets ---');
        wallets.forEach(w => {
            console.log(`User: ${w.customerId?.fullName || 'Unknown'}, TotalEarned: ${w.totalEarned}, Available: ${w.availableBalance}`);
        });

        const investments = await CustomerInvestment.find().populate('customerId');
        console.log('--- Investments ---');
        investments.forEach(i => {
            console.log(`User: ${i.customerId?.fullName || 'Unknown'}, Amount: ${i.investedAmount}, MonthlyProfit: ${i.monthlyProfit}, Status: ${i.status}, Start: ${i.startDate}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
