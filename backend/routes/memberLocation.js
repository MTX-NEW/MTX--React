const express = require('express');
const router = express.Router();
const memberLocationController = require('../controllers/memberLocationController');
//const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
//router.use(authenticateToken);

// Get all locations for a member
router.get('/member/:memberId/locations', memberLocationController.getMemberLocations);

// Add a location to a member
router.post('/member/:memberId/location', memberLocationController.addLocationToMember);

// Update a member location
router.put('/member-location/:memberLocationId', memberLocationController.updateMemberLocation);

// Remove a location from a member
router.delete('/member-location/:memberLocationId', memberLocationController.removeLocationFromMember);

module.exports = router; 