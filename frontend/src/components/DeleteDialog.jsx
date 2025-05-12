import Dialog from "@/components/Dialog"; // Using the generic dialog
import { FaExclamationTriangle } from "react-icons/fa";

const DeleteDialog = ({ show, itemName, onClose, onConfirm }) => {
  return (
    <Dialog
      show={show}
      title="Confirm Delete"
      message={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmText="Delete"
      confirmClass="danger" // Allows custom styling for destructive actions
      icon={<FaExclamationTriangle className="dialog-icon warning" />}
    />
  );
};

export default DeleteDialog;
