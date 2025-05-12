import { useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import useUserRoutes from "@/hooks/useUserRoutes";
import Header from "@/components/Header";

const TripSystemLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filteredRoutes, loading } = useUserRoutes();

  // Find tripSystem section in filteredRoutes
  const tripSystemSection = filteredRoutes.find(route => route.id === 'trip-system');
  const tabs = tripSystemSection?.tabs || [];

  // Determine active tab directly from location
  const currentActiveTab = tabs.find((tab) => location.pathname.startsWith(tab.path))?.name || tabs[0]?.name;

  // Redirect logic moved or handled by Router - simplified useEffect
  useEffect(() => {
    // Don't redirect if still loading
    if (loading || tabs.length === 0) return;
    
    // Optional: Redirect if the base path is hit but no specific tab matches 
    // This assumes Router.jsx already handles index route navigation properly
    if (location.pathname === '/trip-system' || location.pathname === '/trip-system/') {
       if (tabs.length > 0) {
         navigate(tabs[0].path, { replace: true });
       }
    }
    // Add other side effects here if needed, but keep minimal
  }, [location.pathname, navigate, tabs, loading]); // Added loading to dependencies

  // Handle tab switching - wrapped in useCallback
  const handleTabChange = useCallback((tabName) => {
    const selectedTab = tabs.find((tab) => tab.name === tabName);
    if (selectedTab) {
      navigate(selectedTab.path);
    }
  }, [navigate, tabs]); // Add navigate and tabs as dependencies

  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        {loading ? (
          <div className="p-3">Loading...</div>
        ) : (
          <Header
            tabs={tabs.map((tab) => tab.name)}
            activeTab={currentActiveTab}
            onTabChange={handleTabChange} // Pass stable function reference
            className="sticky-top bg-white"
          />
        )}
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