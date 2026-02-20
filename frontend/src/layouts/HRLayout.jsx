import { useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import useUserRoutes from "@/hooks/useUserRoutes";
import Header from "@/components/Header";

const HRLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filteredRoutes, loading } = useUserRoutes();

  const hrSection = filteredRoutes.find(route => route.id === 'hr');
  const tabs = hrSection?.tabs || [];

  const currentActiveTab = tabs.find((tab) => 
    !tab.hidden && location.pathname.startsWith(tab.path)
  )?.name || tabs[0]?.name;

  useEffect(() => {
    if (loading || tabs.length === 0) return;

    const pathMatchesVisibleTab = tabs.some(tab => 
      !tab.hidden && location.pathname.startsWith(tab.path)
    );

    if (!pathMatchesVisibleTab && location.pathname.startsWith('/hr')) {
      const firstVisibleTab = tabs.find(tab => !tab.hidden);
      if (firstVisibleTab) {
        navigate(firstVisibleTab.path, { replace: true });
      }
    }
  }, [location.pathname, navigate, tabs, loading]);

  const handleTabChange = useCallback((tabName) => {
    const selectedTab = tabs.find((tab) => tab.name === tabName);
    if (selectedTab) {
      navigate(selectedTab.path);
    }
  }, [navigate, tabs]);

  const visibleTabs = tabs.filter(tab => !tab.hidden);

  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        {loading ? (
          <div className="p-3">Loading...</div>
        ) : (
          <Header
            tabs={visibleTabs.map((tab) => tab.name)}
            activeTab={currentActiveTab}
            onTabChange={handleTabChange}
            className="sticky-top bg-white"
          />
        )}
        <div className="hr-container flex-grow-1 overflow-auto" style={{
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

export default HRLayout;
