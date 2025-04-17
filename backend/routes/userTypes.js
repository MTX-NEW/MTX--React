const express = require("express");
const router = express.Router();
const userTypeController = require("../controllers/userTypeController");

// Get all user types
router.get("/", userTypeController.getAllUserTypes);

// Create a new user type
router.post("/", userTypeController.createUserType);

// Update a user type
router.put("/:id", userTypeController.updateUserType);

// Delete a user type
router.delete("/:id", userTypeController.deleteUserType);

module.exports = router; 