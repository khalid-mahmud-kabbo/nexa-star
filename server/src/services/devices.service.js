const Device = require('../models/Device');
const ApiError = require('../utils/ApiError');

const MAX_KEYS_PER_USER = 10;

async function listDevices(userId) {
  const keys = await Device.find({ user: userId }).sort({ createdAt: -1 });
  return keys.map((k) => k.toSafeJSON());
}

async function createDevice(userId, label) {
  if (!label || !label.trim()) {
    throw new ApiError(400, 'A label is required (e.g. "Production server").');
  }

  const existingCount = await Device.countDocuments({ user: userId, revoked: false });
  if (existingCount >= MAX_KEYS_PER_USER) {
    throw new ApiError(400, `You can have at most ${MAX_KEYS_PER_USER} active API keys.`);
  }

  const key = await Device.create({ user: userId, label: label.trim() });
  return key.toSafeJSON();
}


async function revokeDevice(userId, deviceId) {
  const key = await Device.findOne({ _id: deviceId, user: userId });
  if (!key) throw new ApiError(404, 'Device not found.');

  key.revoked = true;
  await key.save();
  return key.toSafeJSON();
}

module.exports = { listDevices, createDevice, revokeDevice };
