const mongoose = require('mongoose');

const ApplicationOtpSchema = new mongoose.Schema({
  channel: { type: String, enum: ['PHONE', 'EMAIL', 'SMS'], required: true },
  targetValue: { type: String, required: true },
  otpCode: { type: String, required: true },
  purpose: { type: String, default: 'REGISTRATION' },
  expiresAt: { type: Date, required: true },
  verifiedAt: { type: Date },
  attemptCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index for automatic deletion after expiry (TTL index)
// Note: expiresAt is the absolute time it expires.
// We could also use an index on createdAt with a fixed expireAfterSeconds, 
// but since we have a dynamic expiresAt, let's just index it for query performance and maybe manual cleanup or a different TTL approach.
ApplicationOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
ApplicationOtpSchema.index({ channel: 1, targetValue: 1, purpose: 1 });

module.exports = mongoose.model('ApplicationOtp', ApplicationOtpSchema);
