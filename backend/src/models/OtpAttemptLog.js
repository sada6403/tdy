const mongoose = require('mongoose');

const OtpAttemptLogSchema = new mongoose.Schema({
    otpId: { type: mongoose.Schema.Types.ObjectId, ref: 'OtpVerification', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    tempSessionId: { type: String, index: true },
    
    actionType: { 
        type: String, 
        required: true,
        enum: [
            'GENERATED',
            'EMAIL_SENT',
            'SMS_SENT',
            'RESEND_REQUESTED',
            'VERIFICATION_ATTEMPT',
            'VERIFICATION_SUCCESS',
            'VERIFICATION_FAILURE',
            'EXPIRY_FAILURE',
            'MAX_ATTEMPTS_EXCEEDED',
            'ABUSE_BLOCK_TRIGGERED'
        ]
    },
    
    channel: { type: String, enum: ['EMAIL', 'SMS', 'BOTH'] },
    status: { type: String, required: true },
    attemptNumber: { type: Number },
    
    ipAddress: { type: String },
    userAgent: { type: String },
    
    note: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Logs kept for 30 days for compliance
OtpAttemptLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('OtpAttemptLog', OtpAttemptLogSchema);
