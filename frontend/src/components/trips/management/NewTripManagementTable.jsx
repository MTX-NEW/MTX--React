import React, { useState, useEffect } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEye, faUser, faArrowDown, faArrowUp, faCheck, faSortDown, faSortUp, faSort } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import TripStatusPopup from '../TripStatusPopup';
import TripTimePopup from '../TripTimePopup';
import DriverAssignPopup from '../DriverAssignPopup';
import { useDriver } from '@/hooks/useDriver';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import '@/assets/TripManagement.css';
import 'react-tooltip/dist/react-tooltip.css';

const NewTripManagementTable = ({ 
  trips, 
  onEdit,
  onView,
  isLoading,
  onUpdateStatus,
  onUpdateTime,
  onAddLeg,
  driversData
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
  // Sorting state
  const [sortConfig, setSortConfig] = useState([]);

  // Get driver functionality from hook
  const { assignDriverToLeg, loading: driverLoading, error: driverError } = useDriver();

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
      console.log(`Assigning driver ${driverId} to leg ${legId}`);
      
      // Call optimistic update through the parent component
      // No need to try to get driver info here, TripManagement component will handle that
      if (onUpdateStatus) {
        onUpdateStatus(legId, { 
          type: 'driver',
          driverId: driverId
        });
      }
      
      // In parallel, make the actual API call
      await assignDriverToLeg(legId, driverId);
      
      // Show success message
      toast.success(`Driver ${driverId ? 'assigned' : 'removed'} successfully`);
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Failed to assign driver. Please try again.');
      
      // On error, refresh the data to recover
      if (onUpdateStatus) {
        onUpdateStatus(legId, 'refresh');
      }
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

  // Helper to get program initials
  const getProgramInitials = (programName) => {
    if (!programName || programName === 'N/A') return 'N/A';
    
    return programName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  // Sorting functions
  const handleSort = (column) => {
    // Check if the column is already in sort config
    const existingIndex = sortConfig.findIndex(item => item.column === column);
    let newSortConfig = [...sortConfig];

    if (existingIndex !== -1) {
      // If it's already the first one and not desc, toggle direction
      if (existingIndex === 0) {
        if (newSortConfig[0].direction === 'asc') {
          newSortConfig[0].direction = 'desc';
        } else {
          // If already desc, remove it from sort
          newSortConfig.splice(0, 1);
        }
      } else {
        // If not the first one, move it to first position and set to asc
        const item = newSortConfig.splice(existingIndex, 1)[0];
        item.direction = 'asc';
        newSortConfig.unshift(item);
      }
    } else {
      // If not in config, add it as first with asc direction
      newSortConfig.unshift({ column, direction: 'asc' });
    }

    // Only keep up to 3 sort columns
    if (newSortConfig.length > 3) {
      newSortConfig = newSortConfig.slice(0, 3);
    }

    setSortConfig(newSortConfig);
  };

  // Get sort direction for a column
  const getSortDirection = (column) => {
    const index = sortConfig.findIndex(item => item.column === column);
    if (index === -1) return null;
    return sortConfig[index].direction;
  };

  // Get sort indicator icon for a column
  const getSortIcon = (column) => {
    const direction = getSortDirection(column);
    if (!direction) return <FontAwesomeIcon icon={faSort} className="ms-1 text-muted" />;
    return direction === 'asc' 
      ? <FontAwesomeIcon icon={faSortUp} className="ms-1" /> 
      : <FontAwesomeIcon icon={faSortDown} className="ms-1" />;
  };

  // Sort trips and legs by the configuration
  const getSortedTripsWithLegs = () => {
    if (sortConfig.length === 0) return trips;

    // Create a copy of trips to sort
    let sortedTrips = [...trips];

    // Map to store trip ID -> trip for easy lookup
    const tripsMap = new Map();
    sortedTrips.forEach(trip => tripsMap.set(trip.trip_id, trip));

    // Flatten trips into legs with trip info
    let legsWithTripInfo = [];
    sortedTrips.forEach(trip => {
      const legs = trip.legs || [];
      legs.forEach(leg => {
        legsWithTripInfo.push({
          ...leg,
          tripId: trip.trip_id,
          programName: trip.TripMember?.Program?.program_name || 'N/A',
          clientName: trip.TripMember ? `${trip.TripMember.first_name} ${trip.TripMember.last_name}` : 'N/A',
          phoneNumber: trip.TripMember?.phone || leg.pickupLocation?.phone || 'N/A',
        });
      });
    });

    // Sort legs based on sortConfig
    legsWithTripInfo.sort((a, b) => {
      // Apply each sort config in order
      for (const { column, direction } of sortConfig) {
        let comparison = 0;
        
        switch (column) {
          case 'tripId':
            // Compare numeric trip IDs
            comparison = a.tripId - b.tripId;
            break;
          case 'scheduledPickup':
            // Compare pickup times as minutes
            const aPickup = parseTimeAsMinutes(a.scheduled_pickup) || 0;
            const bPickup = parseTimeAsMinutes(b.scheduled_pickup) || 0;
            comparison = aPickup - bPickup;
            break;
          case 'scheduledDropoff':
            // Compare dropoff times as minutes
            const aDropoff = parseTimeAsMinutes(a.scheduled_dropoff) || 0;
            const bDropoff = parseTimeAsMinutes(b.scheduled_dropoff) || 0;
            comparison = aDropoff - bDropoff;
            break;
          default:
            comparison = 0;
        }
        
        // If this criteria yields a difference, return the result with direction applied
        if (comparison !== 0) {
          return direction === 'asc' ? comparison : -comparison;
        }
      }
      
      // If all criteria are equal, maintain original order by sequence
      return a.sequence - b.sequence;
    });

    // Rebuild trips from sorted legs
    const sortedTripsMap = new Map();
    
    legsWithTripInfo.forEach(leg => {
      const tripId = leg.tripId;
      
      if (!sortedTripsMap.has(tripId)) {
        // Create a new trip entry with the original trip data
        sortedTripsMap.set(tripId, {
          ...tripsMap.get(tripId),
          legs: []
        });
      }
      
      // Add this leg to the trip's legs
      sortedTripsMap.get(tripId).legs.push(leg);
    });
    
    // Convert map back to array
    return Array.from(sortedTripsMap.values());
  };

  // Function to render the table rows
  const renderTableRows = () => {
    let rows = [];
    const sortedTrips = getSortedTripsWithLegs();
    
    sortedTrips.forEach((trip) => {
      // If the trip has legs, show them
      const legs = trip.legs || [];
      
      // Sort legs by sequence
      const sortedLegs = [...legs].sort((a, b) => a.sequence - b.sequence);
      
      // Get program name from TripMember.Program if available
      const programName = trip.TripMember?.Program?.program_name || 'N/A';
      const programInitials = getProgramInitials(programName);
      
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
            <td 
              className={`clinic-cell ${statusClass}`} 
              data-tooltip-id={`clinic-tooltip-${trip.trip_id}-${leg.leg_id}`}
            >
              {programInitials}
            </td>
            <td className={statusClass}>{clientName}</td>
            <td className={statusClass}>{phoneNumber}</td>
            <td 
              className={statusClass}
              data-tooltip-id={`pickup-address-tooltip-${leg.leg_id}`}
            >
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
              data-tooltip-id={`driver-tooltip-${leg.leg_id}`}
            >
              {leg.driver ? (
                <span className="driver-id">#{leg.driver.id}</span>
              ) : (
                <FontAwesomeIcon icon={faUser} className="text-muted" />
              )}
            </td>
            <td 
              className={`status-cell clickable ${statusClass}`} 
              onClick={() => handleStatusClick(leg, leg.status)}
            >
              {leg.status || 'Scheduled'}
            </td>
            <td 
              className={statusClass}
              data-tooltip-id={`dropoff-address-tooltip-${leg.leg_id}`}
            >
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
              <th onClick={() => handleSort('tripId')} className="sortable-header">
                # {getSortIcon('tripId')}
              </th>
              <th className="clinic-header">Clinic</th>
              <th>Client</th>
              <th>Phone</th>
              <th>Pickup Address</th>
              <th onClick={() => handleSort('scheduledPickup')} className="sortable-header">
                R/U {getSortIcon('scheduledPickup')}
              </th>
              <th>P/U</th>
              <th onClick={() => handleSort('scheduledDropoff')} className="sortable-header">
                APPT {getSortIcon('scheduledDropoff')}
              </th>
              <th>D/O</th>
              <th>TS</th>
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

      {/* Add tooltip components for each leg */}
      {trips.flatMap(trip => 
        (trip.legs || []).map(leg => (
          leg.driver && 
          <Tooltip 
            key={`tooltip-component-${leg.leg_id}`}
            id={`driver-tooltip-${leg.leg_id}`}
            className="driver-tooltip"
            place="top"
          >
            <div className="driver-tooltip-content">
              <strong>{leg.driver.first_name} {leg.driver.last_name}</strong>
              {leg.driver.phone && (
                <>
                  <br />
                  <span>{leg.driver.phone}</span>
                </>
              )}
            </div>
          </Tooltip>
        ))
      )}

      {/* Add tooltips for clinics */}
      {trips.flatMap(trip => 
        (trip.legs || []).map(leg => (
          <Tooltip 
            key={`clinic-tooltip-component-${trip.trip_id}-${leg.leg_id}`}
            id={`clinic-tooltip-${trip.trip_id}-${leg.leg_id}`}
            className="clinic-tooltip"
            place="top"
          >
            <div className="clinic-tooltip-content">
              <strong>Program:</strong> {trip.TripMember?.Program?.program_name || 'N/A'}
            </div>
          </Tooltip>
        ))
      )}

      {/* Add tooltips for pickup addresses */}
      {trips.flatMap(trip => 
        (trip.legs || []).map(leg => 
          leg.pickupLocation && (
            <Tooltip 
              key={`pickup-address-tooltip-component-${leg.leg_id}`}
              id={`pickup-address-tooltip-${leg.leg_id}`}
              className="address-tooltip"
              place="top"
              delayShow={400}
            >
              <div className="address-tooltip-content">
                <strong>Pickup Address:</strong><br />
                {leg.pickupLocation.street_address}<br />
                {leg.pickupLocation.city}, {leg.pickupLocation.state} {leg.pickupLocation.zip}
                {leg.pickupLocation.phone && (
                  <>
                    <br />
                    <strong>Phone:</strong> {leg.pickupLocation.phone}
                  </>
                )}
              </div>
            </Tooltip>
          )
        )
      )}

      {/* Add tooltips for dropoff addresses */}
      {trips.flatMap(trip => 
        (trip.legs || []).map(leg => 
          leg.dropoffLocation && (
            <Tooltip 
              key={`dropoff-address-tooltip-component-${leg.leg_id}`}
              id={`dropoff-address-tooltip-${leg.leg_id}`}
              className="address-tooltip"
              place="top"
              delayShow={300}
            >
              <div className="address-tooltip-content">
                <strong>Dropoff Address:</strong><br />
                {leg.dropoffLocation.street_address}<br />
                {leg.dropoffLocation.city}, {leg.dropoffLocation.state} {leg.dropoffLocation.zip}
                {leg.dropoffLocation.phone && (
                  <>
                    <br />
                    <strong>Phone:</strong> {leg.dropoffLocation.phone}
                  </>
                )}
              </div>
            </Tooltip>
          )
        )
      )}
    </div>
  );
};

export default NewTripManagementTable; 