import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spinner, Form, Badge, Button, Dropdown, Tabs, Tab, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faMapMarkerAlt, 
  faUser, 
  faInfoCircle, 
  faChevronRight, 
  faCalendarDay,
  faExchangeAlt,
  faEllipsisV,
  faDirections,
  faCalendarAlt,
  faCheck,
  faTimes,
  faTachometerAlt
} from '@fortawesome/free-solid-svg-icons';
//import { useAuth } from '../../contexts/AuthContext';
import { useDriverPanel } from '@/hooks/useDriverPanel';
import { format, parseISO, isToday, isAfter, isBefore, startOfDay } from 'date-fns';
import { toast } from 'react-toastify';
import '@/assets/css/DriverPanel.css';
import StatusUpdateActions from './StatusUpdateActions';

const DriverTrips = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [isLoading, setIsLoading] = useState(false);
  const [showOdometerModal, setShowOdometerModal] = useState(false);
  const [odometerReading, setOdometerReading] = useState('');
  const [odometerType, setOdometerType] = useState(''); // 'pickup' or 'dropoff'
  const [selectedLegId, setSelectedLegId] = useState(null);
  
  //const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Hardcoded user for temporary use - only using the ID
  const currentUserId = 11;

  // Use the driver panel hook
  const { 
    trips, 
    error, 
    loading,
    fetchTrips,
    updateTripLegStatus,
    updateTripLegOdometer
  } = useDriverPanel(currentUserId);

  useEffect(() => {
    setIsLoading(true);
    fetchTrips().finally(() => setIsLoading(false));
  }, [fetchTrips]);

  const handleTripDetails = (legId) => {
    navigate(`/driver-panel/trip-detail/${legId}`);
  };

  const handleStatusChange = async (legId, status) => {
    try {
      setIsLoading(true);
      await updateTripLegStatus(legId, status);
      
      // Refresh trips after status update - toast is handled in the hook
      fetchTrips(); 
    } catch (error) {
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
      
      // Refresh trips to show updated odometer
      fetchTrips();
    } catch (error) {
      console.error('Error updating odometer:', error);
      toast.error('Failed to update odometer reading');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAddress = (location) => {
    if (!location) return 'N/A';
    
    return `${location.street_address}, ${location.city}, ${location.state} ${location.zip}`;
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const openDirections = (location, e) => {
    if (e) e.stopPropagation();
    
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

  // Sort trips by date
  const sortedTrips = [...trips].sort((a, b) => {
    const dateA = a.Trip?.start_date ? new Date(a.Trip.start_date) : new Date(0);
    const dateB = b.Trip?.start_date ? new Date(b.Trip.start_date) : new Date(0);
    
    // First sort by date
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA - dateB;
    }
    
    // If same date, sort by pickup time
    const timeA = a.scheduled_pickup || '';
    const timeB = b.scheduled_pickup || '';
    return timeA.localeCompare(timeB);
  });

  // Filter trips based on active tab
  const today = startOfDay(new Date());
  
  const filteredTrips = sortedTrips.filter(trip => {
    const tripDate = trip.Trip?.start_date ? new Date(trip.Trip.start_date) : null;
    
    if (!tripDate) return false;
    
    if (activeTab === 'today') {
      return isToday(tripDate);
    } else if (activeTab === 'upcoming') {
      return isAfter(tripDate, today) && !isToday(tripDate);
    }
    
    return true;
  });

  // Group trips by date
  const tripsByDate = filteredTrips.reduce((groups, trip) => {
    if (!trip.Trip?.start_date) return groups;
    
    const dateKey = format(new Date(trip.Trip.start_date), 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(trip);
    return groups;
  }, {});

  // Function to determine if odometer entry should be shown
  const shouldShowOdometer = (status, type) => {
    if (type === 'pickup') {
      return ['Transport confirmed', 'Transport enroute', 'Picked up'].includes(status);
    } else if (type === 'dropoff') {
      return ['Picked up', 'Dropped off'].includes(status);
    }
    return false;
  };

  return (
    <div className="driver-trips-container">
      <div className="d-flex flex-column mb-3">
        <h5 className="d-flex align-items-center mb-3">
          <FontAwesomeIcon icon={faCalendarDay} className="me-2 text-primary" />
          My Trips
        </h5>
        
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3 trip-tabs"
        >
          <Tab eventKey="today" title="Today" />
          <Tab eventKey="upcoming" title="Upcoming" />
        </Tabs>
        
        <div className="d-flex align-items-center mb-2">
          <span className="text-muted fs-7">
            {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-3 rounded-3 shadow-sm fs-7">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center my-4">
          <Spinner animation="border" size="sm" variant="primary" />
          <p className="mt-2 text-muted small">Loading trips...</p>
        </div>
      )}

      {!isLoading && Object.keys(tripsByDate).length === 0 ? (
        <Card body className="text-center bg-light rounded-3 shadow-sm border-0 p-3">
          <div className="py-3">
            <FontAwesomeIcon icon={faCalendarDay} size="2x" className="text-muted mb-3" />
            <p className="mb-0 fs-7">
              No trips found.
            </p>
          </div>
        </Card>
      ) : (
        <div className="trip-list">
          {Object.entries(tripsByDate).map(([dateKey, dateTrips]) => (
            <div key={dateKey} className="mb-3">
              <h6 className="date-separator mb-2">
                <span className="bg-light px-3 py-1 rounded-pill">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-muted" />
                  {formatDate(dateKey)}
                </span>
              </h6>
              
              {dateTrips.map((tripLeg) => (
                <Card 
                  key={tripLeg.leg_id} 
                  className="trip-card"
                >
                  <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom border-light py-2 px-3">
                    <div className="d-flex align-items-center">
                      <Badge bg={getStatusBadgeClass(tripLeg.status)} className="status-badge me-2">
                        {tripLeg.status || 'Scheduled'}
                      </Badge>
                      <div className="fs-7">
                        <span className="fw-medium">Trip #{tripLeg.Trip?.trip_id}</span>
                        <span className="text-muted ms-1 small">Leg #{tripLeg.sequence}</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        className="p-1 border-0"
                        onClick={() => handleTripDetails(tripLeg.leg_id)}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} className="text-muted fs-7" />
                      </Button>
                    </div>
                  </Card.Header>
                  
                  <Card.Body onClick={() => handleTripDetails(tripLeg.leg_id)} 
                    style={{ cursor: 'pointer' }} className="py-2 px-3">
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar-circle bg-primary text-white me-2">
                        <FontAwesomeIcon icon={faUser} className="fs-7" />
                      </div>
                      <div>
                        <p className="mb-0 fw-medium fs-7">
                          {tripLeg.Trip?.TripMember?.first_name} {tripLeg.Trip?.TripMember?.last_name}
                        </p>
                        <p className="text-muted mb-0 fs-8">
                          <FontAwesomeIcon icon={faClock} className="me-1" />
                          {formatTime(tripLeg.scheduled_pickup)} - {formatTime(tripLeg.scheduled_dropoff)}
                        </p>
                      </div>
                    </div>
                    
                    <Row className="g-3">
                      <Col xs={12}>
                        <div className="location-item p-2 rounded-3 bg-light">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <p className="mb-1 fs-8 text-uppercase text-muted fw-medium">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1 text-primary" />
                                Pickup
                              </p>
                              <p className="text-muted small mb-0 fs-8 text-truncate">
                                {renderAddress(tripLeg.pickupLocation)}
                              </p>
                            </div>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="rounded-circle p-1 border-0 ms-1"
                              onClick={(e) => openDirections(tripLeg.pickupLocation, e)}
                            >
                              <FontAwesomeIcon icon={faDirections} className="fs-8" />
                            </Button>
                          </div>
                        </div>
                      </Col>
                      
                      <Col xs={12}>
                        <div className="location-item p-2 rounded-3 bg-light">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <p className="mb-1 fs-8 text-uppercase text-muted fw-medium">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1 text-danger" />
                                Dropoff
                              </p>
                              <p className="text-muted small mb-0 fs-8 text-truncate">
                                {renderAddress(tripLeg.dropoffLocation)}
                              </p>
                            </div>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="rounded-circle p-1 border-0 ms-1"
                              onClick={(e) => openDirections(tripLeg.dropoffLocation, e)}
                            >
                              <FontAwesomeIcon icon={faDirections} className="fs-8" />
                            </Button>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Odometer Readings Display */}
                    {(tripLeg.pickup_odometer || tripLeg.dropoff_odometer) && (
                      <div className="mt-2 p-2 bg-light rounded-3">
                        <p className="mb-1 fs-8 fw-medium">Odometer Readings:</p>
                        <div className="d-flex flex-wrap gap-2">
                          {tripLeg.pickup_odometer !== null && (
                            <div className="small text-muted">
                              <FontAwesomeIcon icon={faTachometerAlt} className="me-1 text-primary" />
                              Pickup: {tripLeg.pickup_odometer} miles
                            </div>
                          )}
                          {tripLeg.dropoff_odometer !== null && (
                            <div className="small text-muted">
                              <FontAwesomeIcon icon={faTachometerAlt} className="me-1 text-success" />
                              Dropoff: {tripLeg.dropoff_odometer} miles
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Status Action Buttons */}
                    <div className="mt-3 pt-2 border-top" onClick={e => e.stopPropagation()}>
                      <StatusUpdateActions 
                        currentStatus={tripLeg.status}
                        onStatusChange={(status) => handleStatusChange(tripLeg.leg_id, status)}
                        isLoading={isLoading}
                      />
                    </div>

                    {/* Odometer Entry Buttons */}
                    <div className="mt-3 pt-2 border-top" onClick={e => e.stopPropagation()}>
                      <p className="fs-8 text-muted mb-2">Odometer Readings:</p>
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
                </Card>
              ))}
            </div>
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

export default DriverTrips; 