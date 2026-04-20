const mongoose = require('mongoose');

const ApplicationVerificationSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', unique: true, index: true },
  tempSessionId: { type: String },
  emailOtpHash: { type: String },
  mobileOtpHash: { type: String },
  phoneOtpVerified: { type: Boolean, default: false },
  emailOtpVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  expiresAt: { type: Date, index: { expires: 0 } }
}, { timestamps: true });

// Partial index for tempSessionId to allow multiple nulls
ApplicationVerificationSchema.index({ tempSessionId: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { tempSessionId: { $exists: true, $ne: null } }
});

module.exports = mongoose.model('ApplicationVerification', ApplicationVerificationSchema);
