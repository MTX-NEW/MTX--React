const express = require('express');
const router = express.Router();
const { TimeSheet, User, TimeSheetBreak } = require('../models');
const { Op } = require('sequelize');
const timeSheetController = require('../controllers/timeSheetController');

// Get all timesheets with optional filtering
router.get('/', async (req, res) => {
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
});

// Get timesheet by ID
router.get('/:id', async (req, res) => {
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
});

// Create new timesheet
router.post('/', async (req, res) => {
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
});

// Update timesheet
router.put('/:id', async (req, res) => {
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
});

// Delete timesheet
router.delete('/:id', async (req, res) => {
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
});

// Clock in route
router.post('/clock-in', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    // Validate required fields
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if there's already an active timesheet for today
    const today = new Date().toISOString().split('T')[0];
    const existingTimesheet = await TimeSheet.findOne({
      where: {
        user_id,
        date: today,
        clock_out: null
      }
    });
    
    if (existingTimesheet) {
      return res.status(400).json({ message: 'User is already clocked in' });
    }
    
    // Create new timesheet
    const timesheet = await TimeSheet.create({
      user_id,
      date: today,
      clock_in: new Date(),
      status: 'draft'
    });
    
    res.status(201).json(timesheet);
  } catch (error) {
    console.error('Error clocking in:', error);
    res.status(500).json({ message: 'Failed to clock in', error: error.message });
  }
});

// Clock out route - use the controller implementation
router.post('/clock-out', timeSheetController.clockOut);

// Get current timesheet status for user
router.get('/status/:userId', async (req, res) => {
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
      include: [
        {
          model: TimeSheetBreak,
          order: [['start_time', 'DESC']]
        }
      ],
      order: [
        [TimeSheetBreak, 'start_time', 'DESC']
      ]
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
});

module.exports = router; 