const asyncHandler = require('../utils/asyncHandler');
const paymentService = require('../services/payment.service');

const checkout = asyncHandler(async (req, res) => {
  const result = await paymentService.createCheckout(req.user, req.body.planId);
  res.json(result);
});

const webhook = asyncHandler(async (req, res) => {
  const invoiceId = req.body.invoice_id || req.body.invoiceId;
  const result = await paymentService.handleWebhook(invoiceId);
  res.json(result);
});

const status = asyncHandler(async (req, res) => {
  const result = await paymentService.getTransactionStatus(req.user, req.params.transactionId);
  res.json(result);
});

module.exports = { checkout, webhook, status };
