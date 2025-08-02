const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST: Create user
router.post('/', userController.createUser);

// GET: All users
router.get('/', userController.getAllUsers);

// GET: Single user by ID
router.get('/:id', userController.getUserById);

module.exports = router;
