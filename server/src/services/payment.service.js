const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { getPlan } = require('../config/plans');
const ApiError = require('../utils/ApiError');
const zinipay = require('../utils/zinipay');
const { creditReferralCommission } = require('./referral.service');

/**
 * Marks a plan_purchase transaction completed, activates the plan on the
 * buyer's account, and credits the referrer's commission. Idempotent:
 * safe to call more than once for the same transaction (e.g. webhook +
 * client-side status poll both firing).
 */
async function fulfillPlanPurchase(transaction) {
  if (transaction.status === 'completed') return transaction; // already handled

  const plan = getPlan(transaction.planId);
  if (!plan) throw new ApiError(500, `Unknown planId on transaction: ${transaction.planId}`);

  const buyer = await User.findById(transaction.user);
  if (!buyer) throw new ApiError(500, 'Buyer not found for transaction.');

  const now = new Date();
  const currentExpiry = buyer.plan?.expiresAt ? new Date(buyer.plan.expiresAt) : null;
  const base = currentExpiry && currentExpiry > now ? currentExpiry : now; // extend if still active
  const expiresAt = new Date(base.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  buyer.plan = {
    id: plan.id,
    name: plan.name,
    startedAt: buyer.plan?.startedAt || now,
    expiresAt,
    dailyLimit: plan.dailyLimit
  };
  await buyer.save();

  transaction.status = 'completed';
  await transaction.save();

  await creditReferralCommission(buyer, transaction);

  return transaction;
}

async function createCheckout(user, planId) {
  const plan = getPlan(planId);
  if (!plan) throw new ApiError(400, 'Invalid planId.');

  const transaction = await Transaction.create({
    user: user._id,
    type: 'plan_purchase',
    planId: plan.id,
    planName: plan.name,
    amount: plan.price,
    status: 'pending'
  });

  const invoice = await zinipay.createInvoice({
    customerName: user.name,
    customerEmail: user.email,
    amount: plan.price,
    metadata: {
      order_id: transaction._id.toString(),
      customer_id: user._id.toString(),
      plan_id: plan.id
    }
  });

  if (!invoice.status || !invoice.payment_url) {
    transaction.status = 'failed';
    await transaction.save();
    throw new ApiError(502, 'Could not create ZiniPay invoice.', invoice.message);
  }

  transaction.zinipayInvoiceId = invoice.invoice_id;
  transaction.zinipayPaymentUrl = invoice.payment_url;
  await transaction.save();

  return { payment_url: invoice.payment_url, transaction_id: transaction._id };
}

async function handleWebhook(invoiceId) {
  if (!invoiceId) throw new ApiError(400, 'invoice_id missing from webhook payload.');

  const transaction = await Transaction.findOne({ zinipayInvoiceId: invoiceId });
  if (!transaction) throw new ApiError(404, 'Unknown invoice.');

  // Always re-verify server-to-server rather than trusting the webhook body directly.
  const verifyData = await zinipay.verifyInvoice(invoiceId);

  if (zinipay.isPaid(verifyData)) {
    await fulfillPlanPurchase(transaction);
    return { received: true, status: 'completed' };
  }

  return { received: true, status: transaction.status };
}

async function getTransactionStatus(user, transactionId) {
  const transaction = await Transaction.findOne({ _id: transactionId, user: user._id });
  if (!transaction) throw new ApiError(404, 'Transaction not found.');

  if (transaction.status === 'pending' && transaction.zinipayInvoiceId) {
    const verifyData = await zinipay.verifyInvoice(transaction.zinipayInvoiceId);
    if (zinipay.isPaid(verifyData)) {
      await fulfillPlanPurchase(transaction);
    }
  }

  return { status: transaction.status, transaction };
}

module.exports = { createCheckout, handleWebhook, getTransactionStatus, fulfillPlanPurchase };
