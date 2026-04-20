const mongoose = require('mongoose');

let isTransactionSupported = null;

/**
 * Checks if the current MongoDB connection supports transactions
 */
async function checkTransactionSupport() {
    if (isTransactionSupported !== null) return isTransactionSupported;
    
    try {
        const admin = mongoose.connection.db.admin();
        const status = await admin.command({ isMaster: 1 });
        isTransactionSupported = !!status.setName;
        if (!isTransactionSupported) {
            console.warn('[DB_WARNING] Standalone MongoDB detected. Transactions and Sessions will be disabled to prevent errors.');
        }
        return isTransactionSupported;
    } catch (error) {
        console.error('[DB_ERROR] Failed to check transaction support:', error.message);
        return false;
    }
}

/**
 * Safely starts a transaction. 
 * If the MongoDB instance is a standalone server (not a replica set), 
 * it will return false and skip starting the transaction.
 */
async function safeStartTransaction(session) {
    const supported = await checkTransactionSupport();
    if (!supported) return false;

    try {
        await session.startTransaction();
        return true;
    } catch (error) {
        if (error.message.includes('replica set member')) {
            isTransactionSupported = false;
            return false;
        }
        throw error;
    }
}

/**
 * Safely commits a transaction if one was started.
 */
async function safeCommitTransaction(session) {
    if (session && typeof session.inTransaction === 'function' && session.inTransaction()) {
        await session.commitTransaction();
    }
}

/**
 * Safely aborts a transaction if one was started.
 */
async function safeAbortTransaction(session) {
    if (session && typeof session.inTransaction === 'function' && session.inTransaction()) {
        await session.abortTransaction();
    }
}

/**
 * Returns a session only if transactions are supported, otherwise returns null.
 */
async function getSafeSession() {
    const supported = await checkTransactionSupport();
    if (!supported) return null;
    try {
        return await mongoose.startSession();
    } catch (error) {
        return null;
    }
}

module.exports = {
    getSafeSession,
    safeStartTransaction,
    safeCommitTransaction,
    safeAbortTransaction,
    checkTransactionSupport
};

