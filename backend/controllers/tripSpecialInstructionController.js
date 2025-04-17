const TripSpecialInstruction = require("../models/TripSpecialInstruction");
const Trip = require("../models/Trip");
const { ValidationError } = require("sequelize");

// Get special instructions for a trip
exports.getInstructionsByTripId = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const instructions = await TripSpecialInstruction.findOne({
      where: { trip_id: tripId }
    });
    
    if (!instructions) {
      return res.status(404).json({ message: "Special instructions not found for this trip" });
    }
    
    res.json(instructions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create special instructions for a trip
exports.createInstructions = async (req, res) => {
  try {
    // Check if the trip exists
    const trip = await Trip.findByPk(req.body.trip_id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    
    // Check if special instructions already exist for this trip
    const existingInstructions = await TripSpecialInstruction.findOne({
      where: { trip_id: req.body.trip_id }
    });
    
    if (existingInstructions) {
      return res.status(400).json({ 
        message: "Special instructions already exist for this trip. Use PUT to update." 
      });
    }
    
    const newInstructions = await TripSpecialInstruction.create({
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    res.status(201).json(newInstructions);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Update special instructions for a trip
exports.updateInstructions = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const instructions = await TripSpecialInstruction.findOne({
      where: { trip_id: tripId }
    });
    
    if (!instructions) {
      return res.status(404).json({ message: "Special instructions not found for this trip" });
    }
    
    await instructions.update({
      ...req.body,
      updated_at: new Date(),
    });
    
    res.json(instructions);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Delete special instructions for a trip
exports.deleteInstructions = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const instructions = await TripSpecialInstruction.findOne({
      where: { trip_id: tripId }
    });
    
    if (!instructions) {
      return res.status(404).json({ message: "Special instructions not found for this trip" });
    }
    
    await instructions.destroy();
    res.json({ message: "Special instructions deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 