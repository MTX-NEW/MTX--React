const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");

// Get all maintenance records with details
router.get("/", maintenanceController.getAllRecords);

// Create new maintenance record with services and parts
router.post("/", maintenanceController.createRecord);

// Get maintenance history for a vehicle
router.get("/vehicle/:vehicleId", maintenanceController.getVehicleHistory);

// Get maintenance record by ID
router.get("/:id", maintenanceController.getRecordById);

// Update maintenance record
router.put("/:id", maintenanceController.updateRecord);

// Delete maintenance record
router.delete("/:id", maintenanceController.deleteRecord);

module.exports = router; 