const User = require('../models/User');
const Transaction = require('../models/Transaction');

async function getSummary(user) {
  const referralCount = await User.countDocuments({ referredBy: user._id });

  return {
    totalEarnings: user.totalEarnings,
    balance: user.balance,
    referrals: referralCount,
    plan: user.plan,
    hasActivePlan: user.hasActivePlan(),
    usage: user.usage,
    referralLink: `${process.env.CLIENT_URL}/register?ref=${user.referralCode}`,
    referralCode: user.referralCode,
    commissionPercent: user.commissionPercent
  };
}

async function getHistory(userId) {
  return Transaction.find({ user: userId }).sort({ createdAt: -1 }).limit(100).lean();
}

async function getReferrals(userId) {
  const referrals = await User.find({ referredBy: userId })
    .select('name email createdAt plan')
    .sort({ createdAt: -1 })
    .lean();

  return referrals.map((r) => ({
    name: r.name,
    email: r.email,
    joinedAt: r.createdAt,
    hasActivePlan: !!(r.plan && r.plan.expiresAt && new Date(r.plan.expiresAt) > new Date()),
    planName: r.plan ? r.plan.name : null
  }));
}

module.exports = { getSummary, getHistory, getReferrals };
