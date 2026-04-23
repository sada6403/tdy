const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Application = require('../models/Application');
const ApplicationAddress = require('../models/ApplicationAddress');
const ApplicationVerification = require('../models/ApplicationVerification');
const ApplicationDocument = require('../models/ApplicationDocument');
const ApprovalWorkflow = require('../models/ApprovalWorkflow');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const PendingApproval = require('../models/PendingApproval');
const ApplicationOtp = require('../models/ApplicationOtp');
const { 
    sendApplicationConfirmationEmail, 
    sendOtpEmail, 
    sendApplicationCorrectionEmail 
} = require('../utils/emailService');
const { sendSms } = require('../utils/smsService');
const crypto = require('crypto');
const { uploadSignatureToS3 } = require('../utils/s3Service');
const { getSafeSession, safeStartTransaction, safeCommitTransaction, safeAbortTransaction } = require('../utils/transactionHelper');

/**
 * @desc    Check if User ID (NIC), Email or Phone already exists
 */
exports.checkDuplicate = async (req, res, next) => {
    try {
        const { nic, email, phone } = req.body;
        const normalizedNic = (nic || '').trim().toUpperCase();
        const normalizedEmail = (email || '').trim().toLowerCase();
        const normalizedPhone = (phone || '').trim();

        const duplicate = await Customer.findOne({
            $or: [
                { nic: normalizedNic },
                { email: normalizedEmail },
                { mobile: normalizedPhone }
            ]
        });

        if (duplicate) {
            let field = 'identity';
            if (duplicate.nic === normalizedNic) field = 'NIC Number';
            else if (duplicate.email === normalizedEmail) field = 'Email Address';
            else if (duplicate.mobile === normalizedPhone) field = 'Phone Number';

            return res.status(409).json({
                success: false,
                message: `This ${field} is already registered in our system.`,
                data: { field }
            });
        }

        res.json({ success: true, message: 'Unique credentials' });
    } catch (error) {
        next(error);
    }
};

const OTP_PURPOSE = 'APPLICATION_SUBMISSION';

/**
 * @desc    Send OTP to Phone
 */
const otpService = require('../services/auth/otpService');

