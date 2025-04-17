const express = require("express");
const router = express.Router();
const tripLocationController = require("../controllers/tripLocationController");

// Get all trip locations
router.get("/", tripLocationController.getAllLocations);

// Get a specific trip location by ID
router.get("/:id", tripLocationController.getLocationById);

// Create a new trip location
router.post("/", tripLocationController.createLocation);

// Update a trip location
router.put("/:id", tripLocationController.updateLocation);

// Delete a trip location
router.delete("/:id", tripLocationController.deleteLocation);

module.exports = router; 