const mongoose = require('mongoose');

const InvestmentPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  shortDescription: { type: String, trim: true },
  duration: { type: Number, required: true }, 
  durationUnit: { type: String, enum: ['Months', 'Years'], default: 'Months' },
  interestRate: { type: Number, required: true }, // annual percentage or monthly based on payoutType
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number },
  payoutType: { type: String, enum: ['Monthly Return', 'Maturity Only', 'Custom'], default: 'Monthly Return' },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  customerVisible: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  badgeText: { type: String, trim: true },
  termsSummary: { type: String, trim: true },
  earlyWithdrawalAllowed: { type: Boolean, default: false },
  penaltyNote: { type: String, trim: true },
  internalNote: { type: String, trim: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'DRAFT'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('InvestmentPlan', InvestmentPlanSchema);
