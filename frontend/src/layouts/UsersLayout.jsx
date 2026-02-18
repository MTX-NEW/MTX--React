import { useEffect, useCallback, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import useUserRoutes from "@/hooks/useUserRoutes";
import GroupedHeader from "@/components/GroupedHeader";

const UsersLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filteredRoutes, loading } = useUserRoutes();

  // Find manageUsers section in filteredRoutes
  const manageUsersSection = filteredRoutes.find(route => route.id === 'manage-users');
  const tabs = manageUsersSection?.tabs || [];

  // Group tabs by their group property
  const tabGroups = useMemo(() => {
    console.log('UsersLayout - tabs with group property:', tabs.map(t => ({ name: t.name, group: t.group })));
    
    const groupOrder = ["Users", "Organisation Setup", "Permissions", "Config"];
    const groups = {};
    
    tabs.forEach(tab => {
      const groupName = tab.group || "Other";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(tab.name);
    });
    
    console.log('UsersLayout - grouped tabs:', groups);
    
    // Return groups in the specified order, only including groups that have tabs
    return groupOrder
      .filter(groupName => groups[groupName]?.length > 0)
      .map(groupName => ({
        label: groupName,
        tabs: groups[groupName]
      }));
  }, [tabs]);

  // Determine active tab directly from location
  const currentActiveTab = tabs.find((tab) => location.pathname.startsWith(tab.path))?.name || tabs[0]?.name;

  // Simplified useEffect - Redirect if base path hit or no match
  useEffect(() => {
    if (loading || tabs.length === 0) return;
    
    const pathMatchesTab = tabs.some((tab) => location.pathname.startsWith(tab.path));
    if ((!pathMatchesTab && location.pathname.startsWith('/manage-users')) || location.pathname === '/manage-users' || location.pathname === '/manage-users/') {
      if (tabs.length > 0) {
        navigate(tabs[0].path, { replace: true });
      }
    }
  }, [location.pathname, navigate, tabs, loading]);

  // Handle tab switching
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
          <GroupedHeader
            tabGroups={tabGroups}
            activeTab={currentActiveTab}
            onTabChange={handleTabChange}
          />
        )}
        <div className="users-container flex-grow-1 overflow-auto" style={{ 
          height: 'calc(100vh - 89px)'
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
