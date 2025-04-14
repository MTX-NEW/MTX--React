import { Modal, Button } from "react-bootstrap";

const Popup = ({ 
  show, 
  title, 
  content, 
  onClose, 
  onSave, 
  saveText = "Save Changes", 
  closeText = "Close", 
  saveVariant = "primary", 
  closeVariant = "secondary" 
}) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{content}</Modal.Body>
      <Modal.Footer>
        <Button variant={closeVariant} onClick={onClose}>
          {closeText}
        </Button>
        {onSave && (
          <Button variant={saveVariant} onClick={onSave}>
            {saveText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default Popup;
