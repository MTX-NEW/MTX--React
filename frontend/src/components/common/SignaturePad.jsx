import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Modal, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignature, faEraser, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const SignaturePad = ({ 
  title = 'Signature',
  onSave,
  initialSignature = null,
  buttonText = 'Add Signature',
  buttonVariant = 'primary',
  showButton = true,
}) => {
  const [show, setShow] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const sigCanvas = useRef(null);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const clear = () => {
    sigCanvas.current.clear();
    setIsEmpty(true);
  };

  const save = () => {
    if (isEmpty) {
      alert('Please provide a signature');
      return;
    }
    
    // Get the signature as base64 data URL
    const signatureData = sigCanvas.current.toDataURL();
    
    // Call the onSave callback with the signature data
    onSave(signatureData);
    
    // Close the modal
    handleClose();
  };

  // Function to load initial signature if provided
  const loadInitialSignature = () => {
    if (initialSignature && sigCanvas.current) {
      // Need to wrap in setTimeout because canvas might not be ready yet
      setTimeout(() => {
        const ctx = sigCanvas.current.getCanvas().getContext('2d');
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          setIsEmpty(false);
        };
        img.src = initialSignature;
      }, 100);
    }
  };

  return (
    <>
      {showButton && (
        <Button 
          variant={buttonVariant} 
          onClick={handleShow}
          className="d-flex align-items-center"
        >
          <FontAwesomeIcon icon={faSignature} className="me-2" />
          {buttonText}
        </Button>
      )}

      <Modal show={show} onShow={loadInitialSignature} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card className="signature-container border mb-3">
            <Card.Body className="p-2">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  width: 300,
                  height: 200,
                  className: 'signature-canvas'
                }}
                onBegin={() => setIsEmpty(false)}
              />
            </Card.Body>
          </Card>
          <div className="text-muted mb-3 small">
            Please sign using mouse or touch device
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={clear}>
            <FontAwesomeIcon icon={faEraser} className="me-2" />
            Clear
          </Button>
          <Button variant="outline-secondary" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={isEmpty}>
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Save Signature
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .signature-canvas {
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #fff;
        }
      `}</style>
    </>
  );
};

export default SignaturePad; 