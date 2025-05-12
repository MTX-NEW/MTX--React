import { useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import useUserRoutes from "@/hooks/useUserRoutes";
import Header from "@/components/Header";

const UsersLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filteredRoutes, loading } = useUserRoutes();

  // Find manageUsers section in filteredRoutes
  const manageUsersSection = filteredRoutes.find(route => route.id === 'manage-users');
  const tabs = manageUsersSection?.tabs || [];

  // Determine active tab directly from location
  // Use startsWith for potentially nested routes under a tab
  const currentActiveTab = tabs.find((tab) => location.pathname.startsWith(tab.path))?.name || tabs[0]?.name;

  // Simplified useEffect - Redirect if base path hit or no match
  useEffect(() => {
    // Don't redirect if still loading
    if (loading || tabs.length === 0) return;
    
    const pathMatchesTab = tabs.some((tab) => location.pathname.startsWith(tab.path));
    // Redirect to the first tab if the current path doesn't match any tab root
    // Or if the base path is hit
    if ((!pathMatchesTab && location.pathname.startsWith('/manage-users')) || location.pathname === '/manage-users' || location.pathname === '/manage-users/') {
      if (tabs.length > 0) {
        navigate(tabs[0].path, { replace: true });
      }
    }
  }, [location.pathname, navigate, tabs, loading]);

  // Handle tab switching - wrapped in useCallback
  const handleTabChange = useCallback((tabName) => {
    const selectedTab = tabs.find((tab) => tab.name === tabName);
    if (selectedTab) {
      navigate(selectedTab.path);
    }
  }, [navigate, tabs]);

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
            onTabChange={handleTabChange}
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

export default UsersLayout;
