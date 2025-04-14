const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const TripLeg = require("../models/TripLeg");
const TripMember = require("../models/TripMember");
const TripLocation = require("../models/TripLocation");
const User = require("../models/User");
const Program = require("../models/Program");
const TripSpecialInstruction = require("../models/TripSpecialInstruction");
const { ValidationError, Op } = require("sequelize");
const { calculateDistance, formatAddress } = require("../utils/googleMapsService");
const { formatTimeForDB } = require("../utils/timeUtils");

// Get all trips with related data
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.findAll({
      include: [
        { 
          model: TripMember,
          include: [
            Program,
            {
              model: TripLocation,
              as: "memberPickupLocation",
              attributes: ['location_id', 'street_address', 'city', 'state', 'zip', 'phone', 'latitude', 'longitude']
            },
            {
              model: TripLocation,
              as: "memberDropoffLocation",
              attributes: ['location_id', 'street_address', 'city', 'state', 'zip', 'phone', 'latitude', 'longitude']
            }
          ]
        },
        { 
          model: User, 
          as: "creator",
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: TripSpecialInstruction,
          as: "specialInstructions"
        },
        {
          model: TripLeg,
          as: "legs",
          include: [
            { 
              model: User, 
              as: "driver",
              attributes: ['id', 'first_name', 'last_name']
            },
            { 
              model: TripLocation, 
              as: "pickupLocation" 
            },
            { 
              model: TripLocation, 
              as: "dropoffLocation" 
            }
          ]
        }
      ]
    });
    res.json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific trip by ID
router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { 
          model: TripMember,
          include: [
            Program,
            {
              model: TripLocation,
              as: "memberPickupLocation",
              attributes: ['location_id', 'street_address', 'city', 'state', 'zip', 'phone', 'latitude', 'longitude']
            },
            {
              model: TripLocation,
              as: "memberDropoffLocation",
              attributes: ['location_id', 'street_address', 'city', 'state', 'zip', 'phone', 'latitude', 'longitude']
            }
          ]
        },
        { 
          model: User, 
          as: "creator",
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: TripSpecialInstruction,
          as: "specialInstructions"
        },
        {
          model: TripLeg,
          as: "legs",
          include: [
            { 
              model: User, 
              as: "driver",
              attributes: ['id', 'first_name', 'last_name']
            },
            { 
              model: TripLocation, 
              as: "pickupLocation" 
            },
            { 
              model: TripLocation, 
              as: "dropoffLocation" 
            }
          ]
        }
      ]
    });
    
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    
    res.json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new trip with legs
