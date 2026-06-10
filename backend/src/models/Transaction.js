const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  type: { 
    type: String, 
    enum: [
      'DEPOSIT', 'WITHDRAWAL', 'PROFIT', 'INVESTMENT', 
      'DEPOSIT_APPROVED', 'WITHDRAWAL_COMPLETED', 'HOLD', 'RELEASE',
      'INVESTMENT_ACTIVATED'
    ], 
    required: true 
  },
  referenceType: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'PROFIT', 'ADJUSTMENT'] },
  referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'referenceType' },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'], 
    default: 'PENDING' 
  },
  description: { type: String },
  
  // Balance Snapshots for Audit
  balanceBefore: { type: Number },
  balanceAfter: { type: Number },
  availableBefore: { type: Number },
  availableAfter: { type: Number },
  heldBefore: { type: Number },
  heldAfter: { type: Number },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Customer transaction history: sorted by newest first, filtering out HOLD type
TransactionSchema.index({ customerId: 1, createdAt: -1 });
// Admin reports: aggregate by type + date range
TransactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
