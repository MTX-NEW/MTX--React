import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useRoutes } from "react-router-dom";
import { routes } from "@/routesConfig";

const VehiclesLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");
  
  // Correctly access the tabs from routesConfig.js
  const vehicleRoutes = routes.vehicles.tabs;

  // Remove local tabs definition and use vehicleRoutes directly
  useEffect(() => {
    const currentTab = vehicleRoutes.find((tab) => location.pathname === tab.path);
    currentTab ? setActiveTab(currentTab.name) : navigate(vehicleRoutes[0].path, { replace: true });
  }, [location.pathname, navigate, vehicleRoutes]);

  const handleTabChange = (tabName) => {
    const selectedTab = vehicleRoutes.find((tab) => tab.name === tabName);
    selectedTab && navigate(selectedTab.path);
  };

  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <Header
          tabs={vehicleRoutes.map(route => route.name)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="sticky-top bg-white"
        />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default VehiclesLayout; 