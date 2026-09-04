const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');

// Public route: Login
// Path: /api/user/login
router.post('/login', userController.login);

// Public route: Logout
// Path: /api/user/logout
router.post('/logout', userController.logout);

// Protected route: Get current user session
// Path: /api/user/me
router.get('/me', verifyToken, userController.getMe);

// Protected route: GET all users (MASTER / ADMIN only)
// Path: /api/user/:user_id/getUsers
router.get('/:user_id/getUsers', verifyToken, allowRoles('MASTER', 'ADMIN'), userController.getUsers);

// Protected route: GET specific user (MASTER / ADMIN only)
// Path: /api/user/:user_id
router.get('/:user_id', verifyToken, allowRoles('MASTER', 'ADMIN'), userController.getUserById);

// Protected route: POST create user (MASTER / ADMIN only)
// Path: /api/user/:user_id/createUser
router.post('/:user_id/createUser', verifyToken, allowRoles('MASTER', 'ADMIN'), userController.createUser);

// Protected route: PATCH update user details (MASTER / ADMIN only)
// Path: /api/user/:user_id/updateUser
router.patch('/:user_id/updateUser', verifyToken, allowRoles('MASTER', 'ADMIN'), userController.updateUser);

// Protected route: PATCH update user password (MASTER / ADMIN only)
// Path: /api/user/:user_id/updatePassword
router.patch('/:user_id/updatePassword', verifyToken, allowRoles('MASTER', 'ADMIN'), userController.updatePassword);

// GET user and member details by member_id
// Path: /api/user/:member_id/getUserByMemberId
router.get('/:member_id/getUserByMemberId', userController.getUserByMemberId);

// Protected route: DELETE multiple users (MASTER / ADMIN only)
// Path: /api/user/:user_id/deleteMultipleUsers
router.delete('/:user_id/deleteMultipleUsers', verifyToken, allowRoles('MASTER', 'ADMIN'), userController.deleteMultipleUsers);

// Path: /api/user/deleteMultiple
router.delete('/deleteMultiple', verifyToken, allowRoles('MASTER', 'ADMIN'), userController.deleteMultipleUsers);

// Protected route: DELETE user (MASTER / ADMIN only)
// Path: /api/user/:user_id
router.delete('/:user_id', verifyToken, allowRoles('MASTER', 'ADMIN'), userController.deleteUser);

module.exports = router;
