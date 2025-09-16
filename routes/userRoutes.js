const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Create user
router.post("/", userController.createUser);

// Get all users
router.get("/", userController.getAllUsers);

// Get user by ID
router.get("/:id", userController.getUserById);

// Delete user (soft delete)
router.delete("/:id", userController.deleteUser);

module.exports = router;
