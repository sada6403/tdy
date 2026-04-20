const ProfitService = require('../services/ProfitService');

/**
 * @desc    Trigger Daily Profit Distribution manually (Admin)
 * @route   POST /api/admin/payouts/trigger-daily
 * @access  Private (Admin Only)
 */
exports.triggerDailyPayouts = async (req, res, next) => {
    try {
        const results = await ProfitService.processDailyPayouts();
        
        res.json({
            success: true,
            data: results,
            message: `Profit distribution complete. Processed: ${results.processed}`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Payout Logs for a specific month
 * @route   GET /api/admin/payouts/logs/:month
 * @access  Private (Admin Only)
 */
exports.getPayoutLogs = async (req, res, next) => {
    try {
        const { month } = req.params; // YYYY-MM
        const ProfitPayoutLog = require('../models/ProfitPayoutLog');
        
        const logs = await ProfitPayoutLog.find({ cycleMonth: month })
            .populate('customerId', 'fullName email')
            .populate('investmentId', 'planName investedAmount');

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        next(error);
    }
};
