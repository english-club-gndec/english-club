const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken } = require('../middleware/authMiddleware');

// GET settings (Public)
router.get('/', settingsController.getSettings);

// POST settings (Admin protected)
router.post('/', verifyToken, settingsController.updateSettings);

module.exports = router;
