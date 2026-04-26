const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const Payout = require('../models/Payout');
const CustomerInvestment = require('../models/CustomerInvestment');
const InvestmentPlan = require('../models/InvestmentPlan');
const CustomerGroup = require('../models/CustomerGroup');
const DepositRequest = require('../models/DepositRequest');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcrypt');
const emailService = require('../utils/emailService');
const smsService = require('../utils/smsService');
const Notification = require('../models/Notification');
const { sendDepositApprovalEmail, sendDepositRejectionEmail, sendInvestmentApprovalEmail } = require('../utils/emailService');
const { sendSms } = require('../utils/smsService');
const { finalizeS3File, s3 } = require('../utils/s3Service');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSafeSession, safeStartTransaction, safeCommitTransaction, safeAbortTransaction } = require('../utils/transactionHelper');
const profitEngineService = require('../services/ProfitService');
const ProfitPayoutLog = require('../models/ProfitPayoutLog');

// Safe month addition — prevents overflow (e.g. Jan 31 + 1 month = Feb 28, not Mar 3)
function addMonths(date, months) {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months, 1);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return d;
}

exports.getPayoutSchedules = async (req, res, next) => {
    try {
        const { status } = req.query; // PENDING, COMPLETED, or DUE
        let data = [];
        
        if (status === 'DUE') {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const dueInv = await CustomerInvestment.find({ status: 'ACTIVE', nextProfitDate: { $lte: today } })
                .populate('customerId planId').lean();
            
            data = dueInv.map(inv => {
                let user;
                if (inv.customerId?.email) user = inv.customerId.email;
                return {
                    id: inv._id,
                    customer: inv.customerId?.fullName || 'Unknown',
                    customerId: inv.customerId?.userId || user || 'N/A',
                    plan: inv.planId?.title || 'Unknown',
                    cycle: 'Next Cycle',
                    dueDate: inv.nextProfitDate,
                    amount: inv.investedAmount * ((inv.planId?.interestRate || 0)/100/12), // approximate calculation
                    destination: inv.profitDestination,
                    status: 'DUE',
                    isProjected: true
                };
            });
        } else {
            const filter = status ? { status } : {};
            const logs = await ProfitPayoutLog.find(filter)
                .populate({ path: 'investmentId', populate: { path: 'planId' } })
                .populate('customerId')
                .sort({ createdAt: -1 })
                .lean();

            data = logs.map(log => ({
                id: log._id,
                customer: log.customerId?.fullName || 'Unknown',
                customerId: log.customerId?.userId || 'N/A',
                plan: log.investmentId?.planId?.title || 'Unknown',
                cycle: log.cycleMonth,
                dueDate: log.createdAt,
                amount: log.amountCalculated,
                destination: log.profitDestination,
                status: log.status,
                isProjected: false
            }));
        }

        res.json({ success: true, count: data.length, data });
    } catch (error) {
        next(error);
    }
};

exports.getPayoutDetail = async (req, res, next) => {
    try {
        const { id } = req.params;
        const log = await ProfitPayoutLog.findById(id)
            .populate({ path: 'investmentId', populate: { path: 'planId' } })
            .populate('customerId')
            .lean();
        
        if (!log) return res.status(404).json({ success: false, message: 'Payout Log not found' });
        
        res.json({ success: true, data: log });
    } catch (error) {
        next(error);
    }
};

exports.runMonthlyPayouts = async (req, res, next) => {
    try {
        // Run daily payouts synchronously to wait for result and return metrics
        const results = await profitEngineService.processDailyPayouts();
        res.json({ success: true, message: 'Payout engine ran successfully', data: results });
    } catch (error) {
        next(error);
    }
};

