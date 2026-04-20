const mongoose = require('mongoose');

const DepositReceiptSchema = new mongoose.Schema({
  depositRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'DepositRequest', required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiptPdf: { type: String }, // URL or S3 path
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DepositReceipt', DepositReceiptSchema);
