const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");

// Get all trips with related data
router.get("/", tripController.getAllTrips);

// Get trip summaries for table display
router.get("/summary", tripController.getTripSummaries);

// Get a specific trip by ID
router.get("/:id", tripController.getTripById);

// Create a new trip with legs
router.post("/", tripController.createTrip);

// Update a trip
router.put("/:id", tripController.updateTrip);

// Delete a trip
router.delete("/:id", tripController.deleteTrip);

module.exports = router; 