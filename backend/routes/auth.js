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

module.exports = router; 