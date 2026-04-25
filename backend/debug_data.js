const mongoose = require('mongoose');
const User = require('./src/models/User');
const Customer = require('./src/models/Customer');
const CustomerInvestment = require('./src/models/CustomerInvestment');
require('dotenv').config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ userId: 'NFP-676551' });
        
        if (user) {
            const investmentsByCustomerId = await CustomerInvestment.find({ customerId: user.customerId });
            console.log('Investments by customerId:', JSON.stringify(investmentsByCustomerId.map(i => ({ 
                _id: i._id, 
                status: i.status, 
                investedAmount: i.investedAmount,
                profitDestination: i.profitDestination,
                startDate: i.startDate,
                nextProfitDate: i.nextProfitDate,
                monthlyROI: i.monthlyROI
            })), null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
