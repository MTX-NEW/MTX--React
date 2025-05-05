import { useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import useUserRoutes from "@/hooks/useUserRoutes";
import Header from "@/components/Header";

const TimeSheetLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filteredRoutes, loading } = useUserRoutes();

  // Find timeSheet section in filteredRoutes
  const timeSheetSection = filteredRoutes.find(route => route.id === 'time-sheet');
  const tabs = timeSheetSection?.tabs || [];

  // --- Determine active tab directly from location --- 
  let currentActiveTab = "";
  const pathParts = location.pathname.split('/');
  const employeeIdForHistory = pathParts[2] === 'employee' && pathParts[4] === 'history' && pathParts[3] ? pathParts[3] : null;

  if (employeeIdForHistory) {
    currentActiveTab = "Employee History"; // Special case for history
  } else {
    // Find matching tab based on starting path, fallback to first tab
    currentActiveTab = tabs.find((tab) => !tab.hidden && location.pathname.startsWith(tab.path))?.name || tabs[0]?.name;
  }
  // --- End derive active tab --- 

  // Simplified useEffect - Handle redirects
  useEffect(() => {
    // Don't redirect if still loading
    if (loading || tabs.length === 0) return;

    // Check if the current path (ignoring history detail) matches any visible tab start
    const baseCheckPath = location.pathname;
    const pathMatchesVisibleTab = tabs.some(tab => 
        !tab.hidden && baseCheckPath.startsWith(tab.path)
    );

    // Redirect to the first non-hidden tab if the current path doesn't belong to any visible tab section
    if (!employeeIdForHistory && !pathMatchesVisibleTab && location.pathname.startsWith('/time-sheet')) {
      const firstVisibleTab = tabs.find(tab => !tab.hidden);
      if (firstVisibleTab) {
        navigate(firstVisibleTab.path, { replace: true });
      }
    }
  }, [location.pathname, navigate, tabs, employeeIdForHistory, loading]);

  // Handle tab switching - wrapped in useCallback
  const handleTabChange = useCallback((tabName) => {
    const selectedTab = tabs.find((tab) => tab.name === tabName);
    if (selectedTab) {
      if (selectedTab.name === "Employee History") {
        // Attempt to get employeeId from the current path if switching TO history
        // This logic might need refinement based on where the user can be when clicking the history tab
        const currentPathParts = location.pathname.split('/');
        const currentEmployeeId = currentPathParts[3]; 
        if (currentEmployeeId && location.pathname.includes('/employee/') && !location.pathname.includes('/history')) {
           navigate(`/time-sheet/employee/${currentEmployeeId}/history`);
        } else {
          // Cannot navigate to history without an employee context, maybe default to employee list?
          const employeeListTab = tabs.find(t => t.name === "Employee Timesheet");
          if (employeeListTab) navigate(employeeListTab.path);
        }
      } else {
        navigate(selectedTab.path);
      }
    }
    // Dependencies: navigate, tabs, location (because it reads location.pathname)
  }, [navigate, tabs, location]);

  // Filter out hidden tabs dynamically based on derived active tab
  const visibleTabs = tabs.filter(tab => {
    if (tab.name === "Employee History") {
      return currentActiveTab === "Employee History"; // Show only when active
    }
    return !tab.hidden;
  });

  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        {loading ? (
          <div className="p-3">Loading...</div>
        ) : (
          <Header
            tabs={visibleTabs.map((tab) => tab.name)}
            activeTab={currentActiveTab} // Pass derived active tab
            onTabChange={handleTabChange} // Pass stable function reference
            className="sticky-top bg-white"
          />
        )}
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