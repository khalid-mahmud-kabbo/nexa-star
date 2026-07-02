const User = require('../models/User');
const Transaction = require('../models/Transaction');

const REFERRAL_PERCENT = Number(process.env.REFERRAL_COMMISSION_PERCENT || 10);

/**
 * Credits the referring user their commission for a completed plan
 * purchase made by someone they referred. No-op if the buyer has no
 * referrer.
 */
async function creditReferralCommission(buyer, purchaseTransaction) {
  if (!buyer.referredBy) return null;

  const referrer = await User.findById(buyer.referredBy);
  if (!referrer) return null;

  const commissionAmount = Number(((purchaseTransaction.amount * REFERRAL_PERCENT) / 100).toFixed(2));

  referrer.balance += commissionAmount;
  referrer.totalEarnings += commissionAmount;
  await referrer.save();

  return Transaction.create({
    user: referrer._id,
    type: 'referral_commission',
    amount: commissionAmount,
    status: 'completed',
    sourceUser: buyer._id,
    sourceTransaction: purchaseTransaction._id,
    meta: {
      planId: purchaseTransaction.planId,
      planName: purchaseTransaction.planName,
      percent: REFERRAL_PERCENT
    }
  });
}

module.exports = { creditReferralCommission, REFERRAL_PERCENT };
