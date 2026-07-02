const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboard.service');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary(req.user);
  res.json(summary);
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await dashboardService.getHistory(req.user._id);
  res.json({ history });
});

const getReferrals = asyncHandler(async (req, res) => {
  const referrals = await dashboardService.getReferrals(req.user._id);
  res.json({ referrals });
});

module.exports = { getSummary, getHistory, getReferrals };
