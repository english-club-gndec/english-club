const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// POST register participant (Public event registration)
// Path: /api/registration/register
router.post('/register', registrationController.registerParticipant);

// GET all participants (Admin protected)
// Path: /api/registration/getAllParticipants
router.get('/getAllParticipants', verifyToken, requirePermission('READ_REGISTRATIONS'), registrationController.getAllParticipants);

// GET participants by event ID (Admin protected)
// Path: /api/registration/:event_id/getParticipantsByEventId
router.get('/:event_id/getParticipantsByEventId', verifyToken, requirePermission('READ_REGISTRATIONS'), registrationController.getParticipantsByEventId);

// GET participation count by event ID (Public)
// Path: /api/registration/:event_id/getParticipationCountByEventId
router.get('/:event_id/getParticipationCountByEventId', registrationController.getParticipationCountByEventId);

// PATCH update participant (Admin protected)
// Path: /api/registration/:participant_id/updateParticipant
router.patch('/:participant_id/updateParticipant', verifyToken, requirePermission('UPDATE_REGISTRATIONS'), registrationController.updateParticipant);

// DELETE multiple participants (Admin protected)
// Path: /api/registration/multipleParticipants
router.delete('/multipleParticipants', verifyToken, requirePermission('DELETE_REGISTRATIONS'), registrationController.deleteMultipleParticipants);

// DELETE single participant by ID (Admin protected)
// Path: /api/registration/:participant_id
router.delete('/:participant_id', verifyToken, requirePermission('DELETE_REGISTRATIONS'), registrationController.deleteParticipant);

module.exports = router;
