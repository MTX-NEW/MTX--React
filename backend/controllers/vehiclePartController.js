const { VehiclePart, PartsSupplier } = require("../models/Maintenance");

// Get all vehicle parts
exports.getAllParts = async (req, res) => {
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
};

// Get a single vehicle part by ID
exports.getPartById = async (req, res) => {
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
};

// Create a new vehicle part
exports.createPart = async (req, res) => {
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
};

// Update a vehicle part
exports.updatePart = async (req, res) => {
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
};

// Delete a vehicle part
exports.deletePart = async (req, res) => {
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
}; 