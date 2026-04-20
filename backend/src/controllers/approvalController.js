const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const AppModel = require('../models/Application');
const ApplicationAddress = require('../models/ApplicationAddress');
const ApplicationVerification = require('../models/ApplicationVerification');
const ApplicationDocument = require('../models/ApplicationDocument');
const ApprovalWorkflow = require('../models/ApprovalWorkflow');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const PendingApproval = require('../models/PendingApproval');
const { sendApplicationApprovalEmail, sendApplicationRejectionEmail, sendApplicationCorrectionEmail } = require('../utils/emailService');
const { sendSms } = require('../utils/smsService');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { finalizeS3File, s3 } = require('../utils/s3Service');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSafeSession, safeStartTransaction, safeCommitTransaction, safeAbortTransaction } = require('../utils/transactionHelper');

const WORKFLOW_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    RETURNED: 'RETURNED',
    IN_REVIEW: 'IN_REVIEW'
};

// @desc    Get all pending approval requests
exports.getPendingApprovals = async (req, res, next) => {
    try {
        const approvals = await PendingApproval.aggregate([
            { $match: { status: 'PENDING' } },
            {
                $lookup: {
                    from: 'applicationverifications',
                    localField: 'applicationId',
                    foreignField: 'applicationId',
                    as: 'verification'
                }
            },
            { $unwind: { path: '$verification', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    approvalId: '$_id',
                    id: '$_id',
                    applicationId: '$applicationId',
                    customerName: '$customerName',
                    customerEmail: '$email',
                    customerPhone: '$phone',
                    referenceId: '$referenceId',
                    branch: '$preferredBranch',
                    status: '$status',
                    requestType: 'NEW_REGISTRATION',
                    submittedAt: '$submittedAt',
                    
                    // KYC Verification data (Connects to Flutter checklist)
                    isPhoneVerified: { $ifNull: ['$verification.phoneOtpVerified', false] },
                    isEmailVerified: { $ifNull: ['$verification.emailOtpVerified', false] },
                    otpVerificationStatus: {
                        $cond: [
                            { $and: ['$verification.phoneOtpVerified', '$verification.emailOtpVerified'] },
                            'VERIFIED',
                            'PENDING'
                        ]
                    },
                    kycStatus: {
                        $cond: [
                            { $and: ['$verification.phoneOtpVerified', '$verification.emailOtpVerified'] },
                            'VERIFIED',
                            'PENDING'
                        ]
                    },
                    customerVerificationStatus: {
                        $cond: [
                            { $and: ['$verification.phoneOtpVerified', '$verification.emailOtpVerified'] },
                            'VERIFIED',
                            'PENDING'
                        ]
                    },
                    reviewReadiness: {
                        $cond: [
                            { $and: ['$verification.phoneOtpVerified', '$verification.emailOtpVerified'] },
                            'HIGH',
                            'LOW'
                        ]
                    }
                }
            },
            { $sort: { submittedAt: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                approvals,
                stats: {
                    pending: approvals.length,
                    total: await PendingApproval.countDocuments({ status: 'PENDING' }),
                    approvedToday: await PendingApproval.countDocuments({ 
                        status: 'APPROVED', 
                        updatedAt: { $gte: new Date().setHours(0,0,0,0) } 
                    }),
                    rejectedToday: await PendingApproval.countDocuments({ 
                        status: 'REJECTED', 
                        updatedAt: { $gte: new Date().setHours(0,0,0,0) } 
                    })
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all resubmission required applications
exports.getResendApprovals = async (req, res, next) => {
    try {
        const approvals = await ApprovalWorkflow.aggregate([
            { $match: { status: 'RESUBMISSION_REQUIRED' } },
            {
                $lookup: {
                    from: 'applications',
                    localField: 'applicationId',
                    foreignField: '_id',
                    as: 'application'
                }
            },
            { $unwind: '$application' },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'application.customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $lookup: {
                    from: 'applicationverifications',
                    localField: 'applicationId',
                    foreignField: 'applicationId',
                    as: 'verification'
                }
            },
            { $unwind: { path: '$verification', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    approvalId: '$_id',
                    applicationId: '$application._id',
                    customerId: '$customer._id',
                    customerName: '$customer.fullName',
                    customerEmail: '$customer.email',
                    customerPhone: '$customer.phone',
                    requestType: 'NEW_REGISTRATION',
                    approvalStatus: '$status',
                    workflowStatus: '$status',
                    referenceId: '$application.referenceId',
                    createdAt: '$createdAt',
                    reviewReadiness: { $ifNull: ['$verification.reviewReadiness', 'LOW'] }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                approvals,
                stats: {
                    pending: approvals.length,
                    total: await ApprovalWorkflow.countDocuments()
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pending approval requests (Flat Snapshot)
exports.getPendingApprovalsFlat = async (req, res, next) => {
    try {
        const approvals = await PendingApproval.find({ 
            status: { $in: ['PENDING', 'UNDER_REVIEW'] } 
        }).sort({ submittedAt: -1 });
        
        res.json({
            success: true,
            count: approvals.length,
            data: approvals
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Internal Helper: Finalize across-model customer profile data
const syncCustomerProfile = async (customer, snapshot, session) => {
    if (!snapshot || !customer) return;
    const fields = ['bankName', 'branchName', 'accountHolder', 'accountNumber', 'nic', 'dob', 'gender'];
    fields.forEach(f => {
        if (snapshot[f]) customer[f] = snapshot[f];
    });
    // Sync address from application snapshot
    if (snapshot.address || snapshot.city || snapshot.district || snapshot.province) {
        customer.address = {
            line1: snapshot.address || '',
            city: snapshot.city || '',
            district: snapshot.district || '',
            province: snapshot.province || ''
        };
    }
    // Sync bank details as nested object as well
    if (snapshot.bankName || snapshot.accountNumber) {
        customer.bankDetails = {
            bankName: snapshot.bankName || '',
            branchName: snapshot.branchName || '',
            accountHolder: snapshot.accountHolder || '',
            accountNumber: snapshot.accountNumber || ''
        };
    }
    // Sync registration signature
    if (snapshot.signature) {
        customer.signature = snapshot.signature;
    }
    customer.isActive = true;
    customer.kycStatus = 'VERIFIED';
    await customer.save({ session });
};

// @desc    Internal Helper: Move pending documents to verified storage
const finalizeS3Docs = async (applicationId, session) => {
    const documents = await ApplicationDocument.find({ applicationId }).session(session);
    for (const doc of documents) {
        if (doc.s3Key && doc.s3Key.startsWith('pending/')) {
            const finalInfo = await finalizeS3File(doc.s3Key);
            if (finalInfo) {
                doc.s3Key = finalInfo.key;
                doc.fileUrl = finalInfo.url;
                doc.isPermanent = true;
                await doc.save({ session });
            }
        }
    }

    // Move Signature if cached in snapshot
    const snapshot = await PendingApproval.findOne({ applicationId }).session(session);
    if (snapshot && snapshot.signature && snapshot.signature.includes('pending/')) {
        const urlParts = snapshot.signature.split('.com/');
        const oldKey = urlParts.length > 1 ? urlParts[1] : snapshot.signature;
        if (oldKey.startsWith('pending/')) {
            const finalInfo = await finalizeS3File(oldKey);
            if (finalInfo) {
                snapshot.signature = finalInfo.url;
                await snapshot.save({ session });
            }
        }
    }
};

// @desc    Internal Helper: Generate account and wallet
const createBankingAccount = async (customer, session) => {
    // User ID: NFP- + 6 random digits
    const generatedUserId = `NFP-${Math.floor(100000 + Math.random() * 899999)}`;
    const generatedPassword = crypto.randomBytes(5).toString('hex');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(generatedPassword, salt);

    let userRec = await User.findOne({ email: customer.email }).session(session);
    if (!userRec) {
        userRec = new User({
            name: customer.fullName,
            email: customer.email,
            phone: customer.mobile,
            userId: generatedUserId,
            password: generatedPassword, // Model hashes this via pre-save hook
            role: 'CUSTOMER',
            isActive: true,
            mustChangePassword: true,
            customerId: customer._id
        });
        await userRec.save({ session });
    } else {
        // Safety update if user somehow pre-existed (unlikely in draft flow)
        userRec.password = generatedPassword;
        userRec.userId = generatedUserId;
        userRec.mustChangePassword = true;
        userRec.customerId = customer._id;
        await userRec.save({ session });
    }

    // Initialize Wallet
    let walletRec = await Wallet.findOne({ customerId: customer._id }).session(session);
    if (!walletRec) {
        walletRec = new Wallet({
            customerId: customer._id,
            availableBalance: 0,
            heldBalance: 0,
            totalBalance: 0
        });
        await walletRec.save({ session });
    }

    return { generatedUserId, generatedPassword, userObjectId: userRec._id };
};

// @desc    Approve an application (moves files to permanent storage)
exports.approveApprovalRequest = async (req, res, next) => {
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);

    try {
        const { id: targetId } = req.params;
        console.log('[DEBUG] Approving Application for ID:', targetId);
        
        // 1. Resolve Application ID
        let applicationId;
        let snapshot = await PendingApproval.findOne({ $or: [{ _id: targetId }, { applicationId: targetId }] }).session(session);
        
        if (snapshot) {
            applicationId = snapshot.applicationId;
        } else {
            const workflow = await ApprovalWorkflow.findOne({ $or: [{ _id: targetId }, { entityId: targetId }], entityType: 'Application' }).session(session);
            if (workflow) {
                applicationId = workflow.entityId;
            } else if (mongoose.Types.ObjectId.isValid(targetId)) {
                const directApp = await AppModel.findById(targetId).session(session);
                if (directApp) applicationId = directApp._id;
            }
        }

        if (!applicationId) {
            await safeAbortTransaction(session);
            return res.status(404).json({ success: false, message: 'Application identifier not found' });
        }

        // 2. Fetch Core Records
        const appRec = await AppModel.findById(applicationId).session(session);
        if (!appRec) {
            await safeAbortTransaction(session);
            return res.status(404).json({ success: false, message: 'Application record missing' });
        }

        const customer = await Customer.findById(appRec.customerId).session(session);
        if (!customer) {
            await safeAbortTransaction(session);
            return res.status(404).json({ success: false, message: 'Customer record not found' });
        }

        // 3. Handle Workflow Tracking
        let approval = await ApprovalWorkflow.findOne({ entityId: applicationId, entityType: 'Application' }).session(session);
        if (!approval) {
             approval = new ApprovalWorkflow({
                 entityType: 'Application',
                 entityId: applicationId,
                 status: WORKFLOW_STATUS.PENDING
             });
        }

        if (approval.status === WORKFLOW_STATUS.APPROVED) {
            await safeAbortTransaction(session);
            return res.status(400).json({ success: false, message: 'Already approved' });
        }

        // 4. Persistence & Sync
        await finalizeS3Docs(applicationId, session);

        if (!snapshot) {
            snapshot = await PendingApproval.findOne({ applicationId }).session(session);
        }
        await syncCustomerProfile(customer, snapshot, session);

        // Create Banking Account (User + Wallet)
        const { generatedUserId, generatedPassword, userObjectId } = await createBankingAccount(customer, session);

        // 5. Update Statuses
        approval.status = WORKFLOW_STATUS.APPROVED;
        approval.approvedAt = new Date();
        approval.approvedBy = req.user?.id;
        await approval.save({ session });

        appRec.status = 'APPROVED';
        await appRec.save({ session });

        if (snapshot) {
            snapshot.status = 'APPROVED';
            await snapshot.save({ session });
        }

        // 6. Notifications & Audit
        await Notification.create([{
            userId: userObjectId,
            title: 'Application Approved',
            message: `Your application ${appRec.referenceId} has been finalized. Login ID: ${generatedUserId}`,
            type: 'SUCCESS'
        }], { session });

        await AuditLog.create([{
            actorType: 'ADMIN',
            actorId: req.user?.id,
            action: 'APPROVE_APPLICATION',
            entityType: 'Application',
            entityId: appRec._id,
            metadata: { referenceId: appRec.referenceId, generatedUserId }
        }], { session });

        await safeCommitTransaction(session);
        if (session) session.endSession();

        res.json({ 
            success: true, 
            message: 'Application approved successfully and customer account created',
            data: { userId: generatedUserId }
        });

        // 7. Trigger Communications (Non-blocking)
        sendApplicationApprovalEmail({
            email: customer.email,
            customerName: customer.fullName,
            referenceId: appRec.referenceId,
            userId: generatedUserId,
            password: generatedPassword
        }).catch(err => console.error('[Notification Error] Failed to send approval email:', err.message));

        sendSms({
            phone: customer.mobile,
            text: `Congratulations! Your NF Plantation investment application (${appRec.referenceId}) has been approved. Please check your email for login credentials.`
        }).catch(err => console.error('[Notification Error] Failed to send approval SMS:', err.message));

    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        if (session) session.endSession();
        console.error('[APPROVE_ERROR]', error);
        next(error);
    }
};

// @desc    Resend for resubmission (with secure link)
exports.resendApplication = async (req, res, next) => {
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);

    try {
        const { applicationId: bodyAppId, issues } = req.body;
        const targetId = bodyAppId || req.params.id;

        if (!issues) {
            await safeAbortTransaction(session);
            return res.status(400).json({ success: false, message: 'Remarks (issues) are required' });
        }

        // Resolve ID
        let actualAppId;
        const snapshot = await PendingApproval.findOne({ $or: [{ _id: targetId }, { applicationId: targetId }] }).session(session);
        if (snapshot) {
            actualAppId = snapshot.applicationId;
        } else {
            const workflow = await ApprovalWorkflow.findOne({ $or: [{ _id: targetId }, { applicationId: targetId }] }).session(session);
            if (workflow) actualAppId = workflow.applicationId;
        }

        if (!actualAppId && mongoose.Types.ObjectId.isValid(targetId)) {
             const directApp = await AppModel.findById(targetId).session(session);
             if (directApp) actualAppId = directApp._id;
        }

        if (!actualAppId) {
            await safeAbortTransaction(session);
            return res.status(404).json({ success: false, message: 'Application or approval record not found' });
        }

        let approval = await ApprovalWorkflow.findOne({ entityId: actualAppId, entityType: 'Application' }).session(session);
        if (!approval) {
            approval = new ApprovalWorkflow({
                entityType: 'Application',
                entityId: actualAppId,
                status: 'PENDING'
            });
            await approval.save({ session });
        }

        const appRec = await AppModel.findById(actualAppId).session(session);
        if (!appRec) {
            await safeAbortTransaction(session);
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        
        // Update statuses
        appRec.status = 'RESUBMISSION_REQUIRED';
        appRec.adminRemarks = issues;
        appRec.resubmissionToken = token;
        await appRec.save({ session });

        approval.status = 'RESUBMISSION_REQUIRED';
        approval.rejectionReason = issues;
        await approval.save({ session });

        await PendingApproval.findOneAndUpdate(
            { applicationId: actualAppId },
            { status: 'RESUBMISSION_REQUIRED', adminRemarks: issues },
            { session }
        );

        const customer = await Customer.findById(appRec.customerId).session(session);
        
        // Notifications & Audit
        await new Notification({
            customerId: appRec.customerId,
            applicationId: appRec._id,
            title: 'Resubmission Required',
            message: `Your application ${appRec.referenceId} needs correction. Issues: ${issues}`,
            type: 'WARNING'
        }).save({ session });

        await new AuditLog({
            actorType: 'ADMIN',
            actorId: req.user?.id,
            action: 'RESEND_FOR_CORRECTION',
            entityType: 'Application',
            entityId: appRec._id,
            metadata: { referenceId: appRec.referenceId, issues }
        }).save({ session });

        await safeCommitTransaction(session);
        if (session) session.endSession();

        // Send Email (Non-blocking)
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Default Vite port
        const resubmissionLink = `${baseUrl}/company/nf-plantation/application/edit/${actualAppId}?token=${token}`;

        sendApplicationCorrectionEmail({
            email: customer.email,
            customerName: customer.fullName,
            referenceId: appRec.referenceId,
            remarks: issues,
            resubmissionLink
        }).catch(err => console.error('[Email Error] Failed to send resubmission email:', err));

        res.json({ success: true, message: 'Application sent back for correction' });

    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        if (session) session.endSession();
        next(error);
    }
};

// @desc    Reject application
exports.rejectApprovalRequest = async (req, res, next) => {
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);

    try {
        const { id: targetId } = req.params;
        const { reason } = req.body;

        // Resolve ID
        let applicationId;
        const snapshot = await PendingApproval.findOne({ $or: [{ _id: targetId }, { applicationId: targetId }] }).session(session);
        if (snapshot) {
            applicationId = snapshot.applicationId;
        } else {
            const workflow = await ApprovalWorkflow.findOne({ $or: [{ _id: targetId }, { applicationId: targetId }] }).session(session);
            if (workflow) applicationId = workflow.applicationId;
        }

        if (!applicationId && mongoose.Types.ObjectId.isValid(targetId)) {
             const directApp = await AppModel.findById(targetId).session(session);
             if (directApp) applicationId = directApp._id;
        }

        if (!applicationId) {
            await safeAbortTransaction(session);
            return res.status(404).json({ success: false, message: 'Application or workflow not found' });
        }

        let approval = await ApprovalWorkflow.findOne({ entityId: applicationId, entityType: 'Application' }).session(session);
        if (!approval) {
            approval = new ApprovalWorkflow({
                entityType: 'Application',
                entityId: applicationId,
                status: 'PENDING'
            });
            await approval.save({ session });
        }

        const appRec = await AppModel.findById(applicationId).session(session);
        if (!appRec) {
            await safeAbortTransaction(session);
            return res.status(404).json({ success: false, message: 'Application record missing' });
        }

        approval.status = WORKFLOW_STATUS.REJECTED;
        approval.rejectionReason = reason;
        approval.rejectedAt = new Date();
        await approval.save({ session });

        appRec.status = 'REJECTED';
        appRec.adminRemarks = reason;
        await appRec.save({ session });

        await PendingApproval.findOneAndUpdate({ applicationId }, { status: 'REJECTED', adminRemarks: reason }, { session });

        await safeCommitTransaction(session);
        if (session) session.endSession();

        res.json({ success: true, message: 'Application rejected' });

        const customer = await Customer.findById(appRec.customerId);
        sendApplicationRejectionEmail({
            email: customer.email,
            name: customer.fullName,
            referenceId: appRec.referenceId,
            reason
        }).catch(err => console.error('[Email Error]', err));

    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        if (session) session.endSession();
        next(error);
    }
};

// @desc    Get rejected and resubmission_required applications
exports.getRejectedApplications = async (req, res, next) => {
    try {
        const rejectedWorkflows = await ApprovalWorkflow.aggregate([
            { $match: { status: { $in: ['REJECTED', 'RESUBMISSION_REQUIRED'] } } },
            {
                $lookup: {
                    from: 'applications',
                    localField: 'applicationId',
                    foreignField: '_id',
                    as: 'application'
                }
            },
            { $unwind: '$application' },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'application.customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $project: {
                    customerName: '$customer.fullName',
                    referenceId: '$application.referenceId',
                    applicationDate: '$application.applicationDate',
                    rejectedDate: '$rejectedAt',
                    rejectionReason: '$rejectionReason',
                    status: '$status'
                }
            },
            { $sort: { rejectedDate: -1 } }
        ]);

        res.json({
            success: true,
            count: rejectedWorkflows.length,
            data: rejectedWorkflows
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all completed application history (Approved/Rejected)
exports.getApprovalHistory = async (req, res, next) => {
    try {
        const history = await AppModel.aggregate([
            { $match: { status: { $in: ['APPROVED', 'REJECTED'] } } },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $lookup: {
                    from: 'approvalworkflows',
                    localField: '_id',
                    foreignField: 'entityId',
                    as: 'workflow'
                }
            },
            { $unwind: { path: '$workflow', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    applicationId: '$_id',
                    id: '$_id',
                    customerName: '$customer.fullName',
                    customerEmail: '$customer.email',
                    referenceId: '$referenceId',
                    branch: '$preferredBranch',
                    status: '$status',
                    submittedAt: '$applicationDate',
                    completedAt: { $ifNull: ['$workflow.approvedAt', '$workflow.rejectedAt', '$updatedAt'] },
                }
            },
            { $sort: { completedAt: -1 } }
        ]);

        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        next(error);
    }
};

exports.getApprovalDetails = async (req, res, next) => {
    try {
        const { id: targetId } = req.params;
        console.log('[DEBUG] Opening Details for ID:', targetId);

        if (!mongoose.Types.ObjectId.isValid(targetId)) {
             return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        // 1. Find Application Identifier and Snapshot
        let appIdentifier;
        let appSnapshot = await PendingApproval.findOne({ 
            $or: [{ _id: targetId }, { applicationId: targetId }] 
        });

        if (appSnapshot) {
            appIdentifier = appSnapshot.applicationId;
        } else {
            // Fallback: Check ApprovalWorkflow
            const approvalRec = await ApprovalWorkflow.findOne({ 
                $or: [{ _id: targetId }, { applicationId: targetId }] 
            });
            if (approvalRec) {
                appIdentifier = approvalRec.applicationId;
            } else {
                // Final fallback: Check Application model directly
                const directApp = await AppModel.findById(targetId);
                if (directApp) {
                    appIdentifier = directApp._id;
                }
            }
        }

        if (!appIdentifier) {
            return res.status(404).json({ 
                success: false, 
                message: 'Approval record not found for ID: ' + targetId 
            });
        }

        // 2. Fetch all related details
        const [appData, appAddr, appVerif, appDocs, approvalRec] = await Promise.all([
            AppModel.findById(appIdentifier),
            ApplicationAddress.findOne({ applicationId: appIdentifier }),
            ApplicationVerification.findOne({ applicationId: appIdentifier }),
            ApplicationDocument.find({ applicationId: appIdentifier }),
            ApprovalWorkflow.findOne({ applicationId: appIdentifier })
        ]);

        if (!appSnapshot) {
            appSnapshot = await PendingApproval.findOne({ applicationId: appIdentifier });
        }
        
        let finalDocs = appDocs;
        if (!finalDocs || finalDocs.length === 0) {
            finalDocs = await ApplicationDocument.find({ applicationId: appIdentifier.toString() });
        }

        if (!appData) return res.status(404).json({ success: false, message: 'Application details not found' });

        const custRec = await Customer.findById(appData.customerId);

        const protocol = req.protocol;
        const host = req.get('host');
        let baseUrl = `${protocol}://${host}`;
        
        // Normalize local development URLs to ensure cross-browser compatibility
        if (baseUrl.includes('127.0.0.1') || baseUrl.includes('localhost')) {
            baseUrl = process.env.BACKEND_URL || baseUrl;
        }

        const fixUrl = (url) => {
            if (!url || typeof url !== 'string') return url;
            if (url.startsWith('data:image')) return url;
            if (url.startsWith('http')) {
                if (url.includes('.amazonaws.com/')) {
                    const parts = url.split('.amazonaws.com/');
                    if (parts.length > 1) {
                        return `${baseUrl}/api/admin/view-document?key=${parts[1]}`;
                    }
                }
                return url;
            }

            // If it's a raw S3 key
            if (url.startsWith('pending/') || url.startsWith('verified/') || url.includes('nicFront-') || url.includes('nicBack-')) {
                return `${baseUrl}/api/admin/view-document?key=${url}`;
            }

            return url;
        };

        const recursiveFix = (obj) => {
            if (!obj || typeof obj !== 'object') return obj;
            
            if (Array.isArray(obj)) {
                return obj.map(item => recursiveFix(item));
            }

            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                const isUrlKey = typeof value === 'string' && (key.toLowerCase().includes('url') || key.toLowerCase().includes('path') || key === 'signature' || key === 's3Key');
                const isS3Value = typeof value === 'string' && (value.startsWith('pending/') || value.startsWith('verified/'));
                
                if (isUrlKey || isS3Value) {
                    result[key] = fixUrl(value);
                } else if (typeof value === 'object') {
                    result[key] = recursiveFix(value);
                } else {
                    result[key] = value;
                }
            }
            return result;
        };

        const responseData = {
            application: appData,
            customer: custRec,
            address: appAddr,
            verification: appVerif,
            verificationSummary: {
                isPhoneVerified: appVerif?.phoneOtpVerified || false,
                isEmailVerified: appVerif?.emailOtpVerified || false,
                otpVerificationStatus: (appVerif?.phoneOtpVerified && appVerif?.emailOtpVerified) ? 'VERIFIED' : 'PENDING',
                kycStatus: (appVerif?.phoneOtpVerified && appVerif?.emailOtpVerified) ? 'VERIFIED' : 'PENDING',
                customerVerificationStatus: (appVerif?.phoneOtpVerified && appVerif?.emailOtpVerified) ? 'VERIFIED' : 'PENDING',
            },
            documents: finalDocs,
            approval: approvalRec,
            snapshot: appSnapshot,
            signature: appSnapshot ? appSnapshot.signature : null
        };

        const finalizedData = recursiveFix(JSON.parse(JSON.stringify(responseData)));
        
        // Ensure core fields are at top level for Flutter model simplicity
        if (appSnapshot) {
            finalizedData.dob = appSnapshot.dob;
            finalizedData.gender = appSnapshot.gender;
            finalizedData.phone = appSnapshot.phone;
            finalizedData.address = appSnapshot.address;
            finalizedData.city = appSnapshot.city;
            finalizedData.district = appSnapshot.district;
            finalizedData.province = appSnapshot.province;
            finalizedData.fullName = appSnapshot.fullName;
            finalizedData.nic = appSnapshot.nic;
        }

        res.json({
            success: true,
            data: finalizedData
        });
    } catch (error) {
        console.error('[ERROR STACK] in getApprovalDetails:', error.stack);
        next(error);
    }
};

exports.updateApprovalStatus = async (req, res, next) => {
    try {
        const { status, reason } = req.body;
        if (status === 'APPROVED') return exports.approveApprovalRequest(req, res, next);
        if (status === 'REJECTED') return exports.rejectApprovalRequest(req, res, next);
        if (status === 'RESUBMISSION_REQUIRED') {
            req.body.issues = reason;
            return exports.resendApplication(req, res, next);
        }
        return res.status(400).json({ success: false, message: 'Status must be APPROVED, REJECTED, or RESUBMISSION_REQUIRED.' });
    } catch (error) {
        next(error);
    }
};

/**
 * Proxy S3 documents for display in admin dashboard (bypasses S3 private access)
 */
exports.proxyS3Document = async (req, res, next) => {
    try {
        const { key } = req.query;
        if (!key) return res.status(400).send('Key is required');

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        });

        const { Body, ContentType } = await s3.send(command);
        
        if (ContentType) res.setHeader('Content-Type', ContentType);
        
        // Body is a stream in AWS SDK v3
        Body.pipe(res);
    } catch (error) {
        console.error('[S3 Proxy Error]', error.message);
        res.status(500).send('Failed to fetch document from storage');
    }
};
