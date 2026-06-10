const mongoose = require('mongoose');

const CustomerInvestmentSchema = new mongoose.Schema({
  customerId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  planId:            { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentPlan', required: true },
  planName:          { type: String },
  durationMonths:    { type: Number },
  monthlyROI:        { type: Number },
  investedAmount:    { type: Number, required: true },
  profitDestination: { type: String, enum: ['WALLET', 'BANK'], default: 'WALLET' },
  rulesAccepted:     { type: Boolean, default: false },
  signatureConfirmed:{ type: Boolean, default: false },
  signatureData:     { type: String },
  note:              { type: String },
  referenceNumber:   { type: String },
  approvedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDate:         { type: Date },
  endDate:           { type: Date },
  monthlyProfit:     { type: Number },
  nextProfitDate:    { type: Date },
  totalProfitEarned: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['PENDING_ACTIVATION_APPROVAL', 'ACTIVE', 'MATURED', 'CANCELLED', 'REJECTED'],
    default: 'PENDING_ACTIVATION_APPROVAL'
  },
  rejectionReason:   { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index: daily payout job queries exactly this — without it every
// cron run does a full collection scan on all investments.
CustomerInvestmentSchema.index({ status: 1, nextProfitDate: 1 });
// Customer dashboard: list investments per customer sorted newest first
CustomerInvestmentSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model('CustomerInvestment', CustomerInvestmentSchema);
