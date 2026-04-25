const BaseService = require('./BaseService');
const CustomerInvestment = require('../models/CustomerInvestment');
const ProfitPayoutLog = require('../models/ProfitPayoutLog');
const Payout = require('../models/Payout');
const Wallet = require('../models/Wallet');
const Notification = require('../models/Notification');
const User = require('../models/User');
const WalletService = require('./wallet/WalletService');
const AuditLogService = require('./AuditLogService');
const Customer = require('../models/Customer');

// Safe month addition — prevents overflow (e.g. Jan 31 + 1 month = Feb 28, not Mar 3)
function addOneMonth(date) {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + 1, 1);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return d;
}

class ProfitService extends BaseService {
    constructor() {
        super('ProfitService');
    }

    /**
     * @desc Process all due profit payouts for the current date
     */
    async processDailyPayouts() {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today

        // 1. Find all active investments due for payout
        const dueInvestments = await CustomerInvestment.find({
            status: 'ACTIVE',
            nextProfitDate: { $lte: today }
        });

        this.logSuccess('Scanning for due payouts', { count: dueInvestments.length });

        const results = {
            processed: 0,
            failed: 0,
            skipped: 0
        };

        for (const investment of dueInvestments) {
            try {
                await this.processSinglePayout(investment);
                results.processed++;
            } catch (error) {
                console.error(`[PAYOUT_FAILED] Investment ${investment._id}: ${error.message}`);
                results.failed++;
            }
        }

        this.logSuccess('Daily payout processing finished', results);
        return results;
    }

    /**
     * @desc Handle payout for a single investment (Atomic)
     */
    async processSinglePayout(investment) {
        const cycleMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const idempotencyKey = `${investment._id}_${cycleMonth}`;

        return this.executeTransaction(async (session) => {
            // 1. Idempotency — prevent double payouts
            const existingLog = await ProfitPayoutLog.findOne({ idempotencyKey }).session(session);
            if (existingLog && existingLog.status === 'COMPLETED') {
                return { skipped: true, reason: 'ALREADY_PAID' };
            }

            // 2. Refresh investment with session lock
            const inv = await CustomerInvestment.findById(investment._id).session(session);

            // 3. Calculate profit
            const profitAmount = inv.investedAmount * (inv.monthlyROI / 100);

            // 4. Fetch wallet within session (single read, reused below)
            const wallet = await Wallet.findOne({ customerId: inv.customerId }).session(session);
            if (!wallet) throw new Error('Wallet not found for profit processing');

            // 5. Create Payout Log (PENDING)
            const [payoutLog] = await ProfitPayoutLog.create([{
                investmentId: inv._id,
                customerId: inv.customerId,
                walletId: wallet._id,
                cycleMonth,
                amountCalculated: profitAmount,
                profitDestination: inv.profitDestination,
                idempotencyKey,
                status: 'PENDING'
            }], { session });

            // 6. Distribute profit based on destination
            if (inv.profitDestination === 'WALLET') {
                // Credit profit directly to available balance
                const { transaction } = await WalletService.adjustBalance({
                    customerId: inv.customerId,
                    amount: profitAmount,
                    type: 'EARNING',
                    description: `Monthly Profit: ${inv.planName} (${cycleMonth})`,
                    referenceId: inv._id
                });
                payoutLog.transactionId = transaction._id;
                payoutLog.status = 'COMPLETED';
            } else {
                // BANK: hold profit in escrow until admin confirms bank transfer
                payoutLog.status = 'PENDING';

                const customer = await Customer.findById(inv.customerId).session(session);

                // Create payout record for admin's Payout Management list
                await Payout.create([{
                    customerId: inv.customerId,
                    amount: profitAmount,
                    bankName: customer?.bankDetails?.bankName || customer?.bankName || 'Unknown Bank',
                    accountName: customer?.bankDetails?.accountHolder || customer?.accountHolder || 'Unknown',
                    accountNumber: customer?.bankDetails?.accountNumber || customer?.accountNumber || 'Unknown',
                    branchName: customer?.bankDetails?.branchName || customer?.branchName || 'Unknown',
                    referenceNumber: `AUTO-${idempotencyKey}`,
                    type: 'MONTHLY_RETURN',
                    status: 'PENDING',
                    approvedAt: new Date()
                }], { session });

                // Move profit to heldBalance — visible as HELD ESCROW on customer wallet
                await Wallet.findOneAndUpdate(
                    { _id: wallet._id },
                    { $inc: { heldBalance: profitAmount, totalBalance: profitAmount, totalEarned: profitAmount } },
                    { session }
                );

                // Notify customer that return is queued for bank transfer
                const user = await User.findOne({ customerId: inv.customerId }).session(session);
                await Notification.create([{
                    userId: user?._id,
                    customerId: inv.customerId,
                    title: 'Monthly Return Processing',
                    message: `Your monthly return of LKR ${profitAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} for ${inv.planName || 'your investment'} (${cycleMonth}) is being processed and will be transferred to your bank shortly.`,
                    type: 'INFO'
                }], { session });
            }

            // 7. Update investment state
            inv.totalProfitEarned += profitAmount;
            inv.nextProfitDate = addOneMonth(inv.nextProfitDate);
            await inv.save({ session });
            await payoutLog.save({ session });

            await AuditLogService.log({
                userId: null,
                action: 'PROFIT_PAYOUT_EXECUTED',
                target: 'INVESTMENT',
                targetId: inv._id,
                newData: { amount: profitAmount, nextProfitDate: inv.nextProfitDate },
                severity: 'INFO'
            });

            return { success: true };
        });
    }
}

module.exports = new ProfitService();
