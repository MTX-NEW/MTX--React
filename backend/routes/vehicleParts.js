const express = require("express");
const router = express.Router();
const { VehiclePart, PartsSupplier } = require("../models/Maintenance");

// Get all vehicle parts
router.get("/", async (req, res) => {
  try {
    const parts = await VehiclePart.findAll({
      include: [{
        model: PartsSupplier,
        as: 'supplier',
        attributes: ['company_name', 'city', 'state', 'phone']
      }]
    });
    res.json(parts);
  } catch (error) {
    console.error("Error fetching vehicle parts:", error);
    res.status(500).json({ 
      message: "Failed to fetch vehicle parts",
      error: error.message 
    });
  }
});

// Get single vehicle part
router.get("/:id", async (req, res) => {
  try {
    const part = await VehiclePart.findByPk(req.params.id);
    if (!part) {
      return res.status(404).json({ message: "Vehicle part not found" });
    }
    res.json(part);
  } catch (error) {
    console.error("Error fetching vehicle part:", error);
    res.status(500).json({ 
      message: "Failed to fetch vehicle part",
      error: error.message 
    });
  }
});

// Create new vehicle part
router.post("/", async (req, res) => {
  try {
    const part = await VehiclePart.create(req.body);
    res.status(201).json(part);
  } catch (error) {
    console.error("Error creating vehicle part:", error);
    res.status(500).json({ 
      message: "Failed to create vehicle part",
      error: error.message 
    });
  }
});

// Update vehicle part
router.put("/:id", async (req, res) => {
  try {
    const part = await VehiclePart.findByPk(req.params.id);
    if (!part) {
      return res.status(404).json({ message: "Vehicle part not found" });
    }
    await part.update(req.body);
    res.json(part);
  } catch (error) {
    console.error("Error updating vehicle part:", error);
    res.status(500).json({ 
      message: "Failed to update vehicle part",
      error: error.message 
    });
  }
});

// Delete vehicle part
router.delete("/:id", async (req, res) => {
  try {
    const part = await VehiclePart.findByPk(req.params.id);
    if (!part) {
      return res.status(404).json({ message: "Vehicle part not found" });
    }
    await part.destroy();
    res.json({ message: "Vehicle part deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle part:", error);
    res.status(500).json({ 
      message: "Failed to delete vehicle part",
      error: error.message 
    });
  }
});

module.exports = router; 