const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  amount: { type: Number, required: true },
  purpose: { type: String },
  bankDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    accountHolder: { type: String }
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  payoutReference: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