exports.getPayoutStats = async (req, res, next) => {
    try {
        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);
        next7Days.setHours(23, 59, 59, 999);

        // Find all active investments due in the next 7 days
        const dueInvestments = await CustomerInvestment.find({
            status: 'ACTIVE',
            nextProfitDate: { $lte: next7Days }
        });

        const volumeNext7Days = dueInvestments.reduce((acc, inv) => {
            // Use monthlyROI if present, otherwise approximate from monthlyProfit or default 0
            const profitPerMonth = inv.monthlyProfit || (inv.investedAmount * ((inv.monthlyROI || 0) / 100));
            return acc + profitPerMonth;
        }, 0);

        res.json({
            success: true,
            data: {
                volumeNext7Days,
                dueCount: dueInvestments.length
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllCustomers = async (req, res, next) => {
    try {
        const results = await User.aggregate([
            { $match: { role: 'CUSTOMER' } },
            {
                $lookup: {
                    from: 'customers',
                    let: { cId: '$customerId', uEmail: '$email', uPhone: '$phone' },
                    pipeline: [
                        { 
                            $match: { 
                                $expr: { 
                                    $or: [
                                        { $eq: ['$_id', '$$cId'] },
                                        { $eq: ['$email', '$$uEmail'] },
                                        { $eq: ['$phone', '$$uPhone'] }
                                    ] 
                                } 
                            } 
                        }
                    ],
                    as: 'customerProfile'
                }
            },
            { $unwind: { path: '$customerProfile', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'applications',
                    let: { cId: '$customerProfile._id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$customerId', '$$cId'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'recentApp'
                }
            },
            { $unwind: { path: '$recentApp', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'customerinvestments',
                    localField: 'customerProfile._id',
                    foreignField: 'customerId',
                    as: 'investments'
                }
            },
            {
                $match: { 'investments.status': 'ACTIVE' }
            },
            {
                $lookup: {
                    from: 'wallets',
                    localField: 'customerProfile._id',
                    foreignField: 'customerId',
                    as: 'wallet'
                }
            },
            { $unwind: { path: '$wallet', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'transactions',
                    localField: 'customerProfile._id',
                    foreignField: 'customerId',
                    as: 'transactions'
                }
            },
            {
                $addFields: {
                    // Inject bankDetails back into customerProfile for the frontend response
                    "customerProfile.bankName": { $ifNull: ["$customerProfile.bankName", "$recentApp.bankDetails.bankName"] },
                    "customerProfile.branchName": { $ifNull: ["$customerProfile.branchName", "$recentApp.bankDetails.branchName"] },
                    "customerProfile.accountHolder": { $ifNull: ["$customerProfile.accountHolder", "$recentApp.bankDetails.accountHolder"] },
                    "customerProfile.accountNumber": { $ifNull: ["$customerProfile.accountNumber", "$recentApp.bankDetails.accountNumber"] },
                    "customerProfile.walletBalance": "$wallet.availableBalance"
                }
            },
            {
                $project: {
                    id: '$_id',
                    name: '$name',
                    email: '$email',
                    user_id: '$userId',
                    phone: '$phone',
                    is_active: '$isActive',
                    created_at: '$createdAt',
                    customer_profile: '$customerProfile',
                    investments: 1,
                    wallet: 1,
                    transactions: 1
                }
            },
            { $sort: { created_at: -1 } }
        ]);

        res.json({ success: true, count: results.length, data: results });
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const results = await User.aggregate([
            { $match: { role: 'CUSTOMER' } },
            {
                $lookup: {
                    from: 'customers',
                    let: { cId: '$customerId', uEmail: '$email', uPhone: '$phone' },
                    pipeline: [
                        { 
                            $match: { 
                                $expr: { 
                                    $or: [
                                        { $eq: ['$_id', '$$cId'] },
                                        { $eq: ['$email', '$$uEmail'] },
                                        { $eq: ['$phone', '$$uPhone'] }
                                    ] 
                                } 
                            } 
                        }
                    ],
                    as: 'customerProfile'
                }
            },
            { $unwind: { path: '$customerProfile', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'applications',
                    let: { cId: '$customerProfile._id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$customerId', '$$cId'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'recentApp'
                }
            },
            { $unwind: { path: '$recentApp', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'customerinvestments',
                    localField: 'customerProfile._id',
                    foreignField: 'customerId',
                    as: 'investments'
                }
            },
            {
                $match: {
                    $or: [
                        { investments: { $size: 0 } },
                        { 'investments.status': { $ne: 'ACTIVE' } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'wallets',
                    localField: 'customerProfile._id',
                    foreignField: 'customerId',
                    as: 'wallet'
                }
            },
            { $unwind: { path: '$wallet', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'transactions',
                    localField: 'customerProfile._id',
                    foreignField: 'customerId',
                    as: 'transactions'
                }
            },
            {
                $addFields: {
                    "customerProfile.bankName": { $ifNull: ["$customerProfile.bankName", "$recentApp.bankDetails.bankName"] },
                    "customerProfile.branchName": { $ifNull: ["$customerProfile.branchName", "$recentApp.bankDetails.branchName"] },
                    "customerProfile.accountHolder": { $ifNull: ["$customerProfile.accountHolder", "$recentApp.bankDetails.accountHolder"] },
                    "customerProfile.accountNumber": { $ifNull: ["$customerProfile.accountNumber", "$recentApp.bankDetails.accountNumber"] },
                    "customerProfile.walletBalance": "$wallet.availableBalance"
                }
            },
            {
                $project: {
                    id: '$_id',
                    name: '$name',
                    email: '$email',
                    user_id: '$userId',
                    phone: '$phone',
                    is_active: '$isActive',
                    created_at: '$createdAt',
                    customer_profile: '$customerProfile',
                    investments: 1,
                    wallet: 1,
                    transactions: 1
                }
            },
            { $sort: { created_at: -1 } }
        ]);

        res.json({ success: true, count: results.length, data: results });
    } catch (error) {
        next(error);
    }
};

exports.getAllInvestments = async (req, res, next) => {
    try {
        const results = await CustomerInvestment.aggregate([
            {
                $lookup: {
                    from: 'investmentplans',
                    localField: 'planId',
                    foreignField: '_id',
                    as: 'plan'
                }
            },
            { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    id: '$_id',
                    customerId: 1,
                    planId: 1,
                    invested_amount: '$investedAmount',
                    status: 1,
                    created_at: '$createdAt',
                    referenceNumber: 1,
                    durationMonths: 1,
                    monthlyROI: 1,
                    profitDestination: 1,
                    plan_name: '$plan.name',
                    customer_name: '$customer.fullName'
                }
            },
            { $sort: { created_at: -1 } }
        ]);
        res.json({ success: true, count: results.length, data: results });
    } catch (error) {
        next(error);
    }
};

exports.getDashboardMetrics = async (req, res, next) => {
    try {
        const activeInvestmentCustomers = await CustomerInvestment.distinct('customerId', { status: 'ACTIVE' });
        
        const totalInvestments = await CustomerInvestment.aggregate([
            { $match: { status: 'ACTIVE' } },
            { $group: { _id: null, total: { $sum: '$investedAmount' } } }
        ]);

        const plansStats = await InvestmentPlan.aggregate([
            {
                $group: {
                    _id: null,
                    active_plans: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
                    inactive_plans: { $sum: { $cond: [{ $eq: ['$status', 'INACTIVE'] }, 1, 0] } }
                }
            }
        ]);

        const recentActivities = await CustomerInvestment.find()
            .populate('customerId')
            .sort({ createdAt: -1 })
            .limit(5);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const investmentGrowth = await CustomerInvestment.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    total: { $sum: "$investedAmount" }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { month: "$_id", total: 1, _id: 0 } }
        ]);

        const monthlyProfit = await ProfitPayoutLog.aggregate([
            { $match: { status: 'COMPLETED', createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: '$cycleMonth',
                    total: { $sum: '$amountCalculated' }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { month: '$_id', total: 1, _id: 0 } }
        ]);

        const totalApprovedCustomers = await User.countDocuments({ role: 'CUSTOMER' });
        const pendingApprovalsCount = await require('../models/PendingApproval').countDocuments({ status: 'PENDING' });
        
        res.json({
            success: true,
            data: {
                totalCustomers: totalApprovedCustomers,
                registeredUsers: pendingApprovalsCount, 
                totalInvestmentVolume: totalInvestments[0]?.total || 0,
                activePlans: plansStats[0]?.active_plans || 0,
                inactivePlans: plansStats[0]?.inactive_plans || 0,
                recentActivities: recentActivities.map(a => ({
                    ...a._doc,
                    customer_name: a.customerId?.fullName || 'Unknown'
                })),
                chartData: {
                    investmentGrowth,
                    monthlyProfit
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateCustomerStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        const user = await User.findByIdAndUpdate(id, { isActive: is_active }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'Status updated', data: user });
    } catch (error) {
        next(error);
    }
};

exports.updateInvestmentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const inv = await CustomerInvestment.findByIdAndUpdate(id, { status }, { new: true });
        if (!inv) return res.status(404).json({ success: false, message: 'Investment not found' });
        res.json({ success: true, data: inv });
    } catch (error) {
        next(error);
    }
};

exports.getCustomerGroups = async (req, res, next) => {
    try {
        const groups = await CustomerGroup.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'groupId',
                    as: 'members'
                }
            },
            {
                $project: {
                    id: '$_id',
                    name: 1,
                    description: 1,
                    color: 1,
                    member_count: { $size: '$members' },
                    // Simplified total_investment logic for now
                    total_investment: { $literal: 0 } 
                }
            }
        ]);
        res.json({ success: true, count: groups.length, data: groups });
    } catch (error) {
        next(error);
    }
};

exports.getAnalytics = async (req, res, next) => {
    try {
        const stats = await CustomerInvestment.aggregate([
            { $match: { status: 'ACTIVE' } },
            {
                $group: {
                    _id: null,
                    totalActiveInvestment: { $sum: '$investedAmount' },
                    averageInvestment: { $avg: '$investedAmount' }
                }
            }
        ]);

        const planDistribution = await CustomerInvestment.aggregate([
            { $match: { status: 'ACTIVE' } },
            {
                $lookup: {
                    from: 'investmentplans',
                    localField: 'planId',
                    foreignField: '_id',
                    as: 'plan'
                }
            },
            { $unwind: '$plan' },
            {
                $group: {
                    _id: '$plan.title',
                    total_amount: { $sum: '$investedAmount' }
                }
            },
            { $project: { plan_name: '$_id', total_amount: 1, _id: 0 } }
        ]);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyGrowth = await CustomerInvestment.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    total: { $sum: "$investedAmount" }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { month: "$_id", total: 1, _id: 0 } }
        ]);

        res.json({
            success: true,
            data: {
                totalActiveInvestment: stats[0]?.totalActiveInvestment || 0,
                averageInvestment: (stats[0]?.averageInvestment || 0).toFixed(2),
                planDistribution,
                monthlyGrowth,
                retentionRate: 98.5,
                growthRate: "+15.2%"
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.createCustomer = async (req, res, next) => {
    try {
        const { name, user_id, phone, email } = req.body;
        const existing = await User.findOne({ 
            $or: [{ userId: user_id }, { email: email }] 
        });
        if (existing) return res.status(400).json({ success: false, message: 'User ID or Email already exists' });

        const user = await User.create({
            name,
            userId: user_id,
            email,
            phone,
            password: "123456",
            role: 'CUSTOMER'
        });

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.deleteCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        await User.findOneAndDelete({ _id: id, role: 'CUSTOMER' });
        res.json({ success: true, message: 'Customer deleted' });
    } catch (error) {
        next(error);
    }
};

exports.getDepositRequests = async (req, res, next) => {
    try {
        const protocol = req.protocol;
        const host = req.get('host');
        let baseUrl = `${protocol}://${host}`;
        
        // Normalize local development URLs to ensure cross-browser compatibility
        if (baseUrl.includes('127.0.0.1') || baseUrl.includes('localhost')) {
            baseUrl = process.env.BACKEND_URL || baseUrl;
        }

        // Helper to fix S3 URLs using our proxy
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
            if (url.startsWith('pending/') || url.startsWith('verified/') || url.includes('nicFront-') || url.includes('nicBack-') || url.includes('deposit-')) {
                return `${baseUrl}/api/admin/view-document?key=${url}`;
            }

            return url;
        };

        const { status } = req.query;
        const query = status ? { status: status.toUpperCase() } : {};

        const requests = await DepositRequest.find(query)
            .populate('customerId')
            .sort({ createdAt: -1 })
            .lean();
        
        console.log(`[ADMIN] Found ${requests.length} deposit requests.`);
        
        // Enrich with User info (userId and preferred notification name) and correct field naming
        const enriched = await Promise.all(requests.map(async (dr) => {
            try {
                const customerId = dr.customerId?._id || dr.customerId;
                if (!customerId) return dr;
                
                const user = await User.findOne({ customerId: customerId });
                
                if (dr.customerId && typeof dr.customerId === 'object') {
                    dr.customerId.name = user?.name || dr.customerId.fullName || 'Unknown';
                    dr.customerId.userId = user?.userId || 'N/A';
                }
                
                // Map receiptFile to proofUrl for frontend compatibility if needed
                if (dr.receiptFile) {
                    dr.proofUrl = fixUrl(dr.receiptFile);
                } else if (dr.proofUrl) {
                    dr.proofUrl = fixUrl(dr.proofUrl);
                }
                
                // Ensure note is accessible as both 'note' and 'notes'
                dr.notes = dr.note || dr.notes || '';
            } catch (err) {
                console.error(`[ADMIN] Enrichment failed for request ${dr._id}:`, err.message);
            }
            return dr;
        }));

        res.json({ success: true, count: enriched.length, data: enriched });
    } catch (error) {
        next(error);
    }
};

exports.getWithdrawalRequests = async (req, res, next) => {
    try {
        const requests = await WithdrawalRequest.find()
            .populate('customerId')
            .sort({ createdAt: -1 })
            .lean();

        const Application = require('../models/Application');

        // Enrich with User info (userId and preferred notification name) and Bank Details
        const enriched = await Promise.all(requests.map(async (wr) => {
            try {
                if (wr.customerId && typeof wr.customerId === 'object') {
                    let user = null;
                    if (wr.customerId.email) {
                        user = await User.findOne({ email: wr.customerId.email });
                    }
                    if (!user && wr.customerId.phone) {
                        user = await User.findOne({ phone: wr.customerId.phone });
                    }
                    wr.customerId.name = user?.name || wr.customerId.fullName || 'Unknown';
                    wr.customerId.userId = user?.userId || 'N/A';
                    
                    // Attach bank details properly
                    const app = await Application.findOne({ customerId: wr.customerId._id }).sort({ createdAt: -1 });
                    wr.bankDetails = {
                        bankName: wr.customerId.bankName || app?.bankDetails?.bankName || 'NOT PROVIDED',
                        branchName: wr.customerId.branchName || app?.bankDetails?.branchName || 'NOT PROVIDED',
                        accountHolder: wr.customerId.accountHolder || app?.bankDetails?.accountHolder || 'NOT PROVIDED',
                        accountNumber: wr.customerId.accountNumber || app?.bankDetails?.accountNumber || 'NOT PROVIDED'
                    };
                }
            } catch (err) {
                console.error(`[ADMIN] Enrichment failed for withdrawal request ${wr._id}:`, err.message);
            }
            return wr;
        }));

        res.json({ success: true, count: enriched.length, data: enriched });
    } catch (error) {
        next(error);
    }
};

exports.getWithdrawalDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        let wr = await WithdrawalRequest.findById(id).populate('customerId').lean();
        let isAutoPayout = false;
        
        if (!wr) {
            wr = await Payout.findById(id).populate('customerId').lean();
            if (wr) {
                isAutoPayout = true;
                wr.bankDetails = {
                    bankName: wr.bankName,
                    branchName: wr.branchName,
                    accountHolder: wr.accountName,
                    accountNumber: wr.accountNumber
                };
            } else {
                return res.status(404).json({ success: false, message: 'Withdrawal/Payout not found' });
            }
        }
        
        const Application = require('../models/Application');
        const wallet = await Wallet.findOne({ customerId: wr.customerId._id }).lean();
        
        let user = null;
        if (wr.customerId.email) user = await User.findOne({ email: wr.customerId.email });
        if (!user && wr.customerId.phone) user = await User.findOne({ phone: wr.customerId.phone });
        wr.customerId.name = user?.name || wr.customerId.fullName || 'Unknown';
        wr.customerId.userId = user?.userId || 'N/A';
        
        const app = await Application.findOne({ customerId: wr.customerId._id }).sort({ createdAt: -1 });
        wr.bankDetails = {
            bankName: wr.customerId.bankName || app?.bankDetails?.bankName || 'NOT PROVIDED',
            branchName: wr.customerId.branchName || app?.bankDetails?.branchName || 'NOT PROVIDED',
            accountHolder: wr.customerId.accountHolder || app?.bankDetails?.accountHolder || 'NOT PROVIDED',
            accountNumber: wr.customerId.accountNumber || app?.bankDetails?.accountNumber || 'NOT PROVIDED'
        };

        res.json({ success: true, data: { withdrawal: wr, wallet } });
    } catch (error) {
        next(error);
    }
};

exports.approveDepositRequest = async (req, res, next) => {
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);
    try {
        const { id } = req.params;
        const deposit = await DepositRequest.findById(id).session(session);
        if (!deposit || deposit.status !== 'PENDING') {
            throw new Error('Deposit request not found or not pending');
        }

        deposit.status = 'APPROVED';
        await deposit.save({ session });

        const customerObjectId = deposit.customerId?._id || deposit.customerId;
        const creditAmount = Number(deposit.amount);

        console.info(`[Deposit Approval] Processing LKR ${creditAmount} for Customer: ${customerObjectId}`);

        // Update Wallet & Get Snapshot Atomically
        let wallet = await Wallet.findOne({ customerId: customerObjectId }).session(session);
        if (!wallet) {
            console.warn(`[Deposit Approval] No wallet found for customer ${customerObjectId}. Creating new wallet...`);
            wallet = await Wallet.create([{ customerId: customerObjectId, availableBalance: 0, totalBalance: 0, heldBalance: 0 }], { session });
            wallet = wallet[0];
        }

        const totalBefore = wallet.totalBalance;
        const availableBefore = wallet.availableBalance;
        const heldBefore = wallet.heldBalance;

        const updatedWallet = await Wallet.findOneAndUpdate(
            { customerId: customerObjectId },
            { 
                $inc: { 
                    availableBalance: creditAmount, 
                    totalBalance: creditAmount 
                } 
            },
            { session, new: true }
        );

        if (!updatedWallet) {
            throw new Error('Failed to update customer wallet balance');
        }

        console.info(`[Deposit Approval] Wallet updated successfully. New Total: ${updatedWallet.totalBalance}`);
        
        // Create Transaction with correct schema fields
        const transaction = await Transaction.create([{
            customerId: customerObjectId,
            walletId: updatedWallet._id,
            type: 'DEPOSIT_APPROVED',
            amount: deposit.amount,
            status: 'COMPLETED',
            description: `Deposit Approved - Ref: ${deposit.referenceNumber}`,
            balanceBefore: totalBefore,
            balanceAfter: updatedWallet.totalBalance,
            availableBefore: availableBefore,
            availableAfter: updatedWallet.availableBalance,
            heldBefore: heldBefore,
            heldAfter: updatedWallet.heldBalance
        }], { session });

        await deposit.save({ session });

        await safeCommitTransaction(session);

        // ---------------------------------------------------------
        // BACKGROUND NOTIFICATION (Not blocking transaction completion)
        // ---------------------------------------------------------
        try {
            // Re-fetch customer/user details for notification context
            const customerId = deposit.customerId?._id || deposit.customerId;
            const user = await User.findOne({ customerId });
            
            if (user) {
                // 1. Send Email with PDF
                await sendDepositApprovalEmail({
                    email: user.email,
                    customerName: user.name,
                    referenceNumber: deposit.referenceNumber,
                    amount: deposit.amount,
                    date: deposit.createdAt,
                    userId: user.userId
                }).catch(e => console.error('[Email Error]', e.message));

                // 2. Send SMS
                const smsText = `Dear ${user.name}, your deposit of LKR ${deposit.amount.toLocaleString()} (Ref: ${deposit.referenceNumber}) has been approved. Your wallet has been credited. Thank you.`;
                await sendSms({ phone: user.phone, text: smsText }).catch(e => console.error('[SMS Error]', e.message));

                // 3. Create Specific Dashboard Notification
                const Notification = require('../models/Notification');
                await Notification.create({
                    customerId: customerId,
                    title: 'Deposit Successful',
                    message: `LKR ${deposit.amount.toLocaleString()} has been added to your wallet. Ref: ${deposit.referenceNumber}`,
                    type: 'SUCCESS'
                }).catch(e => console.error('[Notif Error]', e.message));
            }
        } catch (notifErr) {
            console.error('[Notification Error] Failed to send approval notifications:', notifErr.message);
        }

        res.json({ 
            success: true, 
            message: 'Deposit approved successfully',
            customerName: (await User.findOne({ customerId: (deposit.customerId?._id || deposit.customerId) }))?.name || 'Customer'
        });
    } catch (error) {
        await safeAbortTransaction(session);
        next(error);
    } finally {
        if (session) session.endSession();
    }
};
exports.rejectDepositRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const deposit = await DepositRequest.findById(id);
        if (!deposit || deposit.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Request not found or not pending' });
        }

        deposit.status = 'REJECTED';
        deposit.adminRemarks = reason; // Use 'reason' as requested
        await deposit.save();

        // ---------------------------------------------------------
        // BACKGROUND NOTIFICATION
        // ---------------------------------------------------------
        try {
            const user = await User.findOne({ customerId: deposit.customerId });
            if (user) {
                // Send Email
                await sendDepositRejectionEmail({
                    email: user.email,
                    customerName: user.name,
                    referenceNumber: deposit.referenceNumber,
                    reason: reason
                });

                // Send SMS
                const smsText = `Dear ${user.name}, your deposit (Ref: ${deposit.referenceNumber}) was rejected due to: ${reason}. Please contact support for more information.`;
                await sendSms({ phone: user.phone, text: smsText });
            }
        } catch (notifErr) {
            console.error('[Notification Error] Failed to send rejection notifications:', notifErr.message);
        }

        res.json({ success: true, message: 'Deposit rejected' });
    } catch (error) {
        next(error);
    }
};

