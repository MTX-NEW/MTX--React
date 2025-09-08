const express = require('express');
const router = express.Router();
const ediClientSettingController = require('../controllers/ediClientSettingController');

// Get current EDI settings
router.get('/', ediClientSettingController.getEDISettings);

// Update EDI settings
router.put('/', ediClientSettingController.updateEDISettings);

// Initialize default EDI settings
router.post('/initialize', ediClientSettingController.initializeEDISettings);

module.exports = router;
