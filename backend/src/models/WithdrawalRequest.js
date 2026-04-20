const mongoose = require('mongoose');

const WithdrawalRequestSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  bankName: { type: String },
  accountName: { type: String },
  accountNumber: { type: String },
  branchName: { type: String },
  reason: { type: String },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING_PAYOUT', 'COMPLETED', 'FAILED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  adminRemarks: { type: String },
  referenceNumber: { type: String, unique: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  
  // Auditing & Workflow Fields
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date },
  
  // Payout Proofs & Meta
  payoutReferenceNumber: { type: String },
  payoutProofUrl: { type: String },
  rejectionReason: { type: String },
  failureReason: { type: String },
  cancelledReason: { type: String },
  completedAt: { type: Date },
  proofFiles: [{ type: String }],
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: String,
    remark: String
  }]
}, { timestamps: true });

// Pre-save hook to generate a reference number if not provided
WithdrawalRequestSchema.pre('save', function() {
  if (!this.referenceNumber) {
    this.referenceNumber = `WDR-${Math.floor(100000 + Math.random() * 900000)}`;
  }
});

module.exports = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);
