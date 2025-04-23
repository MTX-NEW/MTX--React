const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Get all users
router.get("/", userController.getAllUsers);

// Get pending users
router.get("/pending", userController.getPendingUsers);

// Get user by ID
router.get("/:id", userController.getUserById);

// Create a new user
router.post("/", userController.createUser);

// Update a user
router.put("/:id", userController.updateUser);

// Approve a pending user
router.put("/:id/approve", userController.approveUser);

// Delete a user
router.delete("/:id", userController.deleteUser);

// Get drivers
router.get('/drivers', userController.getDrivers);

module.exports = router;
