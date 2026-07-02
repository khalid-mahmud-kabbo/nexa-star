const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/summary', dashboardController.getSummary);
router.get('/history', dashboardController.getHistory);
router.get('/referrals', dashboardController.getReferrals);

module.exports = router;
