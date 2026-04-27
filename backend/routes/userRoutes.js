const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all users
// Path: /api/users/:user_id/getUsers
router.get('/:user_id/getUsers', userController.getUsers);

// GET specific user (excluding ID and password)
// Path: /api/users/:user_id
router.get('/:user_id', userController.getUserById);

// POST create user
// Path: /api/users/:user_id/createUser
router.post('/:user_id/createUser', userController.createUser);

// PATCH update user details
// Path: /api/users/:user_id/updateUser
router.patch('/:user_id/updateUser', userController.updateUser);

// PATCH update user password
// Path: /api/user/:user_id/updatePassword
// router.patch('/:user_id/updatePassword', userController.updatePassword);

// GET user and member details by member_id
// Path: /api/user/:member_id/getUserByMemberId
router.get('/:member_id/getUserByMemberId', userController.getUserByMemberId);

module.exports = router;
