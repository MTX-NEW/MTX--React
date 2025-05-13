// Import models
const Program = require('./Program');
const Trip = require('./Trip');
const TripMember = require('./TripMember');
const TripLocation = require('./TripLocation');
const TripLeg = require('./TripLeg');
const User = require('./User');
const TripSpecialInstruction = require('./TripSpecialInstruction');
const TimeSheet = require('./TimeSheetEntry');
const TimeSheetBreak = require('./TimeSheetBreak');
const Page = require('./Page');
const PagePermission = require('./PagePermission');
const UserType = require('./UserType');
const MemberLocation = require('./MemberLocation');
const ProgramPlan = require('./ProgramPlan');
// Define associations

// Program associations
Program.hasMany(TripMember, { foreignKey: 'program_id' });
Program.hasMany(ProgramPlan, { foreignKey: 'program_id', as: 'ProgramPlans' });
ProgramPlan.belongsTo(Program, { foreignKey: 'program_id' });
TripMember.belongsTo(Program, { foreignKey: 'program_id' });

// Program Plan associations
ProgramPlan.hasMany(TripMember, { foreignKey: 'program_plan_id' });
TripMember.belongsTo(ProgramPlan, { foreignKey: 'program_plan_id', as: 'ProgramPlan' });

// Trip member default locations - renamed aliases to avoid conflicts
TripMember.belongsTo(TripLocation, { foreignKey: 'pickup_location', as: 'memberPickupLocation' });
TripMember.belongsTo(TripLocation, { foreignKey: 'dropoff_location', as: 'memberDropoffLocation' });

// User location association
User.belongsTo(TripLocation, { foreignKey: 'location_id', as: 'location' });
TripLocation.hasMany(User, { foreignKey: 'location_id' });

// Member multiple locations (many-to-many)
TripMember.belongsToMany(TripLocation, { 
  through: MemberLocation,
  foreignKey: 'member_id',
  otherKey: 'location_id',
  as: 'locations'
});
TripLocation.belongsToMany(TripMember, { 
  through: MemberLocation,
  foreignKey: 'location_id',
  otherKey: 'member_id',
  as: 'members'
});

// Direct access to the join table
TripMember.hasMany(MemberLocation, { foreignKey: 'member_id' });
MemberLocation.belongsTo(TripMember, { foreignKey: 'member_id' });
TripLocation.hasMany(MemberLocation, { foreignKey: 'location_id' });
MemberLocation.belongsTo(TripLocation, { foreignKey: 'location_id' });

// Trip associations
Trip.belongsTo(TripMember, { foreignKey: 'member_id' });
TripMember.hasMany(Trip, { foreignKey: 'member_id' });

Trip.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Trip, { foreignKey: 'created_by' });

// Trip and Trip Legs
Trip.hasMany(TripLeg, { foreignKey: 'trip_id', as: 'legs' });
TripLeg.belongsTo(Trip, { foreignKey: 'trip_id' });

// Trip Leg locations
TripLeg.belongsTo(TripLocation, { foreignKey: 'pickup_location', as: 'pickupLocation' });
TripLeg.belongsTo(TripLocation, { foreignKey: 'dropoff_location', as: 'dropoffLocation' });

// Trip Leg driver
TripLeg.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });
User.hasMany(TripLeg, { foreignKey: 'driver_id', as: 'driverTrips' });

// Trip special instructions
Trip.hasOne(TripSpecialInstruction, { foreignKey: 'trip_id', as: 'specialInstructions' });
TripSpecialInstruction.belongsTo(Trip, { foreignKey: 'trip_id' });

// TimeSheet and User associations
TimeSheet.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(TimeSheet, { foreignKey: 'user_id' });

// TimeSheet and TimeSheetBreak associations
TimeSheet.hasMany(TimeSheetBreak, { foreignKey: 'timesheet_id', onDelete: 'CASCADE' });
TimeSheetBreak.belongsTo(TimeSheet, { foreignKey: 'timesheet_id' });

// Pages and PagePermissions associations
Page.hasMany(PagePermission, { foreignKey: 'page_id' });
PagePermission.belongsTo(Page, { foreignKey: 'page_id' });

// UserType and PagePermissions associations
UserType.hasMany(PagePermission, { foreignKey: 'type_id' });
PagePermission.belongsTo(UserType, { foreignKey: 'type_id' });

// Export for use in other files
module.exports = {
  setupAssociations: () => {
    // Associations are configured above
    console.log('All model associations have been set up');
  }
}; 