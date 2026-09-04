const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// POST /api/members/:user_id/createMember (Admin protected)
router.post('/:user_id/createMember', verifyToken, requirePermission('WRITE_MEMBERS'), memberController.createMember);

// GET /api/members/getAllMembers (Public)
router.get('/getAllMembers', memberController.getAllMembers);

// GET /api/members/:user_id/getAllMembers (Admin protected)
router.get('/:user_id/getAllMembers', verifyToken, requirePermission('READ_MEMBERS'), memberController.getAdminMembers);

// GET /api/members/:user_id/:member_id/getMemberById (Admin protected)
router.get('/:user_id/:member_id/getMemberById', verifyToken, requirePermission('READ_MEMBERS'), memberController.getMemberById);

// PATCH /api/members/:user_id/:member_id/updateMemberById (Admin protected)
router.patch('/:user_id/:member_id/updateMemberById', verifyToken, requirePermission('UPDATE_MEMBERS'), memberController.updateMemberById);

// DELETE /api/members/:user_id/deleteMembersById (Admin protected)
router.delete('/:user_id/deleteMembersById', verifyToken, requirePermission('DELETE_MEMBERS'), memberController.deleteMembersById);

// POST /api/members/:user_id/createMultipleMembers (Admin protected)
router.post('/:user_id/createMultipleMembers', verifyToken, requirePermission('WRITE_MEMBERS'), memberController.createMultipleMembers);

module.exports = router;
