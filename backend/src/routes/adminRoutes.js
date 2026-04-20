const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const planController = require('../controllers/planController');
const adminController = require('../controllers/adminController');
const notificationController = require('../controllers/notificationController');
const expenseController = require('../controllers/expenseController');
const approvalController = require('../controllers/approvalController');
const branchController = require('../controllers/branchController');
const customerAdminController = require('../controllers/customerAdminController');
const customerReportController = require('../controllers/customerReportController');
const heroController = require('../controllers/heroController');
const contactController = require('../controllers/contactController');
const { uploadMarketing } = require('../utils/s3Service');

const handleValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			message: 'Validation failed',
			data: null,
			errors: errors.array(),
		});
	}

	return next();
};

// Publicly accessible for image loading (Security by Obscurity via S3 Keys)
router.get('/view-document', approvalController.proxyS3Document);

// All Admin routes should be protected by ADMIN role
router.use(protect, authorize('ADMIN'));

// Dashboard Metrics
router.get('/dashboard', adminController.getDashboardMetrics);

// Customer Management
router.get('/customers', customerAdminController.getCustomerList);
router.get('/customers/summary', customerAdminController.getCustomerSummary);
router.get('/customers/:id', customerAdminController.getCustomerProfile);
router.get('/customers/:id/wallet', customerAdminController.getCustomerWallet);
router.get('/customers/:id/investments', customerAdminController.getCustomerInvestments);
router.get('/customers/:id/transactions', customerAdminController.getCustomerTransactions);
router.get('/customers/:id/activity', customerAdminController.getCustomerActivity);
router.get('/customers/:id/financial-summary', customerAdminController.getCustomerFinancialSummary);
router.get('/customers/:id/download/:category', customerAdminController.downloadCustomerData);
router.get('/customers/:id/report/:category', customerReportController.generateReport);

router.post('/customers', adminController.createCustomer);
router.get('/users', adminController.getAllUsers);
router.put('/customers/:id/status', adminController.updateCustomerStatus);
router.delete('/customers/:id', adminController.deleteCustomer);

// Manage Investment Plans
router.get('/plans', planController.getAllPlans);
router.get('/plans/:id', planController.getPlanById);
router.post('/plans', planController.createPlan);
router.put('/plans/:id', planController.updatePlan);
router.patch('/plans/:id/status', planController.toggleStatus);
router.patch('/plans/:id/visibility', planController.toggleVisibility);
router.delete('/plans/:id', planController.deletePlan);

// Monitor Investments
router.get('/investments', adminController.getAllInvestments);
router.get('/investments/:id/details', adminController.getInvestmentDetails);
router.post('/investments/:id/approve', adminController.approveInvestment);
router.post('/investments/:id/reject', adminController.rejectInvestment);
router.put('/investments/:id/status', adminController.updateInvestmentStatus);

// Manage Notifications
router.post('/notifications', notificationController.createNotification);
router.get('/notifications', notificationController.getAllNotifications);

// Manage Expenses (Cost Management)
router.get('/expenses', expenseController.getExpenses);
router.post('/expenses', expenseController.createExpense);
router.get('/expenses/distribution', expenseController.getExpenseDistribution);

// Manage Approvals
router.get('/approvals', approvalController.getPendingApprovals);
router.get('/approvals-resend', approvalController.getResendApprovals);
router.get('/approvals-flat', approvalController.getPendingApprovalsFlat);
router.get('/approvals/history', approvalController.getApprovalHistory);
router.get('/rejected-applications', approvalController.getRejectedApplications);

router.get(
	'/approvals/:id/details',
	// param('id').isMongoId().withMessage('Approval ID must be a valid MongoDB ID'),
	// handleValidation,
	approvalController.getApprovalDetails
);
router.post(
	'/approvals/:id/approve',
	param('id').isMongoId().withMessage('Approval ID must be a valid MongoDB ID'),
	handleValidation,
	approvalController.approveApprovalRequest
);
router.post(
	'/approvals/:id/reject',
	param('id').isMongoId().withMessage('Approval ID must be a valid MongoDB ID'),
	body('reason').optional({ values: 'falsy' }).isString().withMessage('Reason must be a string'),
	handleValidation,
	approvalController.rejectApprovalRequest
);
router.post(
	'/approvals/:id/resend',
	param('id').isMongoId().withMessage('Approval ID must be a valid MongoDB ID'),
	body('issues').notEmpty().withMessage('Issues for correction are required'),
	handleValidation,
	approvalController.resendApplication
);
router.post(
	'/application/resend',
	body('applicationId').isMongoId().withMessage('Application ID must be a valid MongoDB ID'),
	body('issues').notEmpty().withMessage('Issues for correction are required'),
	handleValidation,
	approvalController.resendApplication
);
router.put('/approvals/:id/status', approvalController.updateApprovalStatus);

// Manage Groups
router.get('/groups', adminController.getCustomerGroups);

// Analytics & Engine
router.get('/analytics', adminController.getAnalytics);
router.post('/run-monthly-payouts', adminController.runMonthlyPayouts);
router.get('/payout-schedules', adminController.getPayoutSchedules);
router.get('/payout-logs/:id', adminController.getPayoutDetail);

// Manage Branches
router.get('/branches', branchController.getAllBranches);
router.post('/branches', branchController.createBranch);
router.delete('/branches/:id', branchController.deleteBranch);

// Manage Agents
const agentController = require('../controllers/agentController');
router.get('/agents', agentController.getAllAgents);
router.post('/agents', agentController.createAgent);
router.delete('/agents/:id', agentController.deleteAgent);

// Website Settings
const settingController = require('../controllers/settingController');
const eventController = require('../controllers/eventController');
router.get('/website-settings', settingController.getSettings);
router.put('/website-settings', settingController.updateSettings);

// Event Media Management
router.get('/events', eventController.getAllEvents);
router.post('/events', eventController.createEvent);
router.put('/events/:id', eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);

// Deposit Requests
router.get('/deposits', adminController.getDepositRequests);
router.post('/deposits/:id/approve', adminController.approveDepositRequest);
router.post('/deposits/:id/reject', adminController.rejectDepositRequest);
router.post('/deposits/:id/review', adminController.markDepositAsUnderReview);

// Withdrawal Requests
router.get('/withdrawals', adminController.getWithdrawalRequests);
router.get('/withdrawals/:id/details', adminController.getWithdrawalDetails);
router.post('/withdrawals/:id/approve', adminController.approveWithdrawalRequest);
router.post('/withdrawals/:id/reject', adminController.rejectWithdrawalRequest);
router.post('/withdrawals/:id/complete', adminController.completeWithdrawalRequest);
router.post('/withdrawals/:id/fail', adminController.failWithdrawalRequest);
router.get('/payout-list', adminController.getPayoutList);

// Hero Billboard Management
router.get('/hero-slides', heroController.getSlidesAdmin);
router.post('/hero-slides', heroController.createSlide);
router.put('/hero-slides/:id', heroController.updateSlide);
router.delete('/hero-slides/:id', heroController.deleteSlide);

// Contact Inquiries
router.get('/inquiries', contactController.getAllContacts);
router.patch('/inquiries/:id/read', contactController.markRead);

module.exports = router;
