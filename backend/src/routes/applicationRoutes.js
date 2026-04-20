const express = require('express');
const router = express.Router();
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const {
    sendPhoneOtp,
    verifyPhoneOtp,
    sendEmailOtp,
    verifyEmailOtp,
    submitApplication,
    getApplications,
    updateApplicationStatus,
    getApplicationForResubmit,
    checkDuplicate
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const s3Service = require('../utils/s3Service');
const path = require('path');
const fs = require('fs');

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: `Validation failed: ${errors.array()[0].msg}`,
            errors: errors.array(),
        });
    }
    next();
};

const isProduction = process.env.NODE_ENV === 'production';

const getOtpTarget = (req) => {
    const phone = (req.body?.phone || '').trim();
    const email = (req.body?.email || '').trim().toLowerCase();
    return phone || email || 'unknown-target';
};

const createOtpLimiter = ({ windowMs, max, message }) => rateLimit({
    windowMs,
    max: isProduction ? max : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${getOtpTarget(req)}:${req.path}`,
    message: {
        success: false,
        message,
    },
});

const otpSendRateLimiter = createOtpLimiter({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: 'Too many OTP send requests. Please wait a few minutes and try again.',
});

const otpVerifyRateLimiter = createOtpLimiter({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: 'Too many OTP verification attempts. Please request a new OTP and try again.',
});

const submitRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many submission attempts. Please try again later.',
    },
});

// Configure S3 Multer via Service
const uploadFields = s3Service.upload.fields([
    { name: 'nicFront', maxCount: 1 },
    { name: 'nicBack', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'bankProof', maxCount: 1 }
]);

// Public: Check for duplicates
router.post('/check-duplicate', checkDuplicate);

// Public: Submit registration
router.post(
    '/otp/send-phone',
    otpSendRateLimiter,
    body('phone').trim().matches(/^\d{9}$/).withMessage('Phone must be a valid 9-digit mobile number'),
    handleValidation,
    sendPhoneOtp
);

router.post(
    '/otp/verify-phone',
    otpVerifyRateLimiter,
    body('phone').trim().matches(/^\d{9}$/).withMessage('Phone must be a valid 9-digit mobile number'),
    body('otp').trim().matches(/^\d{4,6}$/).withMessage('OTP must be 4 to 6 digits'),
    handleValidation,
    verifyPhoneOtp
);

router.post(
    '/otp/send-email',
    otpSendRateLimiter,
    body('email').trim().isEmail().withMessage('A valid email address is required'),
    handleValidation,
    sendEmailOtp
);

router.post(
    '/otp/verify-email',
    otpVerifyRateLimiter,
    body('email').trim().isEmail().withMessage('A valid email address is required'),
    body('otp').trim().matches(/^\d{4,6}$/).withMessage('OTP must be 4 to 6 digits'),
    handleValidation,
    verifyEmailOtp
);

router.post(
    '/submit',
    submitRateLimiter,
    uploadFields,
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').trim().isEmail().withMessage('A valid email address is required'),
    body('phone').trim().matches(/^(\+94)?\d{9}$/).withMessage('Phone must be a valid mobile number (+94xxxxxxxxx)'),
    body('nic').trim().matches(/^([0-9]{9}[xXvV]|[0-9]{12})$/).withMessage('Invalid NIC format'),
    body('dob').optional({ values: 'falsy' }).isISO8601().withMessage('Date of birth must be a valid date'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('bankName').trim().notEmpty().withMessage('Bank name is required'),
    body('branchName').trim().notEmpty().withMessage('Bank branch is required'),
    body('accountHolder').trim().notEmpty().withMessage('Account holder name is required'),
    body('accountNumber').trim().notEmpty().withMessage('Account number is required'),
    body('preferredBranch').trim().notEmpty().withMessage('Preferred branch is required'),
    body('registrationDate').optional({ values: 'falsy' }).isISO8601().withMessage('Registration date must be a valid date'),
    handleValidation,
    submitApplication
);

// Customer: Get application for resubmit (token based)
router.get('/resubmit/:id', getApplicationForResubmit);
router.put('/update', uploadFields, submitApplication);

// Admin: Manage applications
router.get('/', protect, authorize('ADMIN'), getApplications);
router.put('/:id/status', protect, authorize('ADMIN'), updateApplicationStatus);

module.exports = router;
