const mongoose = require('mongoose');
const Wallet = require('./src/models/Wallet');
require('dotenv').config();

async function fixWalletTotalEarned() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const wallet = await Wallet.findOne({ customerId: '69d1e2678d7d0d3bfcd0987c' }); // Mathan's customer ID
        if (wallet) {
            wallet.totalEarned = (wallet.totalEarned || 0) + 3000;
            await wallet.save();
            console.log('Wallet totalEarned updated:', wallet.totalEarned);
        } else {
            console.log('Wallet not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

fixWalletTotalEarned();
