import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Button, Spinner, Form, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarDay, 
  faClock, 
  faMapMarkerAlt, 
  faUser, 
  faDirections, 
  faEye,
  faChevronRight,
  faCheckCircle,
  faExclamationTriangle,
  faEllipsisV,
  faCheck,
  faTimes,
  faExchangeAlt,
  faTachometerAlt
} from '@fortawesome/free-solid-svg-icons';
//import { useAuth } from '../../contexts/AuthContext';
import { useDriverPanel } from '@/hooks/useDriverPanel';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import '@/assets/css/DriverPanel.css';

const TodayTrips = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOdometerModal, setShowOdometerModal] = useState(false);
  const [odometerReading, setOdometerReading] = useState('');
  const [odometerType, setOdometerType] = useState(''); // 'pickup' or 'dropoff'
  const [selectedLegId, setSelectedLegId] = useState(null);
  //const { currentUser } = useAuth();
  
  // Hardcoded user for temporary use - only using the ID
  const currentUserId = 11;
  
  // Allowed statuses for trips
  const allowedStatuses = [
    'Assigned',
    'Transport confirmed',
    'Transport enroute',
    'Picked up',
    'Not going',
    'Not available',
    'Dropped off'
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
  
  // Use the driver panel hook
  const { 
    todayTrips, 
    error, 
    fetchTodayTrips,
    updateTripLegStatus,
    updateTripLegOdometer
  } = useDriverPanel(currentUserId);

  useEffect(() => {
    setIsLoading(true);
    fetchTodayTrips().finally(() => setIsLoading(false));
  }, [fetchTodayTrips]);

  const handleViewDetails = (legId) => {
    navigate(`/driver-panel/trip-detail/${legId}`);
  };

  const handleStatusChange = async (legId, status) => {
    try {
      setIsLoading(true);
      await updateTripLegStatus(legId, status);
      
      // Show success toast message based on status
      let message = '';
      let toastType = 'success';
      
      switch(status) {
        case 'Transport confirmed':
          message = 'Trip confirmed successfully';
          break;
        case 'Transport enroute':
          message = 'You are now en route to pickup';
          break;
        case 'Picked up':
          message = 'Passenger picked up successfully. You\'ve been clocked in.';
          break;
        case 'Dropped off':
          message = 'Trip completed successfully. You\'ve been clocked out.';
          break;
        case 'Not going':
          message = 'Trip marked as not going';
          toastType = 'warning';
          break;
        case 'Not available':
          message = 'Passenger marked as not available';
          toastType = 'warning';
          break;
        default:
          message = `Status updated to ${status}`;
      }
      
      toast[toastType](message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      
      fetchTodayTrips(); // Refresh trips after status update
    } catch (error) {
      toast.error('Failed to update status. Please try again.', {
        position: "top-center"
      });
      console.error('Status update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOdometerClick = (legId, type) => {
    setOdometerType(type);
    setSelectedLegId(legId);
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
        await updateTripLegOdometer(selectedLegId, reading, null);
      } else {
        await updateTripLegOdometer(selectedLegId, null, reading);
      }
      
      // Close modal
      setShowOdometerModal(false);
      setOdometerReading('');
      setSelectedLegId(null);
      
      // Success message
      toast.success(`${odometerType.charAt(0).toUpperCase() + odometerType.slice(1)} odometer reading updated successfully`);
      
      // Refresh trips to show updated odometer
      fetchTodayTrips();
    } catch (error) {
      console.error('Error updating odometer:', error);
      toast.error('Failed to update odometer reading');
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

  const getPreviousStatus = (currentStatus) => {
    // Since we don't want to transition backward
    return null;
  };

  const getNextStatuses = (currentStatus) => {
    return statusProgression[currentStatus] || [];
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // Parse time (HH:MM:SS format)
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return format(date, 'h:mm a');
  };

  const getAddressString = (location) => {
    if (!location) return 'Address not available';
    return `${location.street_address}, ${location.city}, ${location.state} ${location.zip}`;
  };

  const formatMemberName = (trip) => {
    if (!trip || !trip.Trip || !trip.Trip.TripMember) return 'Unknown';
    const { first_name, last_name } = trip.Trip.TripMember;
    return `${first_name} ${last_name}`;
  };
  
  // Helper function to get status badge class
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

  if (error) {
    return <div className="alert alert-danger my-3 rounded-3 shadow-sm">{error}</div>;
  }

  return (
    <div className="today-trips-container">
      <div className="d-flex align-items-center mb-4">
        <FontAwesomeIcon icon={faCalendarDay} className="me-3 text-primary" size="lg" />
        <div>
          <h4 className="mb-1 fw-bold">Today's Trips</h4>
          <p className="text-muted mb-0 small">
            {todayTrips.length ? 
              `You have ${todayTrips.length} trip${todayTrips.length !== 1 ? 's' : ''} scheduled for today.` : 
              'No trips scheduled for today'}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted small">Loading trips...</p>
        </div>
      )}

      {!isLoading && todayTrips.length === 0 ? (
        <Card body className="text-center bg-light rounded-3 shadow-sm border-0 p-4">
          <div className="py-4">
            <div className="mb-3 text-muted">
              <FontAwesomeIcon icon={faCalendarDay} size="3x" />
            </div>
            <h5 className="mb-2">No Trips Today</h5>
            <p className="text-muted mb-0">You don't have any trips scheduled for today.</p>
          </div>
        </Card>
      ) : (
        <div className="trip-list">
          {todayTrips.map((tripLeg, index) => (
            <Card 
              key={tripLeg.leg_id || index} 
              className="trip-card"
            >
              <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom-0 pt-3 px-3 pb-0">
                <Badge bg={getStatusBadgeClass(tripLeg.status)} className="status-badge">
                  {tripLeg.status || 'Scheduled'}
                </Badge>
                <div className="d-flex align-items-center">
                  <p className="text-muted small mb-0 me-2">
                    Trip #{tripLeg.Trip.trip_id} <span className="mx-1">•</span> Leg #{tripLeg.sequence}
                  </p>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="border-0 p-1 rounded-circle"
                    onClick={() => handleViewDetails(tripLeg.id)}
                  >
                    <FontAwesomeIcon icon={faEye} className="text-primary" />
                  </Button>
                </div>
              </Card.Header>
              
              <Card.Body className="p-3">
                <Row className="g-3">
                  <Col md={4}>
                    <div className="d-flex align-items-center">
                      <div className="avatar-circle bg-primary text-white me-2">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                      <div>
                        <p className="mb-0 fw-medium">{formatMemberName(tripLeg)}</p>
                        <p className="text-muted mb-0 small">
                          <FontAwesomeIcon icon={faClock} className="me-1" />
                          {formatTime(tripLeg.scheduled_pickup)} - {formatTime(tripLeg.scheduled_dropoff)}
                        </p>
                      </div>
                    </div>
                  </Col>
                  
                  <Col md={4}>
                    <div className="location-item">
                      <p className="text-uppercase text-muted small mb-1 fw-medium">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1 text-primary" />
                        Pickup
                      </p>
                      <p className="mb-1 small">{getAddressString(tripLeg.pickupLocation)}</p>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="mt-1 py-1"
                        onClick={() => openDirections(tripLeg.pickupLocation)}
                      >
                        <FontAwesomeIcon icon={faDirections} className="me-1" />
                        Directions
                      </Button>
                    </div>
                  </Col>
                  
                  <Col md={4}>
                    <div className="location-item">
                      <p className="text-uppercase text-muted small mb-1 fw-medium">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1 text-danger" />
                        Dropoff
                      </p>
                      <p className="mb-1 small">{getAddressString(tripLeg.dropoffLocation)}</p>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="mt-1 py-1"
                        onClick={() => openDirections(tripLeg.dropoffLocation)}
                      >
                        <FontAwesomeIcon icon={faDirections} className="me-1" />
                        Directions
                      </Button>
                    </div>
                  </Col>
                </Row>
                
                {/* Odometer Readings Display */}
                {(tripLeg.pickup_odometer || tripLeg.dropoff_odometer) && (
                  <div className="border-top pt-2 mt-2">
                    <small className="text-muted d-block mb-1">Odometer Readings:</small>
                    <div className="d-flex gap-2 flex-wrap">
                      {tripLeg.pickup_odometer && (
                        <span className="badge bg-light text-dark border">
                          <FontAwesomeIcon icon={faTachometerAlt} className="me-1 text-primary" />
                          Pickup: {tripLeg.pickup_odometer} miles
                        </span>
                      )}
                      {tripLeg.dropoff_odometer && (
                        <span className="badge bg-light text-dark border">
                          <FontAwesomeIcon icon={faTachometerAlt} className="me-1 text-success" />
                          Dropoff: {tripLeg.dropoff_odometer} miles
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Status Action Buttons */}
                {getNextStatuses(tripLeg.status).length > 0 && (
                  <div className="mt-3 pt-3 border-top">
                    <p className="small text-muted mb-2">Update Status:</p>
                    <div className="d-flex flex-wrap status-action-buttons gap-2">
                      {getNextStatuses(tripLeg.status).map(nextStatus => {
                        // Define different button styles based on the status type
                        let btnVariant, btnIcon, btnLabel, btnClass;
                        
                        if (nextStatus === 'Dropped off') {
                          btnVariant = 'success';
                          btnIcon = faCheck;
                          btnLabel = 'Dropped Off';
                          btnClass = 'status-btn-success';
                        } else if (nextStatus === 'Not going') {
                          btnVariant = 'danger';
                          btnIcon = faTimes;
                          btnLabel = 'Not Going';
                          btnClass = 'status-btn-danger';
                        } else if (nextStatus === 'Not available') {
                          btnVariant = 'danger';
                          btnIcon = faTimes;
                          btnLabel = 'Not Available';
                          btnClass = 'status-btn-danger';
                        } else if (nextStatus === 'Transport confirmed') {
                          btnVariant = 'primary';
                          btnIcon = faCheck;
                          btnLabel = 'Confirm';
                          btnClass = 'status-btn-primary';
                        } else if (nextStatus === 'Transport enroute') {
                          btnVariant = 'primary';
                          btnIcon = faDirections;
                          btnLabel = 'En Route';
                          btnClass = 'status-btn-primary';
                        } else if (nextStatus === 'Picked up') {
                          btnVariant = 'primary';
                          btnIcon = faUser;
                          btnLabel = 'Picked Up';
                          btnClass = 'status-btn-primary';
                        }
                        
                        return (
                          <Button
                            key={nextStatus}
                            variant={btnVariant}
                            size="sm"
                            className={`py-1 px-3 rounded-pill ${btnClass}`}
                            onClick={() => handleStatusChange(tripLeg.id, nextStatus)}
                            disabled={isLoading}
                          >
                            <div className="d-flex align-items-center">
                              <div className="status-icon-circle me-2">
                                <FontAwesomeIcon icon={btnIcon} className="small" />
                              </div>
                              <span>{btnLabel}</span>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Odometer Entry Buttons */}
                <div className="mt-3 pt-2 border-top">
                  <p className="small text-muted mb-2">Odometer Readings:</p>
                  <div className="d-flex flex-wrap gap-2">
                    {shouldShowOdometer(tripLeg.status, 'pickup') && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="py-1 px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOdometerClick(tripLeg.leg_id, 'pickup');
                        }}
                      >
                        <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                        {tripLeg.pickup_odometer !== null ? 'Update Pickup Odometer' : 'Enter Pickup Odometer'}
                      </Button>
                    )}
                    
                    {shouldShowOdometer(tripLeg.status, 'dropoff') && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="py-1 px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOdometerClick(tripLeg.leg_id, 'dropoff');
                        }}
                      >
                        <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                        {tripLeg.dropoff_odometer !== null ? 'Update Dropoff Odometer' : 'Enter Dropoff Odometer'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
              
              <Card.Footer className="bg-white border-top-0 px-3 pb-3 pt-0">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="w-100 rounded-pill"
                  onClick={() => handleViewDetails(tripLeg.id)}
                >
                  <FontAwesomeIcon icon={faEye} className="me-1" />
                  View Details
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </div>
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
            {odometerType === 'pickup' ? 'Enter Pickup Odometer Reading' : 'Enter Dropoff Odometer Reading'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              {odometerType === 'pickup' 
                ? 'Please enter the vehicle odometer reading at pickup location'
                : 'Please enter the vehicle odometer reading at dropoff location'
              }
            </Form.Label>
            <Form.Control
              type="number"
              value={odometerReading}
              onChange={(e) => setOdometerReading(e.target.value)}
              placeholder="Enter odometer reading (miles)"
              min="0"
              step="0.1"
              required
            />
            <Form.Text className="text-muted">
              Enter the current odometer reading from your vehicle.
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

export default TodayTrips; 