const BaseService = require('../BaseService');
const Wallet = require('../../models/Wallet');
const Transaction = require('../../models/Transaction');

class WalletService extends BaseService {
    constructor() {
        super('WalletService');
    }

    /**
     * @desc Get wallet by customer ID
     */
    async getWallet(customerId) {
        try {
            let wallet = await Wallet.findOne({ customerId });
            if (!wallet) {
                wallet = await Wallet.create({ customerId });
            }
            return wallet;
        } catch (error) {
            this.handleError(error, 'getWallet');
        }
    }

    /**
     * @desc Atomic Adjustment (The Ledger Logic)
     * All balance changes MUST come through here
     * @param {Object} params - { customerId, amount, type, description, referenceId }
     */
    async adjustBalance({ customerId, amount, type, description, referenceId }) {
        return this.executeTransaction(async (session) => {
            // 1. Fetch Wallet with session lock
            const wallet = await Wallet.findOne({ customerId }).session(session);
            if (!wallet) throw new Error('Wallet not found');

            // 2. Create Ledger Entry (Transaction record)
            const transaction = await Transaction.create([{
                customerId,
                amount,
                type,
                description,
                referenceId,
                status: 'COMPLETED',
                balanceAfter: wallet.totalBalance + amount
            }], { session });

            const transactionId = transaction[0]._id;

            // 3. Update Wallet Balance and link to Ledger
            wallet.totalBalance += amount;
            wallet.availableBalance += amount; // Assuming simple adjustment for now
            wallet.lastTransactionId = transactionId;

            // Update stats based on type
            if (type === 'EARNING') wallet.totalEarned += amount;
            if (type === 'WITHDRAWAL') wallet.totalWithdrawn += Math.abs(amount);

            await wallet.save({ session });

            this.logSuccess('adjustBalance', { customerId, amount, transactionId });
            return { wallet, transaction: transaction[0] };
        });
    }

    /**
     * @desc Hold funds (e.g. for a pending withdrawal or investment)
     */
    async holdFunds(customerId, amount) {
        return this.executeTransaction(async (session) => {
            const wallet = await Wallet.findOne({ customerId }).session(session);
            if (wallet.availableBalance < amount) throw new Error('Insufficient available balance');

            wallet.availableBalance -= amount;
            wallet.heldBalance += amount;

            await wallet.save({ session });
            this.logSuccess('holdFunds', { customerId, amount });
            return wallet;
        });
    }

    /**
     * @desc Release or Execute held funds
     */
    async releaseHeldFunds(customerId, amount, execute = false) {
        return this.executeTransaction(async (session) => {
            const wallet = await Wallet.findOne({ customerId }).session(session);
            if (wallet.heldBalance < amount) throw new Error('Insufficient held balance');

            wallet.heldBalance -= amount;
            if (!execute) {
                wallet.availableBalance += amount;
            } else {
                wallet.totalBalance -= amount;
            }

            await wallet.save({ session });
            this.logSuccess('releaseHeldFunds', { customerId, amount, execute });
            return wallet;
        });
    }
}

module.exports = new WalletService();
