const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema(
  {
    // Owner
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Device Information
    deviceName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    gaid: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },

    // Proxy Information
    proxyHost: {
      type: String,
      required: true,
      trim: true,
    },

    proxyPort: {
      type: Number,
      required: true,
      min: 1,
      max: 65535,
    },

    proxyUsername: {
      type: String,
      default: '',
      trim: true,
    },

    proxyPassword: {
      type: String,
      default: '',
      trim: true,
    },

    revoked: {
      type: Boolean,
      default: false,
    },

    lastUsedAt: {
      type: Date,
      default: null,
    },

    usage: {
      date: {
        type: String,
        default: null, // YYYY-MM-DD
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);


DeviceSchema.methods.toSafeJSON = function () {
    return {
        id: this._id,
        deviceName: this.deviceName,
        gaid: this.gaid,
        proxyHost: this.proxyHost,
        proxyPort: this.proxyPort,
        proxyUsername: this.proxyUsername,
        proxyPassword: this.proxyPassword,
        key: this.key,
        revoked: this.revoked,
        lastUsedAt: this.lastUsedAt,
        usage: this.usage,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

module.exports = mongoose.model('Device', DeviceSchema);