const express = require('express');
const router = express.Router();
const {
    saveRegistrationDraft,
    loadRegistrationDraft,
    sendDraftOtp,
    verifyDraftOtp,
    finalizeRegistration
} = require('../controllers/registrationDraftController');

// All registration routes are public until the final submission converts them to real accounts
router.post('/draft', saveRegistrationDraft);
router.get('/draft/:tempSessionId', loadRegistrationDraft);
router.post('/send-otp', sendDraftOtp);
router.post('/verify-otp', verifyDraftOtp);
router.post('/finalize', finalizeRegistration);

module.exports = router;
