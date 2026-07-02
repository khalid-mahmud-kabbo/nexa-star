const express = require('express');
const plansController = require('../controllers/plans.controller');

const router = express.Router();

router.get('/', plansController.listPlans);

module.exports = router;
