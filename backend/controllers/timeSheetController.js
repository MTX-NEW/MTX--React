const { TimeSheet, User, TimeSheetBreak } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../db');

// Get all timesheets with optional filtering
exports.getAllTimeSheets = async (req, res) => {
  try {
    const { userId, startDate, endDate, status } = req.query;
    
    // Build filter conditions
    let whereConditions = {};
    
    if (userId) {
      whereConditions.user_id = userId;
    }
    
    if (startDate || endDate) {
      whereConditions.date = {};
      if (startDate) {
        whereConditions.date[Op.gte] = startDate;
      }
      if (endDate) {
        whereConditions.date[Op.lte] = endDate;
      }
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    const timesheets = await TimeSheet.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: TimeSheetBreak
        }
      ],
      order: [['date', 'DESC']]
    });
    
    res.json(timesheets);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({ message: 'Failed to fetch timesheets', error: error.message });
  }
};

// Get timesheet by ID
exports.getTimeSheetById = async (req, res) => {
  try {
    const timesheet = await TimeSheet.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: TimeSheetBreak
        }
      ]
    });
    
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    res.json(timesheet);
  } catch (error) {
    console.error('Error fetching timesheet:', error);
    res.status(500).json({ message: 'Failed to fetch timesheet', error: error.message });
  }
};

// Create new timesheet
exports.createTimeSheet = async (req, res) => {
  try {
    const { 
      user_id, 
      date, 
      clock_in, 
      clock_out, 
      total_hours, 
      hour_type,
      rate,
      status, 
      notes 
    } = req.body;
    
    // Validate required fields
    if (!user_id || !date || !clock_in) {
      return res.status(400).json({ message: 'User ID, date, and clock-in time are required' });
    }
    
    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create timesheet
    const timesheet = await TimeSheet.create({
      user_id,
      date,
      clock_in,
      clock_out,
      total_hours: total_hours || 0,
      hour_type: hour_type || 'regular',
      rate: rate || user.hourly_rate || 0,
      status: status || 'draft',
      notes
    });
    
    res.status(201).json(timesheet);
  } catch (error) {
    console.error('Error creating timesheet:', error);
    res.status(500).json({ message: 'Failed to create timesheet', error: error.message });
  }
};

// Update timesheet
exports.updateTimeSheet = async (req, res) => {
  try {
    const { 
      user_id, 
      date, 
      clock_in, 
      clock_out, 
      total_hours, 
      hour_type,
      rate,
      status, 
      notes 
    } = req.body;
    
    // Find timesheet
    const timesheet = await TimeSheet.findByPk(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    // Update timesheet
    await timesheet.update({
      user_id: user_id || timesheet.user_id,
      date: date || timesheet.date,
      clock_in: clock_in || timesheet.clock_in,
      clock_out,
      total_hours: total_hours !== undefined ? total_hours : timesheet.total_hours,
      hour_type: hour_type || timesheet.hour_type,
      rate: rate !== undefined ? rate : timesheet.rate,
      status: status || timesheet.status,
      notes: notes !== undefined ? notes : timesheet.notes
    });
    
    // Calculate total hours if clock_out is set
    if (clock_out && !total_hours) {
      const clockInTime = new Date(timesheet.clock_in);
      const clockOutTime = new Date(clock_out);
      const diffHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
      
      // Get breaks for this timesheet
      const breaks = await TimeSheetBreak.findAll({
        where: { timesheet_id: timesheet.timesheet_id }
      });
      
      // Calculate total break time
      let breakHours = 0;
      for (const breakEntry of breaks) {
        if (breakEntry.end_time) {
          const breakStartTime = new Date(breakEntry.start_time);
          const breakEndTime = new Date(breakEntry.end_time);
          breakHours += (breakEndTime - breakStartTime) / (1000 * 60 * 60);
        }
      }
      
      // Subtract break time from total time
      const netHours = diffHours - breakHours;
      
      // Update the hours
      await timesheet.update({
        total_hours: netHours.toFixed(2)
      });
    }
    
    // Get the updated timesheet with associations
    const updatedTimesheet = await TimeSheet.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: TimeSheetBreak
        }
      ]
    });
    
    res.json(updatedTimesheet);
  } catch (error) {
    console.error('Error updating timesheet:', error);
    res.status(500).json({ message: 'Failed to update timesheet', error: error.message });
  }
};

