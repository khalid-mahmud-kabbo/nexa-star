const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { todayUTC } = require('../utils/date');

/**
 * Authenticates requests to the metered product API using a named API key
 * (header: x-api-key) and enforces the owning user's plan daily request
 * limit. Usage is tracked per-key (so the dashboard can show which
 * integration is using the quota) but the limit itself is per-account,
 * matching the user's active plan. Unlimited plans (dailyLimit === -1)
 * bypass the counter.
 */
const requireApiKey = asyncHandler(async (req, res, next) => {
  const rawKey = req.header('x-api-key');
  if (!rawKey) {
    throw new ApiError(401, 'Missing x-api-key header.');
  }

  const apiKey = await ApiKey.findOne({ key: rawKey, revoked: false });
  if (!apiKey) {
    throw new ApiError(401, 'Invalid or revoked API key.');
  }

  const user = await User.findById(apiKey.user);
  if (!user) {
    throw new ApiError(401, 'Invalid API key.');
  }

  if (!user.hasActivePlan()) {
    throw new ApiError(402, 'No active plan. Purchase a plan to make API requests.');
  }

  const limit = user.plan.dailyLimit;
  const today = todayUTC();

  if (user.usage.date !== today) {
    user.usage.date = today;
    user.usage.count = 0;
  }
  if (apiKey.usage.date !== today) {
    apiKey.usage.date = today;
    apiKey.usage.count = 0;
  }

  if (limit !== -1 && user.usage.count >= limit) {
    throw new ApiError(429, 'Daily API request limit reached for your plan.', { limit, used: user.usage.count });
  }

  user.usage.count += 1;
  apiKey.usage.count += 1;
  apiKey.lastUsedAt = new Date();
  await Promise.all([user.save(), apiKey.save()]);

  req.apiUser = user;
  req.apiKeyDoc = apiKey;
  req.usage = { used: user.usage.count, limit };
  next();
});

module.exports = { requireApiKey };
