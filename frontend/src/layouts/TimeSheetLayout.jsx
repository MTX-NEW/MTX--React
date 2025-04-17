import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const TimeSheetLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Define tabs and their corresponding routes
  const tabs = [
    { name: "Employee time sheet", path: "/time-sheet/employee" },
    { name: "Employee History", path: "/time-sheet/employee-history", hidden: true }, // New tab, hidden by default
    { name: "Time Off Requests", path: "/time-sheet/time-off-request" },
    { name: "Manage Time Off", path: "/time-sheet/manage-time-off" },
    { name: "Payroll", path: "/time-sheet/payroll" },
  ];

  // Check if we're on the employee history path
  useEffect(() => {
    const pathParts = location.pathname.split('/');

    // Handle employee history specifically
    if (pathParts[2] === 'employee' && pathParts[4] === 'history' && pathParts[3]) {
      // Extract employee ID
      const employeeId = pathParts[3];
      setSelectedEmployeeId(employeeId);
      setActiveTab("Employee History");
      // Make sure to not redirect away
      return;
    }

    // Regular tab handling
    const currentTab = tabs.find((tab) => location.pathname === tab.path);

    if (currentTab) {
      setActiveTab(currentTab.name);
    } else if (location.pathname.startsWith('/time-sheet/employee/')) {
      // We're on a employee sub-route, keep employee tab active
      setActiveTab(tabs[0].name);
    } else {
      // Redirect to the first tab if no match
      setActiveTab(tabs[0].name);
      navigate(tabs[0].path, { replace: true });
    }
  }, [location.pathname, navigate]);

  // Handle tab switching
  const handleTabChange = (tabName) => {
    if (tabName === "Employee History" && selectedEmployeeId) {
      // Navigate to employee history with the selected ID
      navigate(`/time-sheet/employee/${selectedEmployeeId}/history`);
      return;
    }

    const selectedTab = tabs.find((tab) => tab.name === tabName);
    if (selectedTab) {
      // Only navigate if it's not the history tab or if we have an employee selected
      navigate(selectedTab.path);
    }
  };

  // Filter out hidden tabs
  const visibleTabs = tabs.filter(tab => {
    // Show the history tab only when it's active
    if (tab.name === "Employee History") {
      return activeTab === "Employee History";
    }
    return !tab.hidden;
  });

  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <Header
          tabs={visibleTabs.map((tab) => tab.name)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="sticky-top bg-white"
        />
        <div className="timesheet-container flex-grow-1 overflow-auto" style={{
          height: 'calc(100vh - 89px)' // Adjust to match header height
        }}>
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSheetLayout; 