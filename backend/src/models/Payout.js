const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema({
  withdrawalRequestId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WithdrawalRequest' 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer',
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  bankName: String,
  accountName: String,
  accountNumber: String,
  branchName: String,
  referenceNumber: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['WITHDRAWAL', 'MONTHLY_RETURN'],
    default: 'WITHDRAWAL'
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'FAILED'], 
    default: 'PENDING' 
  },
  payoutReferenceNumber: String,
  approvedAt: { type: Date, default: Date.now },
  completedAt: Date,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Payout', PayoutSchema);
