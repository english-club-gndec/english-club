const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// POST create event
// Path: /api/events/createEvent
router.post('/createEvent', eventController.createEvent);

// GET all events
// Path: /api/events/getAllEvents
router.get('/getAllEvents', eventController.getAllEvents);

// GET event by ID
// Path: /api/events/:event_id
router.get('/:event_id', eventController.getEventById);

// PATCH update event
// Path: /api/events/:event_id/updateEvent
router.patch('/:event_id/updateEvent', eventController.updateEvent);

module.exports = router;
