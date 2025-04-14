import React, { useState, useEffect } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEye, faUser, faArrowDown, faArrowUp, faCheck } from '@fortawesome/free-solid-svg-icons';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import TripStatusPopup from '../TripStatusPopup';
import TripTimePopup from '../TripTimePopup';
import DriverAssignPopup from '../DriverAssignPopup';
import { useDriver } from '@/hooks/useDriver';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import '@/assets/TripManagement.css';

const NewTripManagementTable = ({ 
  trips, 
  onEdit,
  onView,
  isLoading,
  onUpdateStatus,
  onUpdateTime,
  onAddLeg
}) => {
  // State for managing the popups
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [showTimePopup, setShowTimePopup] = useState(false);
  const [showDriverPopup, setShowDriverPopup] = useState(false);
  const [selectedLeg, setSelectedLeg] = useState(null);
  const [timeType, setTimeType] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDriverId, setCurrentDriverId] = useState('');

  // Get driver functionality from hook
  const { assignDriverToLeg, loading: driverLoading, error: driverError } = useDriver();

  // Add console log to debug the API data
  useEffect(() => {
    console.log('Trip data from API:', trips);
  }, [trips]);

  // Log any driver errors
  useEffect(() => {
    if (driverError) {
      console.error('Driver service error:', driverError);
    }
  }, [driverError]);

  const handleStatusClick = (leg, status) => {
    setSelectedLeg(leg);
    setCurrentStatus(status);
    setShowStatusPopup(true);
  };

  const handleTimeClick = (leg, type, time) => {
    setSelectedLeg(leg);
    setTimeType(type);
    setCurrentTime(time);
    setShowTimePopup(true);
  };

  const handleDriverClick = (leg) => {
    setSelectedLeg(leg);
    setCurrentDriverId(leg.driver_id || '');
    setShowDriverPopup(true);
  };

  const handleStatusSubmit = (status) => {
    if (selectedLeg && status) {
      onUpdateStatus(selectedLeg.leg_id, status);
    }
    setShowStatusPopup(false);
  };

  const handleTimeSubmit = (time) => {
    if (selectedLeg && time) {
      onUpdateTime(selectedLeg.leg_id, timeType, time);
    }
    setShowTimePopup(false);
  };

  const handleDriverSubmit = async (legId, driverId) => {
    try {
      console.log('Assigning driver to leg:', { legId, driverId });
      await assignDriverToLeg(legId, driverId);
      // Refresh trips data after assigning driver
      if (onUpdateStatus) {
        // Trigger a refresh by updating status with the same value
        // This is a workaround to refresh data without adding a new function
        const currentLeg = trips
          .flatMap(trip => trip.legs || [])
          .find(leg => leg.leg_id === legId);
          
        if (currentLeg) {
          onUpdateStatus(legId, currentLeg.status || 'Scheduled');
        }
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Failed to assign driver. Please try again.');
    } finally {
      setShowDriverPopup(false);
    }
  };

  // Helper to format the time display
  const formatTime = (time) => {
    if (!time) return '';
    return dayjs(time, 'HH:mm').format('HH:mm');
  };

  // Helper to parse time as minutes for comparison
  const parseTimeAsMinutes = (timeString) => {
    if (!timeString) return null;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 60) + minutes;
  };

  // Helper to determine time comparison class (early, on-time, late)
  const getTimeComparisonClass = (scheduledTime, actualTime) => {
    if (!scheduledTime || !actualTime) return '';
    
    const scheduledMinutes = parseTimeAsMinutes(scheduledTime);
    const actualMinutes = parseTimeAsMinutes(actualTime);
    
    if (scheduledMinutes === null || actualMinutes === null) return '';
    
    // If actual time is more than 5 minutes earlier than scheduled
    if (actualMinutes < scheduledMinutes - 5) {
      return 'time-early';
    }
    
    // If actual time is within 5 minutes of scheduled time
    if (actualMinutes >= scheduledMinutes - 5 && actualMinutes <= scheduledMinutes + 5) {
      return 'time-on-time';
    }
    
    // If actual time is more than 5 minutes later than scheduled
    return 'time-late';
  };

  // Helper to get time status icon based on comparison
  const getTimeStatusIcon = (scheduledTime, actualTime) => {
    if (!scheduledTime || !actualTime) return null;
    
    const scheduledMinutes = parseTimeAsMinutes(scheduledTime);
    const actualMinutes = parseTimeAsMinutes(actualTime);
    
    if (scheduledMinutes === null || actualMinutes === null) return null;
    
    // If actual time is more than 5 minutes earlier than scheduled
    if (actualMinutes < scheduledMinutes - 5) {
      return <FontAwesomeIcon icon={faArrowDown} className="ms-1 text-success" title="Early" />;
    }
    
    // If actual time is within 5 minutes of scheduled time
    if (actualMinutes >= scheduledMinutes - 5 && actualMinutes <= scheduledMinutes + 5) {
      return <FontAwesomeIcon icon={faCheck} className="ms-1 text-primary" title="On Time" />;
    }
    
    // If actual time is more than 5 minutes later than scheduled
    return <FontAwesomeIcon icon={faArrowUp} className="ms-1 text-danger" title="Late" />;
  };

  // Helper to determine background color based on trip status
  const getStatusBackground = (status) => {
    if (!status) return 'bg-light';
    
    switch (status.toLowerCase()) {
      case 'dropped off':
        return 'bg-success';
      case 'not going':
        return 'bg-info';
      case 'cancelled':
        return 'bg-secondary';
      case 'transport enroute':
        return 'bg-warning';
      case 'picked up':
        return 'bg-primary';
      case 'attention':
        return 'bg-danger';
      case 'scheduled':
        return 'bg-light';
      case 'confirmed':
        return 'bg-teal';
      case 'waiting':
        return 'bg-orange';
      case 'no show':
        return 'bg-dark';
      case 'incomplete':
        return 'bg-purple';
      default:
        return 'bg-light';
    }
  };

  // Function to render the table rows
  const renderTableRows = () => {
    let rows = [];
    
    trips.forEach((trip) => {
      // If the trip has legs, show them
      const legs = trip.legs || [];
      
      // Sort legs by sequence
      const sortedLegs = [...legs].sort((a, b) => a.sequence - b.sequence);
      
      // Get program name from TripMember.Program if available
      const programName = trip.TripMember?.Program?.program_name || 'N/A';
      
      // Get client name
      const clientName = trip.TripMember ? `${trip.TripMember.first_name} ${trip.TripMember.last_name}` : 'N/A';
      
      // Render each leg as a separate row
      sortedLegs.forEach((leg, index) => {
        // Get time comparison classes
        const pickupTimeClass = getTimeComparisonClass(leg.scheduled_pickup, leg.actual_pickup);
        const dropoffTimeClass = getTimeComparisonClass(leg.scheduled_dropoff, leg.actual_dropoff);
        
        // Get status class
        const statusClass = getStatusBackground(leg.status);
        
        // Get phone number from TripMember if available, otherwise try pickupLocation
        const phoneNumber = trip.TripMember?.phone || leg.pickupLocation?.phone || 'N/A';
        
        // Determine if this is the first leg in a trip
        const isFirstLeg = index === 0;
        
        rows.push(
          <tr 
            key={`${trip.trip_id}-leg-${leg.leg_id}`} 
            className={`${isFirstLeg ? 'trip-start' : 'trip-continuation'}`}
          >
            <td className={`trip-id-cell ${!isFirstLeg ? 'continuation-leg-cell' : 'first-leg-cell'}`}>
              {isFirstLeg ? trip.trip_id : ''}
              <span className="leg-sequence">#{leg.sequence}</span>
            </td>
            <td className={statusClass}>{programName}</td>
            <td className={statusClass}>{clientName}</td>
            <td className={statusClass}>{phoneNumber}</td>
            <td className={statusClass}>
              {leg.pickupLocation ? 
                `${leg.pickupLocation.street_address}, ${leg.pickupLocation.city}, ${leg.pickupLocation.state} ${leg.pickupLocation.zip}` 
                : 'N/A'
              }
            </td>
            <td 
              className={`time-cell clickable`} 
              onClick={() => handleTimeClick(leg, 'R/U', leg.scheduled_pickup)}
            >
              {formatTime(leg.scheduled_pickup)}
            </td>
            <td 
              className={`time-cell clickable ${pickupTimeClass}`} 
              onClick={() => handleTimeClick(leg, 'P/U', leg.actual_pickup)}
            >
              {formatTime(leg.actual_pickup)}
              {getTimeStatusIcon(leg.scheduled_pickup, leg.actual_pickup)}
            </td>
            <td 
              className={`time-cell clickable`} 
              onClick={() => handleTimeClick(leg, 'APPT', leg.scheduled_dropoff)}
            >
              {formatTime(leg.scheduled_dropoff)}
            </td>
            <td 
              className={`time-cell clickable ${dropoffTimeClass}`} 
              onClick={() => handleTimeClick(leg, 'D/O', leg.actual_dropoff)}
            >
              {formatTime(leg.actual_dropoff)}
              {getTimeStatusIcon(leg.scheduled_dropoff, leg.actual_dropoff)}
            </td>
            <td 
              className={`driver-cell clickable ${statusClass}`} 
              onClick={() => handleDriverClick(leg)}
              title="Click to assign driver"
            >
              {leg.driver ? `${leg.driver.first_name} ${leg.driver.last_name}` : <FontAwesomeIcon icon={faUser} className="text-muted" />}
            </td>
            <td 
              className={`status-cell clickable ${statusClass}`} 
              onClick={() => handleStatusClick(leg, leg.status)}
            >
              {leg.status || 'Scheduled'}
            </td>
            <td className={statusClass}>
              {leg.dropoffLocation ? 
                `${leg.dropoffLocation.street_address}, ${leg.dropoffLocation.city}, ${leg.dropoffLocation.state} ${leg.dropoffLocation.zip}${leg.dropoffLocation.phone ? ` • Ph: ${leg.dropoffLocation.phone}` : ''}` 
                : 'N/A'
              }
            </td>
            <td className="action-cell">

              <Button 
                variant="outline-primary"
                size="sm"
                onClick={() => onView(trip)}
                className="action-btn action-btn-view"
                title="View trip details"
              >
                <FontAwesomeIcon icon={faEye} />
              </Button>
            </td>
          </tr>
        );
      });
      
      // Add a button row for adding a new leg if needed
      if (onAddLeg) {
        rows.push(
          <tr key={`${trip.trip_id}-add-leg`} className="add-leg-row">
            <td colSpan="13" className="text-center py-2">
              <Button 
                variant="outline-success"
                size="sm"
                onClick={() => onAddLeg(trip)}
                className="add-leg-btn"
                title="Add a new leg to this trip"
              >
                + Add Leg
              </Button>
            </td>
          </tr>
        );
      }
    });
    
    return rows;
  };

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading trip data...</p>
      </div>
    );
  }

  return (
    <div className="trip-management-table">
      <div className="table-responsive">
        <Table hover responsive className="mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Clinic</th>
              <th>Client</th>
              <th>Phone</th>
              <th>Pickup Address</th>
              <th>R/U</th>
              <th>P/U</th>
              <th>APPT</th>
              <th>D/O</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Drop Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {trips.length > 0 ? (
              renderTableRows()
            ) : (
              <tr>
                <td colSpan="13" className="text-center py-4">
                  No trips found. Create a new trip or modify your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Status Popup */}
      {showStatusPopup && (
        <RightSidebarPopup
          show={showStatusPopup}
          title="Trip Status"
          onClose={() => setShowStatusPopup(false)}
        >
          <TripStatusPopup 
            onSubmit={handleStatusSubmit}
            onClose={() => setShowStatusPopup(false)}
            currentStatus={currentStatus}
          />
        </RightSidebarPopup>
      )}

      {/* Time Popup */}
      {showTimePopup && (
        <RightSidebarPopup
          show={showTimePopup}
          title="Update Time"
          onClose={() => setShowTimePopup(false)}
        >
          <TripTimePopup 
            onSubmit={handleTimeSubmit}
            onClose={() => setShowTimePopup(false)}
            timeType={timeType}
            currentTime={currentTime}
          />
        </RightSidebarPopup>
      )}

      {/* Driver Popup */}
      {showDriverPopup && selectedLeg && (
        <RightSidebarPopup
          show={showDriverPopup}
          title="Assign Driver"
          onClose={() => setShowDriverPopup(false)}
        >
          <DriverAssignPopup 
            onSubmit={handleDriverSubmit}
            onClose={() => setShowDriverPopup(false)}
            legId={selectedLeg.leg_id}
            currentDriverId={currentDriverId}
          />
        </RightSidebarPopup>
      )}
    </div>
  );
};

export default NewTripManagementTable; 