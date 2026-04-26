const mongoose = require('mongoose');

const OtpVerificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true },
    tempSessionId: { type: String, index: true },
    
    email: { type: String, trim: true, lowercase: true },
    mobileNumber: { type: String, trim: true },
    
    purpose: {
        type: String,
        required: true,
        enum: [
            'REGISTRATION_VERIFICATION',
            'PASSWORD_RESET',
            'LOGIN_VERIFICATION',
            'PLAN_ACTIVATION',
            'WITHDRAWAL_CONFIRMATION',
            'SENSITIVE_ACTION',
            'CHANGE_PASSWORD'
        ],
        index: true 
    },
    
    otpHash: { type: String, required: true },
    
    deliveryChannels: [{ 
        type: String, 
        enum: ['EMAIL', 'SMS'] 
    }],
    
    emailSendStatus: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
    smsSendStatus: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
    
    expiresAt: { type: Date, required: true, index: true },
    
    attemptCount: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    
    isUsed: { type: Boolean, default: false },
    usedAt: { type: Date },
    
    status: { 
        type: String, 
        enum: ['PENDING', 'SENT', 'VERIFIED', 'EXPIRED', 'LOCKED', 'USED', 'FAILED'],
        default: 'PENDING'
    },
    
    lastAttemptAt: { type: Date },
    lockedAt: { type: Date },
    blockReason: { type: String },
    
    requestIp: { type: String },
    requestUserAgent: { type: String }
}, { timestamps: true });

// TTL Index for automatic cleanup (1 day retention for audits, then delete)
// Note: Verification logic will handle the 2-minute strict expiry.
OtpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); 

module.exports = mongoose.model('OtpVerification', OtpVerificationSchema);
