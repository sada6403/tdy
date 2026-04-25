const CustomerInvestment = require('../models/CustomerInvestment');
const InvestmentPlan = require('../models/InvestmentPlan');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const DepositRequest = require('../models/DepositRequest');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const mongoose = require('mongoose');
const { sendInvestmentActivationEmail } = require('../utils/emailService');
const { sendSms } = require('../utils/smsService');
const ApplicationAddress = require('../models/ApplicationAddress');
const ApplicationDocument = require('../models/ApplicationDocument');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const ApplicationOtp = require('../models/ApplicationOtp');
const AuditLog = require('../models/AuditLog');
const { getSafeSession, safeStartTransaction, safeCommitTransaction, safeAbortTransaction } = require('../utils/transactionHelper');

const otpService = require('../services/auth/otpService');

exports.sendInvestmentOtp = async (req, res, next) => {
    try {
        const user = req.user;
        const customer = req.customer || await Customer.findOne({ userId: user._id });
        const identifier = (customer && customer.mobile) ? customer.mobile : user.phone;

        const result = await otpService.generateAndSendOtp({
            userId: user._id,
            customerId: customer ? customer._id : user.customerId,
            email: user.email,
            phone: identifier,
            purpose: 'PLAN_ACTIVATION',
            channels: ['SMS'],
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({ success: true, message: `OTP sent to ${identifier ? 'your registered mobile number' : 'your email'}` });
    } catch (error) {
        res.status(429).json({ success: false, message: error.message });
    }
};

exports.verifyInvestmentOtp = async (req, res, next) => {
    try {
        const { otp } = req.body;
        const user = req.user;
        const customer = req.customer || await Customer.findOne({ userId: user._id });
        const identifier = (customer && customer.mobile) ? customer.mobile : user.phone;

        const result = await otpService.verifyOtp({
            identifier: identifier,
            purpose: 'PLAN_ACTIVATION',
            otpInput: otp,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.createInvestment = async (req, res, next) => {
    const mongoose = require('mongoose');
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);
    try {
        const { planId, amountInvested, profitDestination, rulesAccepted, signatureConfirmed, signatureData, note } = req.body;
        
        const user = req.user;
        const customer = req.customer || await Customer.findOne({ 
            $or: [{ _id: user.customerId }, { email: user.email }, { mobile: user.phone }] 
        }).session(session);
        
        if (!customer) {
            throw new Error('Customer profile not found');
        }

        const Wallet = require('../models/Wallet');
        const wallet = await Wallet.findOne({ customerId: customer._id }).session(session);
        
        if (!wallet) {
            throw new Error('Wallet not configured.');
        }

        if (amountInvested > wallet.availableBalance) {
            throw new Error('Insufficient Safe Withdrawable Amount in Wallet.');
        }

        const plan = await InvestmentPlan.findById(planId).session(session);
        if (!plan || plan.status !== 'ACTIVE') {
            throw new Error('Investment Plan not found or inactive');
        }

        if (amountInvested < 100000 || amountInvested < plan.minAmount) {
            throw new Error(`Minimum investment is Rs. 100,000`);
        }

        if (!profitDestination || !['BANK', 'WALLET'].includes(profitDestination)) {
            throw new Error('Valid profit destination option is mandatory.');
        }

        if (!rulesAccepted || !signatureConfirmed) {
            throw new Error('You must explicitly agree to the plan rules and verify your signature.');
        }

        // Generate Reference
        const referenceNumber = 'FD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        const investment = await CustomerInvestment.create([{
            customerId: customer._id,
            planId: plan._id,
            planName: plan.name,
            durationMonths: plan.duration,
            monthlyROI: plan.interestRate,
            investedAmount: amountInvested,
            monthlyProfit: (amountInvested * plan.interestRate) / 100,
            profitDestination,
            rulesAccepted,
            signatureConfirmed,
            signatureData: signatureData || null,
            note,
            referenceNumber,
            status: 'PENDING_ACTIVATION_APPROVAL'
        }], { session });

        // HOLD FUNDS: Move from available to held
        wallet.availableBalance -= amountInvested;
        wallet.heldBalance = (wallet.heldBalance || 0) + amountInvested;
        await wallet.save({ session });

        // Record Audit Log for tracing
        await AuditLog.create([{
            actorType: 'CUSTOMER',
            actorId: user._id,
            action: 'CREATE_INVESTMENT',
            entityType: 'CustomerInvestment',
            entityId: investment[0]._id,
            metadata: { referenceNumber, amount: amountInvested }
        }], { session });

        await safeCommitTransaction(session);

        // Dispatch Confirmation Email with PDF
        try {
            await sendInvestmentActivationEmail({
                email: customer.email,
                customerName: customer.fullName,
                referenceNumber,
                amount: amountInvested,
                planName: plan.name,
                duration: plan.duration,
                roi: plan.interestRate,
                profitDestination,
                bankName: customer.bankName,
                accountNumber: customer.accountNumber,
                userId: customer.userId
            });
        } catch (mailError) {
            console.error('Failed to send investment confirmation email:', mailError);
        }

        // Dashboard Notification
        try {
            const Notification = require('../models/Notification');
            await Notification.create({
                userId: user._id,
                customerId: customer._id,
                title: 'Investment Activation Requested',
                message: `Congratulations! Your investment of LKR ${Number(amountInvested).toLocaleString()} in "${plan.title}" has been submitted successfully. Reference: ${referenceNumber}. Pending admin approval.`,
                type: 'SUCCESS'
            });
        } catch (notifError) {
            console.error('Failed to create dashboard notification:', notifError);
        }

        // SMS Congratulations
        try {
            const phone = customer.mobile || customer.phone;
            if (phone) {
                await sendSms(phone, `Congratulations! Your FD investment of LKR ${Number(amountInvested).toLocaleString()} in ${plan.title} has been submitted. Ref: ${referenceNumber}. Pending approval. - NF Plantation`);
            }
        } catch (smsError) {
            console.error('Failed to send investment SMS:', smsError);
        }

        res.status(201).json({
            success: true, 
            message: 'FD Plan Activation requested successfully. Funds are now HELD pending validation.', 
            data: investment[0]
        });

    } catch (error) {
        await safeAbortTransaction(session);
        if (error.message.includes('Customer profile') || error.message.includes('Wallet') || error.message.includes('Insufficient') || error.message.includes('Investment Plan') || error.message.includes('Minimum investment') || error.message.includes('Valid profit') || error.message.includes('explicitly agree')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    } finally {
        if (session) session.endSession();
    }
};

exports.rejectInvestment = async (req, res, next) => {
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const investment = await CustomerInvestment.findById(id).session(session);
        
        if (!investment || investment.status !== 'PENDING_ACTIVATION_APPROVAL') {
            throw new Error('Investment request not found or not in pending state');
        }

        const wallet = await Wallet.findOne({ customerId: investment.customerId }).session(session);
        
        // Restore Funds from Held to Available
        if (wallet) {
            wallet.heldBalance = Math.max(0, (wallet.heldBalance || 0) - investment.investedAmount);
            wallet.availableBalance += investment.investedAmount;
            await wallet.save({ session });
        }

        investment.status = 'REJECTED';
        investment.rejectionReason = reason;
        await investment.save({ session });

        await safeCommitTransaction(session);
        res.json({ success: true, message: 'Investment request rejected and funds restored' });
    } catch (error) {
        await safeAbortTransaction(session);
        next(error);
    } finally {
        if (session) session.endSession();
    }
};

exports.getMyInvestments = async (req, res, next) => {
    try {
        const user = req.user;
        const customer = req.customer || await Customer.findOne({ 
            $or: [{ _id: user.customerId }, { email: user.email }, { mobile: user.phone }] 
        });
        
        if (!customer) {
            return res.json({ success: true, count: 0, data: [] });
        }

        const results = await CustomerInvestment.find({ customerId: customer._id })
            .populate('planId')
            .sort({ createdAt: -1 });

        const formatted = results.map(inv => ({
            ...inv._doc,
            plan_name: inv.planId?.name || inv.planName
        }));

        res.json({ success: true, count: formatted.length, data: formatted });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Submit a new deposit request (Add Cash)
 * @route   POST /api/customer/deposit-request
 */
exports.submitDepositRequest = async (req, res, next) => {
    try {
        const { amount, referenceNumber, note } = req.body;
        const user = req.user;
        
        const customer = req.customer || await Customer.findOne({ 
            $or: [{ _id: user.customerId }, { email: user.email }, { mobile: user.phone }] 
        });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer record not found for this user' });
        }

        // Check for duplicate reference number
        const existingRequest = await DepositRequest.findOne({ referenceNumber: (referenceNumber || '').trim().toUpperCase() });
        if (existingRequest) {
            return res.status(409).json({ success: false, message: 'This reference number has already been used' });
        }

        // Handle File Upload Metadata (from Multer-S3)
        if (!req.files || !req.files.bankProof) {
            return res.status(400).json({ success: false, message: 'Bank slip/payment proof is required' });
        }

        const proofFile = req.files.bankProof[0];
        
        const deposit = await DepositRequest.create({
            customerId: customer._id,
            amount: Number(amount),
            referenceNumber: referenceNumber.trim().toUpperCase(),
            nic: customer.nic, // Required by model
            receiptFile: proofFile.location, // S3 URL (Model field name check: receiptFile)
            note: note || '',
            status: 'PENDING'
        });

        res.status(201).json({ 
            success: true, 
            message: 'Deposit request submitted successfully! Our team will verify it soon.',
            data: deposit 
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get deposit request history
 * @route   GET /api/customer/deposit-history
 */
exports.getDepositHistory = async (req, res, next) => {
    try {
        const user = req.user;
        const customer = req.customer || await Customer.findOne({ 
            $or: [{ _id: user.customerId }, { email: user.email }, { mobile: user.phone }] 
        });
        
        if (!customer) {
            return res.json({ success: true, count: 0, data: [] });
        }

        const history = await DepositRequest.find({ customerId: customer._id })
            .sort({ createdAt: -1 });

        res.json({ success: true, count: history.length, data: history });
    } catch (error) {
        next(error);
    }
};


/**
 * @desc    Submit a new withdrawal request
 * @route   POST /api/customer/withdrawal-request
 */
exports.submitWithdrawalRequest = async (req, res, next) => {
    const mongoose = require('mongoose');
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);
    try {
        const { amount, bankName, accountName, accountNumber, branchName, reason, note } = req.body;
        const user = req.user;
        const Wallet = require('../models/Wallet');
        const Transaction = require('../models/Transaction');
        
        const customer = req.customer || await Customer.findOne({ 
            $or: [{ _id: user.customerId }, { email: user.email }, { mobile: user.phone }] 
        }).session(session);
        if (!customer) throw new Error('Customer record not found for this user');

        const wallet = await Wallet.findOne({ customerId: customer._id }).session(session);
        if (!wallet) throw new Error('Wallet not found for customer');

        // Validate balance
        const withdrawAmount = Number(amount);
        if (withdrawAmount <= 0) throw new Error('Invalid withdrawal amount');
        if (withdrawAmount > wallet.availableBalance) {
            throw new Error('Insufficient wallet balance for this withdrawal. Please allow pending transactions to clear.');
        }

        // Apply Wallet HOLD Logic
        const availableBefore = wallet.availableBalance;
        const heldBefore = wallet.heldBalance;
        const totalBefore = wallet.totalBalance;

        wallet.availableBalance -= withdrawAmount;
        wallet.heldBalance += withdrawAmount;
        // totalBalance is unchanged = available + held
        wallet.totalBalance = wallet.availableBalance + wallet.heldBalance;
        await wallet.save({ session });

        // Record Request
        const withdrawal = await WithdrawalRequest.create([{
            customerId: customer._id,
            walletId: wallet._id,
            amount: withdrawAmount,
            bankName,
            accountName,
            accountNumber,
            branchName,
            reason,
            notes: note || '',
            status: 'PENDING',
            statusHistory: [{ status: 'PENDING', remark: 'Request Submitted by Customer' }]
        }], { session });

        // Record Holding Transaction Ledger Audit
        await Transaction.create([{
            customerId: customer._id,
            walletId: wallet._id,
            type: 'HOLD',
            referenceType: 'WITHDRAWAL',
            referenceId: withdrawal[0]._id,
            amount: withdrawAmount,
            status: 'COMPLETED',
            description: `Funds placed on hold for withdrawal request`,
            balanceBefore: totalBefore,
            balanceAfter: wallet.totalBalance,
            availableBefore: availableBefore,
            availableAfter: wallet.availableBalance,
            heldBefore: heldBefore,
            heldAfter: wallet.heldBalance,
            createdBy: user._id
        }], { session });

        await AuditLog.create([{
            actorType: 'CUSTOMER',
            actorId: user._id,
            action: 'SUBMIT_WITHDRAWAL',
            entityType: 'WithdrawalRequest',
            entityId: withdrawal[0]._id,
            metadata: { amount: withdrawAmount, currency: 'LKR' }
        }], { session });

        await safeCommitTransaction(session);

        res.status(201).json({ 
            success: true, 
            message: 'Withdrawal request submitted! Our finance team will review it within 24-48 hours.',
            data: withdrawal[0]
        });

    } catch (error) {
        await safeAbortTransaction(session);
        if (error.message.includes('Customer record') || error.message.includes('Insufficient') || error.message.includes('Invalid')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    } finally {
        if (session) session.endSession();
    }
};

/**
 * @desc    Get withdrawal request history
 * @route   GET /api/customer/withdrawal-history
 */
exports.getWithdrawalHistory = async (req, res, next) => {
    try {
        const user = req.user;
        const customer = req.customer || await Customer.findOne({ 
            $or: [{ _id: user.customerId }, { email: user.email }, { mobile: user.phone }] 
        });
        
        if (!customer) {
            return res.json({ success: true, count: 0, data: [] });
        }

        const history = await WithdrawalRequest.find({ customerId: customer._id })
            .sort({ createdAt: -1 });

        res.json({ success: true, count: history.length, data: history });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get detailed withdrawal request stats
 * @route   GET /api/customer/withdrawal-request/:id
 */
exports.getWithdrawalDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const withdrawal = await WithdrawalRequest.findById(id).populate('customerId', 'fullName email phone');
        if (!withdrawal) return res.status(404).json({ success: false, message: 'Request not found' });
        res.json({ success: true, data: withdrawal });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Edit a pending withdrawal request
 * @route   PUT /api/customer/withdrawal-request/:id/edit
 */
exports.editWithdrawalRequest = async (req, res, next) => {
    const mongoose = require('mongoose');
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);
    try {
        const { id } = req.params;
        const { amount, bankName, accountName, accountNumber, branchName, reason, note } = req.body;

        const withdrawal = await WithdrawalRequest.findById(id).session(session);
        if (!withdrawal || withdrawal.status !== 'PENDING') {
            throw new Error('Only PENDING requests can be edited');
        }

        const wallet = await Wallet.findOne({ customerId: withdrawal.customerId }).session(session);
        const oldAmount = withdrawal.amount;
        const newAmount = Number(amount);
        
        if (newAmount !== oldAmount) {
            const difference = newAmount - oldAmount; // positive if increasing withdrawal
            if (difference > wallet.availableBalance) {
                throw new Error('Insufficient wallet balance for this adjustment');
            }
            wallet.availableBalance -= difference;
            wallet.heldBalance += difference;
            wallet.totalBalance = wallet.availableBalance + wallet.heldBalance;
            await wallet.save({ session });
        }

        withdrawal.amount = newAmount;
        if(bankName) withdrawal.bankName = bankName;
        if(accountName) withdrawal.accountName = accountName;
        if(accountNumber) withdrawal.accountNumber = accountNumber;
        if(branchName) withdrawal.branchName = branchName;
        if(reason) withdrawal.reason = reason;
        if(note) withdrawal.notes = note;
        withdrawal.statusHistory.push({ status: 'PENDING', remark: 'Request Edited by Customer' });
        
        await withdrawal.save({ session });
        await safeCommitTransaction(session);

        res.json({ success: true, message: 'Withdrawal request updated successfully', data: withdrawal });
    } catch (error) {
        await safeAbortTransaction(session);
        next(error);
    } finally {
        if (session) session.endSession();
    }
};

/**
 * @desc    Cancel a withdrawal request (returns funds)
 * @route   POST /api/customer/withdrawal-request/:id/cancel
 */
exports.cancelWithdrawalRequest = async (req, res, next) => {
    const mongoose = require('mongoose');
    const Transaction = require('../models/Transaction');
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);
    try {
        const { id } = req.params;
        const withdrawal = await WithdrawalRequest.findById(id).session(session);
        
        if (!withdrawal) throw new Error('Request not found');
        if (!['PENDING', 'UNDER_REVIEW'].includes(withdrawal.status)) {
            throw new Error('Request has advanced past the cancellation threshold');
        }

        const wallet = await Wallet.findOne({ customerId: withdrawal.customerId }).session(session);
        
        const availableBefore = wallet.availableBalance;
        const totalBefore = wallet.totalBalance;
        const heldBefore = wallet.heldBalance;

        // Restore Held Balance to Available Balance
        wallet.heldBalance = Math.max(0, (wallet.heldBalance || 0) - withdrawal.amount);
        wallet.availableBalance += withdrawal.amount;
        // totalBalance is unchanged = available + held
        wallet.totalBalance = wallet.availableBalance + wallet.heldBalance;
        await wallet.save({ session });

        const { reason } = req.body;
        withdrawal.status = 'CANCELLED';
        withdrawal.cancelledReason = reason || 'Cancelled by Customer';
        withdrawal.statusHistory.push({ status: 'CANCELLED', remark: reason || 'Cancelled safely by customer' });
        await withdrawal.save({ session });

        await Transaction.create([{
            customerId: withdrawal.customerId,
            walletId: wallet._id,
            type: 'RELEASE',
            referenceType: 'WITHDRAWAL',
            referenceId: withdrawal._id,
            amount: withdrawal.amount,
            status: 'COMPLETED',
            description: 'Funds released from hold (Customer Cancellation)',
            balanceBefore: totalBefore,
            balanceAfter: wallet.totalBalance,
            availableBefore: availableBefore,
            availableAfter: wallet.availableBalance,
            heldBefore: heldBefore,
            heldAfter: wallet.heldBalance,
            createdBy: req.user._id
        }], { session });

        await safeCommitTransaction(session);
        res.json({ success: true, message: 'Withdrawal request cancelled successfully. Funds restored.' });
    } catch (error) {
        await safeAbortTransaction(session);
        next(error);
    } finally {
        if (session) session.endSession();
    }
};

/**
 * @desc    Download standard placeholder proof
 * @route   GET /api/customer/withdrawal-request/:id/proof
 */
exports.downloadWithdrawalProof = async (req, res, next) => {
    // Basic mock implementation. Can integrate real PDF later.
    try {
        const { id } = req.params;
        const withdrawal = await WithdrawalRequest.findById(id);
        if (!withdrawal) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        res.json({
            success: true,
            message: 'Proof receipt generated successfully.',
            receiptData: {
                id: withdrawal._id,
                reference: withdrawal.referenceNumber,
                amount: withdrawal.amount,
                status: withdrawal.status,
                bank: withdrawal.bankName,
                createdAt: withdrawal.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get complete customer profile (details + wallet)
 * @route   GET /api/customer/profile
 */
exports.getProfile = async (req, res, next) => {
    try {
        const User = require('../models/User');
        const Wallet = require('../models/Wallet');
        const Application = require('../models/Application');
        const PendingApproval = require('../models/PendingApproval');

        const user = await User.findById(req.user.id);
        if (!user) return res.status(401).json({ success: false, message: 'Session invalid' });

        let customer = null;

        if (user.customerId) {
            customer = await Customer.findById(user.customerId).populate('agentId');
        }
        if (!customer) {
            customer = await Customer.findOne({
                $or: [{ email: user.email }, { userId: user.userId }, { mobile: user.phone }]
            }).populate('agentId');
        }
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer profile not found' });
        }

        let wallet = await Wallet.findOne({ customerId: customer._id });
        if (!wallet) {
            wallet = new Wallet({ customerId: customer._id });
            await wallet.save();
        }

        const app = await Application.findOne({ customerId: customer._id }).sort({ createdAt: -1 });

        // Fetch the PendingApproval snapshot — has dob, gender, address from registration
        const snapshot = app ? await PendingApproval.findOne({ applicationId: app._id }) : null;

        let needsSave = false;

        // ── Address ──
        const addrObj = customer.address;
        const hasAddrInCustomer = addrObj?.line1 || addrObj?.city || addrObj?.district;
        let finalAddress = '';
        if (hasAddrInCustomer) {
            finalAddress = [addrObj.line1, addrObj.city, addrObj.district, addrObj.province]
                .filter(Boolean).join(', ');
        } else {
            // Try snapshot first, then ApplicationAddress
            const src = (snapshot?.address || snapshot?.city) ? snapshot : null;
            if (src) {
                finalAddress = [src.address?.replace(/\r\n|\r|\n/g, ' ').trim(), src.city, src.district, src.province].filter(Boolean).join(', ');
                customer.address = { line1: src.address || '', city: src.city || '', district: src.district || '', province: src.province || '' };
                needsSave = true;
            } else if (app) {
                const addressDoc = await ApplicationAddress.findOne({ applicationId: app._id });
                if (addressDoc) {
                    const cleanAddr = addressDoc.permanentAddress?.replace(/\r\n|\r|\n/g, ' ').trim() || '';
                    finalAddress = [cleanAddr, addressDoc.city, addressDoc.district, addressDoc.province].filter(Boolean).join(', ');
                    customer.address = { line1: cleanAddr, city: addressDoc.city || '', district: addressDoc.district || '', province: addressDoc.province || '' };
                    needsSave = true;
                }
            }
        }

        // ── DOB ──
        let finalDob = customer.dob || null;
        if (!finalDob && snapshot?.dob) {
            finalDob = snapshot.dob;
            customer.dob = finalDob;
            needsSave = true;
        }

        // ── Gender ──
        let finalGender = customer.gender || '';
        if (!finalGender && snapshot?.gender) {
            finalGender = snapshot.gender;
            customer.gender = finalGender;
            needsSave = true;
        }

        // ── Photo ──
        let finalPhoto = customer.photoUrl || user.photoUrl || '';

        // Re-finalize if still a pending S3 URL
        if (finalPhoto && finalPhoto.includes('/pending/')) {
            const { finalizeS3File } = require('../utils/s3Service');
            const s3Key = finalPhoto.split('.amazonaws.com/')[1];
            if (s3Key) {
                const moved = await finalizeS3File(s3Key).catch(() => null);
                if (moved?.url) {
                    finalPhoto = moved.url;
                } else {
                    // File might already be in verified/ — just fix the URL
                    finalPhoto = finalPhoto.replace('/pending/', '/verified/');
                }
                customer.photoUrl = finalPhoto;
                needsSave = true;
            }
        }

        // Pull from ApplicationDocument if still no photo
        if (!finalPhoto && app) {
            const photoDoc = await ApplicationDocument.findOne({ applicationId: app._id, documentType: 'photo' });
            if (photoDoc?.fileUrl) {
                finalPhoto = photoDoc.fileUrl;
                customer.photoUrl = finalPhoto;
                needsSave = true;
            }
        }

        // One consolidated save for all backfilled fields
        if (needsSave) await customer.save().catch(err => console.warn('[PROFILE_BACKFILL]', err.message));

        const finalBankName = customer.bankDetails?.bankName || app?.bankDetails?.bankName || '';
        const finalBranchName = customer.bankDetails?.branchName || app?.bankDetails?.branchName || '';
        const finalAccountHolder = customer.bankDetails?.accountHolder || app?.bankDetails?.accountHolder || '';
        const finalAccountNumber = customer.bankDetails?.accountNumber || app?.bankDetails?.accountNumber || '';
        const finalMobile = customer.mobile || user.phone || 'N/A';

        res.json({
            success: true,
            data: {
                id:              customer._id,
                customerId:      customer._id,
                fullName:        customer.fullName || user.name || 'N/A',
                name:            customer.fullName || user.name || 'N/A',
                nic:             customer.nic      || '',
                email:           customer.email    || user.email || 'N/A',
                phone:           finalMobile,
                mobile:          finalMobile,
                dob:             finalDob,
                gender:          finalGender,
                address:         finalAddress,
                userId:          user.userId || 'N/A',
                bankName:        finalBankName,
                branchName:      finalBranchName,
                accountHolder:   finalAccountHolder,
                accountNumber:   finalAccountNumber,
                kycStatus:       customer.kycStatus || 'PENDING',
                adminApproved:   customer.kycStatus === 'VERIFIED' || customer.isActive === true,
                photoUrl:        finalPhoto,
                signature:       customer.signature || '',
                applicationStatus: app?.status || 'NOT_FOUND',
                walletBalance:   wallet.availableBalance,
                walletSummary: {
                    totalInvested:  wallet.totalInvested,
                    totalEarned:    wallet.totalEarned,
                    totalWithdrawn: wallet.totalWithdrawn,
                    totalBalance:   wallet.totalBalance,
                    heldBalance:    wallet.heldBalance
                },
                agent: customer.agentId ? {
                    name: customer.agentId.name,
                    contact: customer.agentId.contact,
                    email: customer.agentId.email || null,
                    designation: customer.agentId.designation || 'Field Agent'
                } : null
            }
        });
    } catch (error) {
        next(error);
    }
};
/**
 * @desc    Generate and Download Investment Certificate (PDF)
 * @route   GET /api/customer/my-investments/:id/certificate
 */
exports.downloadInvestmentCertificate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const PDFDocument = require('pdfkit');
        
        const investment = await CustomerInvestment.findById(id).populate('customerId');
        if (!investment) {
            return res.status(404).json({ success: false, message: 'Investment document not found' });
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Set Headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate_${investment.referenceNumber}.pdf`);

        doc.pipe(res);

        // Header Branding
        doc.fillColor('#059669').fontSize(24).text('NF PLANTATION', { align: 'center', bold: true });
        doc.fillColor('#475569').fontSize(10).text('OFFICIAL FIXED DEPOSIT CERTIFICATE', { align: 'center', tracking: 1 });
        doc.moveDown(2);

        // Border
        doc.rect(20, 20, 555, 780).stroke('#cbd5e1');

        // Content
        doc.fillColor('#1e293b').fontSize(12).text('INVESTOR DETAILS', { bold: true });
        doc.rect(50, doc.y + 5, 495, 1).fill('#f1f5f9');
        doc.moveDown(0.5);
        
        doc.fontSize(10).fillColor('#64748b').text('FULL NAME:', 50, doc.y, { continued: true }).fillColor('#0f172a').text(`  ${investment.customerId.fullName}`);
        doc.fontSize(10).fillColor('#64748b').text('NIC NUMBER:', 50, doc.y + 5, { continued: true }).fillColor('#0f172a').text(`  ${investment.customerId.nic}`);
        doc.fontSize(10).fillColor('#64748b').text('USER REFERENCE ID:', 50, doc.y + 5, { continued: true }).fillColor('#0f172a').text(`  ${investment.customerId.userId || 'N/A'}`);
        
        doc.moveDown(2);

        doc.fillColor('#1e293b').fontSize(12).text('CONTRACT PARAMETERS', 50, doc.y, { bold: true });
        doc.rect(50, doc.y + 5, 495, 1).fill('#f1f5f9');
        doc.moveDown(0.5);

        const formatCurrency = (val) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val);
        const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : 'PENDING APPROVAL';

        doc.fontSize(10).fillColor('#64748b').text('PLAN NAME:', 50, doc.y, { continued: true }).fillColor('#0f172a').text(`  ${investment.planName}`);
        doc.fontSize(10).fillColor('#64748b').text('REFERENCE NUMBER:', 50, doc.y + 5, { continued: true }).fillColor('#0f172a').text(`  ${investment.referenceNumber}`);
        doc.fontSize(10).fillColor('#64748b').text('PRINCIPAL CAPITAL:', 50, doc.y + 5, { continued: true }).fillColor('#059669').text(`  ${formatCurrency(investment.investedAmount)}`, { bold: true });
        doc.fontSize(10).fillColor('#64748b').text('MONTHLY ROI:', 50, doc.y + 5, { continued: true }).fillColor('#0f172a').text(`  ${investment.monthlyROI}%`);
        doc.fontSize(10).fillColor('#64748b').text('DURATION:', 50, doc.y + 5, { continued: true }).fillColor('#0f172a').text(`  ${investment.durationMonths} Months`);
        doc.fontSize(10).fillColor('#64748b').text('PROFIT ROUTING:', 50, doc.y + 5, { continued: true }).fillColor('#0f172a').text(`  ${investment.profitDestination}`);

        doc.moveDown(2);

        doc.fillColor('#1e293b').fontSize(12).text('LIFECYCLE TIMELINE', 50, doc.y, { bold: true });
        doc.rect(50, doc.y + 5, 495, 1).fill('#f1f5f9');
        doc.moveDown(0.5);

        doc.fontSize(10).fillColor('#64748b').text('DATE CREATED:', 50, doc.y, { continued: true }).fillColor('#0f172a').text(`  ${formatDate(investment.createdAt)}`);
        doc.fontSize(10).fillColor('#64748b').text('ACTIVATION DATE:', 50, doc.y + 5, { continued: true }).fillColor('#0f172a').text(`  ${formatDate(investment.startDate)}`);
        doc.fontSize(10).fillColor('#64748b').text('MATURITY DATE:', 50, doc.y + 5, { continued: true }).fillColor('#1d4ed8').text(`  ${formatDate(investment.endDate)}`, { bold: true });

        doc.moveDown(4);

        // Verification Section
        doc.fontSize(8).fillColor('#94a3b8').text('DIGITAL VERIFICATION STAMP', { align: 'right' });
        doc.fontSize(6).fillColor('#cbd5e1').text(`${investment._id} | ${investment.status} | SIGNATURE_ON_FILE`, { align: 'right' });

        doc.moveDown(2);
        doc.fontSize(8).fillColor('#64748b').text('This document is electronically generated and serves as a legally binding certificate for the mentioned investment under NF Plantation regulatory protocols. Transfer of funds from wallet to hold state serves as acknowledgment of terms.', { align: 'justify', lineGap: 2 });

        doc.end();

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Send OTP for password change (Authenticated)
 * @route   POST /api/customer/change-password/send-otp
 */
exports.sendChangePasswordOtp = async (req, res, next) => {
    try {
        const { nic } = req.body;
        const user = await User.findById(req.user.id);
        const customer = req.customer || await Customer.findOne({ 
            $or: [{ _id: user.customerId }, { email: user.email }, { mobile: user.phone }] 
        });

        if (!customer || customer.nic !== nic) {
            return res.status(400).json({ success: false, message: 'Identity verification failed. NIC does not match our records.' });
        }

        const result = await otpService.generateAndSendOtp({
            userId: user._id,
            customerId: customer._id,
            email: user.email,
            phone: user.phone,
            purpose: 'CHANGE_PASSWORD',
            channels: ['SMS'],
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({ success: true, message: 'Security OTP sent to your registered mobile number' });
    } catch (error) {
        res.status(429).json({ success: false, message: error.message });
    }
};

exports.updatePasswordWithOtp = async (req, res, next) => {
    try {
        const { otp, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        await otpService.verifyOtp({
            identifier: user.phone,
            purpose: 'CHANGE_PASSWORD',
            otpInput: otp,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        // Hashing is handled by user model pre-save or auth service
        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update Profile Picture
 * @route   POST /api/customer/update-photo
 */
exports.updateProfilePhoto = async (req, res, next) => {
    try {
        console.log("DEBUG: Photo upload request body", req.body);
        console.log("DEBUG: Photo upload file", req.file);

        if (!req.file) {
             console.error("ERROR: No file found in req.file");
             return res.status(400).json({ success: false, message: 'No file uploaded or file filter rejected it.' });
        }
        
        const user = await User.findById(req.user.id);
        const customer = await Customer.findOne({ $or: [{ email: user.email }, { phone: user.phone }] });

        const photoUrl = req.file.location || req.file.url; // Support multiple field names
        console.log("DEBUG: Final photoUrl to save", photoUrl);

        if (customer) {
            customer.photoUrl = photoUrl;
            await customer.save();
            console.log("DEBUG: Customer photoUrl updated");
        }

        // We also want to update the User record to cache it for the Auth initial state
        if (user) {
            user.photoUrl = photoUrl;
            await user.save().catch(err => console.warn("DEBUG: User save photoUrl failed (maybe field missing in schema)", err.message));
        }

        res.json({ success: true, photoUrl, message: 'Profile photo updated successfully!' });
    } catch (error) {
        console.error("ERROR: Profile photo update failed", error);
        next(error);
    }
};
