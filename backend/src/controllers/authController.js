const authService = require('../services/auth/AuthService');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Customer = require('../models/Customer');
const Application = require('../models/Application');
const ApplicationDocument = require('../models/ApplicationDocument');
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

        // Log login event
        AuditLog.create({
            userId: user._id,
            action: 'ADMIN_LOGIN',
            target: 'AUTH',
            description: `${user.name} (${user.userId}) signed in`,
            severity: 'INFO',
            ipAddress: req.ip || req.headers['x-forwarded-for'] || 'UNKNOWN',
            userAgent: req.headers['user-agent']
        }).catch(() => {});

        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                userId: user.userId,
                role: user.role,
                isSuperAdmin: user.isSuperAdmin || user.role === 'ADMIN',
                branchId: user.branchId || null,
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
    // Log logout if user is authenticated
    if (req.user) {
        AuditLog.create({
            userId: req.user._id,
            action: 'ADMIN_LOGOUT',
            target: 'AUTH',
            description: `${req.user.name} signed out`,
            severity: 'INFO',
            ipAddress: req.ip || 'UNKNOWN'
        }).catch(() => {});
    }
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
        const customer = req.customer;
        const customerObj = customer.toObject();

        // Lazy backfill photoUrl from ApplicationDocument for existing customers
        if (!customerObj.photoUrl) {
            const app = await Application.findOne({ customerId: customer._id }).sort({ createdAt: -1 });
            if (app) {
                const photoDoc = await ApplicationDocument.findOne({ applicationId: app._id, documentType: 'photo' });
                if (photoDoc?.fileUrl) {
                    customerObj.photoUrl = photoDoc.fileUrl;
                    customer.photoUrl = photoDoc.fileUrl;
                    await customer.save();
                }
            }
        }

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

    // Always include admin-specific fields for admin portal
    if (!req.customer) {
        userData.isSuperAdmin = req.user.isSuperAdmin || req.user.role === 'ADMIN';
        userData.branchId = req.user.branchId || null;
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

// In-memory OTP store for admin password change: Map<userId, {otp, expiresAt}>
const adminOtpStore = new Map();
const ADMIN_OTP_DEST = 'info@nfplantation.com';

exports.sendAdminPasswordChangeOtp = async (req, res, next) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        adminOtpStore.set(req.user._id.toString(), { otp, expiresAt });

        const html = `
        <!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f7f9;margin:0;padding:0}
        .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)}
        .hd{background:#0c1c2c;padding:28px 32px;text-align:center;color:#fff;font-size:20px;font-weight:800;letter-spacing:1px}
        .bd{padding:36px 32px;color:#334155;line-height:1.7}
        .otp-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:28px;text-align:center;margin:28px 0}
        .otp{font-size:40px;font-weight:900;color:#10b981;letter-spacing:10px}
        .exp{font-size:12px;color:#94a3b8;margin-top:8px}
        .warn{background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:0 8px 8px 0;font-size:13px;color:#92400e;margin-bottom:20px}
        .ft{background:#1a1a1a;padding:24px;text-align:center;font-size:11px;color:#888}
        </style></head><body>
        <div class="wrap">
          <div class="hd">NF PLANTATION — ADMIN SECURITY</div>
          <div class="bd">
            <p>An administrator (<strong>${req.user.name} / ${req.user.userId || req.user.email}</strong>) has requested a password change on the NF Plantation Admin Portal.</p>
            <div class="otp-box">
              <div class="otp">${otp}</div>
              <div class="exp">Expires in 10 minutes</div>
            </div>
            <div class="warn"><strong>Security Alert:</strong> If you did not initiate this request, immediately contact your IT administrator and do NOT share this code.</div>
            <p style="font-size:13px;color:#64748b">This OTP is required to complete the password change. Enter it in the admin portal to proceed.</p>
          </div>
          <div class="ft">&copy; ${new Date().getFullYear()} NF Plantation (Pvt) Ltd. | info@nfplantation.com</div>
        </div>
        </body></html>`;

        await sendEmail({ to: ADMIN_OTP_DEST, subject: 'Admin Password Change OTP — NF Plantation', html, text: `Admin password change OTP: ${otp} (expires in 10 minutes)` });

        res.json({ success: true, message: `OTP sent to ${ADMIN_OTP_DEST}` });
    } catch (error) {
        next(error);
    }
};

exports.adminChangePasswordWithOtp = async (req, res, next) => {
    try {
        const { otp, newPassword } = req.body;
        if (!otp || !newPassword) return res.status(400).json({ success: false, message: 'OTP and new password are required.' });
        if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

        const userId = req.user._id.toString();
        const stored = adminOtpStore.get(userId);
        if (!stored) return res.status(400).json({ success: false, message: 'No OTP was requested. Please request a new OTP first.' });
        if (Date.now() > stored.expiresAt) {
            adminOtpStore.delete(userId);
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }
        if (stored.otp !== otp.trim()) return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });

        adminOtpStore.delete(userId);

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        // Hash and save (pre-save hook handles hashing — set plain password)
        user.password = newPassword;
        user.passwordChangedAt = new Date();
        user.mustChangePassword = false;
        await user.save();

        AuditLog.create({
            userId: req.user._id,
            action: 'ADMIN_PASSWORD_CHANGED',
            target: 'AUTH',
            description: `${req.user.name} (${req.user.userId}) changed admin password via OTP verification`,
            severity: 'CRITICAL',
            ipAddress: req.ip || 'UNKNOWN'
        }).catch(() => {});

        res.json({ success: true, message: 'Password changed successfully.', passwordChangedAt: user.passwordChangedAt });
    } catch (error) {
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