// Delete timesheet
exports.deleteTimeSheet = async (req, res) => {
  try {
    const timesheet = await TimeSheet.findByPk(req.params.id);
    
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    await timesheet.destroy();
    res.json({ message: 'Timesheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting timesheet:', error);
    res.status(500).json({ message: 'Failed to delete timesheet', error: error.message });
  }
};

// Clock in
exports.clockIn = async (req, res) => {
  try {
    const { user_id, notes, hour_type } = req.body;
    
    // Validate required fields
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already has an active timesheet
    // Only check for timesheets that have no clock_out time
    const activeTimesheet = await TimeSheet.findOne({
      where: {
        user_id,
        clock_out: null
      }
    });
    
    if (activeTimesheet) {
      return res.status(400).json({ 
        message: 'User already has an active timesheet, please clock out first',
        timesheet: activeTimesheet
      });
    }
    
    // Current time
    const now = new Date();
    
    // Create timesheet
    const timesheet = await TimeSheet.create({
      user_id,
      date: now.toISOString().split('T')[0], // YYYY-MM-DD
      clock_in: now,
      hour_type: hour_type || 'regular',
      rate: user.hourly_rate || 0,
      status: 'active',
      notes: notes || 'Manually clocked in',
      total_hours: 0
    });
    
    res.status(201).json(timesheet);
  } catch (error) {
    console.error('Error clocking in:', error);
    res.status(500).json({ message: 'Failed to clock in', error: error.message });
  }
};

// Clock out
exports.clockOut = async (req, res) => {
  try {
    const { user_id, notes } = req.body;
    
    // Validate required fields
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Find active timesheet for this user (without clock_out time)
    const activeTimesheet = await TimeSheet.findOne({
      where: {
        user_id,
        clock_out: null
      },
      include: [
        {
          model: TimeSheetBreak
        }
      ]
    });
    
    if (!activeTimesheet) {
      return res.status(404).json({ message: 'No active timesheet found for this user. Employee must clock in first.' });
    }
    
    // Current time
    const now = new Date();
    
    // Calculate hours
    const clockInTime = new Date(activeTimesheet.clock_in);
    const clockOutTime = now;
    
    // Calculate the time difference correctly
    // If the clock-out is on the same date, calculate actual hours
    // Otherwise, limit to a standard workday (e.g., 8 hours)
    let diffHours;
    let overnightNote = '';
    
    const clockInDate = clockInTime.toISOString().split('T')[0];
    const clockOutDate = clockOutTime.toISOString().split('T')[0];
    
    if (clockInDate === clockOutDate) {
      // Same day - calculate actual hours worked
      diffHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
    } else {
      // Different days - assume a standard workday of 8 hours
      diffHours = 8;
      overnightNote = `System automatically limited hours to ${diffHours} for overnight shift from ${clockInDate} to ${clockOutDate}.`;
      console.log(`Clock out on different day than clock in. Limiting to ${diffHours} hours.`);
    }
    
    // Calculate total break time
    let breakHours = 0;
    for (const breakEntry of activeTimesheet.TimeSheetBreaks) {
      if (breakEntry.end_time) {
        const breakStartTime = new Date(breakEntry.start_time);
        const breakEndTime = new Date(breakEntry.end_time);
        breakHours += (breakEndTime - breakStartTime) / (1000 * 60 * 60);
      }
    }
    
    // Subtract break time from total time
    const netHours = diffHours - breakHours;
    
    // Output for debugging
    console.log(`Clock in: ${clockInTime}, Clock out: ${clockOutTime}`);
    console.log(`Diff hours: ${diffHours}, Break hours: ${breakHours}, Net hours: ${netHours}`);
    
    // Combine notes
    const updatedNotes = [
      activeTimesheet.notes || '',
      notes || '',
      overnightNote
    ].filter(Boolean).join('\n').trim();
    
    // Update the timesheet
    await activeTimesheet.update({
      clock_out: now,
      total_hours: netHours.toFixed(2),
      status: 'submitted',
      notes: updatedNotes
    });
    
    // Calculate weekly overtime
    await calculateWeeklyOvertime(user_id, activeTimesheet.date);
    
    // Get the updated timesheet with associations
    const updatedTimesheet = await TimeSheet.findByPk(activeTimesheet.timesheet_id, {
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: TimeSheetBreak
        }
      ]
    });
    
    res.json(updatedTimesheet);
  } catch (error) {
    console.error('Error clocking out:', error);
    res.status(500).json({ message: 'Failed to clock out', error: error.message });
  }
};

