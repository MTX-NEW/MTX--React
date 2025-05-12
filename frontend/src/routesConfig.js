// routesConfig.js
export const routes = {
  tripSystem: { 
    id: "trip-system",
    path: "/trip-system", 
    label: "Trip system", 
    icon: "faBus",
    tabs: [
      { id: "trip-requests", name: "Trip Requests", path: "/trip-system/trip-requests" },
      { id: "trip-requests-v2", name: "Trip Requests v2", path: "/trip-system/trip-requests-v2" },
      { id: "trip-management", name: "Route Sheet",      path: "/trip-system/trip-management" },
      { id: "members", name: "Members",           path: "/trip-system/members" },
      { id: "locations", name: "Locations",       path: "/trip-system/locations" },
      // Additional tabs can be added here in the future
    ]
  },
  timeSheet: {
    id: "time-sheet",
    path: "/time-sheet",
    label: "Time sheet",
    icon: "faClock",
    tabs: [
      { id: "employee", name: "Employee time sheet", path: "/time-sheet/employee" },
      { id: "employee-history", name: "Employee History",     path: "/time-sheet/employee-history", hidden: true },
      { id: "time-off-request", name: "Time Off Requests",    path: "/time-sheet/time-off-request" },
      { id: "manage-time-off", name: "Manage Time Off",      path: "/time-sheet/manage-time-off" },
      { id: "payroll", name: "Payroll",              path: "/time-sheet/payroll" }
    ]
  },
  manageUsers: {
    id: "manage-users",
    path: "/manage-users",
    label: "Manage users",
    icon: "faUsers",
    tabs: [
      { id: "all-users", name: "All users", path: "/manage-users/all-users" },
      { id: "user-groups", name: "User groups", path: "/manage-users/user-groups" },
      { id: "clinic-pocs", name: "Clinic POCs", path: "/manage-users/clinic-pocs" },
      { id: "group-permissions", name: "Group permissions", path: "/manage-users/group-permissions" },
      { id: "page-permissions", name: "Page permissions", path: "/manage-users/page-permissions" },
      { id: "user-types", name: "User types", path: "/manage-users/user-types" },
      { id: "manage-programs", name: "Manage programs", path: "/manage-users/manage-programs" },
    ],
  },
  manageEmails: {
    id: "manage-emails",
    path: "/manage-emails",
    label: "Manage emails",
    icon: "faEnvelope"
  },
  hr: {
    id: "hr",
    path: "/hr",
    label: "HR",
    icon: "faUserTie"
  },
  forms: {
    id: "forms",
    path: "/forms",
    label: "Forms",
    icon: "faFileAlt"
  },
  claims: {
    id: "claims",
    path: "/claims",
    label: "Claims",
    icon: "faClipboard"
  },
 // routeSheet: { path: "/route-sheet", label: "Route sheet", icon: "faRoute" },
  vehicles: { 
    id: "manage-vehicles",
    path: "/manage-vehicles",
    label: "Manage Vehicles",
    icon: "faCar",
    tabs: [
      { id: "vehicles", name: "Vehicles", path: "/manage-vehicles/vehicles" },
      { id: "maintenance-schedule", name: "Maintenance Schedule", path: "/manage-vehicles/maintenance-schedule" },
      { id: "parts-suppliers", name: "Parts & Suppliers", path: "/manage-vehicles/parts-suppliers" }
    ]
  },
  importData: {
    id: "import-data",
    path: "/import-data",
    label: "Import data",
    icon: "faUpload"
  }
};
