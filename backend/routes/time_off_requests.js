const express = require('express');
const router = express.Router();
const timeOffRequestController = require('../controllers/timeOffRequestController');

// Get all time off requests with optional filtering
router.get('/', timeOffRequestController.getAllTimeOffRequests);

// Get time off request by ID
router.get('/:id', timeOffRequestController.getTimeOffRequestById);

// Create new time off request
router.post('/', timeOffRequestController.createTimeOffRequest);

// Update time off request
router.put('/:id', timeOffRequestController.updateTimeOffRequest);

// Delete time off request
router.delete('/:id', timeOffRequestController.deleteTimeOffRequest);

// Approve or deny time off request
router.put('/:id/respond', timeOffRequestController.respondToTimeOffRequest);

module.exports = router; 