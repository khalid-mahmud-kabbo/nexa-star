const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    type: {
      type: String,
      enum: ['plan_purchase', 'referral_commission'],
      required: true
    },

    // Plan purchase fields
    planId: { type: String, default: null },
    planName: { type: String, default: null },

    // Referral commission fields
    sourceUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // who triggered the commission
    sourceTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },

    // ZiniPay linkage
    zinipayInvoiceId: { type: String, default: null, index: true },
    zinipayPaymentUrl: { type: String, default: null },

    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
