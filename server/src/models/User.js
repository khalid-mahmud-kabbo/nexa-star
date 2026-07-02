const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { customAlphabet } = require('nanoid');

const genReferralCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);
const genApiKey = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 32);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    // Affiliate / referral
    referralCode: { type: String, unique: true, default: () => genReferralCode() },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    totalEarnings: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    commissionPercent: { type: Number, default: 10 },

    // API access
    apiKey: { type: String, unique: true, sparse: true, default: () => genApiKey() }, // legacy default key

    // Active plan
    plan: {
      id: { type: String, default: null }, // 'day' | 'week' | 'month' | 'year'
      name: { type: String, default: null },
      startedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null },
      dailyLimit: { type: Number, default: 0 } // -1 = unlimited
    },

    // API usage counter, reset daily
    usage: {
      date: { type: String, default: null }, // YYYY-MM-DD (UTC)
      count: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

UserSchema.methods.setPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plainPassword, salt);
};

UserSchema.methods.checkPassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

UserSchema.methods.hasActivePlan = function () {
  return !!(this.plan && this.plan.expiresAt && new Date(this.plan.expiresAt) > new Date());
};

UserSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    referralCode: this.referralCode,
    totalEarnings: this.totalEarnings,
    balance: this.balance,
    apiKey: this.apiKey,
    plan: this.plan,
    usage: this.usage,
    hasActivePlan: this.hasActivePlan(),
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', UserSchema);
