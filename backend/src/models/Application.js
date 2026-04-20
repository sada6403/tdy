const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  referenceId: { type: String, required: true, unique: true, index: true },
  preferredBranch: { type: String, required: true },
  applicationDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'RETURNED', 'REJECTED', 'APPROVED', 'RESUBMISSION_REQUIRED'],
    default: 'SUBMITTED',
    index: true 
  },
  adminRemarks: { type: String },
  resubmissionToken: { type: String },
  resubmissionCount: { type: Number, default: 0 },
  currentStep: { type: Number, default: 1 },
  bankDetails: {
    bankName: { type: String },
    branchName: { type: String },
    accountHolder: { type: String },
    accountNumber: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