exports.markDepositAsUnderReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deposit = await DepositRequest.findById(id);
        if (!deposit || deposit.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Only pending requests can be moved to review' });
        }
        deposit.status = 'UNDER_REVIEW';
        await deposit.save();
        res.json({ success: true, message: 'Deposit marked as under review' });
    } catch (error) {
        next(error);
    }
};

exports.approveWithdrawalRequest = async (req, res, next) => {
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);
    try {
        const { id } = req.params;
        const withdrawal = await WithdrawalRequest.findById(id).session(session);
        if (!withdrawal || withdrawal.status !== 'PENDING') {
            throw new Error('Withdrawal request not found or not in PENDING state');
        }

        withdrawal.status = 'APPROVED';
        withdrawal.approvedBy = req.user ? req.user._id : null;
        withdrawal.approvedAt = Date.now();
        await withdrawal.save({ session });
        
        // Create a Payout record for the Payout list
        await Payout.create([{
            withdrawalRequestId: withdrawal._id,
            customerId: withdrawal.customerId,
            amount: withdrawal.amount,
            bankName: withdrawal.bankName,
            accountName: withdrawal.accountName,
            accountNumber: withdrawal.accountNumber,
            branchName: withdrawal.branchName,
            referenceNumber: withdrawal.referenceNumber,
            type: 'WITHDRAWAL',
            status: 'PENDING',
            approvedAt: Date.now()
        }], { session });

        await safeCommitTransaction(session);
        res.json({ success: true, message: 'Withdrawal approved. Awaiting final bank transfer completion.' });
    } catch (error) {
        await safeAbortTransaction(session);
        next(error);
    } finally {
        if (session) session.endSession();
    }
};

