const { PLANS } = require('../config/plans');

function listPlans() {
  return Object.values(PLANS);
}

module.exports = { listPlans };
