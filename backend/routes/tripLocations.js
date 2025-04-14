const express = require("express");
const router = express.Router();
const TripLocation = require("../models/TripLocation");
const { ValidationError } = require("sequelize");
const { geocodeAddress, formatAddress } = require("../utils/googleMapsService");

// Get all trip locations
router.get("/", async (req, res) => {
  try {
    const locations = await TripLocation.findAll();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific trip location by ID
router.get("/:id", async (req, res) => {
  try {
    const location = await TripLocation.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new trip location
router.post("/", async (req, res) => {
  try {
    // Format address for geocoding
    const address = formatAddress(req.body);
    
    // Get coordinates from Google Maps API
    let geocodeData = null;
    try {
      geocodeData = await geocodeAddress(address);
    } catch (geocodeError) {
      console.error("Geocoding error:", geocodeError);
      // Continue with the location creation even if geocoding fails
    }
    
    // Create location with coordinates if available
    const newLocation = await TripLocation.create({
      ...req.body,
      latitude: geocodeData?.latitude || null,
      longitude: geocodeData?.longitude || null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    res.status(201).json(newLocation);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update a trip location
router.put("/:id", async (req, res) => {
  try {
    const location = await TripLocation.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    
    // Format address for geocoding
    const address = formatAddress(req.body);
    
    // Get coordinates from Google Maps API
    let geocodeData = null;
    try {
      geocodeData = await geocodeAddress(address);
    } catch (geocodeError) {
      console.error("Geocoding error:", geocodeError);
      // Continue with the location update even if geocoding fails
    }
    
    // Update location with coordinates if available
    await location.update({
      ...req.body,
      latitude: geocodeData?.latitude || location.latitude,
      longitude: geocodeData?.longitude || location.longitude,
      updated_at: new Date(),
    });
    
    res.json(location);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Delete a trip location
router.delete("/:id", async (req, res) => {
  try {
    const location = await TripLocation.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    
    await location.destroy();
    res.json({ message: "Location deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 