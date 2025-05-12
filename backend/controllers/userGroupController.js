const UserGroup = require("../models/UserGroup");
const { ValidationError, UniqueConstraintError } = require("sequelize");

// Get all user groups
exports.getAllUserGroups = async (req, res) => {
  try {
    const groups = await UserGroup.findAll();
    res.json(groups);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new user group
exports.createUserGroup = async (req, res) => {
  try {
    const newGroup = await UserGroup.create({
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
    });
    res.status(201).json(newGroup);
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
    res.status(400).json({ message: error.message });
  }
};

// Update a user group
exports.updateUserGroup = async (req, res) => {
  try {
    const group = await UserGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ message: "User group not found" });

    await group.update(req.body);
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a user group
exports.deleteUserGroup = async (req, res) => {
  try {
    const group = await UserGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ message: "User group not found" });

    await group.destroy();
    res.json({ message: "User group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 