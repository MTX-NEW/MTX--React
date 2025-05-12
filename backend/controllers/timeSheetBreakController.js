const { TimeSheetBreak, TimeSheet } = require('../models');

// Get all breaks for a specific timesheet
exports.getBreaksByTimesheet = async (req, res) => {
  try {
    const { timesheetId } = req.params;
    
    // If timesheetId is undefined, return an empty array instead of erroring
    if (!timesheetId || timesheetId === 'undefined') {
      return res.json([]);
    }
    
    const breaks = await TimeSheetBreak.findAll({
      where: { timesheet_id: timesheetId },
      order: [['start_time', 'DESC']]
    });
    
    res.json(breaks);
  } catch (error) {
    console.error('Error fetching breaks:', error);
    res.status(500).json({ message: 'Failed to fetch breaks', error: error.message });
  }
};

// Get break by ID
exports.getBreakById = async (req, res) => {
  try {
    const breakEntry = await TimeSheetBreak.findByPk(req.params.id);
    
    if (!breakEntry) {
      return res.status(404).json({ message: 'Break not found' });
    }
    
    res.json(breakEntry);
  } catch (error) {
    console.error('Error fetching break:', error);
    res.status(500).json({ message: 'Failed to fetch break', error: error.message });
  }
};

// Start a break
exports.startBreak = async (req, res) => {
  try {
    const { timesheet_id, type = 'break' } = req.body;
    
    // Validate required fields
    if (!timesheet_id) {
      return res.status(400).json({ message: 'Timesheet ID is required' });
    }
    
    // Check if timesheet exists
    const timesheet = await TimeSheet.findByPk(timesheet_id);
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    // Check if timesheet is active (not clocked out)
    if (timesheet.clock_out) {
      return res.status(400).json({ message: 'Cannot start break on closed timesheet' });
    }
    
    // Check if there's already an active break
    const activeBreak = await TimeSheetBreak.findOne({
      where: {
        timesheet_id,
        end_time: null
      }
    });
    
    if (activeBreak) {
      return res.status(400).json({ message: 'User already has an active break' });
    }
    
    // Create break
    const breakEntry = await TimeSheetBreak.create({
      timesheet_id,
      start_time: new Date(),
      type
    });
    
    res.status(201).json(breakEntry);
  } catch (error) {
    console.error('Error starting break:', error);
    res.status(500).json({ message: 'Failed to start break', error: error.message });
  }
};

// End a break
exports.endBreak = async (req, res) => {
  try {
    const breakEntry = await TimeSheetBreak.findByPk(req.params.id);
    
    if (!breakEntry) {
      return res.status(404).json({ message: 'Break not found' });
    }
    
    if (breakEntry.end_time) {
      return res.status(400).json({ message: 'Break has already ended' });
    }
    
    // Set end time
    const endTime = new Date();
    
    // Calculate duration in minutes
    const startTime = new Date(breakEntry.start_time);
    const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
    
    // Update break
    await breakEntry.update({
      end_time: endTime,
      duration_minutes: durationMinutes
    });
    
    res.json(breakEntry);
  } catch (error) {
    console.error('Error ending break:', error);
    res.status(500).json({ message: 'Failed to end break', error: error.message });
  }
};

// Update a break
exports.updateBreak = async (req, res) => {
  try {
    const { start_time, end_time, type } = req.body;
    
    const breakEntry = await TimeSheetBreak.findByPk(req.params.id);
    
    if (!breakEntry) {
      return res.status(404).json({ message: 'Break not found' });
    }
    
    // Update fields
    const updates = {};
    if (start_time) updates.start_time = start_time;
    if (end_time) updates.end_time = end_time;
    if (type) updates.type = type;
    
    // Recalculate duration if either start or end time changes
    if (start_time || end_time) {
      const startTimeValue = start_time ? new Date(start_time) : new Date(breakEntry.start_time);
      const endTimeValue = end_time ? new Date(end_time) : (breakEntry.end_time ? new Date(breakEntry.end_time) : null);
      
      if (endTimeValue) {
        updates.duration_minutes = Math.round((endTimeValue - startTimeValue) / (1000 * 60));
      }
    }
    
    await breakEntry.update(updates);
    
    res.json(breakEntry);
  } catch (error) {
    console.error('Error updating break:', error);
    res.status(500).json({ message: 'Failed to update break', error: error.message });
  }
};

// Delete a break
exports.deleteBreak = async (req, res) => {
  try {
    const breakEntry = await TimeSheetBreak.findByPk(req.params.id);
    
    if (!breakEntry) {
      return res.status(404).json({ message: 'Break not found' });
    }
    
    await breakEntry.destroy();
    
    res.json({ message: 'Break deleted successfully' });
  } catch (error) {
    console.error('Error deleting break:', error);
    res.status(500).json({ message: 'Failed to delete break', error: error.message });
  }
};

// Start a break by user ID (will find active timesheet)
exports.startBreakByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'break', duration_minutes } = req.body;
    
    // Find user's active timesheet
    const today = new Date().toISOString().split('T')[0];
    const timesheet = await TimeSheet.findOne({
      where: {
        user_id: userId,
        date: today,
        clock_out: null
      }
    });
    
    if (!timesheet) {
      return res.status(404).json({ message: 'No active timesheet found' });
    }
    
    // Check if there's already an active break
    const activeBreak = await TimeSheetBreak.findOne({
      where: {
        timesheet_id: timesheet.timesheet_id,
        end_time: null
      }
    });
    
    if (activeBreak) {
      return res.status(400).json({ message: 'User already has an active break' });
    }
    
    // Create break
    const breakEntry = await TimeSheetBreak.create({
      timesheet_id: timesheet.timesheet_id,
      start_time: new Date(),
      type,
      duration_minutes
    });
    
    res.status(201).json(breakEntry);
  } catch (error) {
    console.error('Error starting break by user:', error);
    res.status(500).json({ message: 'Failed to start break', error: error.message });
  }
};

// End active break by user ID
exports.endBreakByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user's active timesheet
    const today = new Date().toISOString().split('T')[0];
    const timesheet = await TimeSheet.findOne({
      where: {
        user_id: userId,
        date: today,
        clock_out: null
      }
    });
    
    if (!timesheet) {
      return res.status(404).json({ message: 'No active timesheet found' });
    }
    
    // Find active break
    const activeBreak = await TimeSheetBreak.findOne({
      where: {
        timesheet_id: timesheet.timesheet_id,
        end_time: null
      }
    });
    
    if (!activeBreak) {
      return res.status(404).json({ message: 'No active break found' });
    }
    
    // Set end time
    const endTime = new Date();
    
    // Calculate duration in minutes
    const startTime = new Date(activeBreak.start_time);
    const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
    
    // Update break
    await activeBreak.update({
      end_time: endTime,
      duration_minutes: durationMinutes
    });
    
    res.json(activeBreak);
  } catch (error) {
    console.error('Error ending break by user:', error);
    res.status(500).json({ message: 'Failed to end break', error: error.message });
  }
}; 