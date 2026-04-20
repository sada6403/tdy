const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'nf-plantation'
        });
        console.log('Connected to nf-plantation.');

        const db = mongoose.connection.db;

        // Collection 1: customers (Check if any remaining index issues)
        const customersCol = db.collection('customers');
        let indexes = await customersCol.indexes();
        console.log('Customers indexes:', JSON.stringify(indexes, null, 2));

        // Collection 2: applicationverifications
        const appVerifCol = db.collection('applicationverifications');
        indexes = await appVerifCol.indexes();
        console.log('ApplicationVerifications indexes:', JSON.stringify(indexes, null, 2));

        const tempSessionIndex = indexes.find(idx => idx.name === 'tempSessionId_1');
        if (tempSessionIndex) {
            console.log('Dropping tempSessionId_1 from applicationverifications...');
            await appVerifCol.dropIndex('tempSessionId_1');
            console.log('Index dropped successfully.');
        } else {
            console.log('tempSessionId_1 not found in applicationverifications.');
        }

        console.log('Index fix completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
}

fixIndexes();
