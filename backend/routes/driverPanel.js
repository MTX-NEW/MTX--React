const express = require("express");
const router = express.Router();
const driverPanelController = require("../controllers/driverPanelController");

// Get trips assigned to the driver
router.get("/trips/:driverId", driverPanelController.getDriverTrips);

// Get a specific trip leg assigned to the driver
router.get("/trip-leg/:legId/:driverId", driverPanelController.getDriverTripLeg);

// Update trip leg status
router.put("/trip-leg/:legId/status", driverPanelController.updateTripLegStatus);

// Update trip leg odometer readings
router.put("/trip-leg/:legId/odometer", driverPanelController.updateTripLegOdometer);

// Get today's trips for driver
router.get("/today-trips/:driverId", driverPanelController.getTodayTrips);

// Get weekly schedule for driver
router.get("/weekly-schedule/:driverId", driverPanelController.getWeeklySchedule);

// Update driver signature
router.put("/driver/:driverId/signature", driverPanelController.updateDriverSignature);

// Update trip member signature
router.put("/trip-member/:memberId/signature", driverPanelController.updateTripMemberSignature);

module.exports = router; 