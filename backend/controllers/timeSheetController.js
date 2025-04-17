const { TimeSheet, User, TimeSheetBreak } = require('../models');
const { Op } = require('sequelize');

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
      total_regular_hours, 
      total_overtime_hours, 
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
      total_regular_hours: total_regular_hours || 0,
      total_overtime_hours: total_overtime_hours || 0,
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
      total_regular_hours, 
      total_overtime_hours, 
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
      total_regular_hours: total_regular_hours !== undefined ? total_regular_hours : timesheet.total_regular_hours,
      total_overtime_hours: total_overtime_hours !== undefined ? total_overtime_hours : timesheet.total_overtime_hours,
      status: status || timesheet.status,
      notes: notes !== undefined ? notes : timesheet.notes
    });
    
    // Calculate total hours if clock_out is set
    if (clock_out && !total_regular_hours) {
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
      
      // Default overtime threshold (8 hours)
      const overtimeThreshold = 8;
      
      // Calculate regular and overtime hours
      const regularHours = Math.min(netHours, overtimeThreshold);
      const overtimeHours = Math.max(0, netHours - overtimeThreshold);
      
      // Update the hours
      await timesheet.update({
        total_regular_hours: regularHours.toFixed(2),
        total_overtime_hours: overtimeHours.toFixed(2)
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
    const { user_id, notes } = req.body;
    
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
    const activeTimesheet = await TimeSheet.findOne({
      where: {
        user_id,
        status: {
          [Op.in]: ['active', 'draft']
        },
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
      status: 'active',
      notes: notes || 'Clock in via API',
      total_regular_hours: 0,
      total_overtime_hours: 0
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
    
    // Find active timesheet for this user
    const activeTimesheet = await TimeSheet.findOne({
      where: {
        user_id,
        status: {
          [Op.in]: ['active', 'draft']
        },
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
    
    // Current time
    const now = new Date();
    
    // Calculate hours
    const clockInTime = new Date(activeTimesheet.clock_in);
    const clockOutTime = now;
    const diffHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
    
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
    
    // Default overtime threshold (8 hours)
    const overtimeThreshold = 8;
    
    // Calculate regular and overtime hours
    const regularHours = Math.min(netHours, overtimeThreshold);
    const overtimeHours = Math.max(0, netHours - overtimeThreshold);
    
    // Update the timesheet
    await activeTimesheet.update({
      clock_out: now,
      total_regular_hours: regularHours.toFixed(2),
      total_overtime_hours: overtimeHours.toFixed(2),
      status: 'completed',
      notes: notes ? (activeTimesheet.notes + '\n' + notes) : activeTimesheet.notes
    });
    
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
        status: {
          [Op.in]: ['active', 'draft']
        },
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
    
    // Find today's timesheet for the user
    const timesheet = await TimeSheet.findOne({
      where: {
        user_id: userId,
        date: today
      },
      include: [{
        model: TimeSheetBreak,
        order: [['start_time', 'DESC']]
      }],
      order: [[TimeSheetBreak, 'start_time', 'DESC']]
    });
    
    if (!timesheet) {
      return res.json({
        status: 'not_started',
        message: 'No timesheet found for today'
      });
    }
    
    // Determine current status
    let status;
    let statusMessage;
    
    if (!timesheet.clock_out) {
      // Check if user is on break
      const latestBreak = timesheet.TimeSheetBreaks && timesheet.TimeSheetBreaks.length > 0
        ? timesheet.TimeSheetBreaks[0]
        : null;
        
      if (latestBreak && !latestBreak.end_time) {
        status = 'on_break';
        statusMessage = 'User is currently on break';
      } else {
        status = 'clocked_in';
        statusMessage = 'User is currently clocked in';
      }
    } else {
      status = 'clocked_out';
      statusMessage = 'User has clocked out for the day';
    }
    
    res.json({
      status,
      message: statusMessage,
      timesheet
    });
  } catch (error) {
    console.error('Error getting timesheet status:', error);
    res.status(500).json({ message: 'Failed to get timesheet status', error: error.message });
  }
}; 