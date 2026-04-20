const mongoose = require('mongoose');
const User = require('./src/models/User');
const customerReportService = require('./src/services/report/customerReportService');
require('dotenv').config();

async function testReport() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'nf-plantation' });
    const user = await User.findOne({ role: 'CUSTOMER' });
    if (user) {
        console.log('Generating report for user:', user._id);
        const report = await customerReportService.getFullFinancialReport(user._id);
        console.log('Report Title:', report.metadata.reportTitle);
        console.log('Profile Name:', report.profile.fullName);
        console.log('Wallet Balance:', report.wallet.availableBalance);
        console.log('Investment Count:', report.investments.length);
    } else {
        console.log('No customer found');
    }
    await mongoose.disconnect();
}

testReport();
