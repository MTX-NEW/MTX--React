const express = require('express');
const router = express.Router();
const { TimeSheet, User, TimeSheetBreak } = require('../models');
const { Op } = require('sequelize');
const timeSheetController = require('../controllers/timeSheetController');

// Get all timesheets with optional filtering
router.get('/', timeSheetController.getAllTimeSheets);

// Get timesheet by ID
router.get('/:id', timeSheetController.getTimeSheetById);

// Create new timesheet
router.post('/', timeSheetController.createTimeSheet);

// Update timesheet
router.put('/:id', timeSheetController.updateTimeSheet);

// Delete timesheet
router.delete('/:id', timeSheetController.deleteTimeSheet);

// Clock in route
router.post('/clock-in', timeSheetController.clockIn);

// Clock out route
router.post('/clock-out', timeSheetController.clockOut);

// Get active timesheet for user
router.get('/user/:userId/active', timeSheetController.getActiveTimesheet);

// Get current timesheet status for user
router.get('/user/:userId/status', timeSheetController.getTimesheetStatus);

// Recalculate overtime for a user in a date range
router.post('/recalculate-overtime', timeSheetController.recalculateOvertime);

// Get all incentives with optional filtering
router.get('/incentives', timeSheetController.getAllIncentives);

// Get incentive by ID
router.get('/incentives/:id', timeSheetController.getIncentiveById);

// Create new incentive
router.post('/incentives', timeSheetController.createIncentive);

// Update incentive
router.put('/incentives/:id', timeSheetController.updateIncentive);

// Delete incentive
router.delete('/incentives/:id', timeSheetController.deleteIncentive);

// Get incentives for a user in a specific period
router.get('/incentives/user/:userId/period/:startDate/:endDate', timeSheetController.getUserIncentivesForPeriod);

module.exports = router; 