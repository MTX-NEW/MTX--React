const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");

// Logging middleware
router.use((req, res, next) => {
  console.log(`Driver route called: ${req.method} ${req.url}`);
  next();
});

// Get all drivers 
router.get("/", driverController.getAllDrivers);

// Get driver by ID
router.get("/:id", driverController.getDriverById);

// Get assigned trips for driver
router.get("/:id/trips", driverController.getDriverTrips);

module.exports = router; 