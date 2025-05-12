import { useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import useUserRoutes from "@/hooks/useUserRoutes";

const VehiclesLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filteredRoutes, loading } = useUserRoutes();
  
  // Find manage-vehicles section in filteredRoutes
  const vehiclesSection = filteredRoutes.find(route => route.id === 'manage-vehicles');
  const vehicleRoutes = vehiclesSection?.tabs || [];

  // Determine active tab directly from location
  const currentActiveTab = vehicleRoutes.find((tab) => location.pathname.startsWith(tab.path))?.name || vehicleRoutes[0]?.name;

  // Simplified useEffect - Redirect if base path hit or no match
  useEffect(() => {
    // Don't redirect if still loading
    if (loading || vehicleRoutes.length === 0) return;
    
    const pathMatchesTab = vehicleRoutes.some((tab) => location.pathname.startsWith(tab.path));
    // Redirect to the first tab if the current path doesn't match any tab root
    // Or if the base path is hit
    if ((!pathMatchesTab && location.pathname.startsWith('/manage-vehicles')) || location.pathname === '/manage-vehicles' || location.pathname === '/manage-vehicles/') {
       if (vehicleRoutes.length > 0) {
         navigate(vehicleRoutes[0].path, { replace: true });
       }
    }
  }, [location.pathname, navigate, vehicleRoutes, loading]);

  // Wrap handleTabChange in useCallback
  const handleTabChange = useCallback((tabName) => {
    const selectedTab = vehicleRoutes.find((tab) => tab.name === tabName);
    selectedTab && navigate(selectedTab.path);
  }, [navigate, vehicleRoutes]);

  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        {loading ? (
          <div className="p-3">Loading...</div>
        ) : (
          <Header
            tabs={vehicleRoutes.map(route => route.name)}
            activeTab={currentActiveTab}
            onTabChange={handleTabChange}
            className="sticky-top bg-white"
          />
        )}
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default VehiclesLayout; 