exports.completeWithdrawalRequest = async (req, res, next) => {
    let session = null;
    let transactionStarted = false;
    
    try {
        // Check if the connection is a replica set or mongos (sharded)
        const topologyType = mongoose.connection?.getClient()?.topology?.description?.type || '';
        const supportsTransactions = topologyType.includes('ReplicaSet') || topologyType.includes('Sharded');

        if (supportsTransactions) {
            session = await mongoose.startSession();
            await safeStartTransaction(session);
            transactionStarted = true;
        } else {
            console.warn('[TRANSACTION] Standalone MongoDB detected. Transactions are disabled.');
        }
    } catch (sessionErr) {
        console.error('[TRANSACTION] Error checking topology:', sessionErr.message);
        session = null;
    }

    try {
        const { id } = req.params;
        const { bankReference } = req.body;
        
        const opt = session ? { session } : {};

        // Use conditional session application
        let withdrawalQuery = WithdrawalRequest.findById(id);
        if (session) withdrawalQuery.session(session);
        let withdrawal = await withdrawalQuery;
        
        let isAutoPayout = false;
        if (!withdrawal) {
            let payoutQuery = Payout.findById(id);
            if (session) payoutQuery.session(session);
            withdrawal = await payoutQuery;
            if (withdrawal) {
                isAutoPayout = true;
            }
        }

        if (!withdrawal || (isAutoPayout ? withdrawal.status !== 'PENDING' : withdrawal.status !== 'APPROVED')) {
            throw new Error('Request not found or not in correct state for payout processing');
        }

        const walletQuery = Wallet.findOne({ customerId: withdrawal.customerId });
        if (session) walletQuery.session(session);
        const wallet = await walletQuery;

        if (!wallet || wallet.heldBalance < withdrawal.amount) {
            throw new Error('Wallet holding error detected before completion — insufficient held balance');
        }

        withdrawal.status = 'COMPLETED';
        withdrawal.payoutReferenceNumber = bankReference || 'N/A';
        withdrawal.processedBy = req.user ? req.user._id : null;
        withdrawal.completedAt = Date.now();
        if (!isAutoPayout) {
            withdrawal.processedAt = Date.now();
            withdrawal.statusHistory.push({
                status: 'COMPLETED',
                changedAt: Date.now(),
                changedBy: req.user ? req.user.fullName : 'ADMIN',
                remark: `Payout confirmed with Bank Reference: ${bankReference || 'N/A'}`
            });
        }
        await (session ? withdrawal.save({ session }) : withdrawal.save());

        // Sync linked Payout / ProfitPayoutLog records
        const payoutCompletionUpdate = {
            status: 'COMPLETED',
            payoutReferenceNumber: bankReference || 'N/A',
            completedAt: Date.now(),
            processedBy: req.user ? req.user._id : null
        };
        if (isAutoPayout) {
            // Auto-payout IS the Payout record — mark its linked ProfitPayoutLog as COMPLETED
            if (withdrawal.referenceNumber?.startsWith('AUTO-')) {
                const idempotencyKey = withdrawal.referenceNumber.replace('AUTO-', '');
                await ProfitPayoutLog.findOneAndUpdate({ idempotencyKey }, { status: 'COMPLETED' });
            }
        } else {
            // Manual withdrawal — update the linked Payout record
            if (session) {
                await Payout.findOneAndUpdate({ withdrawalRequestId: withdrawal._id }, payoutCompletionUpdate, { session });
            } else {
                await Payout.findOneAndUpdate({ withdrawalRequestId: withdrawal._id }, payoutCompletionUpdate);
            }
        }

        const heldBefore = wallet.heldBalance;
        const totalBefore = wallet.totalBalance;
        const availableBefore = wallet.availableBalance;

        // Release held funds — applies to both manual withdrawals and auto bank-transfer payouts
        const walletUpdate = {
            $inc: {
                heldBalance: -withdrawal.amount,
                totalBalance: -withdrawal.amount,
                totalWithdrawn: withdrawal.amount
            }
        };

        const updatedWallet = session
            ? await Wallet.findOneAndUpdate({ customerId: withdrawal.customerId }, walletUpdate, { session, new: true })
            : await Wallet.findOneAndUpdate({ customerId: withdrawal.customerId }, walletUpdate, { new: true });

        if (!updatedWallet) throw new Error('Wallet update failed');

        // Check for existing transaction to prevent duplicates (Idempotency)
        const existingTrans = await Transaction.findOne({ 
            referenceId: withdrawal._id, 
            type: 'WITHDRAWAL_COMPLETED' 
        });

        let transId;
        if (existingTrans) {
            transId = existingTrans._id;
            console.info(`[PAYOUT] Reusing existing transaction record: ${transId}`);
        } else {
            // Record Transaction
            const transData = [{
                customerId: withdrawal.customerId,
                walletId: updatedWallet._id,
                type: 'WITHDRAWAL_COMPLETED',
                referenceType: isAutoPayout ? 'MONTHLY_RETURN' : 'WITHDRAWAL',
                referenceId: withdrawal._id,
                amount: -withdrawal.amount,
                status: 'COMPLETED',
                description: isAutoPayout
                    ? `Monthly Return Bank Transfer Completed - Bank Ref: ${bankReference || 'N/A'} | Internal: ${withdrawal.referenceNumber}`
                    : `Withdrawal Transfer Completed - Ref: ${withdrawal.referenceNumber}`,
                balanceBefore: totalBefore,
                balanceAfter: updatedWallet.totalBalance,
                availableBefore: availableBefore,
                availableAfter: updatedWallet.availableBalance,
                heldBefore: heldBefore,
                heldAfter: updatedWallet.heldBalance,
                createdBy: req.user ? req.user._id : null
            }];

            const transactionResult = session 
                ? await Transaction.create(transData, { session })
                : await Transaction.create(transData);
            
            transId = transactionResult[0]?._id || transactionResult._id;
        }

        withdrawal.transactionId = transId;
        await (session ? withdrawal.save({ session }) : withdrawal.save());

        if (transactionStarted && session) {
            await safeCommitTransaction(session);
        }

        // --- Post-Completion Notifications ---
        try {
            const customer = await Customer.findById(withdrawal.customerId);
            if (customer) {
                const notifTitle = isAutoPayout ? 'Monthly Return Credited' : 'Withdrawal Completed';
                const notifMessage = isAutoPayout
                    ? `Your monthly return of LKR ${withdrawal.amount.toLocaleString()} has been transferred to your bank. Ref: ${bankReference || 'N/A'}`
                    : `Your withdrawal of LKR ${withdrawal.amount.toLocaleString()} has been processed. Ref: ${bankReference || 'N/A'}`;

                // 1. Dashboard Notification
                await Notification.create({
                    customerId: customer._id,
                    title: notifTitle,
                    message: notifMessage,
                    type: 'SUCCESS'
                });

                // 2. SMS Notification
                if (customer.mobile) {
                    const smsText = isAutoPayout
                        ? `NF PLANTATION: Your monthly return of LKR ${withdrawal.amount.toLocaleString()} has been transferred to your bank. Bank Ref: ${bankReference || 'N/A'}. Thank you.`
                        : `NF PLANTATION: Your withdrawal of LKR ${withdrawal.amount.toLocaleString()} was successful. Bank Ref: ${bankReference || 'N/A'}. Thank you.`;
                    await smsService.sendSms({
                        phone: customer.mobile,
                        text: smsText
                    }).catch(e => console.error('SMS Failed:', e.message));
                }

                // 3. Email Notification with Receipt
                if (customer.email && emailService.sendWithdrawalCompletionEmail) {
                    await emailService.sendWithdrawalCompletionEmail({
                        email: customer.email,
                        customerName: customer.name || customer.fullName,
                        referenceNumber: withdrawal.referenceNumber,
                        amount: withdrawal.amount,
                        bankName: withdrawal.bankName,
                        accountNumber: withdrawal.accountNumber,
                        accountName: withdrawal.accountName,
                        branchName: withdrawal.branchName,
                        payoutReferenceNumber: bankReference || 'N/A'
                    }).catch(e => console.error('Email Failed:', e.message));
                }
            }
        } catch (notifErr) {
            console.error('Post-payout notifications failed:', notifErr.message);
        }

        res.json({ success: true, message: 'Payout successfully completed. Wallet updated and customer notified.' });
    } catch (error) {
        if (transactionStarted && session) {
            await safeAbortTransaction(session);
        }
        next(error);
    } finally {
        if (session) {
            if (session) session.endSession();
        }
    }
};

