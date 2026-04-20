const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Customer = require('../src/models/Customer');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const res = await Customer.updateOne(
            { fullName: /Mathan/i }, 
            { 
                $set: { 
                    bankDetails: { 
                        bankName: 'Bank of Ceylon (BOC)', 
                        branchName: 'Colombo', 
                        accountHolder: 'Monishan', 
                        accountNumber: '8765432456' 
                    } 
                } 
            }
        );
        console.log('Update Result:', res);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

fix();
