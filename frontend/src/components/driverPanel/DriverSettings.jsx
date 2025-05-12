import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignature, faUser, faInfoCircle, faExclamationTriangle, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { useDriverPanel } from '@/hooks/useDriverPanel';
import SignaturePad from '@/components/common/SignaturePad';
import useAuth from '@/hooks/useAuth';

const DriverSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [currentDriver, setCurrentDriver] = useState(null);

  // Use the driver panel hook
  const { 
    loading,
    error,
    driverDetails,
    updateDriverSignature,
    fetchDriverDetails
  } = useDriverPanel(currentUserId);

  // Fetch driver details
  useEffect(() => {
    setIsLoading(true);
    fetchDriverDetails()
      .then((driverData) => {
        if (driverData) {
          setCurrentDriver({
            id: driverData.id,
            first_name: driverData.first_name,
            last_name: driverData.last_name,
            signature: driverData.signature
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentUserId, fetchDriverDetails]);

  const handleDriverSignature = (signatureData) => {
    setIsLoading(true);
    updateDriverSignature(signatureData)
      .then((success) => {
        if (success) {
          setCurrentDriver(prev => ({
            ...prev,
            signature: signatureData
          }));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isLoading && !currentDriver) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading driver settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
        {error}
      </Alert>
    );
  }

  return (
    <div className="settings-container pb-5">
      <h5 className="mb-4">
        <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
        Driver Settings
      </h5>

      <Card className="mb-4 border-light shadow-sm rounded-3">
        <Card.Header className="bg-white py-3">
          <h6 className="mb-0">
            <FontAwesomeIcon icon={faSignature} className="me-2 text-primary" />
            Your Signature
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col xs={12}>
              <p className="text-muted mb-3">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                Your signature will be used for all trip confirmations. You only need to set this once.
              </p>
              
              {currentDriver?.signature ? (
                <div className="mb-3">
                  <div className="border p-3 mb-3 rounded">
                    <img 
                      src={currentDriver.signature} 
                      alt="Driver Signature" 
                      className="img-fluid" 
                      style={{ maxHeight: '150px' }}
                    />
                  </div>
                  <SignaturePad
                    title="Update Your Signature"
                    onSave={handleDriverSignature}
                    initialSignature={currentDriver.signature}
                    buttonText="Update Signature"
                    buttonVariant="outline-primary"
                  />
                </div>
              ) : (
                <div className="text-center p-4 border rounded mb-3">
                  <p className="mb-3">You haven't added your signature yet.</p>
                  <SignaturePad
                    title="Driver Signature"
                    onSave={handleDriverSignature}
                    buttonText="Add Your Signature"
                    buttonVariant="primary"
                  />
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DriverSettings; 