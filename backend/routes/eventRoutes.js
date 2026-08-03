const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST create event (Admin protected)
// Path: /api/events/createEvent
router.post('/createEvent', verifyToken, eventController.createEvent);

// GET all events (Public)
// Path: /api/events/getAllEvents
router.get('/getAllEvents', eventController.getAllEvents);

// GET event by ID (Public)
// Path: /api/events/:event_id
router.get('/:event_id', eventController.getEventById);

// PATCH update event (Admin protected)
// Path: /api/events/:event_id/updateEvent
router.patch('/:event_id/updateEvent', verifyToken, eventController.updateEvent);

// DELETE event (Admin protected)
// Path: /api/events/:event_id
router.delete('/:event_id', verifyToken, eventController.deleteEvent);

module.exports = router;
