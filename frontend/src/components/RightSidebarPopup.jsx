import React from "react";
import "@/assets/RightSidebarPopup.css";

const RightSidebarPopup = ({ show, title, children, onClose }) => {
  if (!show) return null;

  const handleClose = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("popup-overlay")) {
      handleClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="popup-overlay show"
        onClick={handleOverlayClick}
      ></div>
      {/* Sidebar Popup */}
      <div 
        className="right-sidebar-popup show"
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
