const otpService = require('../../services/auth/otpService');

/**
 * Controller for OTP-related operations.
 */
exports.requestOtp = async (req, res, next) => {
    try {
        const { 
            email, 
            phone, 
            purpose, 
            tempSessionId,
            channels // optional array ['EMAIL', 'SMS']
        } = req.body;

        if (!purpose) {
            return res.status(400).json({ success: false, message: 'Purpose is required' });
        }

        if (!email && !phone && !tempSessionId) {
            return res.status(400).json({ success: false, message: 'Identifier (email/phone/session) is required' });
        }

        const result = await otpService.generateAndSendOtp({
            userId: req.user?._id,
            customerId: req.user?.customerId,
            tempSessionId,
            email,
            phone,
            purpose,
            channels: channels || ['EMAIL', 'SMS'],
            ip: req.ip || req.headers['x-forwarded-for'],
            userAgent: req.headers['user-agent']
        });

        res.json({
            success: true,
            message: 'Verification code sent successfully',
            data: {
                expiresAt: result.expiresAt
            }
        });
    } catch (error) {
        res.status(429).json({ success: false, message: error.message });
    }
};

exports.verifyOtp = async (req, res, next) => {
    try {
        const { identifier, purpose, otp } = req.body;

        if (!identifier || !purpose || !otp) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const result = await otpService.verifyOtp({
            identifier,
            purpose,
            otpInput: otp,
            ip: req.ip || req.headers['x-forwarded-for'],
            userAgent: req.headers['user-agent']
        });

        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
