const mongoose = require('mongoose');
const CustomerInvestment = require('../models/CustomerInvestment');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const ProfitPayoutLog = require('../models/ProfitPayoutLog');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const Payout = require('../models/Payout');
const Customer = require('../models/Customer');
const { getSafeSession, safeStartTransaction, safeCommitTransaction, safeAbortTransaction } = require('../../utils/transactionHelper');

// Safe month addition — prevents overflow (e.g. Jan 31 + 1 month = Feb 28, not Mar 3)
function addMonths(date, months) {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months, 1);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return d;
}

/**
 * Monthly Profit Engine
 * Securely distributes monthly profit bounds with idempotency and retry-safety.
 */
class ProfitEngineService {
    /**
     * Helper to move a date to the next weekday if it falls on a weekend
     */
    getNextWeekday(date) {
        const d = new Date(date);
        const day = d.getDay(); // 0 = Sunday, 6 = Saturday
        if (day === 6) { // Saturday
            d.setDate(d.getDate() + 2);
        } else if (day === 0) { // Sunday
            d.setDate(d.getDate() + 1);
        }
        return d;
    }

    async runMonthlyPayouts() {
        console.log('[PROFIT ENGINE] Starting monthly payout cycle...');
        const activeInvestments = await CustomerInvestment.find({ status: 'ACTIVE' });
        
        let successCount = 0;
        let failCount = 0;
        const now = new Date();

        for (const investment of activeInvestments) {
            try {
                // Calculate elapsed months since start date
                const start = new Date(investment.startDate);
                let baseDate = addMonths(start, 1); // first payout is 1 month after start

                while (baseDate <= now && baseDate <= new Date(investment.endDate)) {
                    // Weekend Adjustment: Move execution date to next weekday if needed
                    const executionDate = this.getNextWeekday(baseDate);

                    // If the adjusted execution date is in the future, we don't process it yet
                    if (executionDate > now) {
                        break;
                    }

                    const cycleMonth = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}`;
                    const idempotencyKey = `${investment._id.toString()}_${cycleMonth}`;

                    // Check if already processed
                    const existingLog = await ProfitPayoutLog.findOne({ idempotencyKey });

                    if (!existingLog || existingLog.status === 'FAILED') {
                        await this.processPayout(investment, cycleMonth, idempotencyKey);
                        successCount++;
                    }

                    // Move baseDate to the next month's anniversary (NOT based on executionDate)
                    baseDate = addMonths(baseDate, 1);
                }
            } catch (err) {
                console.error(`[PROFIT ENGINE] Failed to process investment ${investment._id}:`, err.message);
                failCount++;
            }
        }

        console.log(`[PROFIT ENGINE] Payout cycle completed. Success: ${successCount}, Failed: ${failCount}`);
    }

    async processPayout(investment, cycleMonth, idempotencyKey) {
        const session = await getSafeSession();
        if (session) await safeStartTransaction(session);
        try {
            const amountCalculated = (investment.investedAmount * investment.monthlyROI) / 100;
            
            const wallet = await Wallet.findOne({ customerId: investment.customerId }).session(session);
            if (!wallet) throw new Error('Wallet not found');

            // 1. Create OR Update Payout Log (Idempotent)
            let payoutLog = await ProfitPayoutLog.findOne({ idempotencyKey }).session(session);
            if (!payoutLog) {
                payoutLog = new ProfitPayoutLog({
                    investmentId: investment._id,
                    customerId: investment.customerId,
                    walletId: wallet._id,
                    cycleMonth,
                    amountCalculated,
                    profitDestination: investment.profitDestination,
                    idempotencyKey,
                    status: 'PENDING'
                });
            } else if (payoutLog.status === 'COMPLETED') {
                await safeAbortTransaction(session);
                return; // Already processed
            }

            // 2. Perform distribution
            let transactionDescription = '';
            const totalBefore = wallet.totalBalance;
            const availableBefore = wallet.availableBalance;
            const heldBefore = wallet.heldBalance;

            let updateObj = { $inc: { totalEarned: amountCalculated } };
            if (investment.profitDestination === 'WALLET') {
                updateObj.$inc.availableBalance = amountCalculated;
                updateObj.$inc.totalBalance = amountCalculated;
                transactionDescription = `Monthly Return (${cycleMonth}) - Credited to Wallet`;
            } else {
                transactionDescription = `Monthly Return (${cycleMonth}) - Direct Bank Transfer Processed`;
            }

            const updatedWallet = await Wallet.findOneAndUpdate(
                { customerId: investment.customerId },
                updateObj,
                { session, new: true }
            );

            if (!updatedWallet) throw new Error('Failed to update wallet atomically');

            // 3. Log transaction
            const transaction = await Transaction.create([{
                customerId: investment.customerId,
                walletId: wallet._id,
                investmentId: investment._id,
                type: 'EARNING',
                referenceType: 'INVESTMENT',
                referenceId: investment._id,
                amount: amountCalculated,
                status: 'COMPLETED',
                description: transactionDescription,
                balanceBefore: totalBefore,
                balanceAfter: updatedWallet.totalBalance,
                availableBefore: availableBefore,
                availableAfter: updatedWallet.availableBalance,
                heldBefore: heldBefore,
                heldAfter: updatedWallet.heldBalance
            }], { session });

            payoutLog.status = 'COMPLETED';
            payoutLog.transactionId = transaction[0]._id;
            await payoutLog.save({ session });

            // 4. If destination is BANK, automatically create an APPROVED Withdrawal Request
            if (investment.profitDestination === 'BANK') {
                const customer = await Customer.findById(investment.customerId).session(session);
                if (customer && customer.bankDetails?.accountNumber) {
                    const withdrawal = await WithdrawalRequest.create([{
                        customerId: investment.customerId,
                        walletId: wallet._id,
                        amount: amountCalculated,
                        bankName: customer.bankDetails.bankName,
                        accountName: customer.bankDetails.accountHolder,
                        accountNumber: customer.bankDetails.accountNumber,
                        branchName: customer.bankDetails.branchName,
                        reason: `Auto-Withdrawal: Monthly Return (${cycleMonth})`,
                        status: 'APPROVED',
                        referenceNumber: `AUTO-WDR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                        transactionId: transaction[0]._id,
                        notes: `Automated system payout for investment ${investment.referenceNumber}`,
                        approvedAt: new Date(),
                        statusHistory: [{
                            status: 'APPROVED',
                            changedAt: new Date(),
                            changedBy: 'SYSTEM_AUTO_WITHDRAWAL',
                            remark: 'Automated approval via direct-bank profit routing configuration.'
                        }]
                    }], { session });

