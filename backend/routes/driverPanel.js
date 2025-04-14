const express = require("express");
const router = express.Router();
const TripLeg = require("../models/TripLeg");
const Trip = require("../models/Trip");
const TripMember = require("../models/TripMember");
const TripLocation = require("../models/TripLocation");
const User = require("../models/User");
const TripSpecialInstruction = require("../models/TripSpecialInstruction");
const TimeSheet = require("../models/TimeSheetEntry");
const { Op } = require("sequelize");
const Program = require("../models/Program");

// Get trips assigned to the driver
router.get("/trips/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status } = req.query;

    const whereClause = {
      driver_id: driverId,
    };

    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }

    const tripLegs = await TripLeg.findAll({
      where: whereClause,
      include: [
        {
          model: Trip,
          include: [
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
                },
              ],
            },
            {
              model: TripSpecialInstruction,
              as: "specialInstructions",
            },
          ],
        },
        {
          model: TripLocation,
          as: "pickupLocation",
        },
        {
          model: TripLocation,
          as: "dropoffLocation",
        },
      ],
      order: [
        ["scheduled_pickup", "ASC"],
      ],
    });

    res.json(tripLegs);
  } catch (error) {
    console.error("Error fetching driver trips:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific trip leg assigned to the driver
router.get("/trip-leg/:legId/:driverId", async (req, res) => {
  try {
    const { legId, driverId } = req.params;

    const tripLeg = await TripLeg.findOne({
      where: {
        leg_id: legId,
        driver_id: driverId,
      },
      include: [
        {
          model: Trip,
          include: [
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
                },
              ],
            },
            {
              model: TripSpecialInstruction,
              as: "specialInstructions",
            },
          ],
        },
        {
          model: TripLocation,
          as: "pickupLocation",
        },
        {
          model: TripLocation,
          as: "dropoffLocation",
        },
      ],
    });

    if (!tripLeg) {
      return res.status(404).json({ message: "Trip leg not found or not assigned to this driver" });
    }

    res.json(tripLeg);
  } catch (error) {
    console.error("Error fetching trip leg details:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update trip leg status (driver can only update to specific statuses)
router.put("/trip-leg/:legId/status", async (req, res) => {
  try {
    const { legId } = req.params;
    const { status, driverId } = req.body;

    // Validate driver permissions
    const tripLeg = await TripLeg.findOne({
      where: {
        leg_id: legId,
        driver_id: driverId,
      },
    });

    if (!tripLeg) {
      return res.status(404).json({ message: "Trip leg not found or not assigned to this driver" });
    }

    // Check if the requested status is allowed for drivers
    const allowedStatuses = [
      'Transport confirmed',
      'Transport enroute',
      'Picked up',
      'Not going',
      'Not available',
      'Dropped off',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Drivers can only update status to: ${allowedStatuses.join(', ')}`,
      });
    }

    // Prepare update data
    const updateData = {
      status,
      updated_at: new Date(),
    };

    // Current date and time
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // Format: HH:MM:SS
    const currentDate = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Update actual pickup time if status is 'Picked up'
    if (status === 'Picked up') {
      updateData.actual_pickup = currentTime;
      
      // Create TimeSheet entry for clock in
      await TimeSheet.create({
        user_id: driverId,
        date: currentDate,
        clock_in: now,
        status: 'draft',
        notes: `Auto clock-in from trip ${tripLeg.trip_id || 'unknown'}, leg ${tripLeg.leg_id}`
      });
      console.log(`Driver ${driverId} clocked in automatically for trip leg ${legId}`);
    }

    // Update actual dropoff time if status is 'Dropped off'
    if (status === 'Dropped off') {
      updateData.actual_dropoff = currentTime;
      
      // Find active TimeSheet for this driver today and clock them out
      const activeTimesheet = await TimeSheet.findOne({
        where: {
          user_id: driverId,
          date: currentDate,
          clock_out: null,
          [Op.or]: [
            { status: 'draft' },
            { status: 'active' }
          ]
        }
      });
      
      if (activeTimesheet) {
        console.log(`Found active timesheet for driver ${driverId}`, activeTimesheet.id || activeTimesheet.timesheet_id);
        
        // Calculate hours worked
        const clockInTime = new Date(activeTimesheet.clock_in).getTime();
        const clockOutTime = now.getTime();
        const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);
        
        try {
          // Update the timesheet with clock out time and hours
          await activeTimesheet.update({
            clock_out: now,
            total_regular_hours: hoursWorked > 8 ? 8 : hoursWorked,
            total_overtime_hours: hoursWorked > 8 ? hoursWorked - 8 : 0,
            status: 'clocked_out',
            notes: activeTimesheet.notes + `\nAuto clock-out from trip ${tripLeg.trip_id || 'unknown'}, leg ${tripLeg.leg_id}`
          });
          console.log(`Successfully clocked out driver ${driverId} from timesheet`, activeTimesheet.id || activeTimesheet.timesheet_id);
        } catch (timesheetError) {
          console.error('Error updating timesheet for clock-out:', timesheetError);
        }
      } else {
        console.log(`No active timesheet found for driver ${driverId} on ${currentDate}`);
      }
    }

    // Update the trip leg
    await tripLeg.update(updateData);

    // Fetch the updated trip leg with its relationships
    const updatedLeg = await TripLeg.findByPk(legId, {
      include: [
        {
          model: Trip,
          include: [
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
                },
              ],
            },
          ],
        },
        {
          model: TripLocation,
          as: "pickupLocation",
        },
        {
          model: TripLocation,
          as: "dropoffLocation",
        },
      ],
    });

    res.json(updatedLeg);
  } catch (error) {
    console.error("Error updating trip leg status:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update trip leg odometer readings
router.put("/trip-leg/:legId/odometer", async (req, res) => {
  try {
    const { legId } = req.params;
    const { pickup_odometer, dropoff_odometer, driverId } = req.body;

    // Validate driver permissions
    const tripLeg = await TripLeg.findOne({
      where: {
        leg_id: legId,
        driver_id: driverId,
      },
    });

    if (!tripLeg) {
      return res.status(404).json({ message: "Trip leg not found or not assigned to this driver" });
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date(),
    };

    // Only update the fields that are provided
    if (pickup_odometer !== undefined && pickup_odometer !== null) {
      updateData.pickup_odometer = pickup_odometer;
    }

    if (dropoff_odometer !== undefined && dropoff_odometer !== null) {
      updateData.dropoff_odometer = dropoff_odometer;
    }

    // Update the trip leg
    await tripLeg.update(updateData);

    // Fetch the updated trip leg with its relationships
    const updatedLeg = await TripLeg.findByPk(legId, {
      include: [
        {
          model: Trip,
          include: [
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
                },
              ],
            },
          ],
        },
        {
          model: TripLocation,
          as: "pickupLocation",
        },
        {
          model: TripLocation,
          as: "dropoffLocation",
        },
      ],
    });

    res.json(updatedLeg);
  } catch (error) {
    console.error("Error updating trip leg odometer readings:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get today's trips for driver
router.get("/today-trips/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    
    const tripLegs = await TripLeg.findAll({
      where: {
        driver_id: driverId,
      },
      include: [
        {
          model: Trip,
          where: {
            // Filter trips scheduled for today
            start_date: {
              [Op.gte]: `${todayFormatted} 00:00:00`,
              [Op.lte]: `${todayFormatted} 23:59:59`,
            },
          },
          include: [
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
                },
              ],
            },
            {
              model: TripSpecialInstruction,
              as: "specialInstructions",
            },
          ],
        },
        {
          model: TripLocation,
          as: "pickupLocation",
        },
        {
          model: TripLocation,
          as: "dropoffLocation",
        },
      ],
      order: [
        ["scheduled_pickup", "ASC"],
      ],
    });

    res.json(tripLegs);
  } catch (error) {
    console.error("Error fetching today's driver trips:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get weekly schedule for driver
router.get("/weekly-schedule/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;
    const { startDate } = req.query;
    
    // Calculate start and end dates for the week
    let weekStart, weekEnd;
    
    if (startDate) {
      // If startDate is provided, use it as the beginning of the week
      weekStart = new Date(startDate);
    } else {
      // Otherwise use the current date as reference
      const today = new Date();
      const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate previous Sunday (or today if it's Sunday)
      weekStart = new Date(today);
      weekStart.setDate(today.getDate() - day);
    }
    
    // Set week end to 6 days after week start (Saturday)
    weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    // Format dates for query
    const weekStartFormatted = weekStart.toISOString().split('T')[0];
    const weekEndFormatted = weekEnd.toISOString().split('T')[0];
    
    const tripLegs = await TripLeg.findAll({
      where: {
        driver_id: driverId,
      },
      include: [
        {
          model: Trip,
          where: {
            // Filter trips scheduled for the week
            start_date: {
              [Op.gte]: `${weekStartFormatted} 00:00:00`,
              [Op.lte]: `${weekEndFormatted} 23:59:59`,
            },
          },
          include: [
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
                },
              ],
            },
          ],
        },
        {
          model: TripLocation,
          as: "pickupLocation",
        },
        {
          model: TripLocation,
          as: "dropoffLocation",
        },
      ],
      order: [
        [Trip, 'start_date', 'ASC'],
        ['scheduled_pickup', 'ASC'],
      ],
    });

    // Group trips by day for easier frontend rendering
    const groupedByDay = {};
    
    for (let i = 0; i <= 6; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      groupedByDay[dateKey] = [];
    }
    
    tripLegs.forEach(leg => {
      const tripDate = leg.Trip.start_date.toISOString().split('T')[0];
      if (groupedByDay[tripDate]) {
        groupedByDay[tripDate].push(leg);
      }
    });

    res.json({
      weekStart: weekStartFormatted,
      weekEnd: weekEndFormatted,
      schedule: groupedByDay
    });
  } catch (error) {
    console.error("Error fetching weekly schedule:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update driver signature
router.put("/driver/:driverId/signature", async (req, res) => {
  try {
    const { driverId } = req.params;
    const { signature } = req.body;

    // Validate that the driver exists
    const driver = await User.findByPk(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Update the driver's signature
    await driver.update({
      signature,
      updated_at: new Date()
    });

    res.json({ message: "Driver signature updated successfully" });
  } catch (error) {
    console.error("Error updating driver signature:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update trip member signature
router.put("/trip-member/:memberId/signature", async (req, res) => {
  try {
    const { memberId } = req.params;
    const { signature } = req.body;

    // Validate that the trip member exists
    const tripMember = await TripMember.findByPk(memberId);
    if (!tripMember) {
      return res.status(404).json({ message: "Trip member not found" });
    }

    // Update the trip member's signature
    await tripMember.update({
      signature,
      updated_at: new Date()
    });

    res.json({ message: "Trip member signature updated successfully" });
  } catch (error) {
    console.error("Error updating trip member signature:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 