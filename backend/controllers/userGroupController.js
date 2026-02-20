const UserGroup = require("../models/UserGroup");
const User = require("../models/User");
const Employee = require("../models/Employee");
const OrgProgram = require("../models/OrgProgram");
const GroupPermission = require("../models/GroupPermission");
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

// Delete a user group (organisation) - block if any references exist
exports.deleteUserGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await UserGroup.findByPk(groupId);
    if (!group) return res.status(404).json({ message: "Organisation not found" });

    // Check for references that would violate foreign key constraints
    const [userCount, employeeCount, programCount, permissionCount] = await Promise.all([
      User.count({ where: { user_group: groupId } }),
      Employee.count({ where: { user_group_id: groupId } }),
      OrgProgram.count({ where: { group_id: groupId } }),
      GroupPermission.count({ where: { group_id: groupId } }),
    ]);

    const blockers = [];
    if (userCount > 0) blockers.push(`${userCount} user(s)`);
    if (employeeCount > 0) blockers.push(`${employeeCount} employee(s)`);
    if (programCount > 0) blockers.push(`${programCount} program(s)`);
    if (permissionCount > 0) blockers.push("organisation permissions");

    if (blockers.length > 0) {
      return res.status(400).json({
        message: "Cannot delete organisation while it is in use.",
        detail: `Reassign or remove: ${blockers.join(", ")} first.`,
      });
    }

    await group.destroy();
    res.json({ message: "Organisation deleted successfully" });
  } catch (error) {
    console.error("Error deleting organisation:", error);
    res.status(500).json({ message: error.message });
  }
}; 