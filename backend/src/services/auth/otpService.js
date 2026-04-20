const OtpVerification = require('../../models/OtpVerification');
const OtpAttemptLog = require('../../models/OtpAttemptLog');
const generateOtp = require('../../utils/otp/generateOtp');
const { hashOtp, compareOtp } = require('../../utils/otp/hashOtp');
const { sendEmail } = require('../../utils/emailService');
const { sendSms } = require('../../utils/smsService');

class OtpService {
    /**
     * Generates and sends a dual-channel OTP.
     */
    async generateAndSendOtp({ 
        userId, 
        customerId, 
        tempSessionId, 
        email, 
        phone, 
        purpose, 
        channels = ['EMAIL', 'SMS'],
        ip,
        userAgent
    }) {
        // 1. Rate Limiting Check (Simple 60s cooldown per purpose/identifier)
        const recentOtp = await OtpVerification.findOne({
            $or: [
                { email: email },
                { mobileNumber: phone },
                { tempSessionId: tempSessionId }
            ],
            purpose,
            createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
        });

        if (recentOtp) {
            throw new Error('Please wait 60 seconds before requesting another code.');
        }

        // 2. Generate OTP
        const plainOtp = generateOtp();
        const otpHash = await hashOtp(plainOtp);
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 Minutes expiry

        // 3. Create Record
        const otpRecord = await OtpVerification.create({
            userId,
            customerId,
            tempSessionId,
            email,
            mobileNumber: phone,
            purpose,
            otpHash,
            deliveryChannels: channels,
            expiresAt,
            requestIp: ip,
            requestUserAgent: userAgent,
            status: 'PENDING'
        });

        // 4. Log Generation
        await this.logEvent(otpRecord._id, {
            userId,
            tempSessionId,
            actionType: 'GENERATED',
            status: 'SUCCESS',
            ipAddress: ip,
            userAgent: userAgent,
            note: `OTP generated for ${purpose}`
        });

        // 5. Delivery Logic
        let emailTask = null;
        let smsTask = null;

        if (channels.includes('EMAIL') && email) {
            emailTask = this.sendOtpEmail(email, plainOtp, purpose, otpRecord, ip, userAgent);
        }

        if (channels.includes('SMS') && phone) {
            smsTask = this.sendOtpSms(phone, plainOtp, purpose, otpRecord, ip, userAgent);
        }

        // Run deliveries in parallel
        const results = await Promise.allSettled([emailTask, smsTask]);
        
        // Update send status based on results
        const updates = {};
        if (channels.includes('EMAIL')) updates.emailSendStatus = results[0]?.status === 'fulfilled' ? 'SENT' : 'FAILED';
        if (channels.includes('SMS')) {
            const smsIdx = channels.includes('EMAIL') ? 1 : 0;
            updates.smsSendStatus = results[smsIdx]?.status === 'fulfilled' ? 'SENT' : 'FAILED';
        }
        
        if (Object.keys(updates).length > 0) {
            await OtpVerification.findByIdAndUpdate(otpRecord._id, { ...updates, status: 'SENT' });
        }

        return { success: true, otpId: otpRecord._id, expiresAt };
    }

