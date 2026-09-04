const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');

// GET /api/roles - Fetch all available roles (Protected, any authenticated admin/user)
router.get('/', verifyToken, roleController.getRoles);

// GET /api/roles/:role_name - Fetch specific role (Protected)
router.get('/:role_name', verifyToken, roleController.getRoleByName);

// POST /api/roles - Create custom role (MASTER / ADMIN only)
router.post('/', verifyToken, allowRoles('MASTER', 'ADMIN'), roleController.createRole);

// PATCH /api/roles/:role_id - Update custom role permissions (MASTER / ADMIN only)
router.patch('/:role_id', verifyToken, allowRoles('MASTER', 'ADMIN'), roleController.updateRole);

// DELETE /api/roles/:role_id - Delete custom role (MASTER / ADMIN only)
router.delete('/:role_id', verifyToken, allowRoles('MASTER', 'ADMIN'), roleController.deleteRole);

module.exports = router;
