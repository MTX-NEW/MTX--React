
import { FaExclamationTriangle } from "react-icons/fa";

const Dialog = ({ show, title, message, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog-container">
        <div className="dialog-header">
          <FaExclamationTriangle className="dialog-icon" />
          <h2 className="dialog-title dialog-title-container">{title}</h2>
        </div>
        <div className="dialog-message">
          <p>{message}</p>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn dialog-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="dialog-btn dialog-confirm-btn" onClick={onConfirm}>
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
