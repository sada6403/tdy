const app = require('./app');
const connectDB = require('./config/database');
const { initJobs } = require('./jobs/scheduler');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB Atlas
        await connectDB();
        
        // Initialize Background Jobs
        initJobs();
        
        console.log(`✅ MongoDB Connection Established`);

        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Server Initialization Failed:', error.message);
        process.exit(1);
    }
};

startServer();