                    // CREATE PAYOUT RECORD FOR UNIFIED LIST
                    await Payout.create([{
                        withdrawalRequestId: withdrawal[0]._id,
                        customerId: investment.customerId,
                        amount: amountCalculated,
                        bankName: customer.bankDetails.bankName,
                        accountName: customer.bankDetails.accountHolder,
                        accountNumber: customer.bankDetails.accountNumber,
                        branchName: customer.bankDetails.branchName,
                        referenceNumber: withdrawal[0].referenceNumber,
                        type: 'MONTHLY_RETURN',
                        status: 'PENDING',
                        approvedAt: new Date()
                    }], { session });
                }
            }

            await safeCommitTransaction(session);
            console.log(`[PROFIT ENGINE] Processed payout for ${idempotencyKey}`);
        } catch (error) {
            await safeAbortTransaction(session);
            
            // Mark as failed outside transaction to preserve the failure state
            await ProfitPayoutLog.updateOne(
                { idempotencyKey },
                { 
                    $set: { 
                        status: 'FAILED', 
                        errorMessage: error.message,
                        investmentId: investment._id,
                        customerId: investment.customerId,
                        walletId: investment.customerId, // fallback if wallet missing
                        cycleMonth,
                        amountCalculated: (investment.investedAmount * investment.monthlyROI) / 100,
                        profitDestination: investment.profitDestination
                    } 
                },
                { upsert: true }
            ).catch(err => console.error("Could not log failure:", err));
            
            throw error;
        } finally {
            if (session) session.endSession();
        }
    }
}

module.exports = new ProfitEngineService();
