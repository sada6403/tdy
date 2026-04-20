const mongoose = require('mongoose');

const PendingApprovalSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  referenceId: { type: String, required: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  nic: { type: String, required: true },
  gender: { type: String },
  dob: { type: Date },
  address: { type: String },
  city: { type: String },
  district: { type: String },
  province: { type: String },
  bankName: { type: String },
  branchName: { type: String },
  accountHolder: { type: String },
  accountNumber: { type: String },
  preferredBranch: { type: String },
  documents: [{
    type: { type: String },
    fileUrl: { type: String },
    s3Key: { type: String }
  }],
  signature: { type: String },
  status: { type: String, default: 'PENDING' },
  adminRemarks: { type: String },
  submittedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  collection: 'pending_approvals'
});

module.exports = mongoose.model('PendingApproval', PendingApprovalSchema);