// Get active timesheet for user
exports.getActiveTimesheet = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find active timesheet for this user
    const activeTimesheet = await TimeSheet.findOne({
      where: {
        user_id: userId,
        clock_out: null
      },
      include: [
        {
          model: TimeSheetBreak
        }
      ]
    });
    
    if (!activeTimesheet) {
      return res.status(404).json({ message: 'No active timesheet found for this user' });
    }
    
    res.json(activeTimesheet);
  } catch (error) {
    console.error('Error fetching active timesheet:', error);
    res.status(500).json({ message: 'Failed to fetch active timesheet', error: error.message });
  }
};

// Get current timesheet status for user
exports.getTimesheetStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // First check for any active timesheet (clock_out is null) regardless of date
    const activeTimesheet = await TimeSheet.findOne({
      where: {
        user_id: userId,
        clock_out: null
      },
      include: [{
        model: TimeSheetBreak,
        order: [['start_time', 'DESC']]
      }],
      order: [
        ['created_at', 'DESC'],
        [TimeSheetBreak, 'start_time', 'DESC']
      ]
    });
    
    // If there's an active timesheet, return it even if it's from a previous day
    if (activeTimesheet) {
      // Check if user is on break
      const latestBreak = activeTimesheet.TimeSheetBreaks && activeTimesheet.TimeSheetBreaks.length > 0
        ? activeTimesheet.TimeSheetBreaks[0]
        : null;
        
      if (latestBreak && !latestBreak.end_time) {
        return res.json({
          status: 'on_break',
          message: 'User is currently on break',
          timesheet: activeTimesheet
        });
      } else {
        return res.json({
          status: 'clocked_in',
          message: 'User is currently clocked in',
          timesheet: activeTimesheet
        });
      }
    }
    
    // If no active timesheet found, look for today's most recent timesheet
    const todayTimesheet = await TimeSheet.findOne({
      where: {
        user_id: userId,
        date: today
      },
      include: [{
        model: TimeSheetBreak,
        order: [['start_time', 'DESC']]
      }],
      order: [
        ['created_at', 'DESC'],
        [TimeSheetBreak, 'start_time', 'DESC']
      ]
    });
    
    if (!todayTimesheet) {
      return res.json({
        status: 'not_started',
        message: 'No timesheet found for today'
      });
    }
    
    // Since we already checked for active timesheets, this must be a completed timesheet
    return res.json({
      status: 'clocked_out',
      message: 'User has clocked out for the day',
      timesheet: todayTimesheet
    });
  } catch (error) {
    console.error('Error getting timesheet status:', error);
    res.status(500).json({ message: 'Failed to get timesheet status', error: error.message });
  }
};

// Manually recalculate overtime for user in a date range
exports.recalculateOvertime = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.body;
    
    if (!userId || !startDate) {
      return res.status(400).json({ message: 'User ID and start date are required' });
    }
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Convert dates
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Recalculate overtime for each week in the date range
    const currentDate = new Date(start);
    const results = [];
    
    while (currentDate <= end) {
      try {
        await calculateWeeklyOvertime(userId, currentDate);
        
        // Get start and end of current week
        const dayOfWeek = currentDate.getDay();
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - dayOfWeek);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        results.push({
          week: {
            start: weekStart.toISOString().split('T')[0],
            end: weekEnd.toISOString().split('T')[0]
          },
          status: 'recalculated'
        });
        
        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
      } catch (error) {
        results.push({
          week: {
            start: currentDate.toISOString().split('T')[0]
          },
          status: 'error',
          error: error.message
        });
        
        // Move to next week even if there was an error
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }
    
    res.json({
      message: 'Overtime recalculation completed',
      results
    });
  } catch (error) {
    console.error('Error recalculating overtime:', error);
    res.status(500).json({ message: 'Failed to recalculate overtime', error: error.message });
  }
};

