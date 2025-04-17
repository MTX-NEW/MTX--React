const express = require("express");
const router = express.Router();
const pagePermissionController = require("../controllers/pagePermissionController");

// Get all page permissions
router.get("/", pagePermissionController.getAllPagePermissions);

// Get all pages that a specific user type can access
router.get("/type/:typeId", pagePermissionController.getPagesByType);

// Get permissions for a specific page
router.get("/by-page/:pageName", pagePermissionController.getPermissionsByPage);

// Update permissions for a page
router.post("/by-page/:pageName", pagePermissionController.updatePagePermissions);

// Validate if a user type has access to a page
router.get("/validate/:pageName/:typeId", pagePermissionController.validatePageAccess);

// Remove a specific permission
router.delete("/page/:pageName/type/:typeId", pagePermissionController.removePagePermission);

module.exports = router; 