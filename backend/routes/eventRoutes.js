const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// POST create event (Admin protected)
// Path: /api/events/createEvent
router.post('/createEvent', verifyToken, requirePermission('WRITE_EVENTS'), eventController.createEvent);

// GET all events (Public)
// Path: /api/events/getAllEvents
router.get('/getAllEvents', eventController.getAllEvents);

// GET event by ID (Public)
// Path: /api/events/:event_id
router.get('/:event_id', eventController.getEventById);

// PATCH update event (Admin protected)
// Path: /api/events/:event_id/updateEvent
router.patch('/:event_id/updateEvent', verifyToken, requirePermission('UPDATE_EVENTS'), eventController.updateEvent);

// DELETE event (Admin protected)
// Path: /api/events/:event_id
router.delete('/:event_id', verifyToken, requirePermission('DELETE_EVENTS'), eventController.deleteEvent);

module.exports = router;
