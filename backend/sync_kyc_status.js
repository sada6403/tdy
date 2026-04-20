const mongoose = require('mongoose');
const User = require('./src/models/User');
const Customer = require('./src/models/Customer');
const Application = require('./src/models/Application');
require('dotenv').config();

async function syncStatuses() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'nf-plantation' });
    
    // Find all approved applications
    const approvedApps = await Application.find({ status: 'APPROVED' }).lean();
    console.log(`Found ${approvedApps.length} approved applications.`);

    let updatedCount = 0;
    for (const app of approvedApps) {
        const customer = await Customer.findById(app.customerId);
        if (customer && customer.kycStatus !== 'VERIFIED') {
            console.log(`Updating status for ${customer.fullName} (${customer._id}) to VERIFIED`);
            customer.kycStatus = 'VERIFIED';
            await customer.save();
            updatedCount++;
        }
    }

    console.log(`Synchronization complete. ${updatedCount} profiles updated.`);
    await mongoose.disconnect();
}

syncStatuses();
