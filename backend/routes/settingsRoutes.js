const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, restrictRoles } = require('../middleware/authMiddleware');

// GET settings (Public)
router.get('/', settingsController.getSettings);

// POST settings (Admin protected - forbidden for INTERVIEWEE)
router.post('/', verifyToken, restrictRoles('INTERVIEWEE'), settingsController.updateSettings);

module.exports = router;
