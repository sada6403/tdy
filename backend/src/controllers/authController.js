const authService = require('../services/auth/AuthService');
const User = require('../models/User');
const Customer = require('../models/Customer');
const ApplicationOtp = require('../models/ApplicationOtp');
const Notification = require('../models/Notification');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/emailService');
const { sendSms } = require('../utils/smsService');

exports.login = async (req, res, next) => {
    try {
        const { user_id, password, requiredRole } = req.body;
        const { user, token } = await authService.login({ user_id, password });

        // Portal-specific role restriction
        if (requiredRole && user.role !== requiredRole) {
            return res.status(403).json({ 
                success: false, 
                message: `Unauthorized portal access. This dashboard is only for ${requiredRole.toLowerCase()}s.` 
            });
        }

        // Set HttpOnly Cookie for session persistence (Banking Grade)
        res.cookie('nf_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day matched with JWT expiry
        });

        res.json({
            success: true,
            data: { 
                id: user._id, 
                name: user.name, 
                userId: user.userId, 
                role: user.role, 
                token: token,
                mustChangePassword: user.mustChangePassword 
            }
        });

    } catch (error) {
        if (error.message === 'Invalid Credentials' || error.message.includes('Account locked')) {
            return res.status(error.message.includes('locked') ? 403 : 401).json({ success: false, message: error.message });
        }
        next(error);
    }
};


exports.logout = (req, res) => {
    res.cookie('nf_token', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res, next) => {
    let userData = req.user.toObject();
    
    // If the user is a customer, merge their profile details for the frontend
    if (req.customer) {
        const customerObj = req.customer.toObject();
        userData = {
            ...userData,
            ...customerObj,
            // Flatten bank details for easier frontend access as expected by WalletDashboard
            bankName: customerObj.bankDetails?.bankName || null,
            branchName: customerObj.bankDetails?.branchName || null,
            accountHolder: customerObj.bankDetails?.accountHolder || null,
            accountNumber: customerObj.bankDetails?.accountNumber || null
        };
    }
    
    res.json({ success: true, data: userData });
};

exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        await authService.changePassword(req.user._id, currentPassword, newPassword);
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        if (error.message === 'User not found' || error.message === 'Current password incorrect') {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.verifyNic = async (req, res, next) => {
    try {
        const { nic } = req.body;
        const customer = await Customer.findOne({ nic: nic.trim() });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'No account found with this NIC' });
        }

        const user = await User.findOne({ customerId: customer._id });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User account not linked to this NIC' });
        }

        // Return masked info for selection with safety checks
        const maskedEmail = (user.email || '').replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + "*".repeat(gp3.length));
        const maskedPhone = (user.phone || '').replace(/(\d{2})(\d+)(\d{2})/, (gp1, gp2, gp3, gp4) => gp2 + "*".repeat(gp3.length) + gp4);

        res.json({
            success: true,
            data: {
                userId: user.userId,
                email: maskedEmail,
                phone: maskedPhone
            }
        });
    } catch (error) {
        next(error);
    }
};

const otpService = require('../services/auth/otpService');

exports.sendForgotPasswordOtp = async (req, res, next) => {
    try {
        const { userId, channel } = req.body;
        const user = await User.findOne({ userId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const result = await otpService.generateAndSendOtp({
            userId: user._id,
            customerId: user.customerId,
            email: user.email,
            phone: user.phone,
            purpose: 'PASSWORD_RESET',
            channels: [channel === 'EMAIL' ? 'EMAIL' : 'SMS'],
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({ 
            success: true, 
            message: `Verification code sent to your registered ${channel.toLowerCase()}`,
            data: { expiresAt: result.expiresAt }
        });
    } catch (error) {
        res.status(429).json({ success: false, message: error.message });
    }
};

exports.verifyForgotPasswordOtp = async (req, res, next) => {
    try {
        const { userId, channel, otp } = req.body;
        const user = await User.findOne({ userId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const identifier = channel === 'EMAIL' ? user.email : user.phone;

        const result = await otpService.verifyOtp({
            identifier,
            purpose: 'PASSWORD_RESET',
            otpInput: otp,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.resetForgotPassword = async (req, res, next) => {
    try {
        const { userId, newPassword, otp } = req.body;
        const user = await User.findOne({ userId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Final security check: Ensure there is a recently verified OTP record for this session
        const OtpVerification = require('../models/OtpVerification');
        const otpRecord = await OtpVerification.findOne({
            $or: [{ email: user.email }, { mobileNumber: user.phone }],
            purpose: 'PASSWORD_RESET',
            status: 'USED',
            isUsed: true,
            updatedAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) } // Within last 15 mins
        }).sort({ updatedAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Password reset session invalid or expired.' });
        }

        // Strength Validation (Banking Grade)
        const hasUpper = /[A-Z]/.test(newPassword);
        const hasLower = /[a-z]/.test(newPassword);
        const hasSpecial = /[+#@$=]/.test(newPassword);
        const hasNumber = /\d/.test(newPassword);
        const isValidLength = newPassword.length >= 6 && newPassword.length <= 10;

        if (!isValidLength || !hasUpper || !hasLower || !hasSpecial || !hasNumber) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be 6-10 characters long, containing upper/lower case letters, numbers, and symbols (+, #, @, $, =)' 
            });
        }

        user.password = newPassword;
        await user.save();

        // Cleanup OTP record
        await OtpVerification.deleteOne({ _id: otpRecord._id });

        // 1. Send Email Notification
        if (user.email) {
            sendEmail({
                to: user.email,
                subject: 'Security Alert: Password Changed',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #00c853;">Security Alert</h2>
                        <p>Hello <strong>${user.name}</strong>,</p>
                        <p>This is an automated notification to confirm that your <strong>NF Plantation Portal password</strong> was successfully changed on <strong>${new Date().toLocaleString()}</strong>.</p>
                        <p>If you did not perform this action, please contact our support team immediately to secure your account.</p>
                        <br/>
                        <p>Best Regards,<br/><strong>Security Team | NF Plantation</strong></p>
                    </div>
                `
            }).catch(err => console.error('[Email Error] Password reset notification failed:', err.message));
        }

        // 2. Send SMS Notification
        if (user.phone) {
            sendSms({
                phone: user.phone,
                text: `Security Alert: Your NF Plantation password was changed successfully on ${new Date().toLocaleDateString()}. If this wasn't you, contact support now.`
            }).catch(err => console.error('[SMS Error] Password reset notification failed:', err.message));
        }

        // 3. Create Dashboard Notification
        await Notification.create({
            customerId: user.customerId,
            userId: user._id,
            title: 'Password Security Update',
            message: 'Your account password was successfully reset. For your security, we have sent a confirmation to your registered email and phone.',
            type: 'SUCCESS'
        }).catch(err => console.error('[Notification Error] Dashboard alert failed:', err.message));

        res.json({ success: true, message: 'Password reset successful. You can now login.' });
    } catch (error) {
        next(error);
    }
};
