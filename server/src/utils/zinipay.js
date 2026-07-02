const axios = require('axios');

const BASE_URL = process.env.ZINIPAY_BASE_URL || 'https://api.zinipay.com/v1';
const API_KEY = process.env.ZINIPAY_API_KEY;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'zini-api-key': API_KEY
  },
  timeout: 15000
});

/**
 * Create a hosted ZiniPay invoice.
 * @param {Object} params
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {number} params.amount - amount in BDT
 * @param {Object} params.metadata - arbitrary metadata (order_id, customer_id, etc.)
 * @returns {Promise<{status:boolean, payment_url:string, invoice_id:string, raw:Object}>}
 */
async function createInvoice({ customerName, customerEmail, amount, metadata = {} }) {
  const payload = {
    cus_name: customerName,
    cus_email: customerEmail,
    amount,
    metadata,
    redirect_url: process.env.ZINIPAY_REDIRECT_URL,
    cancel_url: process.env.ZINIPAY_CANCEL_URL,
    webhook_url: process.env.ZINIPAY_WEBHOOK_URL
  };

  const { data } = await client.post('/payment/create', payload);

  // ZiniPay returns payment_url like https://secure.zinipay.com/payment/INVOICE_ID
  let invoiceId = null;
  if (data && data.payment_url) {
    const parts = data.payment_url.split('/');
    invoiceId = parts[parts.length - 1];
  }

  return {
    status: !!(data && data.status),
    message: data && data.message,
    payment_url: data && data.payment_url,
    invoice_id: invoiceId,
    raw: data
  };
}

/**
 * Verify a ZiniPay invoice's current payment status.
 * @param {string} invoiceId
 * @returns {Promise<Object>} raw ZiniPay verify response
 */
async function verifyInvoice(invoiceId) {
  const { data } = await client.post('/payment/verify', { invoice_id: invoiceId });
  return data;
}

/**
 * Normalizes various possible "paid" status shapes ZiniPay may return
 * (defensive: real field names should be confirmed against your ZiniPay
 * dashboard/docs response before going live).
 */
function isPaid(verifyResponseData) {
  if (!verifyResponseData) return false;
  const status = (verifyResponseData.status || verifyResponseData.payment_status || '')
    .toString()
    .toLowerCase();
  return ['paid', 'success', 'completed', 'true'].includes(status) || verifyResponseData.status === true;
}

module.exports = { createInvoice, verifyInvoice, isPaid };
