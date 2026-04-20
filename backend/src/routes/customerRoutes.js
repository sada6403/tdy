const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const customerController = require('../controllers/customerController');
const planController = require('../controllers/planController');
const notificationController = require('../controllers/notificationController');
const walletController = require('../controllers/walletController');
const { upload } = require('../utils/s3Service');
const { requireIdempotency } = require('../middleware/idempotencyMiddleware');
const { body } = require('express-validator');

// Public Routes
router.get('/plans', planController.getPublicPlans);
router.get('/branches', require('../controllers/branchController').getAllBranches);

// Protected Routes
router.use(protect, authorize('CUSTOMER'));
router.get('/profile', customerController.getProfile);
router.get('/wallet', walletController.getWalletSummary);
router.get('/activities', walletController.getWalletActivities);
router.post('/invest/send-otp', customerController.sendInvestmentOtp);
router.post('/invest/verify-otp', customerController.verifyInvestmentOtp);
router.post('/invest', requireIdempotency(), customerController.createInvestment);
router.get('/my-investments', customerController.getMyInvestments);
router.get('/my-investments/:id/certificate', customerController.downloadInvestmentCertificate);
router.post('/change-password/send-otp', customerController.sendChangePasswordOtp);
router.post('/change-password/update', customerController.updatePasswordWithOtp);
router.post('/update-photo', upload.single('photo'), customerController.updateProfilePhoto);

// Deposits (Add Cash)
router.post('/deposit-request', requireIdempotency(), upload.fields([{ name: 'bankProof', maxCount: 1 }]), customerController.submitDepositRequest);
router.get('/deposit-history', customerController.getDepositHistory);

// Withdrawals
router.post('/withdrawal-request', requireIdempotency(), customerController.submitWithdrawalRequest);
router.get('/withdrawal-history', customerController.getWithdrawalHistory);
router.get('/withdrawal-request/:id', customerController.getWithdrawalDetails);
router.put('/withdrawal-request/:id/edit', customerController.editWithdrawalRequest);
router.post('/withdrawal-request/:id/cancel', customerController.cancelWithdrawalRequest);
router.get('/withdrawal-request/:id/proof', customerController.downloadWithdrawalProof);

// Notifications
router.get('/notifications', notificationController.getMyNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);

module.exports = router;
