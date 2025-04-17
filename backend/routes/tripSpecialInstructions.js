const express = require("express");
const router = express.Router();
const tripSpecialInstructionController = require("../controllers/tripSpecialInstructionController");

// Get special instructions for a trip
router.get("/trip/:tripId", tripSpecialInstructionController.getInstructionsByTripId);

// Create special instructions for a trip
router.post("/", tripSpecialInstructionController.createInstructions);

// Update special instructions for a trip
router.put("/trip/:tripId", tripSpecialInstructionController.updateInstructions);

// Delete special instructions for a trip
router.delete("/trip/:tripId", tripSpecialInstructionController.deleteInstructions);

module.exports = router; 