router.post("/", async (req, res) => {
  try {
    const { special_instructions, legs, ...tripData } = req.body;
    
    // Create the trip with the provided data
    const newTrip = await Trip.create({
      ...tripData,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    // Create trip legs if any were provided
    let totalDistance = 0;
    
    if (legs && legs.length > 0) {
      for (let i = 0; i < legs.length; i++) {
        const legData = legs[i];
        
        // Set the trip_id and sequence
        legData.trip_id = newTrip.trip_id;
        legData.sequence = i + 1;
        
        // Calculate leg distance
        let leg_distance = 0;
        
        if (legData.pickup_location && legData.dropoff_location) {
          try {
            // Get pickup and dropoff location details
            const pickupLocation = await TripLocation.findByPk(legData.pickup_location);
            const dropoffLocation = await TripLocation.findByPk(legData.dropoff_location);
            
            if (pickupLocation && dropoffLocation) {
              // Format addresses for the distance calculation
              const pickupAddress = formatAddress(pickupLocation);
              const dropoffAddress = formatAddress(dropoffLocation);
              
              // Calculate distance
              const distanceResult = await calculateDistance(pickupAddress, dropoffAddress);
              
              if (distanceResult && distanceResult.distance) {
                // Store distance in miles (convert from meters)
                leg_distance = parseFloat((distanceResult.distance.value / 1609.34).toFixed(2));
              }
            }
          } catch (distanceError) {
            console.error("Error calculating leg distance:", distanceError);
            // Continue without distance calculation on error
          }
        }
        
        // Format time fields
        if (legData.scheduled_pickup) {
          legData.scheduled_pickup = formatTimeForDB(legData.scheduled_pickup);
        }
        if (legData.scheduled_dropoff) {
          legData.scheduled_dropoff = formatTimeForDB(legData.scheduled_dropoff);
        }
        if (legData.actual_pickup) {
          legData.actual_pickup = formatTimeForDB(legData.actual_pickup);
        }
        if (legData.actual_dropoff) {
          legData.actual_dropoff = formatTimeForDB(legData.actual_dropoff);
        }
        
        
        // Create the trip leg with distance information
        const tripLeg = await TripLeg.create({
          ...legData,
          leg_distance,
          created_at: new Date(),
          updated_at: new Date(),
        });
        
        // Add to total distance
        totalDistance += leg_distance;
      }
      
      // Update trip with total distance
      await newTrip.update({
        total_distance: totalDistance
      });
    }
    
    // Create special instructions if any were provided
    if (special_instructions) {
      try {
        const createdInstructions = await TripSpecialInstruction.create({
          trip_id: newTrip.trip_id,
          mobility_type: special_instructions.mobility_type || 'Ambulatory',
          rides_alone: special_instructions.rides_alone || false,
          spanish_speaking: special_instructions.spanish_speaking || false,
          males_only: special_instructions.males_only || false,
          females_only: special_instructions.females_only || false,
          special_assist: special_instructions.special_assist || false,
          pickup_time_exact: special_instructions.pickup_time_exact || false,
          stay_with_client: special_instructions.stay_with_client || false,
          car_seat: special_instructions.car_seat || false,
          extra_person: special_instructions.extra_person || false,
          call_first: special_instructions.call_first || false,
          knock: special_instructions.knock || false,
          van: special_instructions.van || false,
          sedan: special_instructions.sedan || false,
          created_at: new Date(),
          updated_at: new Date(),
        });
      } catch (instructionsError) {
        console.error("Error creating special instructions:", instructionsError);
        // Continue without failing the whole request if instructions creation fails
      }
    }
    
    // Fetch the created trip with its relationships
    const tripWithRelations = await Trip.findByPk(newTrip.trip_id, {
      include: [
        { 
          model: TripMember,
          include: [
            Program,
            {
              model: TripLocation,
              as: "memberPickupLocation",
              attributes: ['location_id', 'street_address', 'city', 'state', 'zip', 'phone', 'latitude', 'longitude']
            },
            {
              model: TripLocation,
              as: "memberDropoffLocation",
              attributes: ['location_id', 'street_address', 'city', 'state', 'zip', 'phone', 'latitude', 'longitude']
            }
          ]
        },
        { 
          model: User, 
          as: "creator",
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: TripSpecialInstruction,
          as: "specialInstructions"
        },
        {
          model: TripLeg,
          as: "legs",
          include: [
            { 
              model: User, 
              as: "driver",
              attributes: ['id', 'first_name', 'last_name']
            },
            { 
              model: TripLocation, 
              as: "pickupLocation" 
            },
            { 
              model: TripLocation, 
              as: "dropoffLocation" 
            }
          ]
        }
      ]
    });
    
    res.status(201).json(tripWithRelations);
  } catch (error) {
    console.error("Error creating trip:", error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Update a trip with its legs
router.put("/:id", async (req, res) => {
  try {
    const { special_instructions, legs, ...tripData } = req.body;
    
    // Check if trip exists
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    
    // Update the trip
    await trip.update({
      ...tripData,
      updated_at: new Date()
    });
    
    // Update special instructions if provided
    if (special_instructions) {
      let instructions = await TripSpecialInstruction.findOne({
        where: { trip_id: trip.trip_id }
      });
      
      if (instructions) {
        // Update existing instructions
        await instructions.update({
          ...special_instructions,
          updated_at: new Date()
        });
      } else {
        // Create new instructions
        await TripSpecialInstruction.create({
          trip_id: trip.trip_id,
          mobility_type: special_instructions.mobility_type || 'Ambulatory',
          rides_alone: special_instructions.rides_alone || false,
          spanish_speaking: special_instructions.spanish_speaking || false,
          males_only: special_instructions.males_only || false,
          females_only: special_instructions.females_only || false,
          special_assist: special_instructions.special_assist || false,
          pickup_time_exact: special_instructions.pickup_time_exact || false,
          stay_with_client: special_instructions.stay_with_client || false,
          car_seat: special_instructions.car_seat || false,
          extra_person: special_instructions.extra_person || false,
          call_first: special_instructions.call_first || false,
          knock: special_instructions.knock || false,
          van: special_instructions.van || false,
          sedan: special_instructions.sedan || false,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    
    // Update legs if provided
    if (legs && legs.length > 0) {
      // Get existing legs
      const existingLegs = await TripLeg.findAll({
        where: { trip_id: trip.trip_id }
      });
      
      // Track legs to be kept
      const legsToKeep = [];
      let totalDistance = 0;
      
      // Process each leg
      for (let i = 0; i < legs.length; i++) {
        const legData = legs[i];
        legData.trip_id = trip.trip_id;
        legData.sequence = i + 1;
        
        // Format time fields
        if (legData.scheduled_pickup) {
          legData.scheduled_pickup = formatTimeForDB(legData.scheduled_pickup);
        }
        if (legData.scheduled_dropoff) {
          legData.scheduled_dropoff = formatTimeForDB(legData.scheduled_dropoff);
        }
        if (legData.actual_pickup) {
          legData.actual_pickup = formatTimeForDB(legData.actual_pickup);
        }
        if (legData.actual_dropoff) {
          legData.actual_dropoff = formatTimeForDB(legData.actual_dropoff);
        }
        
        let leg;
        
        if (legData.leg_id) {
          // Update existing leg
          leg = existingLegs.find(l => l.leg_id === legData.leg_id);
          
          if (leg) {
            // Recalculate distance if locations changed
            if ((legData.pickup_location && legData.pickup_location !== leg.pickup_location) || 
                (legData.dropoff_location && legData.dropoff_location !== leg.dropoff_location)) {
              
              try {
                const pickupLocation = await TripLocation.findByPk(legData.pickup_location);
                const dropoffLocation = await TripLocation.findByPk(legData.dropoff_location);
                
                if (pickupLocation && dropoffLocation) {
                  const pickupAddress = formatAddress(pickupLocation);
                  const dropoffAddress = formatAddress(dropoffLocation);
                  
                  const distanceResult = await calculateDistance(pickupAddress, dropoffAddress);
                  
                  if (distanceResult && distanceResult.distance) {
                    legData.leg_distance = parseFloat((distanceResult.distance.value / 1609.34).toFixed(2));
                  }
                }
              } catch (distanceError) {
                console.error("Error calculating updated leg distance:", distanceError);
                // Continue without updating distance on error
              }
            }
            
            await leg.update({
              ...legData,
              updated_at: new Date()
            });
            
            legsToKeep.push(leg.leg_id);
            totalDistance += leg.leg_distance || 0;
          }
        } else {
          // Create new leg
          let leg_distance = 0;
          
          if (legData.pickup_location && legData.dropoff_location) {
            try {
              const pickupLocation = await TripLocation.findByPk(legData.pickup_location);
              const dropoffLocation = await TripLocation.findByPk(legData.dropoff_location);
              
              if (pickupLocation && dropoffLocation) {
                const pickupAddress = formatAddress(pickupLocation);
                const dropoffAddress = formatAddress(dropoffLocation);
                
                const distanceResult = await calculateDistance(pickupAddress, dropoffAddress);
                
                if (distanceResult && distanceResult.distance) {
                  leg_distance = parseFloat((distanceResult.distance.value / 1609.34).toFixed(2));
                }
              }
            } catch (distanceError) {
              console.error("Error calculating leg distance:", distanceError);
              // Continue without distance calculation on error
            }
          }
          
          leg = await TripLeg.create({
            ...legData,
            leg_distance,
            created_at: new Date(),
            updated_at: new Date(),
          });
          
          legsToKeep.push(leg.leg_id);
          totalDistance += leg_distance;
        }
      }
      
      // Delete legs that weren't kept
      for (const existingLeg of existingLegs) {
        if (!legsToKeep.includes(existingLeg.leg_id)) {
          await existingLeg.destroy();
        }
      }
      
      // Update trip's total distance
      await trip.update({
        total_distance: totalDistance,
        updated_at: new Date()
      });
    }
    
    // Fetch the updated trip with its relationships
    const updatedTrip = await Trip.findByPk(trip.trip_id, {
      include: [
        { 
          model: TripMember,
          include: [
            Program,
            {
              model: TripLocation,
              as: "memberPickupLocation",
              attributes: ['location_id', 'street_address', 'city', 'state', 'zip', 'phone', 'latitude', 'longitude']
            },
            {
              model: TripLocation,
              as: "memberDropoffLocation",
              attributes: ['location_id', 'street_address', 'city', 'state', 'zip', 'phone', 'latitude', 'longitude']
            }
          ]
        },
        { 
          model: User, 
          as: "creator",
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: TripSpecialInstruction,
          as: "specialInstructions"
        },
        {
          model: TripLeg,
          as: "legs",
          include: [
            { 
              model: User, 
              as: "driver",
              attributes: ['id', 'first_name', 'last_name']
            },
            { 
              model: TripLocation, 
              as: "pickupLocation" 
            },
            { 
              model: TripLocation, 
              as: "dropoffLocation" 
            }
          ]
        }
      ]
    });
    
    res.json(updatedTrip);
  } catch (error) {
    console.error("Error updating trip:", error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Delete a trip
router.delete("/:id", async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    
    // Get related trip legs
    const tripLegs = await TripLeg.findAll({
      where: { trip_id: trip.trip_id }
    });
    
    // Delete trip legs
    for (const leg of tripLegs) {
      await leg.destroy();
    }
    
    // Delete special instructions
    const specialInstructions = await TripSpecialInstruction.findOne({
      where: { trip_id: trip.trip_id }
    });
    
    if (specialInstructions) {
      await specialInstructions.destroy();
    }
    
    // Delete the trip
    await trip.destroy();
    
    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 