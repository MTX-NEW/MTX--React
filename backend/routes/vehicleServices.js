const express = require("express");
const router = express.Router();
const vehicleServiceController = require("../controllers/vehicleServiceController");

// Get all vehicle services
router.get("/", vehicleServiceController.getAllServices);

// Get single vehicle service
router.get("/:id", vehicleServiceController.getServiceById);

// Create new vehicle service
router.post("/", vehicleServiceController.createService);

// Update vehicle service
router.put("/:id", vehicleServiceController.updateService);

// Delete vehicle service
router.delete("/:id", vehicleServiceController.deleteService);

module.exports = router; 