import { useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import Sidebar from "@/components/Sidebar";
import useUserRoutes from "@/hooks/useUserRoutes";
import Header from "@/components/Header";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ClaimsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filteredRoutes, loading } = useUserRoutes();
  
  const tabs = [
    { name: 'Claims Management', path: '/claims/management' },
    { name: 'Batch Management', path: '/claims/batches' },
    { name: 'EDI Files', path: '/claims/edi' }
  ];

  // Determine active tab directly from location
  const currentActiveTab = tabs.find((tab) => location.pathname.startsWith(tab.path))?.name || tabs[0]?.name;

  // Redirect logic
  useEffect(() => {
    // Don't redirect if still loading
    if (loading || tabs.length === 0) return;
    
    // Redirect to first tab if hitting base path
    if (location.pathname === '/claims' || location.pathname === '/claims/') {
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
          <div className="p-3 d-flex align-items-center justify-content-center" style={{ height: '100px' }}>
            <Spin size="large" />
            <span className="ms-3">Loading Claims...</span>
          </div>
        ) : (
          <Header
            tabs={tabs.map((tab) => tab.name)}
            activeTab={currentActiveTab}
            onTabChange={handleTabChange}
            className="sticky-top bg-white"
          />
        )}
        <div className="claims-container flex-grow-1 overflow-auto" style={{ 
          height: 'calc(100vh - 89px)'
        }}>
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ClaimsLayout;
