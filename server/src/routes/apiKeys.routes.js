const express = require('express');
const apiKeysController = require('../controllers/apiKeys.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', apiKeysController.list);
router.post('/', apiKeysController.create);
router.delete('/:id', apiKeysController.revoke);

module.exports = router;
