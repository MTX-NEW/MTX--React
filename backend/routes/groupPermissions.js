const express = require("express");
const router = express.Router();
const groupPermissionController = require("../controllers/groupPermissionController");

// Get all permissions for a specific group
router.get("/group/:groupId", groupPermissionController.getPermissionsByGroup);

// Get all groups that can have a specific user type
router.get("/type/:typeId", groupPermissionController.getGroupsByType);

// Add or update permissions for a group
router.post("/group/:groupId", groupPermissionController.updateGroupPermissions);

// Remove a specific permission
router.delete("/group/:groupId/type/:typeId", groupPermissionController.removePermission);

// Validate if a user type is allowed for a group
router.get("/validate/:groupId/:typeId", groupPermissionController.validatePermission);

module.exports = router; 