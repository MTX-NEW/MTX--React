const TripLeg = require("../models/TripLeg");
const Trip = require("../models/Trip");
const TripLocation = require("../models/TripLocation");
const User = require("../models/User");
const TimeOffRequest = require("../models/TimeOffRequest");
const { ValidationError, Op } = require("sequelize");
const { calculateDistance, formatAddress } = require("../utils/googleMapsService");
const { formatTimeForDB } = require("../utils/timeUtils");
const { sendDriverAssignmentSMS } = require("../utils/smsService");
const sequelize = require("../db");

// Get all trip legs
exports.getAllLegs = async (req, res) => {
  try {
    const tripLegs = await TripLeg.findAll({
      include: [
        { 
          model: Trip,
        },
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
    });
    res.json(tripLegs);
  } catch (error) {
    console.error("Error fetching trip legs:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get trip legs for a specific trip
exports.getLegsByTripId = async (req, res) => {
  try {
    const tripLegs = await TripLeg.findAll({
      where: {
        trip_id: req.params.tripId
      },
      include: [
        { 
          model: Trip,
        },
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
      ],
      order: [['sequence', 'ASC']]
    });
    res.json(tripLegs);
  } catch (error) {
    console.error("Error fetching trip legs:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get a specific trip leg by ID
exports.getLegById = async (req, res) => {
  try {
    const tripLeg = await TripLeg.findByPk(req.params.id, {
      include: [
        { 
          model: Trip,
        },
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
    });
    
    if (!tripLeg) {
      return res.status(404).json({ message: "Trip leg not found" });
    }
    
    res.json(tripLeg);
  } catch (error) {
    console.error("Error fetching trip leg:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new trip leg
exports.createLeg = async (req, res) => {
  try {
    const legData = req.body;
    
    // Validate leg data
    if (!legData.trip_id || !legData.pickup_location || !legData.dropoff_location) {
      return res.status(400).json({
        message: "Trip ID, pickup and dropoff locations are required"
      });
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

    // Create the trip leg with distance information
    const newTripLeg = await TripLeg.create({
      ...legData,
      leg_distance,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    // Update the total distance of the parent trip
    try {
      const parentTrip = await Trip.findByPk(legData.trip_id);
      if (parentTrip) {
        // Get all legs for this trip
        const allLegs = await TripLeg.findAll({
          where: { trip_id: legData.trip_id }
        });
        
        // Sum up all leg distances
        const totalDistance = allLegs.reduce((sum, leg) => {
          return sum + (leg.leg_distance || 0);
        }, 0);
        
        // Update the parent trip
        await parentTrip.update({
          total_distance: totalDistance,
          updated_at: new Date()
        });
      }
    } catch (tripUpdateError) {
      console.error("Error updating parent trip distance:", tripUpdateError);
      // Continue without failing the whole request
    }
    
    // Fetch the created trip leg with its relationships
    const legWithRelations = await TripLeg.findByPk(newTripLeg.leg_id, {
      include: [
        { 
          model: Trip,
        },
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
    });
    
    res.status(201).json(legWithRelations);
  } catch (error) {
    console.error("Error creating trip leg:", error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// Update a trip leg
exports.updateLeg = async (req, res) => {
  try {
    const tripLeg = await TripLeg.findByPk(req.params.id);
    
    if (!tripLeg) {
      return res.status(404).json({ message: "Trip leg not found" });
    }
    
    // Extract data from request
    const legData = req.body;
    const sendSms = legData.send_sms === true; // Check if SMS notification is requested
    delete legData.send_sms; // Remove send_sms from the data to be saved
    
    // Check if driver is being assigned or changed
    if (legData.driver_id && (!tripLeg.driver_id || legData.driver_id !== tripLeg.driver_id)) {
      // Get the trip to find the trip date
      const trip = await Trip.findByPk(tripLeg.trip_id);
      
      if (trip) {
        const tripDate = new Date(trip.start_date);
        
        // Check if driver has approved time off on this date
        const timeOffRequests = await TimeOffRequest.findOne({
          where: {
            user_id: legData.driver_id,
            status: 'approved',
            start_date: { [Op.lte]: tripDate },
            end_date: { [Op.gte]: tripDate }
          }
        });
        
        if (timeOffRequests) {
          return res.status(400).json({ 
            message: "Cannot assign driver. Driver has approved time off during this trip date." 
          });
        }
        
        // Auto set status to "Assigned" when a driver is assigned
        legData.status = "Assigned";
        
        // Send SMS notification if requested
        if (sendSms) {
          try {
            // Get driver details - only fetch the fields we need
            const driver = await User.findByPk(legData.driver_id, {
              attributes: ['id', 'first_name', 'phone']
            });
            
            // Get pickup and dropoff locations
            const pickupLocationId = tripLeg.pickup_location;
            const dropoffLocationId = tripLeg.dropoff_location;
            
            const pickupLocation = await TripLocation.findByPk(pickupLocationId);
            const dropoffLocation = await TripLocation.findByPk(dropoffLocationId);
            
            if (driver && pickupLocation && dropoffLocation) {
              // Format pickup and dropoff addresses
              const pickupAddress = formatAddress(pickupLocation);
              const dropoffAddress = formatAddress(dropoffLocation);
              
              // Prepare trip info for SMS
              const tripInfo = {
                date: trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'N/A',
                time: tripLeg.scheduled_pickup || 'N/A',
                pickup_location: pickupAddress || 'N/A',
                dropoff_location: dropoffAddress || 'N/A'
              };
              
              // Send SMS notification with only required driver info
              await sendDriverAssignmentSMS(driver, tripInfo);
            }
          } catch (smsError) {
            console.error("Error sending SMS notification:", smsError);
            // Don't fail the whole request if SMS fails
          }
        }
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
    
    // Recalculate distance if locations have changed
    if ((legData.pickup_location && legData.pickup_location !== tripLeg.pickup_location) || 
        (legData.dropoff_location && legData.dropoff_location !== tripLeg.dropoff_location)) {
      
      // Get updated locations
      const pickupLocationId = legData.pickup_location || tripLeg.pickup_location;
      const dropoffLocationId = legData.dropoff_location || tripLeg.dropoff_location;
      
      try {
        const pickupLocation = await TripLocation.findByPk(pickupLocationId);
        const dropoffLocation = await TripLocation.findByPk(dropoffLocationId);
        
        if (pickupLocation && dropoffLocation) {
          // Format addresses for distance calculation
          const pickupAddress = formatAddress(pickupLocation);
          const dropoffAddress = formatAddress(dropoffLocation);
          
          // Calculate distance
          const distanceResult = await calculateDistance(pickupAddress, dropoffAddress);
          
          if (distanceResult && distanceResult.distance) {
            // Update distance in miles
            legData.leg_distance = parseFloat((distanceResult.distance.value / 1609.34).toFixed(2));
          }
        }
      } catch (distanceError) {
        console.error("Error calculating updated leg distance:", distanceError);
        // Continue without updating distance on error
      }
    }
    
    // Update the trip leg
    await tripLeg.update({
      ...legData,
      updated_at: new Date()
    });
    
    // Update the total distance of the parent trip
    try {
      const parentTrip = await Trip.findByPk(tripLeg.trip_id);
      if (parentTrip) {
        // Get all legs for this trip
        const allLegs = await TripLeg.findAll({
          where: { trip_id: tripLeg.trip_id }
        });
        
        // Sum up all leg distances
        const totalDistance = allLegs.reduce((sum, leg) => {
          return sum + (leg.leg_distance || 0);
        }, 0);
        
        // Update the parent trip
        await parentTrip.update({
          total_distance: totalDistance,
          updated_at: new Date()
        });
      }
    } catch (tripUpdateError) {
      console.error("Error updating parent trip distance:", tripUpdateError);
      // Continue without failing the whole request
    }
    
    // Fetch the updated trip leg with its relationships
    const updatedLeg = await TripLeg.findByPk(tripLeg.leg_id, {
      include: [
        { 
          model: Trip,
        },
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
    });
    
    res.json(updatedLeg);
  } catch (error) {
    console.error("Error updating trip leg:", error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// Delete a trip leg
exports.deleteLeg = async (req, res) => {
  try {
    const tripLeg = await TripLeg.findByPk(req.params.id);
    
    if (!tripLeg) {
      return res.status(404).json({ message: "Trip leg not found" });
    }
    
    // Store trip_id for later use
    const tripId = tripLeg.trip_id;
    
    // Delete the trip leg
    await tripLeg.destroy();
    
    // Update the total distance of the parent trip
    try {
      const parentTrip = await Trip.findByPk(tripId);
      if (parentTrip) {
        // Get all remaining legs for this trip
        const remainingLegs = await TripLeg.findAll({
          where: { trip_id: tripId }
        });
        
        // Sum up all leg distances
        const totalDistance = remainingLegs.reduce((sum, leg) => {
          return sum + (leg.leg_distance || 0);
        }, 0);
        
        // Update the parent trip
        await parentTrip.update({
          total_distance: totalDistance,
          updated_at: new Date()
        });
      }
    } catch (tripUpdateError) {
      console.error("Error updating parent trip distance after leg deletion:", tripUpdateError);
      // Continue without failing the whole request
    }
    
    res.json({ message: "Trip leg deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip leg:", error);
    res.status(500).json({ message: error.message });
  }
}; 