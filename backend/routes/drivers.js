const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserType = require("../models/UserType");
const { Op } = require("sequelize");

// Logging middleware
router.use((req, res, next) => {
  console.log(`Driver route called: ${req.method} ${req.url}`);
  next();
});

// Get all drivers - using the User model directly with a where clause
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all drivers");
    const drivers = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'status'],
      include: [{
        model: UserType,
        attributes: ['type_id', 'type_name', 'display_name'],
        where: { type_name: 'driver' }
      }]
    });
    console.log(`Found ${drivers.length} drivers`);
    res.json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get driver by ID - using the User model with a where clause
router.get("/:id", async (req, res) => {
  try {
    console.log(`Fetching driver with ID: ${req.params.id}`);
    const driver = await User.findOne({
      where: { id: req.params.id },
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'status'],
      include: [{
        model: UserType,
        attributes: ['type_id', 'type_name', 'display_name'],
        where: { type_name: 'driver' }
      }]
    });
    
    if (!driver) {
      console.log(`Driver with ID ${req.params.id} not found`);
      return res.status(404).json({ message: "Driver not found" });
    }
    
    res.json(driver);
  } catch (error) {
    console.error(`Error fetching driver with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
});

// Get assigned trips for driver - using the User model
router.get("/:id/trips", async (req, res) => {
  try {
    console.log(`Fetching trips for driver with ID: ${req.params.id}`);
    const driver = await User.findOne({
      where: { 
        id: req.params.id,
        '$UserType.type_name$': 'driver'
      },
      include: [
        {
          model: UserType,
          attributes: []
        },
        { 
          association: 'driverTrips',
          include: [
            { association: 'pickupLocation' },
            { association: 'dropoffLocation' },
            { association: 'trip' }
          ]
        }
      ]
    });
    
    if (!driver) {
      console.log(`Driver with ID ${req.params.id} not found`);
      return res.status(404).json({ message: "Driver not found" });
    }
    
    res.json(driver.driverTrips || []);
  } catch (error) {
    console.error(`Error fetching trips for driver with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 