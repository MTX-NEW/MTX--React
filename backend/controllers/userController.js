const User = require("../models/User");
const UserType = require("../models/UserType");
const UserGroup = require("../models/UserGroup");
const TripLocation = require("../models/TripLocation");
const Trip = require("../models/Trip");
const TripLeg = require("../models/TripLeg");
const TimeSheet = require("../models/TimeSheet");
const TimeOffRequest = require("../models/TimeOffRequest");
const Incentive = require("../models/Incentive");
const Claim = require("../models/Claim");
const Employee = require("../models/Employee");
const Batch = require("../models/Batch");
const { ValidationError, UniqueConstraintError, Op } = require("sequelize");

// Common location attributes to use across all query includes
const locationAttributes = ['location_id', 'street_address', 'building', 'building_type', 'city', 'state', 'zip', 'latitude', 'longitude'];

// Get all users (exclude archived)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { archived_at: null },
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] },
        { model: TripLocation, as: 'location', attributes: locationAttributes }
      ]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'status', 'signature', 'hourly_rate', 'sex', 'spanishSpeaking', 'paymentStructure', 'hiringDate', 'lastEmploymentDate', 'location_id'],
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] },
        { model: TripLocation, as: 'location', attributes: locationAttributes }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create({
      ...req.body,
      emp_code: req.body.emp_code || `EMP${Math.floor(Math.random() * 10000)}`,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Fetch the created user with its relationships
    const userWithRelations = await User.findByPk(newUser.id, {
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] },
        { model: TripLocation, as: 'location', attributes: locationAttributes }
      ]
    });

    res.status(201).json(userWithRelations);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: `${err.path} already exists`,
        })),
      });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    console.error("Error creating user:", error.message);
    res.status(500).json({ message: "An error occurred while creating the user" });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update(req.body);
    
    // Fetch the updated user with its relationships
    const updatedUser = await User.findByPk(req.params.id, {
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] },
        { model: TripLocation, as: 'location', attributes: locationAttributes }
      ]
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get archived users
exports.getArchivedUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { archived_at: { [Op.ne]: null } },
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] },
        { model: TripLocation, as: 'location', attributes: locationAttributes }
      ],
      order: [['archived_at', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Archive a user (soft delete)
exports.archiveUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.archived_at) return res.status(400).json({ message: "User is already archived" });

    await user.update({ archived_at: new Date(), updated_at: new Date() });
    const updated = await User.findByPk(user.id, {
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] },
        { model: TripLocation, as: 'location', attributes: locationAttributes }
      ]
    });
    res.json({ message: "User archived successfully", user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Restore an archived user
exports.restoreUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.archived_at) return res.status(400).json({ message: "User is not archived" });

    await user.update({ archived_at: null, updated_at: new Date() });
    const updated = await User.findByPk(user.id, {
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] },
        { model: TripLocation, as: 'location', attributes: locationAttributes }
      ]
    });
    res.json({ message: "User restored successfully", user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Build list of connections for permanent delete (for error message)
async function getUserConnectionSummary(userId) {
  const [tripsCreated, tripLegsAsDriver, timeSheets, timeOffRequests, incentives, claimsCreated, batchesCreated, employee] = await Promise.all([
    Trip.count({ where: { created_by: userId } }),
    TripLeg.count({ where: { driver_id: userId } }),
    TimeSheet.count({ where: { user_id: userId } }),
    TimeOffRequest.count({ where: { user_id: userId } }),
    Incentive.count({ where: { user_id: userId } }),
    Claim.count({ where: { created_by: userId } }),
    Batch.count({ where: { created_by: userId } }),
    Employee.findOne({ where: { user_id: userId }, attributes: ['id'] })
  ]);
  const parts = [];
  if (tripsCreated > 0) parts.push(`${tripsCreated} trip(s) created`);
  if (tripLegsAsDriver > 0) parts.push(`${tripLegsAsDriver} trip leg(s) as driver`);
  if (timeSheets > 0) parts.push(`${timeSheets} time sheet(s)`);
  if (timeOffRequests > 0) parts.push(`${timeOffRequests} time off request(s)`);
  if (incentives > 0) parts.push(`${incentives} incentive(s)`);
  if (claimsCreated > 0) parts.push(`${claimsCreated} claim(s) created`);
  if (batchesCreated > 0) parts.push(`${batchesCreated} batch(es) created`);
  if (employee) parts.push('HR employee record');
  return parts;
}

// Permanently delete a user (only from archived; show error if linked data exists)
exports.deleteUserPermanently = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.archived_at) {
      return res.status(400).json({
        message: "Only archived users can be permanently deleted. Archive the user first.",
        code: "NOT_ARCHIVED"
      });
    }

    const connections = await getUserConnectionSummary(user.id);
    if (connections.length > 0) {
      return res.status(400).json({
        message: "Cannot permanently delete this user because they are linked to other data: " + connections.join(', ') + ". Unlink or reassign these records first, or keep the user archived.",
        code: "HAS_CONNECTIONS",
        connections
      });
    }

    await user.destroy();
    res.json({ message: "User permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get drivers (non-archived only)
exports.getDrivers = async (req, res) => {
  console.log('GET /api/users/drivers endpoint called');
  try {
    const drivers = await User.findAll({
      where: { archived_at: null },
      include: [
        {
          model: UserType,
          where: { type_name: 'driver' },
          attributes: []
        },
        {
          model: TripLocation,
          as: 'location',
          attributes: locationAttributes,
          required: false
        }
      ],
      attributes: ['id', 'first_name', 'last_name', 'location_id']
    });
    console.log(`Found ${drivers.length} drivers`);
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: error.message });
  }
};

// Approve a pending user
exports.approveUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.status !== 'Pending') {
      return res.status(400).json({ message: "User is not in pending status" });
    }
    
    // Update user with additional data and change status to Active
    const updatedData = {
      ...req.body,
      status: 'Active'
    };
    
    await user.update(updatedData);
    
    // Fetch the updated user with relationships
    const approvedUser = await User.findByPk(userId, {
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] },
        { model: TripLocation, as: 'location', attributes: locationAttributes }
      ]
    });
    res.json({
      message: "User approved successfully",
      user: approvedUser
    });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get pending users
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.findAll({
      where: { status: 'Pending' },
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] },
        { model: TripLocation, as: 'location', attributes: locationAttributes }
      ]
    });
    res.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: error.message });
  }
}; 