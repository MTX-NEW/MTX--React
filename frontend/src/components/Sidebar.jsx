import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBus,
  faClock,
  faUsers,
  faEnvelope,
  faUserTie,
  faFileAlt,
  faClipboard,
  faRoute,
  faCar,
  faUpload,
  faUserCircle,
  faExchangeAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { routes } from "@/routesConfig";
//import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  //const { currentUser } = useAuth();
  
  // Hardcoded user for temporary use
  const currentUser = { 
    id: 11,
    first_name: 'Test',
    last_name: 'Driver',
    userType: { type_name: 'driver' }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSwitchPanel = () => {
    // If current location is driver panel, go to main app
    if (location.pathname.startsWith('/driver-panel')) {
      navigate('/');
    } 
    // If user is a driver, go to driver panel
    else if (currentUser?.userType?.type_name === 'driver') {
      navigate('/driver-panel');
    }
  };

  // Determine button text based on current location
  const switchButtonText = location.pathname.startsWith('/driver-panel') 
    ? 'Switch to Main App' 
    : 'Switch to Driver Panel';

  // Only show the switch button for drivers or when already in the driver panel
  const showSwitchButton = location.pathname.startsWith('/driver-panel') || 
    (currentUser?.userType?.type_name === 'driver');

  return (
    <div className="sidebar">
      <div className="logo-section">
        <img src={logo} alt="Company Logo" className="logo" />
      </div>
      <nav className="nav">
        <ul>
          {Object.values(routes).map((route) => (
            <li
              key={route.path}
              className={`nav-item ${
                location.pathname.startsWith(route.path) ? "active" : ""
              }`}
              onClick={() => handleNavigation(route.path)}
            >
              {route.icon && (
                <FontAwesomeIcon icon={eval(route.icon)} className="icon" />
              )}
              {route.label}
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="profile-section">
          <FontAwesomeIcon icon={faUserCircle} className="profile-icon" />
          {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Profile'}
        </div>
        {showSwitchButton && (
          <button className="switch-panel-btn" onClick={handleSwitchPanel}>
            <FontAwesomeIcon icon={faExchangeAlt} className="mr-2" />
            {switchButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
