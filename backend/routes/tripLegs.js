const express = require("express");
const router = express.Router();
const tripLegController = require("../controllers/tripLegController");

// Get all trip legs
router.get("/", tripLegController.getAllLegs);

// Get trip legs for a specific trip
router.get("/trip/:tripId", tripLegController.getLegsByTripId);

// Get a specific trip leg by ID
router.get("/:id", tripLegController.getLegById);

// Create a new trip leg
router.post("/", tripLegController.createLeg);

// Update a trip leg
router.put("/:id", tripLegController.updateLeg);

// Delete a trip leg
router.delete("/:id", tripLegController.deleteLeg);

module.exports = router; 