const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/recruitment/createCandidate (Public candidate application)
router.post('/createCandidate', recruitmentController.createCandidate);

// GET /api/recruitment/:user_id/getAllCandidates (Admin protected)
router.get('/:user_id/getAllCandidates', verifyToken, recruitmentController.getAllCandidates);

// GET /api/recruitment/:userId/:candidate_id/getCandidateById (Admin protected)
router.get('/:userId/:candidate_id/getCandidateById', verifyToken, recruitmentController.getCandidateById);

// PATCH /api/recruitment/:candidate_id/updateCandidateById (Admin protected)
router.patch('/:candidate_id/updateCandidateById', verifyToken, recruitmentController.updateCandidateById);

// PATCH /api/recruitment/:user_id/:candidate_id/updateCandidateStatusById (Admin protected)
router.patch('/:user_id/:candidate_id/updateCandidateStatusById', verifyToken, recruitmentController.updateCandidateStatusById);

// DELETE /api/recruitment/:user_id/:candidate_id/deleteCandidateById (Admin protected)
router.delete('/:user_id/:candidate_id/deleteCandidateById', verifyToken, recruitmentController.deleteCandidateById);

// DELETE /api/recruitment/:user_id/deleteMultipleCandidates (Admin protected)
router.delete('/:user_id/deleteMultipleCandidates', verifyToken, recruitmentController.deleteMultipleCandidates);

// DELETE /api/recruitment/:user_id/archiveAllData (Admin protected)
router.delete('/:user_id/archiveAllData', verifyToken, recruitmentController.archiveAllData);

// GET /api/recruitment/questions (Public active questions)
router.get('/questions', recruitmentController.getPublicQuestions);

// GET /api/recruitment/:user_id/adminQuestions (Admin protected all questions)
router.get('/:user_id/adminQuestions', verifyToken, recruitmentController.getAdminQuestions);

// POST /api/recruitment/:user_id/createQuestion (Admin protected)
router.post('/:user_id/createQuestion', verifyToken, recruitmentController.createQuestion);

// PATCH /api/recruitment/:user_id/:question_id/updateQuestion (Admin protected)
router.patch('/:user_id/:question_id/updateQuestion', verifyToken, recruitmentController.updateQuestion);

// DELETE /api/recruitment/:user_id/:question_id/deleteQuestion (Admin protected)
router.delete('/:user_id/:question_id/deleteQuestion', verifyToken, recruitmentController.deleteQuestion);

module.exports = router;
