const app = require('./app');
const connectDB = require('./config/database');
const mongoose = require('mongoose');
const { initJobs } = require('./jobs/scheduler');

const PORT = process.env.PORT || 5000;

// ── Crash Safety ─────────────────────────────────────────────────────────────
// Without these, a single unhandled error kills the process silently.
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err.stack || err.message);
    process.exit(1); // PM2 / systemd will restart the process
});

process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled Promise Rejection:', reason);
    process.exit(1);
});

// ── Graceful Shutdown ────────────────────────────────────────────────────────
let server;
const shutdown = async (signal) => {
    console.log(`[SHUTDOWN] ${signal} received. Closing HTTP server...`);
    server.close(async () => {
        try {
            await mongoose.connection.close(false);
            console.log('[SHUTDOWN] MongoDB connection closed. Exiting.');
            process.exit(0);
        } catch {
            process.exit(1);
        }
    });
    // Force kill if shutdown takes too long
    setTimeout(() => { console.error('[SHUTDOWN] Force exit after timeout.'); process.exit(1); }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── Start ────────────────────────────────────────────────────────────────────
const startServer = async () => {
    try {
        await connectDB();
        initJobs();
        console.log('✅ MongoDB Connection Established');

        server = app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
        });
    } catch (error) {
        console.error('❌ Server Initialization Failed:', error.message);
        process.exit(1);
    }
};

startServer();
