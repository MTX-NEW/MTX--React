const express = require("express");
const router = express.Router();
const userGroupController = require("../controllers/userGroupController");

// Get all user groups
router.get("/", userGroupController.getAllUserGroups);

// Create a new user group
router.post("/", userGroupController.createUserGroup);

// Update a user group
router.put("/:id", userGroupController.updateUserGroup);

// Delete a user group
router.delete("/:id", userGroupController.deleteUserGroup);

module.exports = router; 