const User = require('../../models/User');
const Customer = require('../../models/Customer');
const Wallet = require('../../models/Wallet');
const Transaction = require('../../models/Transaction');
const CustomerInvestment = require('../../models/CustomerInvestment');
const DepositRequest = require('../../models/DepositRequest');
const WithdrawalRequest = require('../../models/WithdrawalRequest');
const Application = require('../../models/Application');

/**
 * Service to aggregate data for various official reports
 */
class CustomerReportService {
    
    /**
     * Aggregates a comprehensive "Full Financial Report" for a customer
     */
    async getFullFinancialReport(userId) {
        const user = await User.findById(userId).populate({
            path: 'customerId',
            populate: { path: 'branchId' }
        }).lean();

        if (!user) throw new Error('Customer not found');
        const customer = user.customerId;
        const cId = customer?._id || customer;

        const [wallet, lastApp, investments, transactions, activity] = await Promise.all([
            Wallet.findOne({ customerId: cId }).lean(),
            Application.findOne({ customerId: cId }).sort({ createdAt: -1 }).lean(),
            CustomerInvestment.find({ customerId: cId }).populate('planId').sort({ createdAt: -1 }).lean(),
            Transaction.find({ customerId: cId }).sort({ createdAt: -1 }).limit(100).lean(),
            this.getCustomerTimeline(cId)
        ]);

        const financialSummary = await this.calculateFinancialMetrics(cId, investments, transactions);

        return {
            metadata: {
                reportTitle: 'Full Customer Financial Report',
                generatedAt: new Date(),
                category: 'FULL_AUDIT'
            },
            profile: {
                fullName: customer?.fullName || user.name,
                userId: user.userId,
                nic: customer?.nic || 'N/A',
                email: customer?.email || user.email,
                mobile: customer?.mobile || user.phone,
                branch: customer?.branchId?.name || lastApp?.preferredBranch || 'N/A',
                registrationDate: user.createdAt,
                status: customer?.kycStatus || 'ACTIVE',
                bankDetails: customer?.bankDetails || lastApp?.bankDetails || {}
            },
            wallet: wallet || { availableBalance: 0, heldBalance: 0, totalBalance: 0 },
            summary: financialSummary,
            investments: investments.map(inv => ({
                planName: inv.planId?.title,
                duration: inv.planId?.duration,
                amount: inv.amount,
                roi: inv.planId?.interestRate,
                startDate: inv.startDate,
                maturityDate: inv.endDate,
                status: inv.status
            })),
            transactions: transactions.map(tx => ({
                id: tx._id,
                date: tx.createdAt,
                type: tx.type,
                description: tx.description,
                reference: tx.referenceId,
                amount: tx.amount,
                status: tx.status
            })),
            timeline: activity
        };
    }

    async getProfileReport(userId) {
        const data = await this.getFullFinancialReport(userId);
        return {
            metadata: { ...data.metadata, reportTitle: 'Customer Identity Profile', category: 'PROFILE' },
            profile: data.profile
        };
    }

    async getWalletStatement(userId) {
        const data = await this.getFullFinancialReport(userId);
        return {
            metadata: { ...data.metadata, reportTitle: 'Official Wallet Statement', category: 'WALLET' },
            profile: data.profile,
            wallet: data.wallet,
            summary: data.summary,
            transactions: data.transactions.filter(t => ['DEPOSIT', 'WITHDRAWAL', 'PROFIT'].includes(t.type))
        };
    }

    async getInvestmentsReport(userId) {
        const data = await this.getFullFinancialReport(userId);
        return {
            metadata: { ...data.metadata, reportTitle: 'Investment Portfolio History', category: 'INVESTMENTS' },
            profile: data.profile,
            summary: data.summary,
            investments: data.investments
        };
    }

    async getTransactionsAudit(userId) {
        const data = await this.getFullFinancialReport(userId);
        return {
            metadata: { ...data.metadata, reportTitle: 'Complete Transaction Audit', category: 'TRANSACTIONS' },
            profile: data.profile,
            transactions: data.transactions
        };
    }

