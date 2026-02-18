const express = require("express");
const cors = require("cors");
const path = require('path');
const cookieParser = require("cookie-parser");

// Import routes
const userRoutes = require("./routes/users");
const userGroupRoutes = require("./routes/userGroups");
const userTypeRoutes = require("./routes/userTypes");
const groupPermissionRoutes = require("./routes/groupPermissions");
const pagePermissionRoutes = require("./routes/pagePermissions");
const programRoutes = require("./routes/programs");
const vehicleRoutes = require("./routes/vehicles");
const maintenanceRoutes = require("./routes/maintenance");
const vehiclePartsRoutes = require("./routes/vehicleParts");
const vehicleServicesRoutes = require("./routes/vehicleServices");
const partsSuppliersRoutes = require("./routes/partsSuppliers");
const documentRoutes = require("./routes/documents");
const tripRoutes = require("./routes/trips");
const tripLegRoutes = require("./routes/tripLegs");
const tripMemberRoutes = require("./routes/tripMembers");
const tripLocationRoutes = require("./routes/tripLocations");
const tripSpecialInstructionsRoutes = require("./routes/tripSpecialInstructions");
const timeSheetRoutes = require("./routes/time_sheets");
const timeSheetBreakRoutes = require("./routes/timesheet_breaks");
const timeOffRequestRoutes = require("./routes/time_off_requests");
const driverRoutes = require("./routes/drivers");
const driverPanelRoutes = require("./routes/driverPanel");
const authRoutes = require("./routes/auth");
const memberLocationRoutes = require("./routes/memberLocation");
const claimRoutes = require('./routes/claims');
const ediSettingsRoutes = require('./routes/ediSettings');
const batchRoutes = require('./routes/batchRoutes');
const orgProgramRoutes = require('./routes/orgPrograms');
const providerRoutes = require('./routes/providers');

require('./models/associations');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));  // Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(cookieParser());

// Test route to verify server is running
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user-groups", userGroupRoutes);
app.use("/api/user-types", userTypeRoutes);
app.use("/api/group-permissions", groupPermissionRoutes);
app.use("/api/page-permissions", pagePermissionRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/vehicle-parts", vehiclePartsRoutes);
app.use("/api/vehicle-services", vehicleServicesRoutes);
app.use("/api/parts-suppliers", partsSuppliersRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/trip-legs", tripLegRoutes);
app.use("/api/trip-members", tripMemberRoutes);
app.use("/api/trip-locations", tripLocationRoutes);
app.use("/api/trip-special-instructions", tripSpecialInstructionsRoutes);
app.use("/api/time-sheets", timeSheetRoutes);
app.use("/api/time-sheet-breaks", timeSheetBreakRoutes);
app.use("/api/time-off-requests", timeOffRequestRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/driver-panel", driverPanelRoutes);
app.use("/api/member-locations", memberLocationRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/edi-settings", ediSettingsRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/org-programs", orgProgramRoutes);
app.use("/api/providers", providerRoutes);
// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
  
});
// log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ 
    message: "Something went wrong!", 
    error: err.message 
  });
});

module.exports = app; 