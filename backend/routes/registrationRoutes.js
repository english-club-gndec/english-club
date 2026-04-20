const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// POST register participant
// Path: /api/registration/register
router.post('/register', registrationController.registerParticipant);

// GET all participants
// Path: /api/registration/getAllParticipants
router.get('/getAllParticipants', registrationController.getAllParticipants);

// GET participants by event ID
// Path: /api/registration/:event_id/getParticipantsByEventId
router.get('/:event_id/getParticipantsByEventId', registrationController.getParticipantsByEventId);

// PATCH update participant
// Path: /api/registration/:participant_id/updateParticipant
router.patch('/:participant_id/updateParticipant', registrationController.updateParticipant);

module.exports = router;
