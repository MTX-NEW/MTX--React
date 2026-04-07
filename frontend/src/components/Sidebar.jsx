import React, { useState, useRef, useEffect, memo } from "react";
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
  faUserAlt
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import useAuth from "@/hooks/useAuth";
import useUserRoutes  from "@/hooks/useUserRoutes";

// Create an icon map
const iconMap = {
  faBus,
  faClock,
  faUsers,
  faEnvelope,
  faUserTie,
  faFileAlt,
  faClipboard, 
  faCar,
  faUpload,
  faUserAlt
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  const { filteredRoutes, loading } = useUserRoutes();

  useEffect(() => {
    if (!showProfileMenu) return;
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  const handleProfileClick = () => setShowProfileMenu(prev => !prev);
  
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSwitchPanel = () => {
    // If current location is driver panel, go to main app
    if (location.pathname.startsWith('/driver-panel')) {
      navigate('/');
    } 
    // If user is authenticated, go to driver panel
    else if (currentUser) {
      navigate('/driver-panel');
    }
  };

  // Determine button text based on current location
  const switchButtonText = location.pathname.startsWith('/driver-panel') 
    ? 'Switch to Main App' 
    : 'Switch to Driver Panel';

  // Show the switch button for all authenticated users
  const showSwitchButton = location.pathname.startsWith('/driver-panel') || currentUser;

  return (
    <div className="sidebar">
      <div className="logo-section">
        <img src={logo} alt="Company Logo" className="logo" />
      </div>
      <nav className="nav">
        <ul>
          {loading ? (
            <li className="nav-item">Loading...</li>
          ) : filteredRoutes.map((route) => (
            <li
              key={route.path}
              className={`nav-item ${
                location.pathname.startsWith(route.path) ? "active" : ""
              }`}
              onClick={() => handleNavigation(route.path)}
            >
              {route.icon && (
                <FontAwesomeIcon icon={iconMap[route.icon]} className="icon" />
              )}
              {route.displayName || route.label}
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="profile-menu-wrapper" ref={profileRef}>
          <div className="profile-section" onClick={handleProfileClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleProfileClick(); } }}>
            {currentUser && currentUser.profile_image ? (
              <img 
                src={currentUser.profile_image} 
                alt="Profile" 
                className="profile-icon" 
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <FontAwesomeIcon icon={faUserCircle} className="profile-icon" />
            )}
            <span className="profile-section-name">
              {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Profile'}
            </span>
          </div>
          {showProfileMenu && currentUser && (
            <div className="profile-popup">
              <div className="profile-details">
                <p>{currentUser.first_name} {currentUser.last_name}</p>
                <p>{currentUser.email}</p>
              </div>
              <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
          )}
        </div>
        {showSwitchButton && (
          <button className="switch-panel-btn" onClick={handleSwitchPanel}>
            {switchButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(Sidebar);
