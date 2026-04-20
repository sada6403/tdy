const BaseService = require('./BaseService');
const WalletService = require('./wallet/WalletService');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const AuditLogService = require('./AuditLogService');

class WithdrawalService extends BaseService {
    constructor() {
        super('WithdrawalService');
    }

    /**
     * @desc Initiate a withdrawal request (The "HOLD" phase)
     */
    async requestWithdrawal({ customerId, amount, bankDetails, note, req }) {
        return this.executeTransaction(async (session) => {
            // 1. Hold Funds in Wallet (Ensures availability & atomic lock)
            const wallet = await WalletService.holdFunds(customerId, amount);

            // 2. Create the Request Record
            const [request] = await WithdrawalRequest.create([{
                customerId,
                amount,
                bankDetails,
                note,
                status: 'PENDING',
                referenceId: `WD-${Date.now()}`
            }], { session });

            // 3. Audit the request
            await AuditLogService.log({
                userId: null,
                action: 'WITHDRAWAL_REQUESTED',
                target: 'WITHDRAWAL_REQUEST',
                targetId: request._id,
                newData: { amount, referenceId: request.referenceId },
                req
            });

            this.logSuccess('Withdrawal Requested & Funds Held', { customerId, amount });
            return request;
        });
    }

    /**
     * @desc Approve & Execute Withdrawal (The "RELEASE & DEBIT" phase)
     */
    async approveWithdrawal(requestId, adminId, req) {
        return this.executeTransaction(async (session) => {
            const request = await WithdrawalRequest.findById(requestId).session(session);
            if (!request || request.status !== 'PENDING') {
                throw new Error('Invalid or non-pending withdrawal request');
            }

            // 1. Release & Execute held funds from Wallet
            const { wallet, transaction } = await WalletService.adjustBalance({
                customerId: request.customerId,
                amount: -request.amount, // Explicit negative for debit
                type: 'WITHDRAWAL_COMPLETED',
                description: `Withdrawal Approved (${request.referenceId})`,
                referenceId: request._id
            });

            // Handle the "Held" balance part (Release and Subtract)
            await WalletService.releaseHeldFunds(request.customerId, request.amount, true);

            // 2. Update Request Status
            request.status = 'APPROVED';
            request.approvedBy = adminId;
            request.processedAt = new Date();
            request.transactionId = transaction._id;
            await request.save({ session });

            // 3. Audit the approval
            await AuditLogService.log({
                userId: adminId,
                action: 'WITHDRAWAL_APPROVED',
                target: 'WITHDRAWAL_REQUEST',
                targetId: request._id,
                newData: { amount: request.amount, status: 'APPROVED' },
                req
            });

            this.logSuccess('Withdrawal Approved & Funds Debited', { requestId });
            return { request, wallet };
        });
    }

    /**
     * @desc Reject Withdrawal (The "REVERT" phase)
     */
    async rejectWithdrawal(requestId, reason, adminId, req) {
        return this.executeTransaction(async (session) => {
            const request = await WithdrawalRequest.findById(requestId).session(session);
            if (!request || request.status !== 'PENDING') {
                throw new Error('Invalid or non-pending withdrawal request');
            }

            // 1. Release held funds back to available balance
            await WalletService.releaseHeldFunds(request.customerId, request.amount, false);

            // 2. Update Request Status
            request.status = 'REJECTED';
            request.rejectionReason = reason;
            request.processedAt = new Date();
            await request.save({ session });

            // 3. Audit the rejection
            await AuditLogService.log({
                userId: adminId,
                action: 'WITHDRAWAL_REJECTED',
                target: 'WITHDRAWAL_REQUEST',
                targetId: request._id,
                newData: { reason, amount: request.amount },
                req
            });

            this.logSuccess('Withdrawal Rejected & Funds Reverted', { requestId });
            return request;
        });
    }
}

module.exports = new WithdrawalService();
