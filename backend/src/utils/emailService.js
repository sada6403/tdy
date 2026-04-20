const nodemailer = require('nodemailer');
const { generateApplicationPdf, generateDepositReceiptPdf, generateInvestmentPdf } = require('./pdfService');
const Notification = require('../models/Notification');
const Customer = require('../models/Customer');

let transporter;

const getTransporter = async () => {
    if (transporter) {
        return transporter;
    }

    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_SECURE,
        SMTP_USER,
        SMTP_PASS,
    } = process.env;

    if (SMTP_HOST && SMTP_PORT) {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: SMTP_SECURE === 'true',
            auth: SMTP_USER ? {
                user: SMTP_USER,
                pass: SMTP_PASS,
            } : undefined,
        });

        await transporter.verify();
        return transporter;
    }

    transporter = nodemailer.createTransport({
        jsonTransport: true,
    });

    return transporter;
};

const getFromAddress = () => process.env.EMAIL_FROM || 'NF Investment <no-reply@nfinvestment.local>';

const sendEmail = async ({ to, subject, text, html }) => {
    console.info(`[Email] Attempting to send email to ${to} with subject: ${subject}`);
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
        from: getFromAddress(),
        to,
        subject,
        text,
        html,
    });

    console.info(`[Email] Sent successfully. MessageID: ${info.messageId}`);
    
    try {
        if (!subject.toLowerCase().includes('otp') && !subject.toLowerCase().includes('verification code')) {
            const customer = await Customer.findOne({ email: to });
            if (customer) {
                await Notification.create({
                    customerId: customer._id,
                    title: subject,
                    message: text || 'We have sent you an official email regarding this action.',
                    type: 'INFO'
                });
            }
        }
    } catch (notifErr) {
        console.error('[Notification] Failed to generate dashboard notification:', notifErr.message);
    }

    return info;
};

