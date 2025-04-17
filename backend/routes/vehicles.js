const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");

// Get all vehicles with assigned user info
router.get("/", vehicleController.getAllVehicles);

// Create new vehicle
router.post("/", vehicleController.createVehicle);

// Update vehicle
router.put("/:id", vehicleController.updateVehicle);

// Delete vehicle
router.delete("/:id", vehicleController.deleteVehicle);

module.exports = router; 