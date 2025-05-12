import React from "react";
import { FaInfoCircle, FaClock, FaUserClock, FaCoffee, FaSignOutAlt } from "react-icons/fa";

const ConfirmationDialog = ({ show, title, message, onClose, onConfirm, action }) => {
  if (!show) return null;

  // Determine icon and button style based on action
  let Icon = FaInfoCircle;
  let confirmButtonClass = "btn-primary";
  let confirmButtonText = "Confirm";
  let iconColor = "#0d6efd"; // Default blue

  if (action === 'clockIn') {
    Icon = FaUserClock;
    confirmButtonClass = "btn-success";
    confirmButtonText = "Clock In";
    iconColor = "#198754"; // Success green
  } else if (action === 'clockOut') {
    Icon = FaSignOutAlt;
    confirmButtonClass = "btn-danger";
    confirmButtonText = "Clock Out";
    iconColor = "#dc3545"; // Danger red
  } else if (action === 'startBreak') {
    Icon = FaCoffee;
    confirmButtonClass = "btn-warning";
    confirmButtonText = "Start Break";
    iconColor = "#ffc107"; // Warning yellow
  } else if (action === 'endBreak') {
    Icon = FaClock;
    confirmButtonClass = "btn-info";
    confirmButtonText = "End Break";
    iconColor = "#0dcaf0"; // Info blue
  }

  return (
    <div className="confirmation-dialog-backdrop">
      <div className="confirmation-dialog-container">
        <div className="confirmation-dialog-content">
          <div className="confirmation-dialog-header">
            <Icon className="confirmation-dialog-icon" style={{ color: iconColor }} />
            <h4 className="confirmation-dialog-title">{title}</h4>
          </div>
          <div className="confirmation-dialog-body">
            <p>{message}</p>
          </div>
          <div className="confirmation-dialog-footer">
            <button className="btn btn-light" onClick={onClose}>
              Cancel
            </button>
            <button className={`btn ${confirmButtonClass} ms-2`} onClick={onConfirm}>
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog; 