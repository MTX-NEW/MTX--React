import React from "react";
import "@/assets/RightSidebarPopup.css";

const RightSidebarPopup = ({ show, title, children, onClose, width, isWide }) => {
  if (!show) return null;

  const handleClose = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("popup-overlay")) {
      handleClose();
    }
  };

  // Generate style object if width is provided
  const popupStyle = width ? { width } : {};
  
  // Generate CSS class, conditionally adding 'wide' if isWide is true
  const popupClassName = `right-sidebar-popup show${isWide ? ' wide' : ''}`;

  return (
    <>
      {/* Overlay */}
      <div
        className="popup-overlay show"
        onClick={handleOverlayClick}
      ></div>
      {/* Sidebar Popup */}
      <div 
        className={popupClassName}
        style={popupStyle}
        aria-modal="true"
        role="dialog"
      >
        <div className="popup-header">
          <h2>{title}</h2>
          <button 
            className="close-btn" 
            onClick={handleClose}
            aria-label="Close popup"
          >
            &times;
          </button>
        </div>
        <div className="popup-content">{children}</div>
      </div>
    </>
  );
};

export default RightSidebarPopup;
