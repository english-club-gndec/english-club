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

module.exports = router;
