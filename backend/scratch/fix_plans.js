const mongoose = require('mongoose');
require('dotenv').config();

const updatePlans = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const InvestmentPlan = mongoose.model('InvestmentPlan', new mongoose.Schema({}, { strict: false }), 'investmentplans');
        
        const result = await InvestmentPlan.updateMany(
            {}, 
            { 
                $set: { 
                    status: 'ACTIVE', 
                    customerVisible: true, 
                    isActive: true,
                    durationUnit: 'Months',
                    payoutType: 'Monthly Return'
                } 
            }
        );

        console.log(`Successfully updated ${result.modifiedCount} investment plans.`);
        process.exit(0);
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
};

updatePlans();
