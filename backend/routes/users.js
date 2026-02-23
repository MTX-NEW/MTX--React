const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Get all users (non-archived)
router.get("/", userController.getAllUsers);

// Get archived users
router.get("/archived", userController.getArchivedUsers);

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

// Archive a user (soft delete)
router.post("/:id/archive", userController.archiveUser);

// Restore an archived user
router.post("/:id/restore", userController.restoreUser);

// Permanently delete a user (archived only; returns error if linked data exists)
router.delete("/:id/permanent", userController.deleteUserPermanently);

// Get drivers (only non-archived)
router.get('/drivers', userController.getDrivers);

module.exports = router;
