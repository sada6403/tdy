const express = require('express');
const router = express.Router();
const heroController = require('../controllers/heroController');
const branchController = require('../controllers/branchController');
const contactController = require('../controllers/contactController');
const settingController = require('../controllers/settingController');
const eventController = require('../controllers/eventController');

// Hero Slides
router.get('/hero-slides', heroController.getPublicSlides);

// Events & Media
router.get('/events', eventController.getPublicEvents);

// Branches (Public list)
router.get('/branches', branchController.getAllBranches);

// Contact Submission
router.post('/contact', contactController.submitContact);

// Website Settings
router.get('/settings', settingController.getSettings);

module.exports = router;