exports.failWithdrawalRequest = async (req, res, next) => {
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);
    try {
        const { id } = req.params;
        const { remarks } = req.body;
        const withdrawal = await WithdrawalRequest.findById(id).session(session);
        if (!withdrawal || withdrawal.status !== 'APPROVED') {
            throw new Error('Request not found or not approved');
        }

        let wallet = await Wallet.findOne({ customerId: withdrawal.customerId }).session(session);
        if (!wallet || wallet.heldBalance < withdrawal.amount) {
            throw new Error('Wallet holding error detected before failure');
        }

        withdrawal.status = 'FAILED';
        withdrawal.adminRemarks = remarks;
        withdrawal.failureReason = remarks;
        await withdrawal.save({ session });

        const heldBefore = wallet.heldBalance;
        const totalBefore = wallet.totalBalance;
        const availableBefore = wallet.availableBalance;

        // Release Hold
        wallet.heldBalance -= withdrawal.amount;
        wallet.availableBalance += withdrawal.amount;
        wallet.totalBalance = wallet.availableBalance + wallet.heldBalance; // unchanged mathematically
        await wallet.save({ session });

        // Record Release Transaction
        await Transaction.create([{
            customerId: withdrawal.customerId,
            walletId: wallet._id,
            type: 'RELEASE',
            referenceType: 'WITHDRAWAL',
            referenceId: withdrawal._id,
            amount: withdrawal.amount,
            status: 'COMPLETED',
            description: `Withdrawal Transfer Failed/Cancelled - Funds Released to Available Balance - Ref: ${withdrawal.referenceNumber}`,
            balanceBefore: totalBefore,
            balanceAfter: wallet.totalBalance,
            availableBefore: availableBefore,
            availableAfter: wallet.availableBalance,
            heldBefore: heldBefore,
            heldAfter: wallet.heldBalance,
            createdBy: req.user ? req.user._id : null
        }], { session });

        await safeCommitTransaction(session);
        res.json({ success: true, message: 'Withdrawal marked failed and funds securely released' });
    } catch (error) {
        await safeAbortTransaction(session);
        next(error);
    } finally {
        if (session) session.endSession();
    }
};

