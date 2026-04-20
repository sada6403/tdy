const cron = require('node-cron');
const ProfitService = require('../services/ProfitService');

/**
 * @desc Initialize all background jobs
 */
const initJobs = () => {
    console.log('--- Initializing Background Schedulers ---');

    // 1. Profit Payout Job (Daily at 00:01 AM)
    // Runs '1 0 * * *' -> Minute 1, Hour 0, Every Day
    cron.schedule('1 0 * * *', async () => {
        console.log('[SCHEDULER] Starting Daily Profit Distribution Scan...');
        try {
            const results = await ProfitService.processDailyPayouts();
            console.log(`[SCHEDULER] Profit Distribution Complete:`, results);
        } catch (error) {
            console.error(`[SCHEDULER_CRITICAL] Profit Distribution Failed: ${error.message}`);
        }
    });

    // 2. Add other jobs here (e.g. Cleanning up old drafts, System Health Checks)
    console.log('✅ Schedulers active: ProfitDistribution (Daily)');
};

module.exports = { initJobs };
