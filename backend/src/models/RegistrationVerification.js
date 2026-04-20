const mongoose = require('mongoose');

const RegistrationVerificationSchema = new mongoose.Schema({
  tempSessionId: { type: String, required: true, unique: true },
  email: { type: String },
  mobileNumber: { type: String },
  
  emailOtpHash: { type: String },
  mobileOtpHash: { type: String },
  
  emailVerifiedTemp: { type: Boolean, default: false },
  mobileVerifiedTemp: { type: Boolean, default: false },
  
  verifiedAt: { type: Date },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// TTL Index for automatic deletion after 1 day (OTP/Temp verification shouldn't last long!)
RegistrationVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RegistrationVerification', RegistrationVerificationSchema);
