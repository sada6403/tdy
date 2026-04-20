const Transaction = require('../models/Transaction');
const CustomerInvestment = require('../models/CustomerInvestment');
const WalletService = require('../services/wallet/WalletService');

/**
 * @desc    Get Wallet Balance and summary stats
 * @route   GET /api/customer/wallet
 * @access  Private (Customer)
 */
exports.getWalletSummary = async (req, res, next) => {
    try {
        if (!req.customer) {
            return res.status(404).json({ success: false, message: 'Customer profile required for wallet access' });
        }

        const wallet = await WalletService.getWallet(req.customer._id);

        const activeInvestments = await CustomerInvestment.find({
            customerId: req.customer._id,
            status: 'ACTIVE'
        });

        const activePlansCount = activeInvestments.length;
        res.json({
            success: true,
            data: {
                availableBalance: wallet.availableBalance,
                heldBalance: wallet.heldBalance || 0,
                totalBalance: wallet.totalBalance || (wallet.availableBalance + (wallet.heldBalance || 0)),
                totalInvested: wallet.totalInvested || 0,
                totalEarned: wallet.totalEarned || 0,
                totalWithdrawn: wallet.totalWithdrawn || 0,
                activePlansCount: activePlansCount,
                lastTransactionId: wallet.lastTransactionId,
                currency: wallet.currency || 'LKR'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get recent wallet transactions
 * @route   GET /api/customer/wallet/activities
 * @access  Private (Customer)
 */
exports.getWalletActivities = async (req, res, next) => {
    try {
        if (!req.customer) return res.status(404).json({ success: false, message: 'Profile not found' });

        const activities = await Transaction.find({ 
            customerId: req.customer._id,
            type: { $ne: 'HOLD' }
        })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        next(error);
    }
};