// Function to calculate weekly overtime
async function calculateWeeklyOvertime(userId, date) {
  try {
    // Convert input date to a Date object if it's a string
    const currentDate = typeof date === 'string' ? new Date(date) : new Date(date);
    
    // Calculate the start of the week (Sunday)
    const dayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate the end of the week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    console.log(`Calculating overtime for user ${userId} for week: ${startOfWeek.toISOString()} to ${endOfWeek.toISOString()}`);
    
    // Get all timesheet entries for this user within the week
    const timesheets = await TimeSheet.findAll({
      where: {
        user_id: userId,
        date: {
          [Op.between]: [startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]]
        },
        status: {
          [Op.not]: 'rejected'
        }
      },
      order: [['date', 'ASC'], ['clock_in', 'ASC']]
    });
    
    if (timesheets.length === 0) {
      console.log('No timesheets found for this week');
      return;
    }
    
    // Calculate total weekly hours
    let totalWeeklyHours = 0;
    let cumulativeHours = 0;
    let remainingRegularHours = 40; // Standard 40 hour workweek
    
    // First pass: Calculate total hours
    for (const timesheet of timesheets) {
      totalWeeklyHours += parseFloat(timesheet.total_hours || 0);
    }
    
    console.log(`Total weekly hours: ${totalWeeklyHours}`);
    
    // Second pass: Update timesheet types based on cumulative hours
    const transaction = await sequelize.transaction();
    
    try {
      // If total hours <= 40, make sure all entries are regular/driving/etc (not overtime)
      if (totalWeeklyHours <= 40) {
        for (const timesheet of timesheets) {
          // Skip entries that are already correctly typed (not overtime)
          if (timesheet.hour_type === 'over_time') {
            await timesheet.update({
              hour_type: timesheet.hour_type === 'driving' ? 'driving' : 'regular'
            }, { transaction });
          }
        }
      } else {
        // We have overtime to distribute
        for (const timesheet of timesheets) {
          const hours = parseFloat(timesheet.total_hours || 0);
          
          if (remainingRegularHours >= hours) {
            // This entire entry is regular time
            if (timesheet.hour_type === 'over_time') {
              await timesheet.update({
                hour_type: timesheet.hour_type === 'driving' ? 'driving' : 'regular'
              }, { transaction });
            }
            
            remainingRegularHours -= hours;
            cumulativeHours += hours;
          } else if (remainingRegularHours > 0) {
            // This entry contains both regular and overtime hours
            // We need to split this entry into two records
            
            // Update the existing record to contain only regular hours
            const regularHours = remainingRegularHours;
            const overtimeHours = hours - remainingRegularHours;
            
            // Create a new entry for overtime hours
            await TimeSheet.create({
              user_id: userId,
              date: timesheet.date,
              clock_in: timesheet.clock_in,
              clock_out: timesheet.clock_out,
              total_hours: overtimeHours,
              hour_type: 'over_time',
              rate: timesheet.rate, // Use the same rate
              status: timesheet.status,
              notes: `Overtime split from timesheet #${timesheet.timesheet_id}`
            }, { transaction });
            
            // Update the original entry to be regular hours only
            await timesheet.update({
              total_hours: regularHours
            }, { transaction });
            
            remainingRegularHours = 0;
            cumulativeHours += hours;
          } else {
            // This entire entry is overtime
            if (timesheet.hour_type !== 'over_time') {
              await timesheet.update({
                hour_type: 'over_time'
              }, { transaction });
            }
            
            cumulativeHours += hours;
          }
        }
      }
      
      await transaction.commit();
      console.log(`Successfully processed overtime for user ${userId}`);
    } catch (error) {
      await transaction.rollback();
      console.error(`Error processing overtime: ${error.message}`);
      throw error;
    }
  } catch (error) {
    console.error(`Error calculating weekly overtime: ${error.message}`);
    throw error;
  }
}

// Export the overtime calculation function for use in other controllers
exports.calculateWeeklyOvertime = calculateWeeklyOvertime; 