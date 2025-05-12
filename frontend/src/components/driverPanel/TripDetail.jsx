import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Badge, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faDirections, 
  faUser, 
  faInfoCircle, 
  faMapMarkerAlt, 
  faClock, 
  faCheck, 
  faTimes,
  faExchangeAlt,
  faCalendarAlt,
  faPhone,
  faTachometerAlt,
  faExclamationTriangle,
  faSignature
} from '@fortawesome/free-solid-svg-icons';
import useAuth from '@/hooks/useAuth';
import { useDriverPanel } from '@/hooks/useDriverPanel';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import '@/assets/css/DriverPanel.css';
import StatusUpdateActions from './StatusUpdateActions';
import SignaturePad from '@/components/common/SignaturePad';

const TripDetail = () => {
  const { legId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [showOdometerModal, setShowOdometerModal] = useState(false);
  const [odometerReading, setOdometerReading] = useState('');
  const [odometerType, setOdometerType] = useState(''); // 'pickup' or 'dropoff'
  const navigate = useNavigate();
  
  const { user } = useAuth();
  
  // Replace hardcoded user ID with authenticated user ID
  const currentUserId = user?.id;

  // Use the driver panel hook
  const { 
    currentTrip: trip, 
    error, 
    loading,
    fetchTripLegDetails,
    updateTripLegStatus,
    updateTripLegOdometer,
    updateTripMemberSignature
  } = useDriverPanel(currentUserId);

  const allowedStatuses = [
    'Assigned',
    'Transport confirmed',
    'Transport enroute',
    'Picked up',
    'Not going',
    'Not available',
    'Dropped off',
  ];

  // Status progression map
  const statusProgression = {
    'Assigned': ['Transport confirmed'],
    'Transport confirmed': ['Transport enroute'],
    'Transport enroute': ['Picked up', 'Not going', 'Not available'],
    'Picked up': ['Dropped off'],
    'Not going': [],
    'Not available': [],
    'Dropped off': []
  };

  useEffect(() => {
    if (legId) {
      setIsLoading(true);
      fetchTripLegDetails(legId)
        .finally(() => setIsLoading(false));
    }
  }, [legId, fetchTripLegDetails]);

  const handleStatusChange = async (status) => {
    try {
      setIsLoading(true);
      await updateTripLegStatus(legId, status);
      
      // Refresh trip after status update - no need for toast as the API hook already shows it
      fetchTripLegDetails(legId);
    } catch (error) {
      console.error('Status update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOdometerClick = (type) => {
    setOdometerType(type);
    setOdometerReading('');
    setShowOdometerModal(true);
  };

  const handleOdometerSubmit = async () => {
    if (!odometerReading) {
      toast.error('Please enter a valid odometer reading');
      return;
    }

    const reading = parseFloat(odometerReading);
    if (isNaN(reading) || reading < 0) {
      toast.error('Please enter a valid odometer reading');
      return;
    }

    try {
      setIsLoading(true);
      if (odometerType === 'pickup') {
        await updateTripLegOdometer(legId, reading, null);
      } else {
        await updateTripLegOdometer(legId, null, reading);
      }
      
      // Close modal
      setShowOdometerModal(false);
      setOdometerReading('');
      
      // Refresh trip details to show updated odometer
      fetchTripLegDetails(legId);
    } catch (error) {
      console.error('Error updating odometer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to determine if odometer entry should be shown
  const shouldShowOdometer = (status, type) => {
    if (type === 'pickup') {
      return ['Transport confirmed', 'Transport enroute', 'Picked up'].includes(status);
    } else if (type === 'dropoff') {
      return ['Picked up', 'Dropped off'].includes(status);
    }
    return false;
  };

  const handleBackClick = () => {
    navigate('/driver-panel/trips');
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // Parse time (HH:MM:SS format)
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return format(date, 'HH:mm');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const openDirections = (location) => {
    if (!location || !location.latitude || !location.longitude) {
      toast.error('Location coordinates not available', {
        position: "top-center"
      });
      return;
    }
    
    // Open Google Maps directions in a new tab
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  // Status badge helper
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'secondary';
      case 'Attention':
        return 'warning';
      case 'Assigned':
        return 'info';
      case 'Transport confirmed':
        return 'primary';
      case 'Transport enroute':
        return 'info';
      case 'Picked up':
        return 'success';
      case 'Not going':
        return 'danger';
      case 'Not available':
        return 'danger';
      case 'Dropped off':
        return 'success';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const renderBackButton = () => (
    <Button variant="outline-primary" onClick={handleBackClick} size="sm" className="mb-3 rounded-pill shadow-sm">
      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
      Back to Trips
    </Button>
  );

  const handleMemberSignature = (signatureData) => {
    if (trip && trip.Trip && trip.Trip.TripMember) {
      const memberId = trip.Trip.TripMember.member_id;
      updateTripMemberSignature(memberId, signatureData)
        .then((success) => {
          if (success) {
            // Refresh trip details to update the UI with the new signature
            fetchTripLegDetails(legId);
          }
        });
    } else {
      toast.error('Trip member information not available');
    }
  };

  if (isLoading && !trip) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading trip details...</p>
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

  if (!trip) {
    return (
      <Alert variant="warning" className="m-3">
        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
        Trip details not found.
      </Alert>
    );
  }

  return (
    <div className="trip-detail-container pb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        {renderBackButton()}
        <Badge bg={getStatusBadgeClass(trip.status)} className="status-badge ms-2">
          {trip.status || 'Scheduled'}
        </Badge>
      </div>

      <div className="trip-header mb-3">
        <h5 className="mb-1 d-flex align-items-center fs-6">
          <span className="trip-id me-2">#{trip.Trip.trip_id}</span>
          Trip Details 
          <span className="ms-2 text-muted small">(Leg #{trip.sequence})</span>
        </h5>
        
        <p className="text-muted mb-0 fs-7">
          <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
          {formatDate(trip.Trip.start_date)}
        </p>
      </div>

      <Row className="g-3 mb-3">
        {/* Member Information */}
        <Col lg={6} className="mb-2">
          <Card className="h-100 border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-bottom-0 pt-2 px-3 pb-0">
              <div className="d-flex align-items-center">
                <div className="avatar-circle bg-primary text-white me-2">
                  <FontAwesomeIcon icon={faUser} className="fs-7" />
                </div>
                <h6 className="mb-0 fs-6">Member Information</h6>
              </div>
            </Card.Header>
            <Card.Body className="pt-0 px-3 py-2">
              <div className="p-2 bg-light rounded-3 mb-2">
                <Row className="g-2">
                  <Col xs={12}>
                    <p className="mb-0 fs-7">
                      <strong>Name:</strong> {trip.Trip.TripMember.first_name} {trip.Trip.TripMember.last_name}
                    </p>
                  </Col>
                  
                  {trip.Trip.TripMember.phone && (
                    <Col xs={12}>
                      <p className="mb-0 fs-7">
                        <FontAwesomeIcon icon={faPhone} className="me-2 text-muted" />
                        <a href={`tel:${trip.Trip.TripMember.phone}`} className="text-decoration-none">
                          {trip.Trip.TripMember.phone}
                        </a>
                      </p>
                    </Col>
                  )}
                  
                  {trip.Trip.TripMember.Program && (
                    <Col xs={12}>
                      <p className="mb-0 fs-7">
                        <strong>Program:</strong> {trip.Trip.TripMember.Program.program_name}
                      </p>
                    </Col>
                  )}
                </Row>
              </div>
              
              {trip.Trip.TripMember.notes && (
                <div>
                  <h6 className="mb-1 fs-7">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-muted" />
                    Notes
                  </h6>
                  <div className="p-2 bg-light rounded-3">
                    <p className="mb-0 fs-8">{trip.Trip.TripMember.notes}</p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Special Instructions */}
        <Col lg={6} className="mb-2">
          <Card className="h-100 border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-bottom-0 pt-2 px-3 pb-0">
              <div className="d-flex align-items-center">
                <div className="avatar-circle bg-info text-white me-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="fs-7" />
                </div>
                <h6 className="mb-0 fs-6">Special Instructions</h6>
              </div>
            </Card.Header>
            <Card.Body className="pt-0 px-3 py-2">
              {trip.Trip.specialInstructions ? (
                <div className="p-2 bg-light rounded-3">
                  <Row className="g-2">
                    {trip.Trip.specialInstructions.mobility_type && (
                      <Col xs={12}>
                        <div className="instruction-item">
                          <p className="fw-medium mb-1 fs-7">Mobility Type</p>
                          <p className="mb-0 fs-7">{trip.Trip.specialInstructions.mobility_type}</p>
                        </div>
                      </Col>
                    )}
                    
                    <Col xs={6}>
                      <div className="feature-item">
                        <span className={`feature-icon me-2 ${trip.Trip.specialInstructions.rides_alone ? 'text-success' : 'text-muted'}`}>
                          {trip.Trip.specialInstructions.rides_alone ? 
                            <FontAwesomeIcon icon={faCheck} /> : 
                            <FontAwesomeIcon icon={faTimes} />}
                        </span>
                        <span>Rides alone</span>
                      </div>
                    </Col>
                    
                    <Col xs={6}>
                      <div className="feature-item">
                        <span className={`feature-icon me-2 ${trip.Trip.specialInstructions.spanish_speaking ? 'text-success' : 'text-muted'}`}>
                          {trip.Trip.specialInstructions.spanish_speaking ? 
                            <FontAwesomeIcon icon={faCheck} /> : 
                            <FontAwesomeIcon icon={faTimes} />}
                        </span>
                        <span>Spanish speaking</span>
                      </div>
                    </Col>
                    
                    <Col xs={6}>
                      <div className="feature-item">
                        <span className={`feature-icon me-2 ${trip.Trip.specialInstructions.service_animal ? 'text-success' : 'text-muted'}`}>
                          {trip.Trip.specialInstructions.service_animal ? 
                            <FontAwesomeIcon icon={faCheck} /> : 
                            <FontAwesomeIcon icon={faTimes} />}
                        </span>
                        <span>Service animal</span>
                      </div>
                    </Col>
                    
                    <Col xs={6}>
                      <div className="feature-item">
                        <span className={`feature-icon me-2 ${trip.Trip.specialInstructions.needs_assistance ? 'text-success' : 'text-muted'}`}>
                          {trip.Trip.specialInstructions.needs_assistance ? 
                            <FontAwesomeIcon icon={faCheck} /> : 
                            <FontAwesomeIcon icon={faTimes} />}
                        </span>
                        <span>Needs assistance</span>
                      </div>
                    </Col>
                    
                    {trip.Trip.specialInstructions.notes && (
                      <Col xs={12} className="mt-2">
                        <div className="instruction-item">
                          <p className="fw-medium mb-1 fs-7">Additional Notes</p>
                          <p className="mb-0 fs-8">{trip.Trip.specialInstructions.notes}</p>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              ) : (
                <div className="text-center p-3">
                  <p className="text-muted fs-7">No special instructions provided</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Trip Locations */}
      <Row className="g-3 mb-3">
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-bottom-0 pt-2 px-3 pb-0">
              <div className="d-flex align-items-center">
                <div className="avatar-circle bg-primary text-white me-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="fs-7" />
                </div>
                <h6 className="mb-0 fs-6">Trip Route</h6>
              </div>
            </Card.Header>
            <Card.Body className="pt-0 px-3 py-2">
              <div className="trip-locations">
                {/* Pickup */}
                <div className="location-item d-flex mb-3">
                  <div className="location-time text-center me-2" style={{ width: '55px' }}>
                    <div className="time-badge rounded-pill px-2 py-1 bg-light border mb-1 fs-8">
                      {formatTime(trip.scheduled_pickup)}
                    </div>
                    <div className="status-dot">
                      <div className="dot bg-primary"></div>
                    </div>
                  </div>
                  
                  <div className="location-details flex-grow-1 p-2 bg-light rounded-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="d-flex align-items-center mb-1 fs-7 fw-medium">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1 text-primary" />
                          Pickup
                        </p>
                        <p className="mb-1 fs-7">
                          {trip.pickupLocation ? (
                            <>
                              {trip.pickupLocation.name && <strong className="d-block mb-1">{trip.pickupLocation.name}</strong>}
                              {trip.pickupLocation.street_address}, {trip.pickupLocation.city}, {trip.pickupLocation.state} {trip.pickupLocation.zip}
                            </>
                          ) : (
                            'Address not available'
                          )}
                        </p>
                      </div>
                      
                      {trip.pickupLocation && trip.pickupLocation.latitude && trip.pickupLocation.longitude && (
                        <Button 
                          variant="primary"
                          size="sm"
                          className="align-self-start p-1 px-2"
                          onClick={() => openDirections(trip.pickupLocation)}
                        >
                          <FontAwesomeIcon icon={faDirections} className="me-1" />
                          <span className="fs-7">Go</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Connection Line */}
                <div className="connection-line ms-4" style={{ height: '30px' }}></div>
                
                {/* Dropoff */}
                <div className="location-item d-flex">
                  <div className="location-time text-center me-2" style={{ width: '55px' }}>
                    <div className="time-badge rounded-pill px-2 py-1 bg-light border mb-1 fs-8">
                      {formatTime(trip.scheduled_dropoff)}
                    </div>
                    <div className="status-dot">
                      <div className="dot bg-danger"></div>
                    </div>
                  </div>
                  
                  <div className="location-details flex-grow-1 p-2 bg-light rounded-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="d-flex align-items-center mb-1 fs-7 fw-medium">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1 text-danger" />
                          Dropoff
                        </p>
                        <p className="mb-1 fs-7">
                          {trip.dropoffLocation ? (
                            <>
                              {trip.dropoffLocation.name && <strong className="d-block mb-1">{trip.dropoffLocation.name}</strong>}
                              {trip.dropoffLocation.street_address}, {trip.dropoffLocation.city}, {trip.dropoffLocation.state} {trip.dropoffLocation.zip}
                            </>
                          ) : (
                            'Address not available'
                          )}
                        </p>
                      </div>
                      
                      {trip.dropoffLocation && trip.dropoffLocation.latitude && trip.dropoffLocation.longitude && (
                        <Button 
                          variant="primary"
                          size="sm"
                          className="align-self-start p-1 px-2"
                          onClick={() => openDirections(trip.dropoffLocation)}
                        >
                          <FontAwesomeIcon icon={faDirections} className="me-1" />
                          <span className="fs-7">Go</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Odometer Readings Card with Update Buttons */}
      <Card className="mb-3 border-light shadow-sm rounded-3">
        <Card.Header className="bg-white py-3">
          <h6 className="mb-0">
            <FontAwesomeIcon icon={faTachometerAlt} className="me-2 text-primary" />
            Odometer Readings
          </h6>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col xs={6}>
              <div className="border rounded p-2">
                <small className="text-muted d-block">Pickup Odometer:</small>
                <span className="fw-medium">{trip.pickup_odometer ? `${trip.pickup_odometer} miles` : 'Not recorded'}</span>
              </div>
              {shouldShowOdometer(trip.status, 'pickup') && (
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="mt-2 w-100"
                  onClick={() => handleOdometerClick('pickup')}
                >
                  <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                  {trip.pickup_odometer ? 'Update Pickup Odometer' : 'Enter Pickup Odometer'}
                </Button>
              )}
            </Col>
            <Col xs={6}>
              <div className="border rounded p-2">
                <small className="text-muted d-block">Dropoff Odometer:</small>
                <span className="fw-medium">{trip.dropoff_odometer ? `${trip.dropoff_odometer} miles` : 'Not recorded'}</span>
              </div>
              {shouldShowOdometer(trip.status, 'dropoff') && (
                <Button 
                  variant="outline-success" 
                  size="sm" 
                  className="mt-2 w-100"
                  onClick={() => handleOdometerClick('dropoff')}
                >
                  <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                  {trip.dropoff_odometer ? 'Update Dropoff Odometer' : 'Enter Dropoff Odometer'}
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Signatures Card */}
      <Card className="mb-3 border-light shadow-sm rounded-3">
        <Card.Header className="bg-white py-3">
          <h6 className="mb-0">
            <FontAwesomeIcon icon={faSignature} className="me-2 text-primary" />
            Member Signature
          </h6>
        </Card.Header>
        <Card.Body>
          {trip?.Trip?.TripMember ? (
            <div>
              {trip.Trip.TripMember.signature ? (
                <div className="mb-3">
                  <div className="border p-3 mb-3 rounded">
                    <img 
                      src={trip.Trip.TripMember.signature} 
                      alt="Member Signature" 
                      className="img-fluid" 
                      style={{ maxHeight: '150px' }}
                    />
                  </div>
                  <p className="text-success mb-0">
                    <FontAwesomeIcon icon={faCheck} className="me-2" />
                    Member signature has been collected
                  </p>
                </div>
              ) : (
                <div className="text-center p-4 border rounded">
                  <p className="mb-3">Member signature is required to complete this trip.</p>
                  <SignaturePad
                    title="Member Signature"
                    onSave={handleMemberSignature}
                    buttonText="Collect Member Signature"
                    buttonVariant="primary"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted p-3">
              <p>Member information is not available.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Replace the status update buttons section with the StatusUpdateActions component */}
      {trip && (
        <StatusUpdateActions 
          currentStatus={trip.status}
          onStatusChange={handleStatusChange}
          isLoading={isLoading}
          buttonSize="md"
          showTitle={true}
          centerButtons={true}
        />
      )}
      
      {/* Odometer Reading Modal */}
      <Modal
        show={showOdometerModal}
        onHide={() => setShowOdometerModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {odometerType === 'pickup' ? 'Pickup Odometer Reading' : 'Dropoff Odometer Reading'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Please enter your vehicle's odometer reading
            </Form.Label>
            <Form.Control
              type="number"
              value={odometerReading}
              onChange={(e) => setOdometerReading(e.target.value)}
              placeholder="Miles"
              min="0"
              step="0.1"
              required
            />
            <Form.Text className="text-muted">
              Current reading from your vehicle's dashboard.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOdometerModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleOdometerSubmit}>
            Submit Reading
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TripDetail; 