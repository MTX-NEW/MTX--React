const express = require("express");
const router = express.Router();
const pagePermissionController = require("../controllers/pagePermissionController");

// Get all pages
router.get("/pages", pagePermissionController.getAllPages);

// Get all page permissions
router.get("/", pagePermissionController.getAllPagePermissions);

// Get all pages that a specific user type can access
router.get("/type/:typeId", pagePermissionController.getPagesByType);

// Get permissions for a specific page
router.get("/by-page/:pageId", pagePermissionController.getPermissionsByPage);

// Update permissions for a page
router.post("/by-page/:pageId", pagePermissionController.updatePagePermissions);

// Validate if a user type has access to a page
router.get("/validate/:pageId/:typeId", pagePermissionController.validatePageAccess);

// Remove a specific permission by ID
router.delete("/permission/:permissionId", pagePermissionController.removePagePermission);

// Get route configuration for frontend initialization
router.get("/route-config", pagePermissionController.getRouteConfig);

// Sync pages from route config to database
router.post("/sync-pages", pagePermissionController.syncPages);

module.exports = router; 