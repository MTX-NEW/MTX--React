const express = require("express");
const router = express.Router();
const GroupPermission = require("../models/GroupPermission");
const UserGroup = require("../models/UserGroup");
const UserType = require("../models/UserType");
const { ValidationError } = require("sequelize");

// Get all permissions for a specific group
router.get("/group/:groupId", async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await UserGroup.findByPk(groupId, {
      include: [{
        model: UserType,
        through: { attributes: [] } // Exclude junction table attributes
      }]
    });
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    res.json(group.UserTypes);
  } catch (error) {
    console.error("Error in /group/:groupId:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all groups that can have a specific user type
router.get("/type/:typeId", async (req, res) => {
  try {
    const typeId = req.params.typeId;
    const type = await UserType.findByPk(typeId, {
      include: [{
        model: UserGroup,
        through: { attributes: [] }
      }]
    });
    
    if (!type) {
      return res.status(404).json({ message: "Type not found" });
    }
    
    res.json(type.UserGroups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add or update permissions for a group
router.post("/group/:groupId", async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const { typeIds } = req.body;

    const group = await UserGroup.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Clear existing permissions and set new ones
    await group.setUserTypes(typeIds);
    
    // Fetch updated permissions
    const updatedGroup = await UserGroup.findByPk(groupId, {
      include: [{
        model: UserType,
        through: { attributes: [] }
      }]
    });
    
    res.json(updatedGroup.UserTypes);
  } catch (error) {
    console.error("Error in POST /group/:groupId:", error);
    res.status(400).json({ message: error.message });
  }
});

// Remove a specific permission
router.delete("/group/:groupId/type/:typeId", async (req, res) => {
  try {
    const { groupId, typeId } = req.params;
    
    const permission = await GroupPermission.findOne({
      where: { group_id: groupId, type_id: typeId }
    });
    
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }
    
    await permission.destroy();
    res.json({ message: "Permission removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate if a user type is allowed for a group
router.get("/validate/:groupId/:typeId", async (req, res) => {
  try {
    const { groupId, typeId } = req.params;
    
    const permission = await GroupPermission.findOne({
      where: { group_id: groupId, type_id: typeId }
    });
    
    res.json({ isValid: !!permission });
  } catch (error) {
    console.error("Error in /validate/:groupId/:typeId:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 