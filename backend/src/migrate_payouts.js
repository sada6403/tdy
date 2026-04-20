const mongoose = require('mongoose');
const WithdrawalRequest = require('./models/WithdrawalRequest');
const Payout = require('./models/Payout');
const Customer = require('./models/Customer');

const MONGODB_URI = 'mongodb://nfplantationmm_db_user:REVj1xUtJGgvjbUZ@ac-xi3gh4i-shard-00-00.cqqvqxi.mongodb.net:27017,ac-xi3gh4i-shard-00-01.cqqvqxi.mongodb.net:27017,ac-xi3gh4i-shard-00-02.cqqvqxi.mongodb.net:27017/nf-plantation?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const approved = await WithdrawalRequest.find({ status: { $regex: /^APPROVED$/i } });
        console.log(`Found ${approved.length} approved withdrawals`);

        for (const wr of approved) {
            const exists = await Payout.findOne({ withdrawalRequestId: wr._id });
            if (!exists) {
                await Payout.create({
                    withdrawalRequestId: wr._id,
                    customerId: wr.customerId,
                    amount: wr.amount,
                    bankName: wr.bankName,
                    accountName: wr.accountName,
                    accountNumber: wr.accountNumber,
                    branchName: wr.branchName,
                    referenceNumber: wr.referenceNumber,
                    type: (wr.referenceNumber || '').includes('AUTO') ? 'MONTHLY_RETURN' : 'WITHDRAWAL',
                    status: 'PENDING',
                    approvedAt: wr.approvedAt || wr.updatedAt
                });
                console.log('Migrated WDR:', wr.referenceNumber);
            }
        }
        console.log('Migration completed');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
