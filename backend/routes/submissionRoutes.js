const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// POST /api/submission/ - Create new blog submission (Public)
router.post('/', submissionController.createSubmission);

// POST /api/submission/validate-email - Validate legit email with DNS MX records
router.post('/validate-email', submissionController.validateEmail);

// GET /api/submission/ - Get all submissions (Admin protected)
router.get('/', verifyToken, requirePermission('READ_SUBMISSIONS'), submissionController.getAllSubmissions);

// GET /api/submission/approved - Get approved submissions (Public feed)
router.get('/approved', submissionController.getApprovedSubmissions);

// DELETE /api/submission/:submissionId - Delete submission (Admin protected)
router.delete('/:submissionId', verifyToken, requirePermission('DELETE_SUBMISSIONS'), submissionController.deleteSubmission);

// GET /api/submission/:submissionId/:editToken - Get submission for editing by student (Public with valid token)
router.get('/:submissionId/:editToken', (req, res) => {
  req.params.edit_token = req.params.editToken;
  return submissionController.getSubmissionByEditToken(req, res);
});

// Combined PATCH /api/submission/:submissionId/:param2
// If param2 matches UUID format, it treats it as edit_token (student edit - public).
// Otherwise, it treats it as userId (admin status update - protected).
router.patch('/:submissionId/:param2', (req, res, next) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(req.params.param2)) {
    req.params.edit_token = req.params.param2;
    return submissionController.editSubmissionByStudent(req, res);
  } else {
    req.params.userId = req.params.param2;
    return verifyToken(req, res, () => {
      return requirePermission('UPDATE_SUBMISSIONS')(req, res, () => {
        return submissionController.updateSubmissionStatus(req, res);
      });
    });
  }
});

module.exports = router;
