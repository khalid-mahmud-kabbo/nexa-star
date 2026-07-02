// Central source of truth for subscription plans.
// dailyLimit = -1 means unlimited API requests/day.
const PLANS = {
  day: {
    id: 'day',
    name: 'Day Plan',
    price: 2.0,
    durationDays: 1,
    dailyLimit: 60,
    deviceLimit: 4
  },
  week: {
    id: 'week',
    name: 'Week Plan',
    price: 10.0,
    durationDays: 7,
    dailyLimit: 70,
    deviceLimit: 6
  },
  month: {
    id: 'month',
    name: 'Month Plan',
    price: 35.0,
    durationDays: 30,
    dailyLimit: 100,
    deviceLimit: 10
  },
  year: {
    id: 'year',
    name: 'Year Plan',
    price: 100.0,
    durationDays: 365,
    dailyLimit: -1, // unlimited
    deviceLimit: -1 // unlimited
  }
};

function getPlan(planId) {
  return PLANS[planId] || null;
}

module.exports = { PLANS, getPlan };
