const mongoose = require('mongoose');
const CustomerInvestment = require('./src/models/CustomerInvestment');
const ProfitService = require('./src/services/ProfitService');
require('dotenv').config();

async function fixDataAndProcessPayouts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const activeInvestments = await CustomerInvestment.find({ status: 'ACTIVE', nextProfitDate: { $exists: false } });
        console.log(`Found ${activeInvestments.length} ACTIVE investments missing nextProfitDate.`);

        for (const inv of activeInvestments) {
            let nextDate = new Date(inv.startDate);
            // Fast forward nextDate to the next valid cycle after today, or just 1 month after start if it's the first.
            // Since it was April 17, nextDate should be May 17.
            // Let's just set it to 1 month after startDate.
            nextDate.setMonth(nextDate.getMonth() + 1);
            inv.nextProfitDate = nextDate;
            await inv.save();
            console.log(`Updated investment ${inv._id} with nextProfitDate: ${inv.nextProfitDate}`);
        }

        console.log('Running processDailyPayouts()...');
        const results = await ProfitService.processDailyPayouts();
        console.log('Payouts processed:', results);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

fixDataAndProcessPayouts();
