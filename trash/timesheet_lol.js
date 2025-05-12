const express = require('express');
const router = express.Router();
const timeSheetController = require('../controllers/timeSheetController');

// Get all timesheets with optional filtering
router.get('/', timeSheetController.getAllTimeSheets);

// Get active timesheet for user
router.get('/active/:userId', timeSheetController.getActiveTimesheet);

// Get timesheet status for user
router.get('/status/:userId', timeSheetController.getTimesheetStatus);

// Get timesheet by ID
router.get('/:id', timeSheetController.getTimeSheetById);

// Create new timesheet
router.post('/', timeSheetController.createTimeSheet);

// Clock in
router.post('/clock-in', timeSheetController.clockIn);

// Clock out
router.post('/clock-out', timeSheetController.clockOut);

// Update timesheet
router.put('/:id', timeSheetController.updateTimeSheet);

// Delete timesheet
router.delete('/:id', timeSheetController.deleteTimeSheet);

module.exports = router; 


const express = require('express');
const router = express.Router();
const timeSheetBreakController = require('../controllers/timeSheetBreakController');

// Get all breaks for a specific timesheet
router.get('/timesheet/:timesheetId', timeSheetBreakController.getBreaksByTimesheet);

// Get break by ID
router.get('/:id', timeSheetBreakController.getBreakById);

// Start a break
router.post('/', timeSheetBreakController.startBreak);

// End a break
router.put('/end/:id', timeSheetBreakController.endBreak);

// Update a break
router.put('/:id', timeSheetBreakController.updateBreak);

// Delete a break
router.delete('/:id', timeSheetBreakController.deleteBreak);

// Start a break by user ID (will find active timesheet)
router.post('/start-by-user/:userId', timeSheetBreakController.startBreakByUser);

// End active break by user ID
router.post('/end-by-user/:userId', timeSheetBreakController.endBreakByUser);

module.exports = router; 