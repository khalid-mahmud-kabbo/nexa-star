const express = require('express');

const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const plansRoutes = require('./plans.routes');
const paymentRoutes = require('./payment.routes');
const apiKeysRoutes = require('./apiKeys.routes');
const productApiRoutes = require('./productApi.routes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/plans', plansRoutes);
router.use('/payment', paymentRoutes);
router.use('/keys', apiKeysRoutes);
router.use('/v1', productApiRoutes);

module.exports = router;