exports.rejectWithdrawalRequest = async (req, res, next) => {
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);
    try {
        const { id } = req.params;
        const { remarks } = req.body;
        const withdrawal = await WithdrawalRequest.findById(id).session(session);
        if (!withdrawal || withdrawal.status !== 'PENDING') {
            throw new Error('Request not found or not pending');
        }

        let wallet = await Wallet.findOne({ customerId: withdrawal.customerId }).session(session);
        if (!wallet || wallet.heldBalance < withdrawal.amount) {
            throw new Error('Wallet holding error detected before rejection');
        }

        withdrawal.status = 'REJECTED';
        withdrawal.adminRemarks = remarks;
        withdrawal.failureReason = remarks;
        await withdrawal.save({ session });

        const heldBefore = wallet.heldBalance;
        const totalBefore = wallet.totalBalance;
        const availableBefore = wallet.availableBalance;

        // Release Hold
        wallet.heldBalance -= withdrawal.amount;
        wallet.availableBalance += withdrawal.amount;
        wallet.totalBalance = wallet.availableBalance + wallet.heldBalance; // unchanged mathematically
        await wallet.save({ session });

        // Record Release Transaction
        await Transaction.create([{
            customerId: withdrawal.customerId,
            walletId: wallet._id,
            type: 'RELEASE',
            referenceType: 'WITHDRAWAL',
            referenceId: withdrawal._id,
            amount: withdrawal.amount,
            status: 'COMPLETED',
            description: `Withdrawal Rejected - Funds Released to Available Balance - Ref: ${withdrawal.referenceNumber}`,
            balanceBefore: totalBefore,
            balanceAfter: wallet.totalBalance,
            availableBefore: availableBefore,
            availableAfter: wallet.availableBalance,
            heldBefore: heldBefore,
            heldAfter: wallet.heldBalance,
            createdBy: req.user ? req.user._id : null
        }], { session });

        await safeCommitTransaction(session);
        res.json({ success: true, message: 'Withdrawal rejected and funds released to customer' });
    } catch (error) {
        await safeAbortTransaction(session);
        next(error);
    } finally {
        if (session) session.endSession();
    }
};

