const Trip = require("../models/Trip");
const TripLeg = require("../models/TripLeg");
const TripMember = require("../models/TripMember");
const TripLocation = require("../models/TripLocation");
const User = require("../models/User");
const Program = require("../models/Program");
const TripSpecialInstruction = require("../models/TripSpecialInstruction");
const { ValidationError, Op } = require("sequelize");
const { calculateDistance, formatAddress } = require("../utils/googleMapsService");
const { formatTimeForDB, formatDateForDB } = require("../utils/timeUtils");

// Get all trips with related data
exports.getAllTrips = async (req, res) => {
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
};

// Get a specific trip by ID
exports.getTripById = async (req, res) => {
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
};

// Create a new trip with legs
exports.createTrip = async (req, res) => {
  try {
    const { special_instructions, legs, return_pickup_time, ...tripData } = req.body;
    
    // Convert date strings to Date objects with timezone handling
    if (tripData.start_date) {
      tripData.start_date = formatDateForDB(tripData.start_date);
    }
    
    // For schedule types 'Immediate' and 'Once', make end_date same as start_date
    if (tripData.schedule_type === 'Immediate' || tripData.schedule_type === 'Once') {
      tripData.end_date = tripData.start_date;
    } else if (tripData.end_date) {
      // For 'Blanket', convert end_date if provided
      tripData.end_date = formatDateForDB(tripData.end_date);
    }

    // Filter out any legs with missing required data
    const validLegs = legs?.filter(leg => leg && leg.pickup_location && leg.dropoff_location) || [];
    
    // For Blanket trips, create multiple trips based on schedule_days
    if (tripData.schedule_type === 'Blanket' && tripData.schedule_days) {
      const startDate = new Date(tripData.start_date);
      const endDate = new Date(tripData.end_date);
      const scheduleDays = typeof tripData.schedule_days === 'string' 
        ? tripData.schedule_days.split(',') 
        : tripData.schedule_days;
      
      // Map day names to day numbers (0 = Sunday, 1 = Monday, etc.)
      const dayNameToNumber = {
        'Sunday': 0,
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6
      };
      
      // Convert schedule days to day numbers
      const scheduleDayNumbers = scheduleDays.map(day => dayNameToNumber[day]);
      
      // Create trips for each scheduled day within the date range
      const createdTrips = [];
      const currentDate = new Date(startDate);
      
      // Process each day in the date range
      while (currentDate <= endDate) {
        const currentDayOfWeek = currentDate.getDay(); // 0-6
        
        // If this day of the week is in our schedule
        if (scheduleDayNumbers.includes(currentDayOfWeek)) {
          // Create a trip for this date
          const tripForDate = {
            ...tripData,
            start_date: new Date(currentDate),
            end_date: new Date(currentDate),
            parent_trip_id: null, // Will be updated after creating the first trip
            created_at: new Date(),
            updated_at: new Date()
          };
          
          // First trip in the series is the parent
          if (createdTrips.length === 0) {
            // This is the parent trip (first in series)
            delete tripForDate.parent_trip_id;
            
            const newTrip = await Trip.create(tripForDate);
            createdTrips.push(newTrip);
            
            // Update parentTripId for future trips in this series
            tripForDate.parent_trip_id = newTrip.trip_id;
          } else {
            // This is a child trip
            const newTrip = await Trip.create(tripForDate);
            createdTrips.push(newTrip);
          }
        }
        
        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // For each created trip, create legs and special instructions
      let totalTripsCreated = 0;
      for (const newTrip of createdTrips) {
        await createLegsForTrip(newTrip.trip_id, validLegs, tripData.trip_type, return_pickup_time);
        
        // Create special instructions for this trip
        if (special_instructions) {
          await TripSpecialInstruction.create({
            trip_id: newTrip.trip_id,
            ...special_instructions,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
        
        totalTripsCreated++;
      }
      
      // Return the parent trip (first in the series)
      if (createdTrips.length > 0) {
        const parentTrip = await Trip.findByPk(createdTrips[0].trip_id, {
          include: getFullTripIncludes()
        });
        
        res.status(201).json({
          ...parentTrip.toJSON(),
          _meta: {
            total_trips_created: totalTripsCreated,
            message: `Created ${totalTripsCreated} trips in this series`
          }
        });
      } else {
        res.status(400).json({ 
          message: "No trips were created. Check that the date range and schedule days are valid."
        });
      }
    } else {
      // For non-Blanket trips (Once or Immediate), create a single trip
      const newTrip = await Trip.create({
        ...tripData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      // Create legs for the trip
      await createLegsForTrip(newTrip.trip_id, validLegs, tripData.trip_type, return_pickup_time);
      
      // Create special instructions
      if (special_instructions) {
        await TripSpecialInstruction.create({
          trip_id: newTrip.trip_id,
          ...special_instructions,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
      
      // Get the fully populated trip data
      const createdTrip = await Trip.findByPk(newTrip.trip_id, {
        include: getFullTripIncludes()
      });
      
      res.status(201).json(createdTrip);
    }
  } catch (error) {
    console.error("Error creating trip:", error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// Helper function to create legs for a trip
async function createLegsForTrip(tripId, validLegs, tripType, returnPickupTime) {
  const createdLegs = [];
  let totalDistance = 0;
  
  // For round trips, ensure we only have one leg (we'll create the return leg automatically)
  let legsToCreate = validLegs;
  if (tripType === 'Round Trip' && validLegs.length > 1) {
    legsToCreate = [validLegs[0]]; // Only use the first leg for round trips
  }
  
  // Process each leg
  for (let i = 0; i < legsToCreate.length; i++) {
    const legData = {...legsToCreate[i]};
    
    // Set the trip_id and sequence
    legData.trip_id = tripId;
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
    
    // Create the leg with calculated distance
    const createdLeg = await TripLeg.create({
      ...legData,
      distance: leg_distance,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    createdLegs.push(createdLeg);
    
    // Add to total trip distance
    totalDistance += leg_distance;
  }
  
  // If this is a round trip, create the return leg
  if (tripType === 'Round Trip' && createdLegs.length > 0) {
    const firstLeg = createdLegs[0];
    
    // Only create return leg if we have both pickup and dropoff locations
    if (firstLeg.pickup_location && firstLeg.dropoff_location) {
      // Create return leg by swapping pickup and dropoff
      const returnLeg = await TripLeg.create({
        trip_id: tripId,
        sequence: 2,
        status: 'Scheduled',
        pickup_location: firstLeg.dropoff_location,
        dropoff_location: firstLeg.pickup_location,
        scheduled_pickup: returnPickupTime ? formatTimeForDB(returnPickupTime) : null,
        scheduled_dropoff: null,
        distance: firstLeg.distance,
        is_return: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      createdLegs.push(returnLeg);
      
      // Add return leg distance to total
      totalDistance += firstLeg.distance;
    }
  }
  
  // Update the trip's total distance
  await Trip.update(
    { 
      total_distance: totalDistance,
      updated_at: new Date()
    },
    { where: { trip_id: tripId } }
  );
  
  return { createdLegs, totalDistance };
}

// Helper function to get the standard trip includes for queries
function getFullTripIncludes() {
  return [
    { 
      model: TripMember,
      include: [
        Program,
        {
          model: TripLocation,
          as: "memberPickupLocation",
        },
        {
          model: TripLocation,
          as: "memberDropoffLocation",
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
  ];
}

// Update a trip
exports.updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { special_instructions, legs, return_pickup_time, ...tripData } = req.body;

    // Find the trip
    const trip = await Trip.findByPk(id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Update trip data
    if (tripData.start_date) {
      tripData.start_date = formatDateForDB(tripData.start_date);
    }

    if (tripData.end_date) {
      tripData.end_date = formatDateForDB(tripData.end_date);
    }

    await trip.update({
      ...tripData,
      updated_at: new Date()
    });

    // Update legs if provided
    if (legs && Array.isArray(legs)) {
      // Filter out any legs with missing required data
      const validLegs = legs.filter(leg => leg && leg.pickup_location && leg.dropoff_location);
      
      // For round trips, ensure we only have one leg (we'll create the return leg automatically)
      let legsToProcess = validLegs;
      if (tripData.trip_type === 'Round Trip' && validLegs.length > 1) {
        // For round trips, keep only non-return legs or just the first leg
        const nonReturnLegs = validLegs.filter(leg => !leg.is_return);
        legsToProcess = nonReturnLegs.length > 0 ? [nonReturnLegs[0]] : [validLegs[0]];
      }
      
      // Delete all existing legs first for a cleaner update
      await TripLeg.destroy({
        where: { trip_id: id }
      });

      // Calculate total distance from all legs
      let totalDistance = 0;
      const createdLegs = [];

      // Create all legs fresh
      for (let i = 0; i < legsToProcess.length; i++) {
        const legData = legsToProcess[i];
        legData.sequence = i + 1;
        legData.trip_id = id;

        // Calculate leg distance if pickup and dropoff locations are provided
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
          }
        }

        // Format time fields
        if (legData.scheduled_pickup) {
          legData.scheduled_pickup = formatTimeForDB(legData.scheduled_pickup);
        }
        
        if (legData.scheduled_dropoff) {
          legData.scheduled_dropoff = formatTimeForDB(legData.scheduled_dropoff);
        }

        // Create new leg (ignoring leg_id to avoid conflicts)
        const { leg_id, ...legDataToCreate } = legData;
        const createdLeg = await TripLeg.create({
          ...legDataToCreate,
          distance: leg_distance,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        createdLegs.push(createdLeg);
        totalDistance += leg_distance;
      }
      
      // If this is a round trip, create the return leg
      if (tripData.trip_type === 'Round Trip' && createdLegs.length > 0) {
        const firstLeg = createdLegs[0];
        
        // Only create return leg if we have both pickup and dropoff locations
        if (firstLeg.pickup_location && firstLeg.dropoff_location) {
          // Create return leg by swapping pickup and dropoff
          const returnLeg = await TripLeg.create({
            trip_id: id,
            sequence: 2,
            status: 'Scheduled',
            pickup_location: firstLeg.dropoff_location,
            dropoff_location: firstLeg.pickup_location,
            scheduled_pickup: return_pickup_time ? formatTimeForDB(return_pickup_time) : null,
            scheduled_dropoff: null,
            distance: firstLeg.distance,
            is_return: true,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          createdLegs.push(returnLeg);
          
          // Add return leg distance to total
          totalDistance += firstLeg.distance;
        }
      }

      // Update trip's total distance
      await trip.update({ total_distance: totalDistance });
    }

    // Update special instructions if provided
    if (special_instructions) {
      // Delete existing instructions
      await TripSpecialInstruction.destroy({
        where: { trip_id: id }
      });

      // Create new instruction with all properties
      await TripSpecialInstruction.create({
        trip_id: id,
        ...special_instructions,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Get the updated trip
    const updatedTrip = await Trip.findByPk(id, {
      include: [
        { 
          model: TripMember,
          include: [
            Program,
            {
              model: TripLocation,
              as: "memberPickupLocation"
            },
            {
              model: TripLocation,
              as: "memberDropoffLocation"
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
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// Delete a trip
exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the trip
    const trip = await Trip.findByPk(id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    
    // Delete related entities (legs, special instructions)
    await TripLeg.destroy({ where: { trip_id: id } });
    await TripSpecialInstruction.destroy({ where: { trip_id: id } });
    
    // Delete the trip
    await trip.destroy();
    
    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ message: error.message });
  }
}; 