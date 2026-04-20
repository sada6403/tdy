const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const CustomerInvestment = require('../models/CustomerInvestment');
const DepositRequest = require('../models/DepositRequest');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const Application = require('../models/Application');
const InvestmentPlan = require('../models/InvestmentPlan');

/**
 * GET /api/admin/customers
 * Paginated list of all customers with search and filters
 */
exports.getCustomerList = async (req, res, next) => {
    try {
        const { search, branch, status, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let matchQuery = { role: 'CUSTOMER' };
        
        // Search filters
        if (search) {
            matchQuery['$or'] = [
                { name: { $regex: search, $options: 'i' } },
                { userId: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const aggregationResult = await User.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customerProfile'
                }
            },
            { $unwind: { path: '$customerProfile', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'customerProfile.branchId',
                    foreignField: '_id',
                    as: 'branchInfo'
                }
            },
            { $unwind: { path: '$branchInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'wallets',
                    localField: 'customerId',
                    foreignField: 'customerId',
                    as: 'wallet'
                }
            },
            { $unwind: { path: '$wallet', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'customerinvestments',
                    localField: 'customerId',
                    foreignField: 'customerId',
                    as: 'allInvestments'
                }
            },
            {
                $addFields: {
                    activePlansCount: {
                        $size: {
                            $filter: {
                                input: '$allInvestments',
                                as: 'inv',
                                cond: { $eq: ['$$inv.status', 'ACTIVE'] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    id: '$_id',
                    userId: '$userId',
                    name: { $ifNull: ['$customerProfile.fullName', '$name'] },
                    email: { $ifNull: ['$customerProfile.email', '$email'] },
                    phone: { $ifNull: ['$customerProfile.mobile', '$phone'] },
                    branch: { $ifNull: ['$branchInfo.name', 'N/A'] },
                    status: { $ifNull: ['$customerProfile.kycStatus', 'PENDING'] },
                    walletBalance: { $ifNull: ['$wallet.availableBalance', 0] },
                    activePlansCount: 1,
                    createdAt: 1
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: parseInt(limit) }
                    ]
                }
            }
        ]);

        const total = aggregationResult[0].metadata[0]?.total || 0;
        const data = aggregationResult[0].data;

        res.json({
            success: true,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/customers/summary
 */
exports.getCustomerSummary = async (req, res, next) => {
    try {
        const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });
        const activeCustomerIds = await CustomerInvestment.distinct('customerId', { status: 'ACTIVE' });

        res.json({
            success: true,
            data: {
                totalCustomers,
                activeCustomers: activeCustomerIds.length,
                inactiveCustomers: totalCustomers - activeCustomerIds.length,
                newToday: await User.countDocuments({ 
                    role: 'CUSTOMER', 
                    createdAt: { $gte: new Date().setHours(0,0,0,0) } 
                })
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/customers/:id
 */
exports.getCustomerProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id).populate({
            path: 'customerId',
            populate: { path: 'branchId' }
        }).lean();

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const customer = user.customerId;
        const cId = customer?._id || customer;
        
        const [wallet, lastApp, activePlans] = await Promise.all([
            Wallet.findOne({ customerId: cId }).lean(),
            Application.findOne({ customerId: cId }).sort({ createdAt: -1 }).lean(),
            CustomerInvestment.find({ customerId: cId, status: 'ACTIVE' }).populate('planId').lean()
        ]);

        const profile = {
            userId: user.userId,
            fullName: customer?.fullName || user.name,
            email: customer?.email || user.email,
            phone: customer?.mobile || user.phone,
            nic: customer?.nic || 'N/A',
            branch: customer?.branchId?.name || lastApp?.preferredBranch || 'N/A',
            registrationDate: user.createdAt,
            status: customer?.kycStatus || 'ACTIVE',
            bankDetails: customer?.bankDetails || lastApp?.bankDetails || {}
        };

        res.json({
            success: true,
            data: {
                profile,
                walletSummary: wallet || { availableBalance: 0, totalBalance: 0, heldBalance: 0 },
                activePlans,
                financialSummary: await this.calculateFinancialSummaryInternal(cId)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/customers/:id/financial-summary
 */
exports.getCustomerFinancialSummary = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const cId = user.customerId;
        const summary = await this.calculateFinancialSummaryInternal(cId);
        res.json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
};

/**
 * Internal helper for financial summary
 */
exports.calculateFinancialSummaryInternal = async (customerId) => {
    const [deposits, withdrawals, investments] = await Promise.all([
        DepositRequest.find({ customerId, status: 'APPROVED' }).lean(),
        WithdrawalRequest.find({ customerId }).lean(),
        CustomerInvestment.find({ customerId }).lean()
    ]);

    const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
    const totalWithdrawn = withdrawals.filter(w => w.status === 'COMPLETED').reduce((sum, w) => sum + w.amount, 0);
    const pendingWithdrawal = withdrawals.filter(w => ['PENDING', 'APPROVED'].includes(w.status)).reduce((sum, w) => sum + w.amount, 0);
    const totalInvested = investments.filter(i => ['ACTIVE', 'MATURED'].includes(i.status)).reduce((sum, i) => sum + i.amount, 0);
    const activeInvestmentTotal = investments.filter(i => i.status === 'ACTIVE').reduce((sum, i) => sum + i.amount, 0);

    const profitTransactions = await Transaction.find({ customerId, type: 'PROFIT', status: 'COMPLETED' }).lean();
    const totalEarned = profitTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
        totalDeposited,
        totalWithdrawn,
        totalInvested,
        totalEarned,
        pendingWithdrawal,
        activeInvestmentTotal,
        pendingDeposit: await DepositRequest.countDocuments({ customerId, status: 'PENDING' })
    };
};

/**
 * GET /api/admin/customers/:id/wallet
 */
exports.getCustomerWallet = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const cId = user.customerId;
        const wallet = await Wallet.findOne({ customerId: cId }).lean();
        const financialSummary = await this.calculateFinancialSummaryInternal(cId);
        
        res.json({
            success: true,
            data: {
                ...wallet,
                ...financialSummary
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/customers/:id/investments
 */
exports.getCustomerInvestments = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const investments = await CustomerInvestment.find({ customerId: user.customerId })
            .populate('planId')
            .sort({ createdAt: -1 })
            .lean();
        
        const data = investments.map(inv => ({
            id: inv._id,
            planName: inv.planId?.title,
            duration: inv.planId?.duration,
            investedAmount: inv.amount,
            startDate: inv.createdAt,
            maturityDate: inv.maturityDate,
            monthlyROI: inv.planId?.interestRate ? (inv.planId.interestRate / 12).toFixed(2) : 'N/A',
            status: inv.status
        }));

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/customers/:id/transactions
 */
exports.getCustomerTransactions = async (req, res, next) => {
    try {
        const { type, status, page = 1, limit = 20 } = req.query;
        const user = await User.findById(req.params.id);
        const cId = user.customerId;

        let query = { customerId: cId };
        if (type) query.type = type;
        if (status) query.status = status;

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            pagination: { total, page: parseInt(page), limit: parseInt(limit) },
            data: transactions
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/customers/:id/activity
 */
exports.getCustomerActivity = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const cId = user.customerId;

        const [apps, deposits, investments, withdrawals] = await Promise.all([
            Application.find({ customerId: cId }).lean(),
            DepositRequest.find({ customerId: cId }).lean(),
            CustomerInvestment.find({ customerId: cId }).populate('planId').lean(),
            WithdrawalRequest.find({ customerId: cId }).lean()
        ]);

        let events = [];

        apps.forEach(a => {
            events.push({ date: a.createdAt, action: 'Registration Application Submitted', type: 'REGISTRATION', status: a.status });
            if (a.status === 'APPROVED') events.push({ date: a.updatedAt, action: 'Account KYC Approved', type: 'APPROVAL', status: 'SUCCESS' });
        });

        deposits.forEach(d => {
            events.push({ date: d.createdAt, action: `Deposit Request Submitted (LKR ${d.amount})`, type: 'DEPOSIT', status: 'PENDING' });
            if (d.status === 'APPROVED') events.push({ date: d.updatedAt, action: `Deposit Approved and Wallet Credited (LKR ${d.amount})`, type: 'DEPOSIT', status: 'SUCCESS' });
        });

        investments.forEach(i => {
           events.push({ date: i.createdAt, action: `Activated ${i.planId?.title || 'Investment Plan'} (LKR ${i.amount.toLocaleString()})`, type: 'INVESTMENT', status: i.status });
        });

        withdrawals.forEach(w => {
            events.push({ date: w.createdAt, action: `Withdrawal Request Submitted (LKR ${w.amount})`, type: 'WITHDRAWAL', status: 'PENDING' });
            if (w.status === 'COMPLETED') events.push({ date: w.updatedAt, action: `Withdrawal Successfully Processed (LKR ${w.amount})`, type: 'WITHDRAWAL', status: 'SUCCESS' });
        });

        events.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json({ success: true, data: events });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/customers/:id/download/:category
 */
exports.downloadCustomerData = async (req, res, next) => {
    try {
        const { id, category } = req.params;
        res.json({ success: true, message: `Report for ${category} is being generated.`, downloadUrl: `https://dummy-bucket.s3.amazonaws.com/reports/${category}_${id}.pdf` });
    } catch (error) {
        next(error);
    }
};