exports.approveInvestment = async (req, res, next) => {
    const mongoose = require('mongoose');
    const session = await getSafeSession();
    if (session) await safeStartTransaction(session);
    try {
        const { id } = req.params;
        const investment = await CustomerInvestment.findById(id).session(session);
        
        if (!investment || investment.status !== 'PENDING_ACTIVATION_APPROVAL') {
            throw new Error('Investment request not found or not in pending state');
        }

        const wallet = await Wallet.findOne({ customerId: investment.customerId }).session(session);
        if (!wallet) throw new Error('Customer wallet not found');

        if (wallet.heldBalance < investment.investedAmount) {
            throw new Error('Holding error detected before approval');
        }

        const availableBefore = wallet.availableBalance;
        const heldBefore = wallet.heldBalance;
        const totalBefore = wallet.totalBalance;

        // Perform Permanent Deduction from heldBalance
        wallet.heldBalance -= investment.investedAmount;
        wallet.totalBalance -= investment.investedAmount;
        wallet.totalInvested = (wallet.totalInvested || 0) + investment.investedAmount;
        await wallet.save({ session });

        // Update Investment State
        investment.status = 'ACTIVE';
        investment.startDate = new Date();
        investment.nextProfitDate = addMonths(new Date(), 1);
        investment.endDate = addMonths(new Date(), investment.durationMonths);
        investment.approvedBy = req.user._id;
        await investment.save({ session });

        // Record Ledger Transaction
        await Transaction.create([{
            customerId: investment.customerId,
            walletId: wallet._id,
            type: 'INVESTMENT',
            referenceType: 'INVESTMENT',
            referenceId: investment._id,
            amount: investment.investedAmount,
            status: 'COMPLETED',
            description: `FD Activation Finalized - Ref: ${investment.referenceNumber}`,
            balanceBefore: totalBefore,
            balanceAfter: wallet.totalBalance,
            availableBefore: availableBefore,
            availableAfter: wallet.availableBalance,
            heldBefore: heldBefore,
            heldAfter: wallet.heldBalance,
            createdBy: req.user._id
        }], { session });

        await safeCommitTransaction(session);

        res.json({ success: true, message: 'Investment approved and activated successfully.' });

        // Post-commit: send notifications (non-blocking)
        try {
            const customer = await Customer.findById(investment.customerId).lean();
            const user = await User.findOne({ customerId: investment.customerId }).lean();
            const plan = investment.planId
                ? await InvestmentPlan.findById(investment.planId).lean()
                : null;

            const email = user?.email || customer?.email;
            const phone = customer?.mobile || customer?.phone || user?.phone;
            const monthlyYield = (investment.investedAmount * (investment.monthlyROI || 0)) / 100;

            // 1. Confirmation Email with PDF Agreement
            if (email) {
                await sendInvestmentApprovalEmail({
                    email,
                    customerName: customer?.fullName || 'Investor',
                    referenceNumber: investment.referenceNumber,
                    amount: investment.investedAmount,
                    planName: investment.planName || plan?.name || 'Investment Plan',
                    duration: investment.durationMonths || plan?.duration,
                    roi: investment.monthlyROI || plan?.interestRate,
                    profitDestination: investment.profitDestination,
                    bankName: customer?.bankName,
                    accountNumber: customer?.accountNumber,
                    userId: customer?.userId,
                    startDate: investment.startDate,
                    endDate: investment.endDate,
                    monthlyYield
                }).catch(e => console.error('[Investment Email Error]', e.message));
            }

            // 2. SMS
            if (phone) {
                await sendSms(phone, `Congratulations ${customer?.fullName}! Your FD investment of LKR ${Number(investment.investedAmount).toLocaleString()} in ${investment.planName || 'your plan'} has been APPROVED and activated. Ref: ${investment.referenceNumber}. Monthly yield: LKR ${monthlyYield.toLocaleString()}. - NF Plantation`).catch(e => console.error('[Investment SMS Error]', e.message));
            }

            // 3. Dashboard Notification
            const Notification = require('../models/Notification');
            await Notification.create({
                userId: user?._id,
                customerId: investment.customerId,
                title: 'Investment Activated!',
                message: `Congratulations! Your ${investment.planName || 'FD'} investment of LKR ${Number(investment.investedAmount).toLocaleString()} has been approved and activated. Monthly yield: LKR ${monthlyYield.toLocaleString()}. Ref: ${investment.referenceNumber}.`,
                type: 'SUCCESS'
            }).catch(e => console.error('[Investment Notification Error]', e.message));

        } catch (postErr) {
            console.error('[Post-Approval Notification Error]', postErr.message);
        }

    } catch (error) {
        await safeAbortTransaction(session);
        next(error);
    } finally {
        if (session) session.endSession();
    }
};

