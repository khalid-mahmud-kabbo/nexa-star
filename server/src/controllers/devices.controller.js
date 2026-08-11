const axios = require('axios');
const asyncHandler = require('../utils/asyncHandler');
const { HttpsProxyAgent } = require('https-proxy-agent');
const deviceService = require('../services/devices.service');

const list = asyncHandler(async (req, res) => {
    const devices = await deviceService.listDevices(req.user._id);

    return res.status(200).json({
        success: true,
        data: devices,
    });
});

const create = asyncHandler(async (req, res) => {
    const {
        deviceName,
        gaid,
        proxyHost,
        proxyPort,
        proxyUsername,
        proxyPassword,
    } = req.body;

    // Basic validation
    if (!deviceName?.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Device name is required.',
        });
    }

    if (!gaid?.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Google Advertising ID (GAID) is required.',
        });
    }

    if (!proxyHost?.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Proxy host is required.',
        });
    }

    if (!proxyPort || isNaN(proxyPort)) {
        return res.status(400).json({
            success: false,
            message: 'A valid proxy port is required.',
        });
    }

    const device = await deviceService.createDevice(req.user._id, {
        deviceName: deviceName.trim(),
        gaid: gaid.trim().toUpperCase(),
        proxyHost: proxyHost.trim(),
        proxyPort: Number(proxyPort),
        proxyUsername: proxyUsername?.trim() || '',
        proxyPassword: proxyPassword?.trim() || '',
    });

    return res.status(201).json({
        success: true,
        message: 'Device created successfully.',
        data: device,
    });
});


const testProxy = async (req, res) => {
    const {
        proxyHost,
        proxyPort,
        proxyUsername,
        proxyPassword,
    } = req.body;

    let proxyUrl = '';

    if (proxyUsername && proxyPassword) {
        proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
    } else {
        proxyUrl = `http://${proxyHost}:${proxyPort}`;
    }

    try {
        const agent = new HttpsProxyAgent(proxyUrl);

        const response = await axios.get(
            'https://ipinfo.io/json',
            {
                httpsAgent: agent,
                timeout: 10000,
            }
        );

        return res.json({
            success: true,
            ip: response.data.ip,
            city: response.data.city,
            region: response.data.region,
            country: response.data.country,
            org: response.data.org,
        });

    } catch (e) {
    console.error('========== PROXY TEST ERROR ==========');
    console.error('Message:', e.message);
    console.error('Code:', e.code);
    console.error('Response:', e.response?.data);
    console.error(e);

    return res.status(500).json({
        success: false,
        message: e.message,
        code: e.code,
        details: e.response?.data || null,
    });
}
};

const revoke = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const device = await deviceService.revokeDevice(req.user._id, id);

    return res.status(200).json({
        success: true,
        message: 'Device revoked successfully.',
        data: device,
    });
});

module.exports = {
    list,
    create,
    revoke,
    testProxy,
};