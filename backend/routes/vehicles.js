const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const UserType = require("../models/UserType");
const { ValidationError, UniqueConstraintError } = require("sequelize");

// Get all vehicles with assigned user info
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      include: [{
        model: User,
        as: 'assigned_user',
        attributes: ['id', 'first_name', 'last_name'],
        include: [{
          model: UserType,
          where: { type_name: 'driver' },
          attributes: []
        }]
      }],
      raw: true,
      nest: true
    });

    const formattedVehicles = vehicles.map(vehicle => ({
      ...vehicle,
      assigned_ts: vehicle.assigned_user 
        ? `${vehicle.assigned_user.first_name} ${vehicle.assigned_user.last_name}`
        : 'Unassigned'
    }));

    res.json(formattedVehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new vehicle
router.post("/", async (req, res) => {
  try {
    const newVehicle = await Vehicle.create(req.body);
    const vehicleWithUser = await Vehicle.findByPk(newVehicle.vehicle_id, {
      include: [{
        model: User,
        as: 'assigned_user',
        attributes: ['id', 'first_name', 'last_name'],
        include: [{
          model: UserType,
          where: { type_name: 'driver' },
          attributes: []
        }]
      }]
    });
    res.status(201).json(vehicleWithUser);
  } catch (error) {
    handleError(error, res);
  }
});

// Update vehicle
router.put("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    await vehicle.update(req.body);
    const updatedVehicle = await Vehicle.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'assigned_user',
        attributes: ['id', 'first_name', 'last_name'],
        include: [{
          model: UserType,
          where: { type_name: 'driver' },
          attributes: []
        }]
      }]
    });
    res.json(updatedVehicle);
  } catch (error) {
    handleError(error, res);
  }
});

// Delete vehicle
router.delete("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    await vehicle.destroy();
    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handler
function handleError(error, res) {
  if (error instanceof UniqueConstraintError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors.map(err => ({
        field: err.path,
        message: `${err.path} already exists`
      }))
    });
  }
  
  if (error instanceof ValidationError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }
  
  res.status(400).json({ message: error.message });
}

module.exports = router; 