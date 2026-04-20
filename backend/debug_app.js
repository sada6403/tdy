const axios = require('axios');
const mongoose = require('mongoose');

// Mocking some process env vars if needed, but we just want to call the local API
const targetId = '69d747cfd2fcd3fc586fd6d4';

async function test() {
    try {
        // Since we don't have an admin token easily, we'll try to connect to the DB directly
        // and check the structures.
        const connectDB = require('./src/config/database');
        await connectDB();
        
        const PendingApproval = require('./src/models/PendingApproval');
        const Application = require('./src/models/Application');
        const Customer = require('./src/models/Customer');
        
        console.log('--- DB CONNECTED ---');
        
        const snapshot = await PendingApproval.findById(targetId);
        console.log('Snapshot:', snapshot);
        
        if (snapshot) {
            const application = await Application.findById(snapshot.applicationId);
            console.log('Application:', application);
            
            if (application) {
                const customer = await Customer.findById(application.customerId);
                console.log('Customer:', customer);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

test();
