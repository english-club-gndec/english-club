const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// POST /api/submission/ - Create new blog submission
router.post('/', submissionController.createSubmission);

// GET /api/submission/ - Get all submissions (admin list)
router.get('/', submissionController.getAllSubmissions);

// GET /api/submission/approved - Get approved submissions (public feed)
router.get('/approved', submissionController.getApprovedSubmissions);

// DELETE /api/submission/:submissionId - Delete submission
router.delete('/:submissionId', submissionController.deleteSubmission);

// Combined PATCH /api/submission/:submissionId/:param2
// This avoids Express route collision between "/:submissionId/:userId" and "/:submissionId/:edit_token"
// If param2 matches UUID format, it treats it as edit_token (student edit).
// Otherwise, it treats it as userId (admin status update).
router.patch('/:submissionId/:param2', (req, res, next) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(req.params.param2)) {
    req.params.edit_token = req.params.param2;
    return submissionController.editSubmissionByStudent(req, res);
  } else {
    req.params.userId = req.params.param2;
    return submissionController.updateSubmissionStatus(req, res);
  }
});

module.exports = router;
