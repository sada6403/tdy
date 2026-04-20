const BaseService = require('./BaseService');
const CustomerInvestment = require('../models/CustomerInvestment');
const ProfitPayoutLog = require('../models/ProfitPayoutLog');
const WalletService = require('./wallet/WalletService');
const AuditLogService = require('./AuditLogService');

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
            // 1. Double check idempotency to prevent double payouts
            const existingLog = await ProfitPayoutLog.findOne({ idempotencyKey }).session(session);
            if (existingLog && existingLog.status === 'COMPLETED') {
                return { skipped: true, reason: 'ALREADY_PAID' };
            }

            // 2. Refresh investment data with session lock
            const inv = await CustomerInvestment.findById(investment._id).session(session);
            
            // 3. Calculate Profit
            const profitAmount = inv.investedAmount * (inv.monthlyROI / 100);

            // 4. Create Payout Log (PENDING)
            const [payoutLog] = await ProfitPayoutLog.create([{
                investmentId: inv._id,
                customerId: inv.customerId,
                walletId: (await WalletService.getWallet(inv.customerId))._id,
                cycleMonth,
                amountCalculated: profitAmount,
                profitDestination: inv.profitDestination,
                idempotencyKey,
                status: 'PENDING'
            }], { session });

            // 5. Execute Payout if destination is WALLET
            if (inv.profitDestination === 'WALLET') {
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
                // If destination is BANK, we mark as PENDING for manual/batch bank transfer processing
                payoutLog.status = 'PENDING';
            }

            // 6. Update Investment state
            inv.totalProfitEarned += profitAmount;
            
            // Set next profit date (add 1 month)
            const nextDate = new Date(inv.nextProfitDate);
            nextDate.setMonth(nextDate.getMonth() + 1);
            inv.nextProfitDate = nextDate;

            await inv.save({ session });
            await payoutLog.save({ session });

            await AuditLogService.log({
                userId: null, // System Action
                action: 'PROFIT_PAYOUT_EXECUTED',
                target: 'INVESTMENT',
                targetId: inv._id,
                newData: { amount: profitAmount, nextDate },
                severity: 'INFO'
            });

            return { success: true };
        });
    }
}

module.exports = new ProfitService();
