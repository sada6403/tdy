const mongoose = require('mongoose');
const Payout = require('./src/models/Payout');
require('dotenv').config();

async function checkPayouts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const payouts = await Payout.find();
        console.log('Total Payouts:', payouts.length);
        console.log(JSON.stringify(payouts, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkPayouts();
