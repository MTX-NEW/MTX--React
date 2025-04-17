const PagePermission = require("../models/PagePermission");
const UserType = require("../models/UserType");
const { ValidationError } = require("sequelize");
const sequelize = require("../db");

// Get all page permissions
exports.getAllPagePermissions = async (req, res) => {
  try {
    const permissions = await PagePermission.findAll({
      attributes: ['page_name', 'type_id', 'can_view', 'can_edit']
    });
    res.json(permissions);
  } catch (error) {
    console.error("Error in getAllPagePermissions:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all pages that a specific user type can access
exports.getPagesByType = async (req, res) => {
  try {
    const typeId = req.params.typeId;
    const permissions = await PagePermission.findAll({
      where: { type_id: typeId },
      attributes: ['page_name', 'can_view', 'can_edit']
    });
    res.json(permissions);
  } catch (error) {
    console.error("Error in getPagesByType:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get permissions for a specific page
exports.getPermissionsByPage = async (req, res) => {
  try {
    const pageName = decodeURIComponent(req.params.pageName);
    const permissions = await PagePermission.findAll({
      where: { page_name: pageName },
      attributes: ['type_id', 'can_view', 'can_edit']
    });
    res.json(permissions);
  } catch (error) {
    console.error("Error in getPermissionsByPage:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update permissions for a page
exports.updatePagePermissions = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const pageName = decodeURIComponent(req.params.pageName);
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Permissions must be an array" });
    }

    // Delete existing permissions for this page
    await PagePermission.destroy({
      where: { page_name: pageName },
      transaction: t
    });

    // Create new permissions
    if (permissions.length > 0) {
      const permissionsToCreate = permissions.map(p => ({
        page_name: pageName,
        type_id: p.type_id,
        can_view: p.can_view === 1 ? 1 : 0,
        can_edit: p.can_edit === 1 ? 1 : 0
      }));

      await PagePermission.bulkCreate(permissionsToCreate, { transaction: t });
    }

    await t.commit();

    // Fetch and return updated permissions
    const updatedPermissions = await PagePermission.findAll({
      where: { page_name: pageName },
      attributes: ['type_id', 'can_view', 'can_edit']
    });
    
    res.json(updatedPermissions);
  } catch (error) {
    await t.rollback();
    console.error("Error in updatePagePermissions:", error);
    res.status(400).json({ message: error.message });
  }
};

// Validate if a user type has access to a page
exports.validatePageAccess = async (req, res) => {
  try {
    const pageName = decodeURIComponent(req.params.pageName);
    const typeId = req.params.typeId;
    
    const permission = await PagePermission.findOne({
      where: { 
        page_name: pageName, 
        type_id: typeId,
        can_view: 1
      }
    });
    
    res.json({ isValid: !!permission });
  } catch (error) {
    console.error("Error in validatePageAccess:", error);
    res.status(500).json({ message: error.message });
  }
};

// Remove a specific permission
exports.removePagePermission = async (req, res) => {
  try {
    const { pageName, typeId } = req.params;
    
    const permission = await PagePermission.findOne({
      where: { page_name: pageName, type_id: typeId }
    });
    
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }
    
    await permission.destroy();
    res.json({ message: "Permission removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 