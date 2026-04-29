const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');

// POST /api/recruitment/createCandidate
router.post('/createCandidate', recruitmentController.createCandidate);

// GET /api/recruitment/:user_id/getAllCandidates
router.get('/:user_id/getAllCandidates', recruitmentController.getAllCandidates);

// GET /api/recruitment/:userId/:candidate_id/getCandidateById
router.get('/:userId/:candidate_id/getCandidateById', recruitmentController.getCandidateById);

// PATCH /api/recruitment/:candidate_id/updateCandidateById
router.patch('/:candidate_id/updateCandidateById', recruitmentController.updateCandidateById);

// PATCH /api/recruitment/:user_id/:candidate_id/updateCandidateStatusById
router.patch('/:user_id/:candidate_id/updateCandidateStatusById', recruitmentController.updateCandidateStatusById);

// DELETE /api/recruitment/:user_id/archiveAllData
router.delete('/:user_id/archiveAllData', recruitmentController.archiveAllData);

module.exports = router;
