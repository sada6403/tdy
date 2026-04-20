const mongoose = require('mongoose');

const PlanActivationRequestSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentPlan', required: true },
  amount: { type: Number, required: true },
  investmentDate: { type: Date, default: Date.now },
  profitDestination: { type: String, enum: ['WALLET', 'BANK'], default: 'WALLET' },
  signature: { type: String }, // Base64 signature as proof
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PlanActivationRequest', PlanActivationRequestSchema);
