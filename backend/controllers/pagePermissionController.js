const PagePermission = require("../models/PagePermission");
const UserType = require("../models/UserType");
const Page = require("../models/Page");
const { ValidationError, Op } = require("sequelize");
const sequelize = require("../db");

// Get all pages with their permissions
exports.getAllPages = async (req, res) => {
  try {
    // Get all pages
    const pages = await Page.findAll({
      attributes: ['page_id', 'page_name', 'page_path', 'page_section'],
      order: [['page_section', 'ASC'], ['page_name', 'ASC']]
    });
    
    // Format for frontend
    const formattedPages = pages.map(page => ({
      page_id: page.page_id,
      path: page.page_name,
      section: page.page_section,
      name: page.page_name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      displayPath: page.page_path
    }));
    
    res.json(formattedPages);
  } catch (error) {
    console.error("Error in getAllPages:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all page permissions
exports.getAllPagePermissions = async (req, res) => {
  try {
    const permissions = await PagePermission.findAll({
      include: [
        { model: Page, attributes: ['page_id', 'page_name', 'page_path', 'page_section'] },
        { model: UserType, attributes: ['type_id', 'display_name', 'status'] }
      ],
      attributes: ['permission_id', 'page_id', 'type_id', 'can_view', 'can_edit']
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
      where: { 
        type_id: typeId,
        [Op.or]: [
          { can_view: true },
          { can_edit: true }
        ]
      },
      include: [
        { model: Page, attributes: ['page_id', 'page_name', 'page_path', 'page_section'] }
      ],
      attributes: ['permission_id', 'can_view', 'can_edit']
    });
    res.json(permissions);
  } catch (error) {
    console.error("Error in getPagesByType:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get permissions for a specific page by page_name
exports.getPermissionsByPage = async (req, res) => {
  try {
    const pageNameId = req.params.pageId;
    
    // Find the page by name
    const page = await Page.findOne({
      where: { page_name: pageNameId }
    });
    
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    
    // Get all permissions for this page with user types
    const permissions = await PagePermission.findAll({
      where: { page_id: page.page_id },
      include: [
        { model: UserType, attributes: ['type_id', 'display_name', 'status'] }
      ],
      attributes: ['permission_id', 'page_id', 'type_id', 'can_view', 'can_edit']
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
    const pageId = req.params.pageId;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Permissions must be an array" });
    }
    
    // Find the page - accept either numeric ID or path
    const pageIdNum = parseInt(pageId, 10);
    const pageQuery = !isNaN(pageIdNum) 
      ? { page_id: pageIdNum }
      : { page_path: `/${pageId}` };
      
    const page = await Page.findOne({ 
      where: pageQuery,
      transaction: t 
    });
    
    if (!page) {
      await t.rollback();
      return res.status(404).json({ message: "Page not found" });
    }

    // Separate into new and existing permissions
    const existingPermissions = permissions.filter(p => p.permission_id);
    const newPermissions = permissions.filter(p => !p.permission_id && p.type_id);
    
    // Handle existing permissions with bulk updates
    if (existingPermissions.length > 0) {
      // Process each update in parallel
      await Promise.all(existingPermissions.map(perm => 
        PagePermission.update(
          { 
            can_view: !!perm.can_view, 
            can_edit: !!perm.can_edit 
          },
          { 
            where: { permission_id: perm.permission_id },
            transaction: t
          }
        )
      ));
    }
    
    // Handle new permissions with bulk create or update
    if (newPermissions.length > 0) {
      // Get existing permissions for this page to check for updates vs inserts
      const existingTypeIds = await PagePermission.findAll({
        where: {
          page_id: page.page_id,
          type_id: { [Op.in]: newPermissions.map(p => p.type_id) }
        },
        attributes: ['permission_id', 'type_id'],
        transaction: t
      });
      
      const existingTypeIdSet = new Set(existingTypeIds.map(p => p.type_id));
      
      // Split into updates and inserts
      const permUpdates = newPermissions.filter(p => existingTypeIdSet.has(p.type_id));
      const permInserts = newPermissions.filter(p => !existingTypeIdSet.has(p.type_id));
      
      // Handle updates
      if (permUpdates.length > 0) {
        await Promise.all(permUpdates.map(perm => 
          PagePermission.update(
            { 
              can_view: !!perm.can_view, 
              can_edit: !!perm.can_edit 
            },
            { 
              where: { 
                page_id: page.page_id,
                type_id: perm.type_id 
              },
              transaction: t
            }
          )
        ));
      }
      
      // Handle new inserts with bulk create
      if (permInserts.length > 0) {
        await PagePermission.bulkCreate(
          permInserts.map(perm => ({
            page_id: page.page_id,
            type_id: perm.type_id,
            can_view: !!perm.can_view,
            can_edit: !!perm.can_edit
          })),
          { transaction: t }
        );
      }
    }

    await t.commit();
    
    // Get the updated permissions
    const updatedPermissions = await PagePermission.findAll({
      where: { page_id: page.page_id },
      include: [
        { model: UserType, attributes: ['type_id', 'display_name', 'status'] }
      ],
      attributes: ['permission_id', 'page_id', 'type_id', 'can_view', 'can_edit']
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
    const pageNameId = req.params.pageId;
    const typeId = req.params.typeId;
    
    // Find the page by name
    const page = await Page.findOne({
      where: { page_name: pageNameId }
    });
    
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    
    const permission = await PagePermission.findOne({
      where: { 
        page_id: page.page_id, 
        type_id: typeId,
        can_view: true
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
    const permission_id = req.params.permissionId;
    
    const permission = await PagePermission.findByPk(permission_id);
    
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }
    
    await permission.destroy();
    res.json({ message: "Permission removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a function to provide route configuration
const getFullRouteConfig = () => {
  // This provides a structured route configuration
  return {
    tripSystem: { 
      id: "trip-system", 
      path: "/trip-system", 
      label: "Trip system",
      tabs: [
        { id: "trip-requests", name: "Trip Requests", path: "/trip-system/trip-requests" },
        { id: "trip-management", name: "Trip Management", path: "/trip-system/trip-management" },
        { id: "members", name: "Members", path: "/trip-system/members" },
        { id: "locations", name: "Locations", path: "/trip-system/locations" }
      ]
    },
    timeSheet: { 
      id: "time-sheet", 
      path: "/time-sheet", 
      label: "Time sheet",
      tabs: [
        { id: "employee", name: "Employee Timesheet", path: "/time-sheet/employee" },
        { id: "employee-history", name: "Employee History", path: "/time-sheet/employee-history" },
        { id: "time-off-request", name: "Time Off Request", path: "/time-sheet/time-off-request" },
        { id: "manage-time-off", name: "Manage Time Off", path: "/time-sheet/manage-time-off" },
        { id: "payroll", name: "Payroll", path: "/time-sheet/payroll" }
      ]
    },
    manageUsers: {
      id: "manage-users",
      path: "/manage-users",
      label: "Manage users",
      tabs: [
        { id: "all-users", name: "All users", path: "/manage-users/all-users", group: "Users" },
        { id: "user-types", name: "User types", path: "/manage-users/user-types", group: "Users" },
        { id: "clinic-pocs", name: "Clinic POCs", path: "/manage-users/clinic-pocs", group: "Users" },
        { id: "user-groups", name: "Organisations", path: "/manage-users/user-groups", group: "Organisation Setup" },
        { id: "org-programs", name: "Programs", path: "/manage-users/org-programs", group: "Organisation Setup" },
        { id: "providers", name: "Providers", path: "/manage-users/providers", group: "Organisation Setup" },
        { id: "group-permissions", name: "Organisation permissions", path: "/manage-users/group-permissions", group: "Permissions" },
        { id: "page-permissions", name: "Page permissions", path: "/manage-users/page-permissions", group: "Permissions" },
        { id: "manage-programs", name: "Manage programs", path: "/manage-users/manage-programs", group: "Config" }
      ]
    },
    manageEmails: { id: "manage-emails", path: "/manage-emails", label: "Manage emails" },
    hr: { id: "hr", path: "/hr", label: "HR" },
    forms: { id: "forms", path: "/forms", label: "Forms" },
    claims: { id: "claims", path: "/claims", label: "Claims" },
    vehicles: { 
      id: "manage-vehicles",
      path: "/manage-vehicles",
      label: "Manage Vehicles",
      tabs: [
        { id: "vehicles", name: "Vehicles", path: "/manage-vehicles/vehicles" },
        { id: "maintenance-schedule", name: "Maintenance Schedule", path: "/manage-vehicles/maintenance-schedule" },
        { id: "parts-suppliers", name: "Parts & Suppliers", path: "/manage-vehicles/parts-suppliers" }
      ]
    },
    importData: { id: "import-data", path: "/import-data", label: "Import data" },
    driverPanel: {
      id: "driver-panel",
      path: "/driver-panel",
      label: "Driver Panel",
      tabs: [
        { id: "trips", name: "Trips", path: "/driver-panel/trips" },
        { id: "time-off", name: "Time Off", path: "/driver-panel/time-off" },
        { id: "settings", name: "Settings", path: "/driver-panel/settings" }
      ]
    }
  };
};

// Endpoint to get route configuration
exports.getRouteConfig = async (req, res) => {
  try {
    const routeConfig = getFullRouteConfig();
    res.json(routeConfig);
  } catch (error) {
    console.error("Error in getRouteConfig:", error);
    res.status(500).json({ message: error.message });
  }
};

// Sync pages from route config to database
exports.syncPages = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const routeConfig = getFullRouteConfig();
    const results = {
      created: 0,
      existing: 0,
      pages: []
    };
    
    // Get all existing pages from the database
    const existingPages = await Page.findAll({
      attributes: ['page_name'],
      transaction: t
    });
    
    const existingPageNames = new Set(existingPages.map(p => p.page_name));
    
    // Process each route section
    for (const key in routeConfig) {
      const section = routeConfig[key];
      
      // Add main section if it doesn't exist
      if (!existingPageNames.has(section.id)) {
        await Page.create({
          page_name: section.id,
          page_path: section.path,
          page_section: section.label
        }, { transaction: t });
        
        results.created++;
        results.pages.push(section.id);
      } else {
        results.existing++;
      }
      
      // Add tabs if they exist
      if (section.tabs && section.tabs.length > 0) {
        for (const tab of section.tabs) {
          if (!existingPageNames.has(tab.id)) {
            await Page.create({
              page_name: tab.id,
              page_path: tab.path,
              page_section: section.label
            }, { transaction: t });
            
            results.created++;
            results.pages.push(tab.id);
          } else {
            results.existing++;
          }
        }
      }
    }
    
    // Create default permissions for admin user (type_id 1) for all newly created pages
    if (results.created > 0) {
      // Get all pages that were just created
      const newPages = await Page.findAll({
        where: {
          page_name: {
            [Op.in]: results.pages
          }
        },
        transaction: t
      });
      
      // For each new page, add admin permission
      for (const page of newPages) {
        await PagePermission.create({
          page_id: page.page_id,
          type_id: 1, // Admin user type
          can_view: true,
          can_edit: true
        }, { transaction: t });
      }
    }
    
    await t.commit();
    res.json(results);
  } catch (error) {
    await t.rollback();
    console.error("Error in syncPages:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get navigation routes/pages for a specific user type
exports.getUserRoutes = async (req, res) => {
  try {
    const typeId = req.params.typeId;
    
    // If type is admin (typeId = 1), return all pages
    if (typeId === '1') {
      const allPages = await Page.findAll({
        attributes: ['page_id', 'page_name', 'page_path', 'page_section'],
        order: [['page_id', 'ASC']]
      });
      
      // Group pages by section
      const grouped = {};
      allPages.forEach(page => {
        const section = page.page_section;
        if (!grouped[section]) grouped[section] = [];
        grouped[section].push({
          page_id: page.page_id,
          page_name: page.page_name,
          page_path: page.page_path,
          can_edit: true,
          can_view: true
        });
      });
      
      // Format result as array of { section, pages }
      const result = Object.entries(grouped).map(([section, pages]) => ({ section, pages }));
      return res.json(result);
    }
    
    // For non-admin users, get only their permitted pages
    const permissions = await PagePermission.findAll({
      where: { type_id: typeId, can_view: true },
      include: [
        { model: Page, attributes: ['page_id', 'page_name', 'page_path', 'page_section'] }
      ],
      attributes: ['permission_id', 'page_id', 'type_id', 'can_view', 'can_edit'],
      order: [[ Page, 'page_id', 'ASC' ]]
    });

    // Group pages by section
    const grouped = {};
    permissions.forEach(perm => {
      const page = perm.Page;
      if (!page) return;
      const section = page.page_section;
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push({
        page_id: page.page_id,
        page_name: page.page_name,
        page_path: page.page_path,
        can_edit: perm.can_edit,
        can_view: perm.can_view
      });
    });

    // Format result as array of { section, pages }
    const result = Object.entries(grouped).map(([section, pages]) => ({ section, pages }));
    res.json(result);
  } catch (error) {
    console.error('Error in getUserRoutes:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper functions for backward compatibility
function getPageSection(pageId) {
  const parts = pageId.split('/').filter(Boolean);
  return parts.length > 0 
    ? parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Other';
}

function getPageName(pageId) {
  const parts = pageId.split('/').filter(Boolean);
  return parts.length > 1
    ? parts[parts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
} 