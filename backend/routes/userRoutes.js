const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public route: Login
// Path: /api/user/login
router.post('/login', userController.login);

// Public route: Logout
// Path: /api/user/logout
router.post('/logout', userController.logout);

// Protected route: Get current user session
// Path: /api/user/me
router.get('/me', verifyToken, userController.getMe);

// Protected route: GET all users
// Path: /api/user/:user_id/getUsers
router.get('/:user_id/getUsers', verifyToken, userController.getUsers);

// Protected route: GET specific user
// Path: /api/user/:user_id
router.get('/:user_id', verifyToken, userController.getUserById);

// Protected route: POST create user
// Path: /api/user/:user_id/createUser
router.post('/:user_id/createUser', verifyToken, userController.createUser);

// Protected route: PATCH update user details
// Path: /api/user/:user_id/updateUser
router.patch('/:user_id/updateUser', verifyToken, userController.updateUser);

// Protected route: PATCH update user password
// Path: /api/user/:user_id/updatePassword
router.patch('/:user_id/updatePassword', verifyToken, userController.updatePassword);

// GET user and member details by member_id
// Path: /api/user/:member_id/getUserByMemberId
router.get('/:member_id/getUserByMemberId', userController.getUserByMemberId);

// Protected route: DELETE user
// Path: /api/user/:user_id
router.delete('/:user_id', verifyToken, userController.deleteUser);

module.exports = router;
