const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');
const { verifyToken, requirePermission, optionalVerifyToken } = require('../middleware/authMiddleware');

// POST /api/recruitment/createCandidate (Public candidate application)
router.post('/createCandidate', recruitmentController.createCandidate);

// GET /api/recruitment/results (Public or Admin preview when results are disabled)
router.get('/results', optionalVerifyToken, recruitmentController.getPublicResults);

// GET /api/recruitment/:user_id/getAllCandidates (Admin protected)
router.get('/:user_id/getAllCandidates', verifyToken, requirePermission('READ_RECRUITMENTS'), recruitmentController.getAllCandidates);

// GET /api/recruitment/:userId/:candidate_id/getCandidateById (Admin protected)
router.get('/:userId/:candidate_id/getCandidateById', verifyToken, requirePermission('READ_RECRUITMENTS'), recruitmentController.getCandidateById);

// PATCH /api/recruitment/:candidate_id/updateCandidateById (Admin protected)
router.patch('/:candidate_id/updateCandidateById', verifyToken, requirePermission('UPDATE_RECRUITMENTS'), recruitmentController.updateCandidateById);

// PATCH /api/recruitment/:user_id/:candidate_id/updateCandidateStatusById (Admin protected)
router.patch('/:user_id/:candidate_id/updateCandidateStatusById', verifyToken, requirePermission('UPDATE_RECRUITMENTS'), recruitmentController.updateCandidateStatusById);

// DELETE /api/recruitment/:user_id/:candidate_id/deleteCandidateById (Admin protected)
router.delete('/:user_id/:candidate_id/deleteCandidateById', verifyToken, requirePermission('DELETE_RECRUITMENTS'), recruitmentController.deleteCandidateById);

// DELETE /api/recruitment/:user_id/deleteMultipleCandidates (Admin protected)
router.delete('/:user_id/deleteMultipleCandidates', verifyToken, requirePermission('DELETE_RECRUITMENTS'), recruitmentController.deleteMultipleCandidates);

// DELETE /api/recruitment/:user_id/archiveAllData (Admin protected)
router.delete('/:user_id/archiveAllData', verifyToken, requirePermission('DELETE_RECRUITMENTS'), recruitmentController.archiveAllData);

// GET /api/recruitment/questions (Public active questions)
router.get('/questions', recruitmentController.getPublicQuestions);

// GET /api/recruitment/:user_id/adminQuestions (Admin protected all questions)
router.get('/:user_id/adminQuestions', verifyToken, requirePermission('READ_RECRUITMENTS'), recruitmentController.getAdminQuestions);

// POST /api/recruitment/:user_id/createQuestion (Admin protected)
router.post('/:user_id/createQuestion', verifyToken, requirePermission('WRITE_RECRUITMENTS'), recruitmentController.createQuestion);

// PATCH /api/recruitment/:user_id/:question_id/updateQuestion (Admin protected)
router.patch('/:user_id/:question_id/updateQuestion', verifyToken, requirePermission('UPDATE_RECRUITMENTS'), recruitmentController.updateQuestion);

// DELETE /api/recruitment/:user_id/:question_id/deleteQuestion (Admin protected)
router.delete('/:user_id/:question_id/deleteQuestion', verifyToken, requirePermission('DELETE_RECRUITMENTS'), recruitmentController.deleteQuestion);

// --- Interview Feedback Form Endpoints ---
// POST /api/recruitment/interview-feedback (Public candidate submission)
router.post('/interview-feedback', recruitmentController.createInterviewFeedback);

// GET /api/recruitment/:user_id/interview-feedback (Admin protected)
router.get('/:user_id/interview-feedback', verifyToken, requirePermission('READ_RECRUITMENTS'), recruitmentController.getAllInterviewFeedback);

// DELETE /api/recruitment/:user_id/interview-feedback/clear-all (Admin protected)
router.delete('/:user_id/interview-feedback/clear-all', verifyToken, requirePermission('DELETE_RECRUITMENTS'), recruitmentController.clearAllInterviewFeedback);

// DELETE /api/recruitment/:user_id/interview-feedback/:feedback_id (Admin protected)
router.delete('/:user_id/interview-feedback/:feedback_id', verifyToken, requirePermission('DELETE_RECRUITMENTS'), recruitmentController.deleteInterviewFeedbackById);

module.exports = router;
