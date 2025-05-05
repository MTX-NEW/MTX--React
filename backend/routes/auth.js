const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Register route
router.post("/register", authController.register);

// Login route
router.post("/login", authController.login);

// Get current user (protected route)
router.get("/me", authMiddleware, authController.getCurrentUser);

// Refresh access token using refresh token cookie
router.post("/refresh-token", authController.refreshToken);

// Logout and clear refresh token cookie
router.post("/logout", authController.logout);

module.exports = router; 