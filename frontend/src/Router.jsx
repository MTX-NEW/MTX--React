import { Routes, Route, Navigate } from "react-router-dom";
import UsersLayout from "@/layouts/UsersLayout";
import VehiclesLayout from "@/layouts/VehiclesLayout";
import TripSystemLayout from "@/layouts/TripSystemLayout";
import TimeSheetLayout from "@/layouts/TimeSheetLayout";
import AllUsers from "@/pages/users/AllUsers";
import UserGroups from "@/pages/users/UserGroups";
import ClinicPOC from "@/pages/users/ClinicPOC";
import GroupPermissions from "@/pages/users/GroupPermissions";
import PagePermissions from "@/pages/users/PagePermissions";
import UserTypes from "@/pages/users/UserTypes";
import ManagePrograms from "@/pages/users/ManagePrograms";
import ComingSoonLayout from "@/layouts/ComingSoonLayout";
import Login from "@/pages/auth/Login";

import Vehicles from "@/pages/vehicles/Vehicles";
import PartSuppliers from "@/pages/vehicles/PartSuppliers";
import MaintenanceSchedule from "@/pages/vehicles/MaintenanceSchedule";

// Import Trip System pages
import TripRequests from "@/pages/tripsystem/TripRequests";
import TripManagement from "@/pages/tripsystem/TripManagement";
import Members from "@/pages/tripsystem/Members";

// Import Time Sheet pages
import EmployeeTimesheet from "@/pages/timesheet/EmployeeTimesheet";
import EmployeeTimesheetHistory from "@/pages/timesheet/EmployeeTimesheetHistory";
import Payroll from "@/pages/timesheet/Payroll";
import TimeOffRequest from "@/pages/timesheet/TimeOffRequest";
import ManageTimeOffRequests from "@/pages/timesheet/ManageTimeOffRequests";
import TimeOffRequestForm from "@/components/timesheet/TimeOffRequestForm";

// Import Driver Panel components
import DriverPanelLayout from "@/components/driverPanel/DriverPanelLayout";
import DriverTrips from "@/components/driverPanel/DriverTrips";
import TripDetail from "@/components/driverPanel/TripDetail";
import DriverSettings from "@/components/driverPanel/DriverSettings";
import DriverTimeOff from "@/components/driverPanel/DriverTimeOff";

const Router = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />

      {/* Redirect to Trip System */}
      <Route path="/" element={<Navigate to="/trip-system" replace />} />

      {/* Sidebar Routes */}
      <Route path="/trip-system" element={<TripSystemLayout />}>
        <Route index element={<Navigate to="trip-requests" replace />} />
        <Route path="trip-requests" element={<TripRequests />} />
        <Route path="trip-management" element={<TripManagement />} />
        <Route path="members" element={<Members />} />
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
      <Route path="/claims" element={<ComingSoonLayout />} />
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
    </Routes>
  );
};

export default Router;
