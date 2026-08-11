const express = require('express');
const devicesController = require('../controllers/devices.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', devicesController.list);
router.post('/', devicesController.create);
router.delete('/:id', devicesController.revoke);
router.post('/test-proxy', devicesController.testProxy);

module.exports = router;
