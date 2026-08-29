const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');
const { verifyToken, restrictRoles, optionalVerifyToken } = require('../middleware/authMiddleware');

// POST /api/recruitment/createCandidate (Public candidate application)
router.post('/createCandidate', recruitmentController.createCandidate);

// GET /api/recruitment/results (Public or Admin preview when results are disabled)
router.get('/results', optionalVerifyToken, recruitmentController.getPublicResults);

// GET /api/recruitment/:user_id/getAllCandidates (Admin protected - allowed for INTERVIEWEE)
router.get('/:user_id/getAllCandidates', verifyToken, recruitmentController.getAllCandidates);

// GET /api/recruitment/:userId/:candidate_id/getCandidateById (Admin protected - allowed for INTERVIEWEE)
router.get('/:userId/:candidate_id/getCandidateById', verifyToken, recruitmentController.getCandidateById);

// PATCH /api/recruitment/:candidate_id/updateCandidateById (Admin protected - forbidden for INTERVIEWEE)
router.patch('/:candidate_id/updateCandidateById', verifyToken, restrictRoles('INTERVIEWEE'), recruitmentController.updateCandidateById);

// PATCH /api/recruitment/:user_id/:candidate_id/updateCandidateStatusById (Admin protected - allowed for INTERVIEWEE)
router.patch('/:user_id/:candidate_id/updateCandidateStatusById', verifyToken, recruitmentController.updateCandidateStatusById);

// DELETE /api/recruitment/:user_id/:candidate_id/deleteCandidateById (Admin protected - forbidden for INTERVIEWEE)
router.delete('/:user_id/:candidate_id/deleteCandidateById', verifyToken, restrictRoles('INTERVIEWEE'), recruitmentController.deleteCandidateById);

// DELETE /api/recruitment/:user_id/deleteMultipleCandidates (Admin protected - forbidden for INTERVIEWEE)
router.delete('/:user_id/deleteMultipleCandidates', verifyToken, restrictRoles('INTERVIEWEE'), recruitmentController.deleteMultipleCandidates);

// DELETE /api/recruitment/:user_id/archiveAllData (Admin protected - forbidden for INTERVIEWEE)
router.delete('/:user_id/archiveAllData', verifyToken, restrictRoles('INTERVIEWEE'), recruitmentController.archiveAllData);

// GET /api/recruitment/questions (Public active questions)
router.get('/questions', recruitmentController.getPublicQuestions);

// GET /api/recruitment/:user_id/adminQuestions (Admin protected all questions)
router.get('/:user_id/adminQuestions', verifyToken, recruitmentController.getAdminQuestions);

// POST /api/recruitment/:user_id/createQuestion (Admin protected - forbidden for INTERVIEWEE)
router.post('/:user_id/createQuestion', verifyToken, restrictRoles('INTERVIEWEE'), recruitmentController.createQuestion);

// PATCH /api/recruitment/:user_id/:question_id/updateQuestion (Admin protected - forbidden for INTERVIEWEE)
router.patch('/:user_id/:question_id/updateQuestion', verifyToken, restrictRoles('INTERVIEWEE'), recruitmentController.updateQuestion);

// DELETE /api/recruitment/:user_id/:question_id/deleteQuestion (Admin protected - forbidden for INTERVIEWEE)
router.delete('/:user_id/:question_id/deleteQuestion', verifyToken, restrictRoles('INTERVIEWEE'), recruitmentController.deleteQuestion);

// --- Interview Feedback Form Endpoints ---
// POST /api/recruitment/interview-feedback (Public candidate submission)
router.post('/interview-feedback', recruitmentController.createInterviewFeedback);

// GET /api/recruitment/:user_id/interview-feedback (Admin protected)
router.get('/:user_id/interview-feedback', verifyToken, recruitmentController.getAllInterviewFeedback);

// DELETE /api/recruitment/:user_id/interview-feedback/clear-all (Admin protected)
router.delete('/:user_id/interview-feedback/clear-all', verifyToken, restrictRoles('INTERVIEWEE'), recruitmentController.clearAllInterviewFeedback);

// DELETE /api/recruitment/:user_id/interview-feedback/:feedback_id (Admin protected)
router.delete('/:user_id/interview-feedback/:feedback_id', verifyToken, restrictRoles('INTERVIEWEE'), recruitmentController.deleteInterviewFeedbackById);

module.exports = router;

