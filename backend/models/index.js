const User = require('./User');
const UserGroup = require('./UserGroup');
const UserType = require('./UserType');
const GroupPermission = require('./GroupPermission');
const Vehicle = require('./Vehicle');
const { 
  Maintenance, 
  VehiclePart, 
  VehicleService, 
  MaintenancePart, 
  MaintenanceService 
} = require('./Maintenance');
const Trip = require('./Trip');
const TripMember = require('./TripMember');
const TripLocation = require('./TripLocation');
const TripSpecialInstruction = require('./TripSpecialInstruction');
const TimeSheet = require('./TimeSheetEntry');
const TimeSheetBreak = require('./TimeSheetBreak');
const TimeOffRequest = require('./TimeOffRequest');

// Define relationship between Trip and TripSpecialInstruction - REMOVED, now in associations.js
// Trip.hasOne(TripSpecialInstruction, { foreignKey: 'trip_id', as: 'specialInstructions' });
// TripSpecialInstruction.belongsTo(Trip, { foreignKey: 'trip_id' });

// Define relationship between TimeSheet and TimeSheetBreak - MOVED to associations.js
// TimeSheet.hasMany(TimeSheetBreak, { foreignKey: 'timesheet_id', onDelete: 'CASCADE' });
// TimeSheetBreak.belongsTo(TimeSheet, { foreignKey: 'timesheet_id' });

// Export all models
module.exports = {
  User,
  UserGroup,
  UserType,
  GroupPermission,
  Vehicle,
  Maintenance,
  VehiclePart,
  VehicleService,
  MaintenancePart,
  MaintenanceService,
  Trip,
  TripMember,
  TripLocation,
  TripSpecialInstruction,
  TimeSheet,
  TimeSheetBreak,
  TimeOffRequest,

}; 