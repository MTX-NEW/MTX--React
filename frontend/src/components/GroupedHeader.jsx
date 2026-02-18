import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import "./GroupedHeader.css";

const GroupedHeader = ({ tabGroups, activeTab, onTabChange }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (groupLabel) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenDropdown(groupLabel);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const handleTabClick = (tab) => {
    onTabChange(tab);
    setOpenDropdown(null);
  };

  const isGroupActive = (group) => {
    return group.tabs.includes(activeTab);
  };

  return (
    <div className="dropdown-header">
      <div className="dropdown-nav">
        {tabGroups.map((group) => (
          <div
            key={group.label}
            className={`dropdown-group ${isGroupActive(group) ? "active" : ""} ${openDropdown === group.label ? "open" : ""}`}
            onMouseEnter={() => handleMouseEnter(group.label)}
            onMouseLeave={handleMouseLeave}
          >
            <button className={`dropdown-trigger ${isGroupActive(group) ? "active" : ""}`}>
              {group.label}
              <svg 
                className="dropdown-arrow" 
                width="10" 
                height="6" 
                viewBox="0 0 10 6" 
                fill="currentColor"
              >
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className={`dropdown-menu ${openDropdown === group.label ? "show" : ""}`}>
              {group.tabs.map((tab) => (
                <button
                  key={tab}
                  className={`dropdown-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

GroupedHeader.propTypes = {
  tabGroups: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      tabs: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default GroupedHeader;
