const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');

const genApiKey = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 32);

const ApiKeySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, required: true, trim: true, maxlength: 60 },
    key: { type: String, unique: true, default: () => genApiKey() },
    revoked: { type: Boolean, default: false },
    lastUsedAt: { type: Date, default: null },
    usage: {
      date: { type: String, default: null }, // YYYY-MM-DD (UTC)
      count: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

ApiKeySchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    label: this.label,
    key: this.key,
    revoked: this.revoked,
    lastUsedAt: this.lastUsedAt,
    usage: this.usage,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('ApiKey', ApiKeySchema);
