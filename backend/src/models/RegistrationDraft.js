const mongoose = require('mongoose');

const RegistrationDraftSchema = new mongoose.Schema({
  tempSessionId: { type: String, required: true, unique: true, index: true },
  draftId: { type: String, unique: true, sparse: true }, // Added for easy reference
  formData: { type: mongoose.Schema.Types.Mixed, default: {} },
  finalSubmissionStatus: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' }, // Added for workflow safety
  emailVerificationTemp: {
    otp: { type: String },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date }
  },
  mobileVerificationTemp: {
    otp: { type: String },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: 0 } } // TTL Index for auto-cleanup
}, { timestamps: true });

module.exports = mongoose.model('RegistrationDraft', RegistrationDraftSchema);
