import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRoutesProvider } from "./context/UserRoutesContext";

// Lazy load layouts
const UsersLayout = lazy(() => import("@/layouts/UsersLayout"));
const VehiclesLayout = lazy(() => import("@/layouts/VehiclesLayout"));
const TripSystemLayout = lazy(() => import("@/layouts/TripSystemLayout"));
const TimeSheetLayout = lazy(() => import("@/layouts/TimeSheetLayout"));
const ClaimsLayout = lazy(() => import("@/layouts/ClaimsLayout"));
const ComingSoonLayout = lazy(() => import("@/layouts/ComingSoonLayout"));
const DriverPanelLayout = lazy(() => import("@/components/driverPanel/DriverPanelLayout"));

// Lazy load auth pages
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));

// Lazy load users pages
const AllUsers = lazy(() => import("@/pages/users/AllUsers"));
const UserGroups = lazy(() => import("@/pages/users/UserGroups"));
const ClinicPOC = lazy(() => import("@/pages/users/ClinicPOC"));
const GroupPermissions = lazy(() => import("@/pages/users/GroupPermissions"));
const PagePermissions = lazy(() => import("@/pages/users/PagePermissions"));
const UserTypes = lazy(() => import("@/pages/users/UserTypes"));
const ManagePrograms = lazy(() => import("@/pages/users/ManagePrograms"));

// Lazy load vehicles pages
const Vehicles = lazy(() => import("@/pages/vehicles/Vehicles"));
const PartSuppliers = lazy(() => import("@/pages/vehicles/PartSuppliers"));
const MaintenanceSchedule = lazy(() => import("@/pages/vehicles/MaintenanceSchedule"));

// Lazy load trip system pages
const TripRequests = lazy(() => import("@/pages/tripsystem/TripRequests"));
const TripRequestsV2 = lazy(() => import("@/pages/tripsystem/v2/TripRequests"));
const TripRequestForm = lazy(() => import("@/pages/tripsystem/v2/TripRequestForm"));
const TripManagement = lazy(() => import("@/pages/tripsystem/TripManagement"));
const Members = lazy(() => import("@/pages/tripsystem/Members"));
const Locations = lazy(() => import("@/pages/tripsystem/Locations"));

// Lazy load claims pages
const Claims = lazy(() => import("@/pages/claims/Claims"));
const ClaimsManagement = lazy(() => import("@/pages/claims/ClaimsManagement"));
const BatchManagement = lazy(() => import("@/pages/claims/BatchManagement"));
const EDIFiles = lazy(() => import("@/pages/claims/EDIFiles"));

// Lazy load timesheet pages
const EmployeeTimesheet = lazy(() => import("@/pages/timesheet/EmployeeTimesheet"));
const EmployeeTimesheetHistory = lazy(() => import("@/pages/timesheet/EmployeeTimesheetHistory"));
const Payroll = lazy(() => import("@/pages/timesheet/Payroll"));
const TimeOffRequest = lazy(() => import("@/pages/timesheet/TimeOffRequest"));
const ManageTimeOffRequests = lazy(() => import("@/pages/timesheet/ManageTimeOffRequests"));
const TimeOffRequestForm = lazy(() => import("@/components/timesheet/TimeOffRequestForm"));

// Lazy load driver panel components
const DriverTrips = lazy(() => import("@/components/driverPanel/DriverTrips"));
const TripDetail = lazy(() => import("@/components/driverPanel/TripDetail"));
const DriverSettings = lazy(() => import("@/components/driverPanel/DriverSettings"));
const DriverTimeOff = lazy(() => import("@/components/driverPanel/DriverTimeOff"));

// Loading fallback component
//const LoadingFallback = () => <div className="page-loading">Loading...</div>;

// Component for protected routes that need user routes data
const ProtectedRoutesWithUserRoutes = () => (
  <UserRoutesProvider>
    <ProtectedRoute />
  </UserRoutesProvider>
);

const Router = () => {
  return (
    <Suspense>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes - All routes below require authentication and user routes data */}
        <Route element={<ProtectedRoutesWithUserRoutes />}>
          {/* Redirect to Trip System */}
          <Route path="/" element={<Navigate to="/trip-system" replace />} />

          {/* Sidebar Routes */}
          <Route path="/trip-system" element={<TripSystemLayout />}>
            <Route index element={<Navigate to="trip-requests" replace />} />
            <Route path="trip-requests" element={<TripRequests />} />
            <Route path="trip-requests-v2" element={<TripRequestsV2 />} />
            <Route path="trip-request-form" element={<TripRequestForm />} />
            <Route path="trip-management" element={<TripManagement />} />
            <Route path="members" element={<Members />} />
            <Route path="claims" element={<Claims />} />
            <Route path="locations" element={<Locations />} />
          </Route>
          
          {/* Time Sheet Routes */}
          <Route path="/time-sheet" element={<TimeSheetLayout />}>
            <Route index element={<Navigate to="employee" replace />} />
            <Route path="employee" element={<EmployeeTimesheet />} />
            <Route path="employee/:employeeId/history" element={<EmployeeTimesheetHistory />} />
            <Route path="employee/:employeeId/payroll" element={<Payroll />} />
            <Route path="employee-history" element={<Navigate to="/time-sheet/employee" replace />} />

            <Route path="time-off-request" element={<TimeOffRequest />} />
            <Route path="manage-time-off" element={<ManageTimeOffRequests />} />
            <Route path="payroll" element={<Payroll />} />
          </Route>
          
          <Route path="/manage-users" element={<UsersLayout />}>
            <Route path="all-users" element={<AllUsers />} />
            <Route path="user-groups" element={<UserGroups />} />
            <Route path="clinic-pocs" element={<ClinicPOC />} />
            <Route path="group-permissions" element={<GroupPermissions />} />
            <Route path="page-permissions" element={<PagePermissions />} />
            <Route path="user-types" element={<UserTypes />} />
            <Route path="manage-programs" element={<ManagePrograms />} />
          </Route>
          <Route path="/manage-emails" element={<ComingSoonLayout />} />
          <Route path="/hr" element={<ComingSoonLayout />} />
          <Route path="/forms" element={<ComingSoonLayout />} />
          
          {/* Claims Routes */}
          <Route path="/claims" element={<ClaimsLayout />}>
            <Route index element={<Navigate to="management" replace />} />
            <Route path="management" element={<ClaimsManagement />} />

            <Route path="batches" element={<BatchManagement />} />
            <Route path="edi" element={<EDIFiles />} />
          </Route>
          
          <Route path="/route-sheet" element={<ComingSoonLayout />} />
          

          {/* Manage Vehicles Routes */}
          <Route path="/manage-vehicles" element={<VehiclesLayout />}>
            <Route index element={<Navigate to="vehicles" replace />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="maintenance-schedule" element={<MaintenanceSchedule />} />
            <Route path="parts-suppliers" element={<PartSuppliers />} />
          </Route>

          {/* Driver Panel Routes - Trips view as home */}
          <Route path="/driver-panel" element={<DriverPanelLayout />}>
            <Route index element={<DriverTrips />} />
            <Route path="trips" element={<DriverTrips />} />
            <Route path="trip-detail/:legId" element={<TripDetail />} />
            <Route path="time-off" element={<DriverTimeOff />} />
            <Route path="settings" element={<DriverSettings />} />
          </Route>

          <Route path="/import-data" element={<ComingSoonLayout />} />
        </Route>

        {/* Catch-all route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default Router;
