const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const seedData = async () => {
    try {
        console.log('--- Database Initialization Started ---');

        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'nf-plantation'
        });
        console.log('✅ Connected to MongoDB Atlas');

        // 2. Dynamically Load All Models
        const modelsDir = path.join(__dirname, '../models');
        const files = fs.readdirSync(modelsDir);
        const models = {};

        console.log(`🔍 Scanning models folder: ${modelsDir}`);

        for (const file of files) {
            if (file.endsWith('.js')) {
                const modelName = file.replace('.js', '');
                console.log(`⏳ Loading: ${file}...`);
                try {
                    const model = require(path.join(modelsDir, file));
                    // Check if it's a valid mongoose model
                    if (model && (model.modelName || typeof model === 'function')) {
                        models[modelName] = model;
                        console.log(`📦 Loaded: ${model.modelName || modelName}`);
                    }
                } catch (err) {
                    console.log(`❌ Error Loading ${file}:`, err.message);
                    throw err; // Re-throw to stop and show error
                }
            }
        }

        // 3. Ensure All Collections Exist
        console.log('🚀 Creating collections in MongoDB...');
        for (const modelKey in models) {
            const model = models[modelKey];
            await model.createCollection();
            console.log(`✨ Created/Verified: ${model.collection.name}`);
        }

        // 4. Seed Default Admin (If not exists)
        const User = models['User'];
        if (User) {
            const existingAdmin = await User.findOne({ email: 'admin@nfplantation.com' });
            if (!existingAdmin) {
                const adminUser = new User({
                    name: 'System Administrator',
                    email: 'admin@nfplantation.com',
                    password: 'Admin@123',
                    role: 'ADMIN',
                    isActive: true
                });
                await adminUser.save();
                console.log('👤 Created Default Admin: admin@nfplantation.com');
            } else {
                console.log('ℹ️ Admin user already exists.');
            }

            const existingAdmin2 = await User.findOne({ userId: 'NF_ADMIN_01' });
            if (!existingAdmin2) {
                const adminUser2 = new User({
                    name: 'Operation Manager',
                    userId: 'NF_ADMIN_01',
                    email: 'ops@nfplantation.com',
                    password: 'Ops@Admin123',
                    role: 'ADMIN',
                    isActive: true
                });
                await adminUser2.save();
                console.log('👤 Created Second Admin: NF_ADMIN_01');
            }
        }

        // 5. Seed Default Branches (If empty)
        const Branch = models['Branch'];
        if (Branch) {
            const count = await Branch.countDocuments();
            if (count === 0) {
                const branches = [
                    { name: 'Head Office - Colombo', address: '123 Main St, Colombo 01', contactNumber: '0112345678' },
                    { name: 'Branch - Kandy', address: '45 Peradeniya Rd, Kandy', contactNumber: '0812345678' },
                    { name: 'Branch - Kurunegala', address: '10 Negombo Rd, Kurunegala', contactNumber: '0372345678' }
                ];
                await Branch.insertMany(branches);
                console.log('🏢 Created Default Branches');
            }
        }

        // 6. Seed Investment Plans (If empty)
        const InvestmentPlan = models['InvestmentPlan'];
        if (InvestmentPlan) {
            const count = await InvestmentPlan.countDocuments();
            if (count === 0) {
                const plans = [
                    { name: 'Classic Six', duration: 6, interestRate: 12, minAmount: 100000, isActive: true },
                    { name: 'Annual Growth', duration: 12, interestRate: 15, minAmount: 500000, isActive: true },
                    { name: 'Wealth Builder', duration: 24, interestRate: 18, minAmount: 1000000, isActive: true }
                ];
                await InvestmentPlan.insertMany(plans);
                console.log('📈 Created Investment Plans');
            }
        }

        console.log('--- Database Initialization Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Initialization Failed:', error.message);
        console.error(error.stack);
        fs.writeFileSync(path.join(__dirname, '../../seed_error.txt'), error.stack, 'utf8');
        process.exit(1);
    }
};

seedData();
