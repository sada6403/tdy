const mongoose = require('mongoose');

class BaseService {
    constructor(name) {
        this.name = name;
    }

    /**
     * @desc Wrap a set of operations in a MongoDB transaction
     * @param {Function} workFn - Function containing the logic to execute within the transaction
     */
    async executeTransaction(workFn) {
        const { getSafeSession, safeStartTransaction, safeCommitTransaction, safeAbortTransaction } = require('../utils/transactionHelper');
        const session = await getSafeSession();
        if (session) await safeStartTransaction(session);
        try {
            const result = await workFn(session);
            await safeCommitTransaction(session);
            return result;
        } catch (error) {
            await safeAbortTransaction(session);
            console.error(`[TRANSACTION_ERROR] ${this.name}: ${error.message}`);
            throw error;
        } finally {
            if (session) session.endSession();
        }
    }

    /**
     * @desc Standard success logger
     */
    logSuccess(action, context = {}) {
        console.log(`[SERVICE_SUCCESS] ${this.name}: ${action}`, JSON.stringify(context));
    }

    /**
     * @desc Standard error handler
     */
    handleError(error, action) {
        console.error(`[SERVICE_ERROR] ${this.name}: ${action} - ${error.message}`);
        throw error;
    }
}

module.exports = BaseService;
