const express = require('express');
const productApiController = require('../controllers/productApi.controller');
const { requireApiKey } = require('../middleware/apiUsage.middleware');

const router = express.Router();

router.get('/ping', requireApiKey, productApiController.ping);

module.exports = router;
