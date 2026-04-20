const RegistrationService = require('../services/registration/RegistrationService');
const RegistrationVerification = require('../models/RegistrationVerification');
const RegistrationDraft = require('../models/RegistrationDraft');
const otpService = require('../services/auth/otpService');

/**
 * @desc    Save or Update a Registration Draft
 * @route   POST /api/registration/draft
 */
exports.saveRegistrationDraft = async (req, res, next) => {
    try {
        const { tempSessionId, formData } = req.body;
        if (!tempSessionId) return res.status(400).json({ success: false, message: 'TempSessionId is required' });

        const draft = await RegistrationService.saveDraft(tempSessionId, formData);

        res.json({
            success: true,
            data: { draftId: draft.draftId, updatedAt: draft.updatedAt },
            message: 'Draft saved successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Load existing registration draft
 * @route   GET /api/registration/draft/:tempSessionId
 */
exports.loadRegistrationDraft = async (req, res, next) => {
    try {
        const { tempSessionId } = req.params;
        const draft = await RegistrationDraft.findOne({ tempSessionId }).lean();

        if (!draft) {
            return res.status(404).json({ success: false, message: 'No draft found.' });
        }

        const verif = await RegistrationVerification.findOne({ tempSessionId });
        const formData = draft.formData || {};
        
        const result = {
            ...draft,
            ...formData,
            phone: formData.phone || formData.mobile || draft.mobileNumber,
            address: formData.address || draft.address?.line1,
            city: formData.city || draft.address?.city,
            district: formData.district || draft.address?.district,
            province: formData.province || draft.address?.province,
            bankName: formData.bankName || draft.bankDetails?.bankName,
            branchName: formData.branchName || draft.bankDetails?.branchName,
            accountHolder: formData.accountHolder || draft.bankDetails?.accountHolder,
            accountNumber: formData.accountNumber || draft.bankDetails?.accountNumber
        };

        res.json({
            success: true,
            data: result,
            verifications: {
                emailVerified: verif?.emailVerifiedTemp || false,
                mobileVerified: verif?.mobileVerifiedTemp || false
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Atomic Finalization of Registration (Submission for Review)
 * @route   POST /api/registration/finalize
 */
exports.finalizeRegistration = async (req, res, next) => {
    try {
        const { tempSessionId } = req.body;
        const result = await RegistrationService.finalizeRegistration(tempSessionId, { req });

        res.status(201).json({
            success: true,
            message: 'Application submitted for review.',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Send OTP for Registration Verification
 * @route   POST /api/registration/send-otp
 */
exports.sendDraftOtp = async (req, res, next) => {
    try {
        const { tempSessionId, channel, targetValue } = req.body;
        
        const result = await otpService.generateAndSendOtp({
            tempSessionId,
            email: channel === 'EMAIL' ? targetValue : undefined,
            phone: channel === 'MOBILE' ? targetValue : undefined,
            purpose: 'REGISTRATION_VERIFICATION',
            channels: [channel === 'MOBILE' ? 'SMS' : 'EMAIL'],
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json(result);
    } catch (error) {
        res.status(429).json({ success: false, message: error.message || 'OTP request failed' });
    }
};

/**
 * @desc    Verify OTP for Registration
 * @route   POST /api/registration/verify-otp
 */
exports.verifyDraftOtp = async (req, res, next) => {
    try {
        const { tempSessionId, channel, otp, targetValue } = req.body;
        const identifier = targetValue || tempSessionId;

        const result = await otpService.verifyOtp({
            identifier,
            purpose: 'REGISTRATION_VERIFICATION',
            otpInput: otp,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        let verif = await RegistrationVerification.findOne({ tempSessionId });
        if (!verif) {
            verif = new RegistrationVerification({ 
                tempSessionId,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h validity for the verification session
            });
        }

        if (channel === 'EMAIL') { 
            verif.emailVerifiedTemp = true; 
        } else { 
            verif.mobileVerifiedTemp = true; 
        }
        
        verif.verifiedAt = Date.now();
        await verif.save();

        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Verification failed' });
    }
};
