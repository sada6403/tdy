const mongoose = require('mongoose');

const ProfitPayoutLogSchema = new mongoose.Schema({
    investmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerInvestment', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
    cycleMonth: { type: String, required: true }, // Format: YYYY-MM
    amountCalculated: { type: Number, required: true },
    profitDestination: { type: String, enum: ['BANK', 'WALLET'], required: true },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    errorMessage: { type: String },
    idempotencyKey: { type: String, required: true, unique: true } // format: investmentId_YYYY-MM
}, { timestamps: true });

// Ensure one payout per cycle per investment
ProfitPayoutLogSchema.index({ investmentId: 1, cycleMonth: 1 }, { unique: true });

module.exports = mongoose.model('ProfitPayoutLog', ProfitPayoutLogSchema);
