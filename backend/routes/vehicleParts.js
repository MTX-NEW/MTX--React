const express = require("express");
const router = express.Router();
const vehiclePartController = require("../controllers/vehiclePartController");

// Get all vehicle parts
router.get("/", vehiclePartController.getAllParts);

// Get single vehicle part
router.get("/:id", vehiclePartController.getPartById);

// Create new vehicle part
router.post("/", vehiclePartController.createPart);

// Update vehicle part
router.put("/:id", vehiclePartController.updatePart);

// Delete vehicle part
router.delete("/:id", vehiclePartController.deletePart);

module.exports = router; 