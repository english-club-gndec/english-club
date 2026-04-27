const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// POST /api/members/:user_id/createMember
router.post('/:user_id/createMember', memberController.createMember);

// GET /api/members/:user_id/getAllMembers
router.get('/:user_id/getAllMembers', memberController.getAllMembers);

// GET /api/members/:user_id/:member_id/getMemberById
router.get('/:user_id/:member_id/getMemberById', memberController.getMemberById);

// PATCH /api/members/:user_id/:member_id/updateMemberById
router.patch('/:user_id/:member_id/updateMemberById', memberController.updateMemberById);

// DELETE /api/members/:user_id/deleteMembersById
// Note: This takes an array of IDs in the body as per request
router.delete('/:user_id/deleteMembersById', memberController.deleteMembersById);

module.exports = router;
