const User = require("../models/User");
const UserType = require("../models/UserType");
const UserGroup = require("../models/UserGroup");
const { ValidationError, UniqueConstraintError } = require("sequelize");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] }
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
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'status', 'signature', 'hourly_rate', 'sex', 'spanishSpeaking', 'paymentStructure', 'hiringDate', 'lastEmploymentDate'],
      include: [
        { model: UserType, attributes: ['type_id', 'type_name', 'display_name'] },
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] }
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
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] }
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
        { model: UserGroup, attributes: ['group_id', 'full_name', 'common_name', 'short_name'] }
      ]
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get drivers
exports.getDrivers = async (req, res) => {
  console.log('GET /api/users/drivers endpoint called');
  try {
    const drivers = await User.findAll({
      include: [{
        model: UserType,
        where: { type_name: 'driver' },
        attributes: []
      }],
      attributes: ['id', 'first_name', 'last_name']
    });
    console.log(`Found ${drivers.length} drivers`);
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: error.message });
  }
}; 