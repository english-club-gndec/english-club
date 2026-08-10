const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Submit feedback for an event
router.post('/', feedbackController.submitFeedback);

// Get feedback & statistics for an event
router.get('/event/:event_id', feedbackController.getEventFeedback);

module.exports = router;
