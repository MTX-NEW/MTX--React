const express = require("express");
const router = express.Router();
const TripMember = require("../models/TripMember");
const Program = require("../models/Program");
const TripLocation = require("../models/TripLocation");
const { ValidationError } = require("sequelize");
const Trip = require("../models/Trip");
const TripLeg = require("../models/TripLeg");

// Get all trip members
router.get("/", async (req, res) => {
  try {
    const members = await TripMember.findAll({
      include: [
        { 
          model: Program,
          attributes: ['program_id', 'program_name']
        },
        {
          model: TripLocation,
          as: "memberPickupLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default',
                      'latitude', 'longitude']
        },
        {
          model: TripLocation,
          as: "memberDropoffLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default',
                      'latitude', 'longitude']
        }
      ],
      attributes: [
        'member_id', 'first_name', 'last_name', 'program_id', 
        'ahcccs_id', 'insurance_expiry', 'birth_date', 'phone', 
        'pickup_location', 'dropoff_location',
        'gender', 'notes', 'created_at', 'updated_at'
      ]
    });
    res.json(members);
  } catch (error) {
    console.error("Error fetching trip members:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific trip member by ID
router.get("/:id", async (req, res) => {
  try {
    const member = await TripMember.findByPk(req.params.id, {
      include: [
        { 
          model: Program,
          attributes: ['program_id', 'program_name']
        },
        {
          model: TripLocation,
          as: "memberPickupLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default',
                      'latitude', 'longitude']
        },
        {
          model: TripLocation,
          as: "memberDropoffLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default',
                      'latitude', 'longitude']
        }
      ],
      attributes: [
        'member_id', 'first_name', 'last_name', 'program_id', 
        'ahcccs_id', 'insurance_expiry', 'birth_date', 'phone', 
        'pickup_location', 'dropoff_location',
        'gender', 'notes', 'created_at', 'updated_at'
      ]
    });
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(member);
  } catch (error) {
    console.error("Error fetching trip member:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new trip member
router.post("/", async (req, res) => {
  try {
    const newMember = await TripMember.create({
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    // Fetch the created member with its relationships
    const memberWithRelations = await TripMember.findByPk(newMember.member_id, {
      include: [
        { 
          model: Program,
          attributes: ['program_id', 'program_name']
        },
        {
          model: TripLocation,
          as: "memberPickupLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default', 'latitude', 'longitude']
        },
        {
          model: TripLocation,
          as: "memberDropoffLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default', 'latitude', 'longitude']
        }
      ],
      attributes: [
        'member_id', 'first_name', 'last_name', 'program_id', 
        'ahcccs_id', 'insurance_expiry', 'birth_date', 'phone', 
        'pickup_location', 'dropoff_location',
        'gender', 'notes', 'created_at', 'updated_at'
      ]
    });
    
    res.status(201).json(memberWithRelations);
  } catch (error) {
    console.error("Error creating trip member:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update a trip member
router.put("/:id", async (req, res) => {
  try {
    const member = await TripMember.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    await member.update({
      ...req.body,
      updated_at: new Date(),
    });
    
    // Fetch the updated member with its relationships
    const updatedMember = await TripMember.findByPk(req.params.id, {
      include: [
        { 
          model: Program,
          attributes: ['program_id', 'program_name']
        },
        {
          model: TripLocation,
          as: "memberPickupLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default',
                      'latitude', 'longitude']
        },
        {
          model: TripLocation,
          as: "memberDropoffLocation",
          attributes: ['location_id', 'street_address', 'building', 'building_type', 
                      'city', 'state', 'zip', 'phone', 'location_type', 'recipient_default',
                      'latitude', 'longitude']
        }
      ],
      attributes: [
        'member_id', 'first_name', 'last_name', 'program_id', 
        'ahcccs_id', 'insurance_expiry', 'birth_date', 'phone', 
        'pickup_location', 'dropoff_location',
        'gender', 'notes', 'created_at', 'updated_at'
      ]
    });
    
    res.json(updatedMember);
  } catch (error) {
    console.error("Error updating trip member:", error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Delete a trip member
router.delete("/:id", async (req, res) => {
  try {
    const member = await TripMember.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    await member.destroy();
    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip member:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add this new endpoint to get member locations
router.get("/:id/locations", async (req, res) => {
  try {
    const memberId = req.params.id;
    
    // Find the member with their default locations
    const member = await TripMember.findByPk(memberId, {
      include: [
        {
          model: TripLocation,
          as: "memberPickupLocation",
        },
        {
          model: TripLocation,
          as: "memberDropoffLocation",
        }
      ]
    });
    
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    // Get member's pickup and dropoff locations
    const memberLocations = [];
    
    // Add pickup location if exists
    if (member.memberPickupLocation) {
      memberLocations.push({
        ...member.memberPickupLocation.get({ plain: true }),
        location_type: 'pickup'
      });
    }
    
    // Add dropoff location if exists and different from pickup
    if (member.memberDropoffLocation && 
        (!member.memberPickupLocation || member.memberDropoffLocation.location_id !== member.memberPickupLocation.location_id)) {
      memberLocations.push({
        ...member.memberDropoffLocation.get({ plain: true }),
        location_type: 'dropoff'
      });
    }
    
    // Get all locations (as a simpler approach)
    const allLocations = await TripLocation.findAll();
    
    // Add additional locations that aren't already included
    allLocations.forEach(location => {
      // Check if this location is already included as a default location
      const isAlreadyIncluded = memberLocations.some(
        loc => loc.location_id === location.location_id
      );
      
      if (!isAlreadyIncluded) {
        memberLocations.push({
          ...location.get({ plain: true }),
          location_type: 'other'
        });
      }
    });
    
    res.json(memberLocations);
  } catch (error) {
    console.error("Error fetching member locations:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 