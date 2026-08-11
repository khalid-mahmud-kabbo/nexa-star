const Device = require('../models/Devices');
const ApiError = require('../utils/ApiError');

const MAX_DEVICES_PER_USER = 10;

async function listDevices(userId) {
    const devices = await Device.find({ user: userId })
        .sort({ createdAt: -1 });

    return devices.map((device) => device.toSafeJSON());
}

async function createDevice(userId, data) {
    const {
        deviceName,
        gaid,
        proxyHost,
        proxyPort,
        proxyUsername,
        proxyPassword,
    } = data;

    if (!deviceName?.trim()) {
        throw new ApiError(400, 'Device name is required.');
    }

    if (!gaid?.trim()) {
        throw new ApiError(400, 'Google Advertising ID (GAID) is required.');
    }

    const count = await Device.countDocuments({
        user: userId,
        revoked: false,
    });

    if (count >= MAX_DEVICES_PER_USER) {
        throw new ApiError(
            400,
            `You can have at most ${MAX_DEVICES_PER_USER} active devices.`
        );
    }

    // Prevent duplicate GAID
    const existing = await Device.findOne({
        gaid: gaid.trim().toUpperCase(),
    });

    if (existing) {
        throw new ApiError(
            409,
            'This Google Advertising ID (GAID) is already registered.'
        );
    }

    const device = await Device.create({
        user: userId,

        deviceName: deviceName.trim(),
        gaid: gaid.trim().toUpperCase(),

        proxyHost: proxyHost?.trim() || '',
        proxyPort: proxyPort || null,

        proxyUsername: proxyUsername?.trim() || '',
        proxyPassword: proxyPassword?.trim() || '',
    });

    return device.toSafeJSON();
}

async function revokeDevice(userId, deviceId) {
    const device = await Device.findOne({
        _id: deviceId,
        user: userId,
    });

    if (!device) {
        throw new ApiError(404, 'Device not found.');
    }

    device.revoked = true;

    await device.save();

    return device.toSafeJSON();
}

module.exports = {
    listDevices,
    createDevice,
    revokeDevice,
};