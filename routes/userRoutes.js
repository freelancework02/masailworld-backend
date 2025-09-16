const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Create user
router.post("/", userController.createUser);

// Get all users (only names)
router.get("/", userController.getAllUsers);

// Get user by ID (only name)
router.get("/:id", userController.getUserById);

module.exports = router;