exports.sendPhoneOtp = async (req, res, next) => {
    try {
        const { phone } = req.body;
        const result = await otpService.generateAndSendOtp({
            phone: phone,
            purpose: 'REGISTRATION_VERIFICATION',
            channels: ['SMS'],
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({ success: true, message: 'OTP sent to mobile' });
    } catch (error) {
        res.status(429).json({ success: false, message: error.message });
    }
};

exports.verifyPhoneOtp = async (req, res, next) => {
    try {
        const { phone, otp } = req.body;
        const result = await otpService.verifyOtp({
            identifier: phone,
            purpose: 'REGISTRATION_VERIFICATION',
            otpInput: otp,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Send OTP to Email
 */
exports.sendEmailOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await otpService.generateAndSendOtp({
            email: email,
            purpose: 'REGISTRATION_VERIFICATION',
            channels: ['EMAIL'],
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        res.status(429).json({ success: false, message: error.message });
    }
};

exports.verifyEmailOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const result = await otpService.verifyOtp({
            identifier: email,
            purpose: 'REGISTRATION_VERIFICATION',
            otpInput: otp,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get application for resubmission (using token)
 */
exports.getApplicationForResubmit = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { token } = req.query;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Resubmission token is required' });
        }

        const app = await Application.findById(id);
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (app.status !== 'RESUBMISSION_REQUIRED') {
            return res.status(400).json({ success: false, message: 'Application is not in resubmission state' });
        }

        if (app.resubmissionToken !== token) {
            return res.status(401).json({ success: false, message: 'Invalid resubmission token' });
        }

        // Fetch related data
        const [customer, address, verification, documents] = await Promise.all([
            Customer.findById(app.customerId),
            ApplicationAddress.findOne({ applicationId: id }),
            ApplicationVerification.findOne({ applicationId: id }),
            ApplicationDocument.find({ applicationId: id })
        ]);

        res.json({
            success: true,
            data: {
                application: app,
                customer,
                address,
                verification,
                documents: documents.map(d => ({
                    type: d.documentType,
                    fileUrl: d.fileUrl,
                    fileName: d.fileName
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Submit or Resubmit Customer Application
 * @route   POST /api/applications/submit
 */
exports.submitApplication = async (req, res, next) => {
    console.log(`[APPLICATION_SUBMIT] 📥 Received request for: ${req.body.name || 'Unknown'} (${req.body.nic || 'No NIC'})`);
    console.log('[APPLICATION_SUBMIT] 📂 Files object keys:', Object.keys(req.files || {}));
    
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);

    try {
        const {
            name, email, phone, nic, dob, gender,
            address, city, district, province,
            bankName, branchName, accountHolder, accountNumber,
            preferredBranch,
            isPhoneVerified, isEmailVerified,
            signature, // Base64 signature
            applicationRef // Optional: used for matching existing draft/returned application
        } = req.body;

        const normalizedPhone = (phone || '').trim();
        const normalizedEmail = (email || '').trim().toLowerCase();
        const normalizedNic = (nic || '').trim().toUpperCase();

        // 1. Identify Existing Customer
        let customer = await Customer.findOne({ 
            $or: [
                { nic: normalizedNic },
                { email: normalizedEmail },
                { mobile: normalizedPhone }
            ] 
        }).session(session);

        // 2. Resolve Application to Create or Update
        let application = null;
        
        // Priority 1: Use provided referenceId
        if (applicationRef) {
            application = await Application.findOne({ referenceId: applicationRef }).session(session);
        }
        
        // Priority 2: Use customer's most recent application if none found by reference
        if (!application && customer) {
            application = await Application.findOne({ customerId: customer._id })
                .sort({ createdAt: -1 })
                .session(session);
        }

        // 3. Block if an active application already exists for this person (that is not DRAFT/RETURNED)
        if (application && !['DRAFT', 'RETURNED', 'RESUBMISSION_REQUIRED'].includes(application.status)) {
            await safeAbortTransaction(session);
            return res.status(409).json({
                success: false,
                message: 'An active application already exists for this identity.',
                data: { referenceId: application.referenceId, status: application.status }
            });
        }

        if (customer) {
            // Check for conflicts if the existing customer doesn't match the new NIC
            if (customer.nic !== normalizedNic) {
                await safeAbortTransaction(session);
                return res.status(409).json({
                    success: false,
                    message: `The provided email or phone number is already registered with a different NIC (${customer.nic}). Please contact support or check your details.`,
                });
            }
            // Update existing customer details just in case
            customer.fullName = name;
            customer.email = normalizedEmail;
            customer.mobile = normalizedPhone;
            customer.dob = dob;
            customer.gender = gender;
            customer.bankDetails = { bankName, branchName, accountHolder, accountNumber };
            await customer.save({ session });
        } else {
            customer = new Customer({
                fullName: name,
                email: normalizedEmail,
                mobile: normalizedPhone,
                nic: normalizedNic,
                dob,
                gender,
                bankDetails: { bankName, branchName, accountHolder, accountNumber }
            });
            await customer.save({ session });
        }

        // 3. Handle Signature Upload (to S3 pending folder)
        let signatureData = null;
        if (signature && signature.startsWith('data:image')) {
            signatureData = await uploadSignatureToS3(signature, applicationRef || 'NEW');
        }

        const filesMetadata = {};
        if (req.files) {
            console.log(`[Submission] Files received: ${Object.keys(req.files).join(', ')}`);
            Object.keys(req.files).forEach(fieldName => {
                const file = req.files[fieldName][0];
                filesMetadata[fieldName] = {
                    path: file.location,
                    filename: file.key, // This is the S3 Key
                    mimetype: file.mimetype
                };
                console.log(`[Submission] Processed file metadata for: ${fieldName}`);
            });
        } else {
            console.warn('[Submission] No files received or multer failed');
        }

        // 4. Create or Update Application
        const referenceId = applicationRef || application?.referenceId || `NF-${Math.floor(100000 + Math.random() * 900000)}`;
        
        if (!application) {
            application = new Application({
                customerId: customer._id,
                referenceId,
                preferredBranch,
                status: 'SUBMITTED',
                bankDetails: { bankName, branchName, accountHolder, accountNumber }
            });
        } else {
            application.status = 'SUBMITTED';
            application.preferredBranch = preferredBranch;
            application.bankDetails = { bankName, branchName, accountHolder, accountNumber };
            application.resubmissionCount += 1;
            application.adminRemarks = ''; // Clear old remarks on resubmit
            application.resubmissionToken = null;
        }
        await application.save({ session });

        // 5. Create/Update Related Data (Address, Verification)
        await ApplicationAddress.findOneAndUpdate(
            { applicationId: application._id },
            { 
                permanentAddress: address.trim(), 
                city: city.trim(), 
                district: district.trim(), 
                province: province.trim() 
            },
            { upsert: true, session }
        );

        await ApplicationVerification.findOneAndUpdate(
            { applicationId: application._id },
            {
                phoneOtpVerified: isPhoneVerified === 'true' || isPhoneVerified === true,
                emailOtpVerified: isEmailVerified === 'true' || isEmailVerified === true,
                verifiedAt: new Date()
            },
            { upsert: true, session }
        );

        // 6. Handle Documents (Update if exists, else create)
        const docTypes = ['nicFront', 'nicBack', 'photo', 'bankProof'];
        for (const type of docTypes) {
            if (filesMetadata[type]) {
                await ApplicationDocument.findOneAndUpdate(
                    { applicationId: application._id, documentType: type },
                    {
                        fileName: filesMetadata[type].filename,
                        fileUrl: filesMetadata[type].path,
                        s3Key: filesMetadata[type].filename,
                        isPermanent: false,
                        mimeType: filesMetadata[type].mimetype,
                        uploadedAt: new Date()
                    },
                    { upsert: true, session }
                );
            }
        }

        // 7. Update Approval Workflow
        await ApprovalWorkflow.findOneAndUpdate(
            { entityType: 'Application', entityId: application._id },
            { status: 'PENDING', notes: '' },
            { upsert: true, session }
        );

        // 8. Update Snapshot (PendingApproval)
        const allDocs = await ApplicationDocument.find({ applicationId: application._id }).session(session);
        const flattenedDocs = allDocs.map(d => ({
            type: d.documentType,
            fileUrl: d.fileUrl,
            s3Key: d.s3Key
        }));

        await PendingApproval.findOneAndUpdate(
            { applicationId: application._id },
            {
                referenceId,
                customerName: name,
                email: normalizedEmail,
                phone: normalizedPhone,
                nic: normalizedNic,
                gender,
                dob,
                address: address.trim(),
                city: city.trim(),
                district: district.trim(),
                province: province.trim(),
                bankName,
                branchName,
                accountHolder,
                accountNumber,
                preferredBranch,
                documents: flattenedDocs,
                signature: signatureData?.url || signature,
                status: 'PENDING',
                adminRemarks: '',
                submittedAt: new Date()
            },
            { upsert: true, session }
        );

        // 9. Cleanup OTPs
        await ApplicationOtp.deleteMany({
            purpose: OTP_PURPOSE,
            targetValue: { $in: [normalizedPhone, normalizedEmail] }
        }).session(session);

        // 10. Audit Log
        await new AuditLog({
            actorType: 'CUSTOMER',
            actorId: customer._id,
            action: application.resubmissionCount > 0 ? 'RESUBMIT_APPLICATION' : 'SUBMIT_APPLICATION',
            entityType: 'Application',
            entityId: application._id,
            metadata: { referenceId, version: application.resubmissionCount }
        }).save({ session });

        await safeCommitTransaction(session);
        if (session) session.endSession();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully!',
            data: { applicationId: application._id, referenceId }
        });

        // 11. Notifications (Async)
        sendApplicationConfirmationEmail({
            email: normalizedEmail, name, referenceId, nic: normalizedNic,
            dob, gender, phone: normalizedPhone, address, city, district,
            bankName, accountNumber, accountHolder, preferredBranch,
            signatureUrl: signature // Use raw base64 for PDF
        });

        sendSms({
            phone: normalizedPhone,
            text: `Success! Your NF Plantation application (Ref: ${referenceId}) has been received. Our team will review it shortly.`
        }).catch(err => console.error('[SMS Error]', err.message));

    } catch (error) {
        await safeAbortTransaction(session);
        if (session) session.endSession();
        next(error);
    }
};

exports.getApplications = async (req, res, next) => {
    try {
        const applications = await Application.find().populate('customerId').sort({ createdAt: -1 });
        res.json({ success: true, count: applications.length, data: applications });
    } catch (error) {
        next(error);
    }
};

exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        
        const updateData = { status, adminRemarks: reason || null };
        let token = null;

        if (status === 'RESUBMISSION_REQUIRED') {
            if (!reason) {
                return res.status(400).json({ success: false, message: 'Remarks are required for resubmission' });
            }
            token = crypto.randomBytes(32).toString('hex');
            updateData.resubmissionToken = token;
        }

        const application = await Application.findByIdAndUpdate(id, updateData, { new: true });
        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
        
        await ApprovalWorkflow.findOneAndUpdate(
            { entityType: 'Application', entityId: id },
            { 
                status: (status === 'RETURNED' || status === 'RESUBMISSION_REQUIRED') ? 'RETURNED' : status, 
                notes: reason
            }
        );
        
        if (status === 'RESUBMISSION_REQUIRED') {
            const customer = await Customer.findById(application.customerId);
            if (customer && customer.email) {
                // Determine frontend URL (ensure to have FRONTEND_URL in env, fallback if needed)
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                const resubmissionLink = `${frontendUrl}/company/nf-plantation/application/edit/${application._id}?token=${token}`;
                
                await sendApplicationCorrectionEmail({
                    email: customer.email,
                    customerName: customer.fullName,
                    referenceId: application.referenceId,
                    remarks: reason,
                    resubmissionLink
                }).catch(err => console.error('[Email Error] Failed to send correction email:', err.message));
            }
        }
        
        res.json({ success: true, data: application });
    } catch (error) {
        next(error);
    }
};