const sendApplicationApprovalEmail = async ({ email, customerName, referenceId, userId, password }) => {
    const subject = 'Account Created - NF Plantation Application Approved';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .header { background-color: #0c1c2c; padding: 35px; text-align: center; }
            .content { padding: 40px; color: #334155; line-height: 1.6; }
            .greeting { font-size: 22px; font-weight: 700; color: #0c1c2c; margin-bottom: 10px; }
            .success-banner { background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 30px; }
            .success-text { color: #065f46; font-weight: 600; margin: 0; }
            .cred-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; }
            .cred-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; }
            .cred-row:last-child { border-bottom: none; }
            .cred-label { color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; }
            .cred-value { color: #0f172a; font-family: 'Courier New', monospace; font-size: 16px; font-weight: 700; }
            .warning-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px; }
            .warning-box p { margin: 0; font-size: 14px; color: #92400e; font-weight: 500; }
            .footer { background-color: #1a1a1a; padding: 35px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #333; }
            .footer p { margin: 6px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 2px;">NF PLANTATION</div>
                <div style="color: #10b981; font-size: 12px; margin-top: 5px; letter-spacing: 1px;">INVESTOR PORTAL</div>
            </div>
            <div class="content">
                <div class="success-banner">
                    <p class="success-text">Application Approved Successfully!</p>
                </div>
                
                <div class="greeting">Congratulations, ${customerName}!</div>
                <p>We are delighted to inform you that your investment application for <strong>${referenceId}</strong> has been approved. Your account on our official investor portal is now active.</p>
                
                <div class="cred-card">
                    <p style="margin-top: 0; font-weight: 700; color: #475569; margin-bottom: 15px;">Login Credentials:</p>
                    <div class="cred-row">
                        <span class="cred-label">User ID</span>
                        <span class="cred-value">${userId}</span>
                    </div>
                    <div class="cred-row">
                        <span class="cred-label">Generated Password</span>
                        <span class="cred-value">${password}</span>
                    </div>
                </div>

                <div class="warning-box">
                    <p><strong>⚠️ SECURITY ACTION REQUIRED:</strong> For your protection, please log in to our portal and change this temporary password immediately after your first access.</p>
                </div>
                
                <p>Thank you for choosing NF Investment.</p>
                <div style="margin-top: 20px;">
                    <p style="margin-bottom: 5px;">Best regards,</p>
                    <p style="font-weight: 700; color: #0c1c2c; margin-top: 0;">NF Plantation Team</p>
                </div>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} NF Plantation (Pvt) Ltd. All Rights Reserved.</p>
                <p>Support: +94 24 433 5099 | <br>nfplantation.official.it@gmail.com</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendEmail({ 
        to: email, 
        subject, 
        html, 
        text: `Congratulations ${customerName}! Your application ${referenceId} is approved. User ID: ${userId}, Password: ${password}. Please change it on your first login.` 
    });
};

const sendApplicationRejectionEmail = async ({ email, customerName, referenceId, reason }) => {
    const subject = 'Update on Your NF Investment Application';
    const text = [
        `Dear ${customerName},`,
        '',
        `Reference ID: ${referenceId}`,
        'Your investment application has been reviewed and is currently not approved.',
        reason ? `Reason: ${reason}` : 'Please contact our support team for further guidance.',
        'Thank you for choosing NF Investment.',
    ].join('\n');
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background: #0c1c2c; padding: 20px; text-align: center; color: white; font-weight: bold; font-size: 20px;">NF PLANTATION</div>
            <div style="padding: 30px;">
                <p>Dear ${customerName},</p>
                <p><strong>Reference ID:</strong> ${referenceId}</p>
                <p>Your investment application has been reviewed and is currently not approved.</p>
                <p>${reason ? `Reason: ${reason}` : 'Please contact our support team for further guidance.'}</p>
                <p>Thank you for choosing NF Investment.</p>
            </div>
            <div style="background: #1a1a1a; color: #888; padding: 30px; text-align: center; font-size: 11px;">
                <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} NF Plantation (Pvt) Ltd. All Rights Reserved.</p>
                <p style="margin: 5px 0;">Support: +94 24 433 5099 | nfplantation.official.it@gmail.com</p>
            </div>
        </div>
    `;

    return sendEmail({ to: email, subject, text, html });
};

const sendOtpEmail = async ({ email, otp }) => {
    const subject = 'Verification Code - NF Plantation (Private) Limited';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { background-color: #0c1c2c; padding: 30px; text-align: center; }
            .header img { max-width: 150px; }
            .content { padding: 40px; color: #334155; line-height: 1.6; }
            .greeting { font-size: 18px; font-weight: 600; color: #0c1c2c; margin-bottom: 20px; }
            .otp-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 36px; font-weight: 800; color: #10b981; letter-spacing: 8px; margin: 0; }
            .expiry { font-size: 13px; color: #64748b; margin-top: 10px; }
            .security-banner { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; }
            .security-banner p { margin: 0; font-size: 13px; color: #92400e; font-weight: 500; }
            .footer { background-color: #1a1a1a; padding: 30px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #333; }
            .footer p { margin: 5px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 1px;">NF PLANTATION</div>
            </div>
            <div class="content">
                <div class="greeting">Identity Verification Request</div>
                <p>To ensure the security of your account, we require a One-Time Password (OTP) to complete your action at NF Plantation (Pvt) Ltd.</p>
                
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <div class="expiry">This code will expire in 10 minutes</div>
                </div>
 
                <div class="security-banner">
                    <p><strong>SECURITY WARNING:</strong> Never share this code with anyone, including NF Plantation employees. We will never call or message you to ask for this code.</p>
                </div>
 
                <p style="font-size: 14px;">If you did not initiate this request, please contact our security team immediately at nfplantation.official.it@gmail.com.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} NF Plantation (Pvt) Ltd. All Rights Reserved.</p>
                <p>Support: +94 24 433 5099 | nfplantation.official.it@gmail.com</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendEmail({ to: email, subject, html, text: `Your verification code is: ${otp}` });
};

/**
 * Send Application Confirmation with PDF
 */
const sendApplicationConfirmationEmail = async (applicationData) => {
    const { email, name, referenceId } = applicationData;
    const subject = 'Application Successfully Submitted - NF Plantation';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { background-color: #0c1c2c; padding: 30px; text-align: center; }
            .content { padding: 40px; color: #334155; line-height: 1.6; }
            .greeting { font-size: 20px; font-weight: 600; color: #0c1c2c; margin-bottom: 20px; }
            .ref-card { background: linear-gradient(135deg, #065f46 0%, #064e3b 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0; }
            .ref-label { font-size: 11px; text-transform: uppercase; opacity: 0.8; letter-spacing: 1px; }
            .ref-value { font-size: 24px; font-weight: 800; margin-top: 5px; }
            .next-steps { background-color: #f8fafc; padding: 20px; border-radius: 8px; font-size: 14px; margin-bottom: 25px; }
            .footer { background-color: #1a1a1a; padding: 30px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #333; }
            .footer p { margin: 5px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 1px;">NF PLANTATION</div>
            </div>
            <div class="content">
                <div class="greeting">Application Submission Confirmed</div>
                <p>Dear ${name},</p>
                <p>We are pleased to inform you that your application for the NF Plantation sustainable project has been successfully received by our systems.</p>
                
                <div class="ref-card">
                    <div class="ref-label">Application Reference ID</div>
                    <div class="ref-value">${referenceId}</div>
                </div>

                <div class="next-steps">
                    <strong>What Happens Next?</strong>
                    <ul style="margin-top: 10px; padding-left: 20px;">
                        <li>Your application is currently being reviewed by our verification team.</li>
                        <li>This process usually takes 2-3 business days.</li>
                        <li>You will receive a notification via SMS and Email once the review is complete.</li>
                    </ul>
                </div>

                <p>We will keep you updated on the progress of your application.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} NF Plantation (Pvt) Ltd. All Rights Reserved.</p>
                <p>Support: +94 24 433 5099 | nfplantation.official.it@gmail.com</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const mailer = await getTransporter();
        await mailer.sendMail({
            from: getFromAddress(),
            to: email,
            subject,
            html,
        });
        console.log(`[Email] Submission confirmation sent to ${email}.`);
    } catch (error) {
        console.error('[Email Error] Failed to send submission confirmation:', error.message);
    }
};


const sendApplicationCorrectionEmail = async ({ email, customerName, referenceId, remarks, resubmissionLink }) => {
    const subject = 'Application Correction Required - NF Plantation';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { background-color: #0c1c2c; padding: 30px; text-align: center; }
            .content { padding: 40px; color: #334155; line-height: 1.6; }
            .greeting { font-size: 20px; font-weight: 600; color: #0c1c2c; margin-bottom: 20px; }
            .remarks-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin: 25px 0; }
            .btn-container { text-align: center; margin: 35px 0; }
            .btn { background-color: #1A237E; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; }
            .footer { background-color: #1a1a1a; padding: 30px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #333; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 1px;">NF PLANTATION</div>
            </div>
            <div class="content">
                <div class="greeting">Correction Required: ${referenceId}</div>
                <p>Dear ${customerName},</p>
                <p>Your application has been reviewed by our team. The following issues were identified:</p>
                
                <div class="remarks-box">
                    <p style="margin: 0; font-style: italic;">"${remarks}"</p>
                </div>

                <p>Please click the button below to review and correct your application using your pre-filled data:</p>
                
                <div class="btn-container">
                    <a href="${resubmissionLink}" class="btn">Update & Resubmit Application</a>
                </div>

                <p>Kindly update and resubmit your application at your earliest convenience to avoid further delays.</p>
                <p>Thank you.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} NF Plantation (Pvt) Ltd. All Rights Reserved.</p>
                <p>Support: +94 24 433 5099 | nfplantation.official.it@gmail.com</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendEmail({ 
        to: email, 
        subject, 
        html, 
        text: `Dear ${customerName}, your application ${referenceId} requires correction. Issues: ${remarks}. Please visit: ${resubmissionLink}` 
    });
};

/**
 * Send Deposit Approval Email with PDF Receipt
 */
const sendDepositApprovalEmail = async ({ email, customerName, referenceNumber, amount, date, userId }) => {
    const subject = 'Payment Confirmed - Deposit Approved';
    
    // Generate PDF
    const pdfBuffer = await generateDepositReceiptPdf({
        customerName,
        referenceNumber,
        amount,
        date,
        userId
    });

    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee;">
        <div style="background: #065f46; color: white; padding: 25px; text-align: center; font-size: 22px; font-weight: bold;">NF PLANTATION</div>
        <div style="padding: 30px;">
            <p>Dear ${customerName},</p>
            <p>We are pleased to inform you that your manual deposit request has been successfully verified and approved.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <div style="font-size: 13px; color: #666; margin-bottom: 5px;">DEPOSIT AMOUNT</div>
                <div style="font-size: 24px; font-weight: bold; color: #065f46;">LKR ${new Intl.NumberFormat('en-LK').format(amount)}</div>
                <div style="font-size: 12px; color: #999; margin-top: 10px;">REF: ${referenceNumber}</div>
            </div>
            <p>Your wallet balance has been updated accordingly. Please find your official payment receipt attached to this email.</p>
            <p>Thank you for choosing NF Investment.</p>
        </div>
        <div style="background: #1a1a1a; color: #666; padding: 20px; text-align: center; font-size: 11px;">
            <p>&copy; NF Plantation (Pvt) Ltd. All Rights Reserved.</p>
        </div>
    </div>
    `;

    const mailer = await getTransporter();
    return await mailer.sendMail({
        from: getFromAddress(),
        to: email,
        subject,
        html,
        attachments: [
            {
                filename: `Receipt_${referenceNumber}.pdf`,
                content: pdfBuffer
            }
        ]
    });
};

/**
 * Send Deposit Rejection Email
 */
const sendDepositRejectionEmail = async ({ email, customerName, referenceNumber, reason }) => {
    const subject = 'Deposit Request Status Update';
    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee;">
        <div style="background: #0c1c2c; color: white; padding: 25px; text-align: center; font-size: 22px; font-weight: bold;">NF PLANTATION</div>
        <div style="padding: 30px;">
            <p>Dear ${customerName},</p>
            <p>Your manual deposit request (Ref: ${referenceNumber}) has been reviewed and was <strong>not approved</strong> at this time.</p>
            <div style="background: #fffafa; border: 1px solid #ff000022; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${reason || 'Incomplete verification details.'}</p>
            </div>
            <p>Please review the details and contact our support team for assistance.</p>
            <p>Support contact: +94 24 433 5099</p>
        </div>
        <div style="background: #1a1a1a; color: #888; padding: 20px; text-align: center; font-size: 11px;">
            <p>&copy; NF Plantation (Pvt) Ltd. All Rights Reserved.</p>
        </div>
    </div>
    `;

    return sendEmail({ to: email, subject, html });
};

/**
 * Send Investment Activation Confirmation Email
 */
const sendInvestmentActivationEmail = async ({ email, customerName, referenceNumber, amount, planName, duration, roi, profitDestination, bankName, accountNumber, userId }) => {
    const subject = 'Investment Activation Requested - NF Plantation';
    
    // Generate PDF Contract/Receipt
    const pdfBuffer = await generateInvestmentPdf({
        customerName,
        referenceNumber,
        amount,
        planName,
        duration,
        roi,
        profitDestination,
        bankName,
        accountNumber,
        userId
    });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
            .header { background: #065f46; color: white; padding: 30px; text-align: center; }
            .content { padding: 40px; }
            .status-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 20px; }
            .investment-summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 25px 0; }
            .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
            .summary-label { color: #64748b; font-weight: 600; }
            .summary-value { color: #0f172a; font-weight: 700; }
            .footer { background: #1a1a1a; color: #64748b; padding: 30px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="font-size: 24px; font-weight: 900; letter-spacing: 1px;">NF PLANTATION</div>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">FIXED DEPOSIT ACTIVATION</div>
            </div>
            <div class="content">
                <div class="status-badge">Activation Pending Approval</div>
                <h2 style="color: #0c1c2c; margin-top: 0;">Hello ${customerName},</h2>
                <p>We have received your request to activate a new Fixed Deposit plan. Your application is currently being reviewed by our administrative team.</p>
                
                <div class="investment-summary">
                    <div class="summary-item"><span class="summary-label">Reference</span><span class="summary-value">${referenceNumber}</span></div>
                    <div class="summary-item"><span class="summary-label">Capital Amount</span><span class="summary-value">LKR ${new Intl.NumberFormat('en-LK').format(amount)}</span></div>
                    <div class="summary-item"><span class="summary-label">Investment Plan</span><span class="summary-value">${planName}</span></div>
                    <div class="summary-item"><span class="summary-label">Monthly Yield</span><span class="summary-value">${roi}% / Month</span></div>
                </div>

                <p>Please find the official <strong>Investment Activation Document</strong> attached to this email for your records.</p>
                <p>Once approved, the capital will be moved to the investment escrow and your growth cycle will begin immediately.</p>
                
                <p>Best Regards,<br><strong>Asset Management Team</strong></p>
            </div>
            <div class="footer">
                &copy; NF Plantation (Pvt) Ltd. All Rights Reserved.<br>
                Support: +94 24 433 5099
            </div>
        </div>
    </body>
    </html>
    `;

    const mailer = await getTransporter();
    return await mailer.sendMail({
        from: getFromAddress(),
        to: email,
        subject,
        html,
        attachments: [
            {
                filename: `Investment_${referenceNumber}.pdf`,
                content: pdfBuffer
            }
        ]
    });
};

const sendInvestmentApprovalEmail = async ({ email, customerName, referenceNumber, amount, planName, duration, roi, profitDestination, bankName, accountNumber, userId, startDate, endDate, monthlyYield }) => {
    const subject = 'Investment Activated - Congratulations! | NF Plantation';

    const pdfBuffer = await generateInvestmentPdf({
        customerName,
        referenceNumber,
        amount,
        planName,
        duration,
        roi,
        profitDestination,
        bankName,
        accountNumber,
        userId
    });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { margin: 0; padding: 0; background: #f8fafc; }
            .container { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 30px auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
            .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; padding: 40px 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: 900; letter-spacing: 2px; }
            .badge { display: inline-block; background: #10b981; color: white; padding: 6px 18px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-top: 12px; }
            .content { padding: 40px; background: white; }
            .congrats { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
            .summary { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 24px 0; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #d1fae5; font-size: 14px; }
            .row:last-child { border-bottom: none; }
            .label { color: #6b7280; font-weight: 600; }
            .value { color: #0f172a; font-weight: 800; }
            .highlight { color: #059669; font-size: 22px; font-weight: 900; text-align: center; margin: 16px 0; }
            .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 13px; color: #1e40af; }
            .footer { background: #0f172a; color: #64748b; padding: 28px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">NF PLANTATION</div>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 6px;">FIXED DEPOSIT INVESTMENT</div>
                <div class="badge">✓ Investment Activated</div>
            </div>
            <div class="content">
                <div class="congrats">Congratulations, ${customerName}! 🎉</div>
                <p>Your Fixed Deposit investment has been <strong>officially approved and activated</strong> by our administrative team. Your capital is now under management and your monthly profit cycle has begun.</p>

                <div class="summary">
                    <div class="row"><span class="label">Reference No.</span><span class="value">${referenceNumber}</span></div>
                    <div class="row"><span class="label">Investment Plan</span><span class="value">${planName}</span></div>
                    <div class="row"><span class="label">Capital Invested</span><span class="value">LKR ${new Intl.NumberFormat('en-LK').format(amount)}</span></div>
                    <div class="row"><span class="label">Monthly Return</span><span class="value">${roi}% / Month</span></div>
                    <div class="row"><span class="label">Duration</span><span class="value">${duration} Months</span></div>
                    <div class="row"><span class="label">Profit Route</span><span class="value">${profitDestination === 'BANK' ? 'Auto Bank Transfer' : 'NF Wallet'}</span></div>
                    <div class="row"><span class="label">Activation Date</span><span class="value">${startDate ? new Date(startDate).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' }) : new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}</span></div>
                    <div class="row"><span class="label">Maturity Date</span><span class="value">${endDate ? new Date(endDate).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' }) : '—'}</span></div>
                </div>

                <div class="highlight">LKR ${new Intl.NumberFormat('en-LK').format(monthlyYield || (amount * roi / 100))} / Month</div>
                <p style="text-align:center; color:#6b7280; font-size:13px; margin-top:-10px;">Your estimated monthly profit</p>

                <div class="info-box">
                    📋 The official <strong>Investment Agreement Document</strong> is attached to this email as a PDF. Please keep it for your records.
                </div>

                <p>If you have any questions, contact our support team at <strong>+94 24 433 5099</strong>.</p>
                <p>Best Regards,<br><strong>Asset Management Team<br>NF Plantation (Pvt) Ltd.</strong></p>
            </div>
            <div class="footer">
                &copy; NF Plantation (Pvt) Ltd. | Reg. No: PV 00303425<br>
                This is an automated confirmation. Please do not reply.
            </div>
        </div>
    </body>
    </html>`;

    const mailer = await getTransporter();
    return await mailer.sendMail({
        from: getFromAddress(),
        to: email,
        subject,
        html,
        attachments: [{
            filename: `NF_Investment_Agreement_${referenceNumber}.pdf`,
            content: pdfBuffer
        }]
    });
};

module.exports = {
    sendEmail,
    sendApplicationApprovalEmail,
    sendApplicationRejectionEmail,
    sendOtpEmail,
    sendApplicationConfirmationEmail,
    sendApplicationCorrectionEmail,
    sendDepositApprovalEmail,
    sendDepositRejectionEmail,
    sendInvestmentActivationEmail,
    sendInvestmentApprovalEmail
};