    /**
     * Verifies an OTP code.
     */
    async verifyOtp({ identifier, purpose, otpInput, ip, userAgent }) {
        // Find the latest valid OTP for this identifier and purpose
        const otpRecord = await OtpVerification.findOne({
            $or: [
                { email: identifier },
                { mobileNumber: identifier },
                { tempSessionId: identifier }
            ],
            purpose,
            isUsed: false,
            status: { $nin: ['LOCKED', 'USED', 'EXPIRED'] }
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            throw new Error('No active verification code found. Please request a new one.');
        }

        // 1. Check Expiry
        if (new Date() > otpRecord.expiresAt) {
            await OtpVerification.findByIdAndUpdate(otpRecord._id, { status: 'EXPIRED' });
            await this.logEvent(otpRecord._id, {
                actionType: 'EXPIRY_FAILURE',
                status: 'FAILED',
                ipAddress: ip,
                userAgent: userAgent,
                note: 'OTP expired'
            });
            throw new Error('OTP expired. Please request a new code.');
        }

        // 2. Check Max Attempts
        if (otpRecord.attemptCount >= otpRecord.maxAttempts) {
            await OtpVerification.findByIdAndUpdate(otpRecord._id, { status: 'LOCKED', lockedAt: new Date() });
            await this.logEvent(otpRecord._id, {
                actionType: 'MAX_ATTEMPTS_EXCEEDED',
                status: 'FAILED',
                ipAddress: ip,
                userAgent: userAgent,
                note: 'Max retry attempts exceeded'
            });
            throw new Error('Maximum attempts exceeded. Please request a new OTP.');
        }

        // 3. Compare Hash
        const isMatch = await compareOtp(otpInput, otpRecord.otpHash);
        
        if (!isMatch) {
            const newCount = otpRecord.attemptCount + 1;
            await OtpVerification.findByIdAndUpdate(otpRecord._id, { 
                attemptCount: newCount,
                lastAttemptAt: new Date()
            });
            
            await this.logEvent(otpRecord._id, {
                actionType: 'VERIFICATION_FAILURE',
                status: 'FAILED',
                attemptNumber: newCount,
                ipAddress: ip,
                userAgent: userAgent,
                note: 'Incorrect OTP entered'
            });

            if (newCount >= otpRecord.maxAttempts) {
                throw new Error('Maximum attempts exceeded. Please request a new OTP.');
            }
            
            throw new Error('Invalid verification code. Please try again.');
        }

        // 4. Success - Mark as Used
        await OtpVerification.findByIdAndUpdate(otpRecord._id, {
            isUsed: true,
            usedAt: new Date(),
            status: 'USED',
            verificationStatus: 'SUCCESS'
        });

        await this.logEvent(otpRecord._id, {
            actionType: 'VERIFICATION_SUCCESS',
            status: 'SUCCESS',
            ipAddress: ip,
            userAgent: userAgent,
            note: 'Verification successful'
        });

        return { success: true, message: 'Verified successfully' };
    }

    /**
     * Sends OTP via Email with branded template.
     */
    async sendOtpEmail(email, otp, purpose, otpRecord, ip, userAgent) {
        try {
            const subject = `${otp} is your verification code`;
            
            const html = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                    <div style="background-color: #0c1c2c; padding: 40px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">NF Plantation</h1>
                        <p style="color: #94a3b8; margin-top: 8px; font-size: 14px; text-transform: uppercase; tracking: 2px;">Secure Verification</p>
                    </div>
                    <div style="padding: 40px; background-color: #ffffff;">
                        <p style="color: #475569; font-size: 16px;">Hello,</p>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                            Your verification code for <strong>${purpose.replace(/_/g, ' ')}</strong> is:
                        </p>
                        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
                            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0c1c2c;">${otp}</span>
                        </div>
                        <p style="color: #ef4444; font-size: 13px; font-weight: 600; text-align: center;">This code will expire in 2 minutes.</p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
                            Security Notice: Never share this OTP with anyone, including NF Plantation staff. 
                            The same code has been sent to your registered mobile number if provided.
                        </p>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
                        &copy; ${new Date().getFullYear()} NF Plantation (Pvt) Ltd. All rights reserved.
                    </div>
                </div>
            `;

            await sendEmail({ to: email, subject, html });
            
            await this.logEvent(otpRecord._id, {
                actionType: 'EMAIL_SENT',
                status: 'SUCCESS',
                channel: 'EMAIL',
                ipAddress: ip,
                userAgent: userAgent
            });
        } catch (err) {
            await this.logEvent(otpRecord._id, {
                actionType: 'EMAIL_SENT',
                status: 'FAILED',
                channel: 'EMAIL',
                ipAddress: ip,
                userAgent: userAgent,
                note: err.message
            });
            throw err;
        }
    }

    /**
     * Sends OTP via SMS.
     */
    async sendOtpSms(phone, otp, purpose, otpRecord, ip, userAgent) {
        try {
            const text = `NF Plantation OTP: ${otp}. Valid for 2 minutes. Purpose: ${purpose.replace(/_/g, ' ')}. Do not share this code.`;
            
            await sendSms({ phone, text });

            await this.logEvent(otpRecord._id, {
                actionType: 'SMS_SENT',
                status: 'SUCCESS',
                channel: 'SMS',
                ipAddress: ip,
                userAgent: userAgent
            });
        } catch (err) {
            await this.logEvent(otpRecord._id, {
                actionType: 'SMS_SENT',
                status: 'FAILED',
                channel: 'SMS',
                ipAddress: ip,
                userAgent: userAgent,
                note: err.message
            });
            throw err;
        }
    }

    /**
     * Logs an OTP lifecycle event.
     */
    async logEvent(otpId, data) {
        try {
            await OtpAttemptLog.create({
                otpId,
                ...data
            });
        } catch (err) {
            console.error('[OtpService] Failed to log event:', err.message);
        }
    }
}

module.exports = new OtpService();
