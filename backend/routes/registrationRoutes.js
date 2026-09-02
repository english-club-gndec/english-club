const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST register participant (Public event registration)
// Path: /api/registration/register
router.post('/register', registrationController.registerParticipant);

// GET all participants (Admin protected)
// Path: /api/registration/getAllParticipants
router.get('/getAllParticipants', verifyToken, registrationController.getAllParticipants);

// GET participants by event ID (Admin protected)
// Path: /api/registration/:event_id/getParticipantsByEventId
router.get('/:event_id/getParticipantsByEventId', verifyToken, registrationController.getParticipantsByEventId);

// GET participation count by event ID (Public)
// Path: /api/registration/:event_id/getParticipationCountByEventId
router.get('/:event_id/getParticipationCountByEventId', registrationController.getParticipationCountByEventId);

// PATCH update participant (Admin protected)
// Path: /api/registration/:participant_id/updateParticipant
router.patch('/:participant_id/updateParticipant', verifyToken, registrationController.updateParticipant);

// DELETE multiple participants (Admin protected)
// Path: /api/registration/multipleParticipants
router.delete('/multipleParticipants', verifyToken, registrationController.deleteMultipleParticipants);

// DELETE single participant by ID (Admin protected)
// Path: /api/registration/:participant_id
router.delete('/:participant_id', verifyToken, registrationController.deleteParticipant);

module.exports = router;

