const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// GET settings
router.get('/', settingsController.getSettings);

// POST settings
router.post('/', settingsController.updateSettings);

module.exports = router;
