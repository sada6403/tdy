const WithdrawalService = require('../services/WithdrawalService');

/**
 * @desc    Request a withdrawal (Customer)
 * @route   POST /api/customer/withdrawals/request
 */
exports.requestWithdrawal = async (req, res, next) => {
    try {
        const { amount, bankDetails, note } = req.body;
        const customerId = req.user.id; // From auth middleware

        const request = await WithdrawalService.requestWithdrawal({
            customerId,
            amount,
            bankDetails,
            note,
            req
        });

        res.status(201).json({
            success: true,
            data: request,
            message: 'Withdrawal request submitted. Funds are currently held.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Approve Withdrawal (Admin)
 */
exports.approveWithdrawal = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const adminId = req.user.id;

        const result = await WithdrawalService.approveWithdrawal(requestId, adminId, req);

        res.json({
            success: true,
            data: result,
            message: 'Withdrawal approved and funds debited.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reject Withdrawal (Admin)
 */
exports.rejectWithdrawal = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const result = await WithdrawalService.rejectWithdrawal(requestId, reason, adminId, req);

        res.json({
            success: true,
            data: result,
            message: 'Withdrawal rejected and funds reverted.'
        });
    } catch (error) {
        next(error);
    }
};
