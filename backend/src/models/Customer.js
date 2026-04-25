const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Removed unique: true here
  fullName: { type: String, required: true, trim: true },
  nic: { type: String, required: true, unique: true, index: true, trim: true, uppercase: true },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  address: {
    line1: { type: String },
    city: { type: String },
    district: { type: String },
    province: { type: String }
  },
  bankDetails: {
    bankName: { type: String },
    branchName: { type: String },
    accountHolder: { type: String },
    accountNumber: { type: String }
  },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  isActive: { type: Boolean, default: false },
  dob: { type: Date },
  gender: { type: String, trim: true },
  kycStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
  signature: { type: String },
  photoUrl: { type: String, default: '' },
  registrationDocuments: [{
    type:    { type: String },
    fileUrl: { type: String },
    s3Key:   { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Use a partial index to allow multiple NULLs but enforce uniqueness for actual IDs
CustomerSchema.index({ userId: 1 }, { 
  unique: true, 
  partialFilterExpression: { userId: { $exists: true, $ne: null } } 
});

module.exports = mongoose.model('Customer', CustomerSchema);
