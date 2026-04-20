const mongoose = require('mongoose');

const DepositRequestSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  amount: { type: Number, required: true },
  referenceNumber: { type: String, required: true, unique: true, index: true },
  nic: { type: String, required: true },
  receiptFile: { type: String }, // S3 key or URL
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DepositRequest', DepositRequestSchema);
