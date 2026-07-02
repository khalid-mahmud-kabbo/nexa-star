const asyncHandler = require('../utils/asyncHandler');
const plansService = require('../services/plans.service');

const listPlans = asyncHandler(async (req, res) => {
  res.json({ plans: plansService.listPlans() });
});

module.exports = { listPlans };
