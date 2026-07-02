const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/checkout', requireAuth, paymentController.checkout);
router.get('/status/:transactionId', requireAuth, paymentController.status);

// Called server-to-server by ZiniPay - no user auth, verified against ZiniPay itself in the service layer.
router.post('/webhook', paymentController.webhook);

module.exports = router;
