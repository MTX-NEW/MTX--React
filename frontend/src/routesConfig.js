// routesConfig.js
export const routes = {
  tripSystem: { 
    path: "/trip-system", 
    label: "Trip system", 
    icon: "faBus",
    tabs: [
      { name: "Trip Requests", path: "/trip-system/trip-requests" },
      { name: "Trip Management", path: "/trip-system/trip-management" },
      { name: "Members", path: "/trip-system/members" },
      // Additional tabs can be added here in the future
    ]
  },
  timeSheet: { path: "/time-sheet", label: "Time sheet", icon: "faClock" },
  manageUsers: {
    path: "/manage-users",
    label: "Manage users",
    icon: "faUsers",
    tabs: [
      { name: "All users", path: "/manage-users/all-users" },
      { name: "User groups", path: "/manage-users/user-groups" },
      { name: "Clinic POCs", path: "/manage-users/clinic-pocs" },
      { name: "Group permissions", path: "/manage-users/group-permissions" },
      { name: "Page permissions", path: "/manage-users/page-permissions" },
      { name: "User types", path: "/manage-users/user-types" },
      { name: "Manage programs", path: "/manage-users/manage-programs" },
    ],
  },
  manageEmails: { path: "/manage-emails", label: "Manage emails", icon: "faEnvelope" },
  hr: { path: "/hr", label: "HR", icon: "faUserTie" },
  forms: { path: "/forms", label: "Forms", icon: "faFileAlt" },
  claims: { path: "/claims", label: "Claims", icon: "faClipboard" },
 // routeSheet: { path: "/route-sheet", label: "Route sheet", icon: "faRoute" },
  vehicles: { 
    path: "/manage-vehicles",
    label: "Manage Vehicles",
    icon: "faCar",
    tabs: [
      { name: "Vehicles", path: "/manage-vehicles/vehicles" },
      { name: "Maintenance Schedule", path: "/manage-vehicles/maintenance-schedule" },
      { name: "Parts & Suppliers", path: "/manage-vehicles/parts-suppliers" }
    ]
  },
  importData: { path: "/import-data", label: "Import data", icon: "faUpload" },
};
