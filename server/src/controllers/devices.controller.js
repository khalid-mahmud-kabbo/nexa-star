const asyncHandler = require('../utils/asyncHandler');
const deviceService = require('../services/devices.service');

const list = asyncHandler(async (req, res) => {
  const devices = await apiDeviceService.listDevices(req.user._id);
  res.json({ devices });
});

const create = asyncHandler(async (req, res) => {
  const device = await deviceService.createDevice(req.user._id, req.body.label);
  res.status(201).json({ device });
});

const revoke = asyncHandler(async (req, res) => {
  const device = await deviceService.revokeDevice(req.user._id, req.params.id);
  res.json({ device });
});

module.exports = { list, create, revoke };