exports.getInvestmentDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const inv = await CustomerInvestment.findById(id).populate('planId').lean();
        if (!inv) return res.status(404).json({ success: false, message: 'Investment not found' });

        const cust = await Customer.findById(inv.customerId).lean();
        const Application = require('../models/Application');
        const PendingApproval = require('../models/PendingApproval');
        const { getImageBase64FromS3 } = require('../utils/s3Service');
        const app = await Application.findOne({ customerId: inv.customerId }).sort({ createdAt: -1 }).lean();
        const wallet = await Wallet.findOne({ customerId: inv.customerId }).lean();
        const user = await User.findOne({ customerId: inv.customerId }).lean();

        // Fetch registration signature from PendingApproval via applicationId
        const pendingApproval = app
            ? await PendingApproval.findOne({ applicationId: app._id }).lean()
            : null;

        // Check for duplicate active investments (same customer, same plan, ACTIVE status)
        const duplicateCount = await CustomerInvestment.countDocuments({
            customerId: inv.customerId,
            planId: inv.planId,
            status: 'ACTIVE',
            _id: { $ne: inv._id }
        });

        // Build merged address: prefer Customer record, fallback to PendingApproval
        const mergedAddress = (cust?.address?.line1 || cust?.address?.city)
            ? cust.address
            : {
                line1: pendingApproval?.address || '',
                city: pendingApproval?.city || '',
                district: pendingApproval?.district || '',
                province: pendingApproval?.province || ''
            };

        // Build merged bankDetails: prefer Customer record, fallback to app/pendingApproval
        const mergedBankDetails = (cust?.bankDetails?.accountNumber || cust?.bankName)
            ? (cust.bankDetails || { bankName: cust.bankName, branchName: cust.branchName, accountHolder: cust.accountHolder, accountNumber: cust.accountNumber })
            : (app?.bankDetails || {
                bankName: pendingApproval?.bankName,
                branchName: pendingApproval?.branchName,
                accountHolder: pendingApproval?.accountHolder,
                accountNumber: pendingApproval?.accountNumber
            });

        // Generate pre-signed URL for registration signature (S3 private bucket)
        const rawRegSig = cust?.signature || pendingApproval?.signature || null;
        const registrationSignature = rawRegSig ? await getImageBase64FromS3(rawRegSig).catch(() => null) : null;

        res.json({
            success: true,
            data: {
                investment: inv,
                customer: {
                    ...cust,
                    email: user?.email || cust?.email,
                    userId: user?.userId,
                    applicationStatus: app?.status,
                    address: mergedAddress,
                    bankDetails: mergedBankDetails,
                    registrationSignature,
                    dob: cust?.dob || pendingApproval?.dob,
                    gender: cust?.gender || pendingApproval?.gender
                },
                application: app,
                wallet: wallet,
                hasDuplicate: duplicateCount > 0
            }
        });
    } catch (error) {
        next(error);
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
        
        if (wallet) {
            const heldBefore = wallet.heldBalance;
            const availableBefore = wallet.availableBalance;
            const totalBefore = wallet.totalBalance;

            // Restore Funds from Held to Available
            wallet.heldBalance = Math.max(0, (wallet.heldBalance || 0) - investment.investedAmount);
            wallet.availableBalance += investment.investedAmount;
            await wallet.save({ session });

            await Transaction.create([{
                customerId: investment.customerId,
                walletId: wallet._id,
                type: 'RELEASE',
                referenceType: 'INVESTMENT',
                referenceId: investment._id,
                amount: investment.investedAmount,
                status: 'COMPLETED',
                description: `FD Activation Rejected - Funds Released to Available Balance - Ref: ${investment.referenceNumber}`,
                balanceBefore: totalBefore,
                balanceAfter: wallet.totalBalance,
                availableBefore: availableBefore,
                availableAfter: wallet.availableBalance,
                heldBefore: heldBefore,
                heldAfter: wallet.heldBalance,
                createdBy: req.user ? req.user._id : null
            }], { session });
        }

        investment.status = 'REJECTED';
        investment.rejectionReason = reason;
        await investment.save({ session });

        await safeCommitTransaction(session);
        res.json({ success: true, message: 'Investment request rejected and funds restored' });

        // Post-commit: notify customer (non-blocking)
        try {
            const customer = await Customer.findById(investment.customerId).lean();
            const user = await User.findOne({ customerId: investment.customerId }).lean();

            const email = user?.email || customer?.email;
            const phone = customer?.mobile || customer?.phone || user?.phone;
            const amount = Number(investment.investedAmount).toLocaleString();
            const planName = investment.planName || 'your investment plan';

            if (email) {
                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT) || 587,
                    secure: false,
                    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                });
                await transporter.sendMail({
                    from: `"NF Plantation" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                    to: email,
                    subject: 'Investment Activation Request - Update Required | NF Plantation',
                    html: `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
                            <h2 style="color:#dc2626">Investment Request: Action Required</h2>
                            <p>Dear ${customer?.fullName || 'Investor'},</p>
                            <p>Your FD investment activation request for <strong>${planName}</strong> (LKR ${amount}) has been reviewed and requires attention.</p>
                            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0">
                                <strong>Reference:</strong> ${investment.referenceNumber}<br/>
                                <strong>Reason:</strong> ${reason || 'Please contact our support team for details.'}
                            </div>
                            <p>Your held funds of <strong>LKR ${amount}</strong> have been released back to your available balance.</p>
                            <p>Please contact our support team or resubmit your application after addressing the issue.</p>
                            <p style="color:#64748b;font-size:12px;margin-top:24px">NF Plantation (Pvt) Ltd. | Reg. No: PV 00303425</p>
                        </div>`
                }).catch(e => console.error('[Rejection Email Error]', e.message));
            }

            if (phone) {
                await sendSms(phone, `NF Plantation: Your FD activation request (Ref: ${investment.referenceNumber}) requires attention. Reason: ${reason || 'See email for details'}. Funds released to your wallet. Contact support for assistance.`).catch(e => console.error('[Rejection SMS Error]', e.message));
            }

            const Notification = require('../models/Notification');
            await Notification.create({
                userId: user?._id,
                customerId: investment.customerId,
                title: 'Investment Activation Update',
                message: `Your FD activation request (Ref: ${investment.referenceNumber}) for LKR ${amount} has been reviewed. ${reason ? `Reason: ${reason}` : 'Please contact support.'} Your funds have been released to your available balance.`,
                type: 'WARNING'
            }).catch(e => console.error('[Rejection Notification Error]', e.message));

        } catch (postErr) {
            console.error('[Post-Rejection Notification Error]', postErr.message);
        }

    } catch (error) {
        await safeAbortTransaction(session);
        next(error);
    } finally {
        if (session) session.endSession();
    }
};

exports.getPayoutList = async (req, res, next) => {
    try {
        const { status = 'PENDING' } = req.query; // PENDING for Active Payouts, COMPLETED for History
        const payouts = await Payout.find({
            status: { $regex: new RegExp(`^${status}$`, 'i') }
        })
            .populate('customerId', 'fullName nic mobile bankDetails')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: payouts });
    } catch (error) {
        next(error);
    }
};

exports.getAdminActivityLog = async (req, res, next) => {
    try {
        const AuditLog = require('../models/AuditLog');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const skip = (page - 1) * limit;

        const logs = await AuditLog.find()
            .populate('userId', 'name userId email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await AuditLog.countDocuments();

        res.json({
            success: true,
            data: logs,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};

exports.getReportSummary = async (req, res, next) => {
    try {
        const Branch = require('../models/Branch');

        const [
            depositStats, withdrawalStats, investmentStats,
            profitStats, pendingPayoutStats,
            branchList, customerByBranch, planWise,
            totalCustomers, kycVerified
        ] = await Promise.all([
            DepositRequest.aggregate([
                { $match: { status: 'APPROVED' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            WithdrawalRequest.aggregate([
                { $match: { status: { $in: ['COMPLETED', 'APPROVED'] } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            CustomerInvestment.aggregate([
                { $match: { status: 'ACTIVE' } },
                { $group: { _id: null, total: { $sum: '$investedAmount' } } }
            ]),
            Transaction.aggregate([
                { $match: { type: { $in: ['PROFIT', 'EARNING'] }, status: 'COMPLETED' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Payout.aggregate([
                { $match: { status: 'PENDING' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Branch.find({}, 'name _id').lean(),
            Customer.aggregate([
                {
                    $group: {
                        _id: '$branchId',
                        total: { $sum: 1 },
                        active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
                    }
                }
            ]),
            CustomerInvestment.aggregate([
                {
                    $group: {
                        _id: { planName: '$planName', status: '$status' },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$investedAmount' }
                    }
                }
            ]),
            Customer.countDocuments(),
            Customer.countDocuments({ isActive: true })
        ]);

        const branchMap = {};
        branchList.forEach(b => { branchMap[b._id.toString()] = b.name; });

        const branchWise = customerByBranch
            .filter(b => b._id)
            .map(b => ({
                name: branchMap[b._id.toString()] || 'Unknown Branch',
                total: b.total,
                active: b.active,
                inactive: b.total - b.active
            }))
            .filter(b => b.name !== 'Unknown Branch')
            .sort((a, b) => b.total - a.total);

        const planMap = {};
        planWise.forEach(item => {
            const name = item._id.planName || 'Other';
            if (!planMap[name]) planMap[name] = { name, active: 0, matured: 0, completed: 0, totalAmount: 0 };
            const s = item._id.status;
            if (s === 'ACTIVE') planMap[name].active += item.count;
            else if (s === 'MATURED') planMap[name].matured += item.count;
            else if (s === 'COMPLETED') planMap[name].completed += item.count;
            planMap[name].totalAmount += item.totalAmount;
        });

        const kycRatio = totalCustomers > 0 ? parseFloat(((kycVerified / totalCustomers) * 100).toFixed(1)) : 0;

        res.json({
            success: true,
            data: {
                finance: {
                    totalDeposits: depositStats[0]?.total || 0,
                    totalWithdrawals: withdrawalStats[0]?.total || 0,
                    activeCapital: investmentStats[0]?.total || 0,
                    totalProfitPaid: profitStats[0]?.total || 0,
                    pendingPayouts: pendingPayoutStats[0]?.total || 0
                },
                customers: {
                    branchWise,
                    kycRatio,
                    totalCustomers,
                    kycVerified
                },
                investments: {
                    planWise: Object.values(planMap).sort((a, b) => b.totalAmount - a.totalAmount)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
