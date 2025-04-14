import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const TripSystemLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");

  // Define tabs and their corresponding routes
  const tabs = [
    { name: "Trip Requests", path: "/trip-system/trip-requests" },
    { name: "Route Sheet", path: "/trip-system/trip-management" },
    { name: "Members", path: "/trip-system/members" },
    { name: "New Trip Requests", path: "/trip-system/new-trip-requests" },
    // Additional tabs can be added here in the future
  ];

  // Sync active tab with the current route
  useEffect(() => {
    const currentTab = tabs.find((tab) => location.pathname === tab.path);

    if (currentTab) {
      setActiveTab(currentTab.name);
    } else {
      // Redirect to the first tab if no match
      setActiveTab(tabs[0].name);
      navigate(tabs[0].path, { replace: true });
    }
  }, [location.pathname, navigate, tabs]);

  // Handle tab switching
  const handleTabChange = (tabName) => {
    const selectedTab = tabs.find((tab) => tab.name === tabName);
    if (selectedTab) {
      navigate(selectedTab.path);
    }
  };

  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <Header
          tabs={tabs.map((tab) => tab.name)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="sticky-top bg-white"
        />
        <div className="users-container flex-grow-1 overflow-auto" style={{ 
          height: 'calc(100vh - 89px)' // Adjust 64px to match your header height
        }}>
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripSystemLayout; 