    async getWithdrawalsReport(userId) {
        const data = await this.getFullFinancialReport(userId);
        return {
            metadata: { ...data.metadata, reportTitle: 'Withdrawal & Payout Report', category: 'WITHDRAWALS' },
            profile: data.profile,
            summary: {
                totalWithdrawn: data.summary.totalWithdrawn,
                pendingWithdrawal: data.summary.pendingWithdrawal
            },
            transactions: data.transactions.filter(t => t.type === 'WITHDRAWAL')
        };
    }

    async getDepositsReport(userId) {
        const data = await this.getFullFinancialReport(userId);
        return {
            metadata: { ...data.metadata, reportTitle: 'Deposit & Funding Report', category: 'DEPOSITS' },
            profile: data.profile,
            summary: {
                totalDeposited: data.summary.totalDeposited,
                pendingDeposit: data.summary.pendingDeposit
            },
            transactions: data.transactions.filter(t => t.type === 'DEPOSIT')
        };
    }

    async getComplianceReport(userId) {
        const data = await this.getFullFinancialReport(userId);
        return {
            metadata: { ...data.metadata, reportTitle: 'Compliance & Audit Timeline', category: 'COMPLIANCE' },
            profile: data.profile,
            timeline: data.timeline
        };
    }

    async calculateFinancialMetrics(customerId, investments, transactions) {
        const [deposits, withdrawals] = await Promise.all([
            DepositRequest.find({ customerId, status: 'APPROVED' }).lean(),
            WithdrawalRequest.find({ customerId }).lean()
        ]);

        const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
        const totalWithdrawn = withdrawals.filter(w => w.status === 'COMPLETED').reduce((sum, w) => sum + w.amount, 0);
        const pendingWithdrawal = withdrawals.filter(w => ['PENDING', 'APPROVED'].includes(w.status)).reduce((sum, w) => sum + w.amount, 0);
        const totalInvested = investments.filter(i => ['ACTIVE', 'MATURED'].includes(i.status)).reduce((sum, i) => sum + i.amount, 0);
        const activeInvestmentTotal = investments.filter(i => i.status === 'ACTIVE').reduce((sum, i) => sum + i.amount, 0);
        const totalEarned = transactions.filter(t => t.type === 'PROFIT' && t.status === 'COMPLETED').reduce((sum, t) => sum + t.amount, 0);

        return {
            totalDeposited,
            totalWithdrawn,
            totalInvested,
            totalEarned,
            pendingWithdrawal,
            activeInvestmentTotal,
            pendingDeposit: await DepositRequest.countDocuments({ customerId, status: 'PENDING' })
        };
    }

    async getCustomerTimeline(customerId) {
        const [apps, deposits, investments, withdrawals] = await Promise.all([
            Application.find({ customerId }).lean(),
            DepositRequest.find({ customerId }).lean(),
            CustomerInvestment.find({ customerId }).lean(),
            WithdrawalRequest.find({ customerId }).lean()
        ]);

        let events = [];
        apps.forEach(a => {
            events.push({ date: a.createdAt, action: 'Registration Application Submitted', status: a.status });
            if (a.status === 'APPROVED') events.push({ date: a.updatedAt, action: 'Account KYC Approved', status: 'SUCCESS' });
        });
        deposits.forEach(d => {
            events.push({ date: d.createdAt, action: `Deposit Request (LKR ${d.amount})`, status: d.status });
            if (d.status === 'APPROVED') events.push({ date: d.updatedAt, action: `Deposit Approved`, status: 'SUCCESS' });
        });
        investments.forEach(i => {
           events.push({ date: i.createdAt, action: `Investment Plan Activated`, status: i.status });
        });
        withdrawals.forEach(w => {
            events.push({ date: w.createdAt, action: `Withdrawal Request (LKR ${w.amount})`, status: w.status });
            if (w.status === 'COMPLETED') events.push({ date: w.updatedAt, action: `Withdrawal Processed`, status: 'SUCCESS' });
        });

        return events.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

module.exports = new CustomerReportService();
