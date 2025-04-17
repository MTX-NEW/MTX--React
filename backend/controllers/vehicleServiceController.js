const { VehicleService } = require("../models/Maintenance");

// Get all vehicle services
exports.getAllServices = async (req, res) => {
  try {
    const services = await VehicleService.findAll();
    res.json(services);
  } catch (error) {
    console.error("Error fetching vehicle services:", error);
    res.status(500).json({ 
      message: "Failed to fetch vehicle services",
      error: error.message 
    });
  }
};

// Get a single vehicle service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await VehicleService.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Vehicle service not found" });
    }
    res.json(service);
  } catch (error) {
    console.error("Error fetching vehicle service:", error);
    res.status(500).json({ 
      message: "Failed to fetch vehicle service",
      error: error.message 
    });
  }
};

// Create a new vehicle service
exports.createService = async (req, res) => {
  try {
    const service = await VehicleService.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating vehicle service:", error);
    res.status(500).json({ 
      message: "Failed to create vehicle service",
      error: error.message 
    });
  }
};

// Update a vehicle service
exports.updateService = async (req, res) => {
  try {
    const service = await VehicleService.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Vehicle service not found" });
    }
    await service.update(req.body);
    res.json(service);
  } catch (error) {
    console.error("Error updating vehicle service:", error);
    res.status(500).json({ 
      message: "Failed to update vehicle service",
      error: error.message 
    });
  }
};

// Delete a vehicle service
exports.deleteService = async (req, res) => {
  try {
    const service = await VehicleService.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Vehicle service not found" });
    }
    await service.destroy();
    res.json({ message: "Vehicle service deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle service:", error);
    res.status(500).json({ 
      message: "Failed to delete vehicle service",
      error: error.message 
    });
  }
}; 