import React from 'react';
import { format } from 'date-fns';
import { formatTimeForDisplay } from '@/utils/timeUtils';

const TripDetails = ({ trip, onEdit, onCopy, onClose }) => {
  // Get Bootstrap color class based on leg status
  const getLegStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'assigned':
        return 'info';
      case 'scheduled':
        return 'primary';
      case 'in progress':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Helper to safely format dates
  const formatDate = (dateStr) => {
    try {
      return dateStr ? format(new Date(dateStr), 'MM/dd/yyyy') : 'N/A';
    } catch (error) {
      console.error('Date format error:', error);
      return 'Invalid date';
    }
  };

  // Helper to safely format time-only values
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    
    // Check if it's a time-only string (HH:MM:SS)
    if (typeof timeStr === 'string' && timeStr.includes(':') && !timeStr.includes('T')) {
      return formatTimeForDisplay(timeStr) || 'N/A';
    }
    
    // If it's a full datetime
    try {
      return format(new Date(timeStr), 'h:mm a');
    } catch (error) {
      console.error('Time format error:', error);
      return 'Invalid time';
    }
  };

  return (
    <div className="trip-details-container">
      <p className="vehicle-info">
        {trip.TripMember 
          ? `${trip.TripMember.first_name} ${trip.TripMember.last_name}` 
          : 'N/A'}
        {trip.Program?.program_name && ` - ${trip.Program.program_name}`}
      </p>
      
      {trip.TripMember && (
        <div className="details-section">
          <h3 className="section-title">Member Information</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">AHCCCS ID:</span>
              <span className="detail-value">{trip.TripMember.ahcccs_id || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Birth Date:</span>
              <span className="detail-value">
                {formatDate(trip.TripMember.birth_date)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Insurance Expiry:</span>
              <span className="detail-value">
                {formatDate(trip.TripMember.insurance_expiry)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{trip.TripMember.phone || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Gender:</span>
              <span className="detail-value">{trip.TripMember.gender || 'N/A'}</span>
            </div>
          </div>
          
          {trip.TripMember.notes && (
            <div className="mt-3">
              <span className="detail-label">Notes:</span>
              <p className="detail-notes">{trip.TripMember.notes}</p>
            </div>
          )}
        </div>
      )}
      
      {trip.Program && (
        <div className="details-section">
          <h3 className="section-title">Program Information</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Program Name:</span>
              <span className="detail-value">{trip.Program.program_name || 'N/A'}</span>
            </div>
            {trip.Program.program_type && (
              <div className="detail-item">
                <span className="detail-label">Program Type:</span>
                <span className="detail-value">{trip.Program.program_type}</span>
              </div>
            )}
            {trip.Program.contact_name && (
              <div className="detail-item">
                <span className="detail-label">Contact:</span>
                <span className="detail-value">{trip.Program.contact_name}</span>
              </div>
            )}
            {trip.Program.contact_phone && (
              <div className="detail-item">
                <span className="detail-label">Contact Phone:</span>
                <span className="detail-value">{trip.Program.contact_phone}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="details-section">
        <h3 className="section-title">Trip Information</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Schedule Type:</span>
            <span className="detail-value">{trip.schedule_type || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{trip.schedule_type === 'Once' ? 'Date' : 'Start Date'}:</span>
            <span className="detail-value">
              {formatDate(trip.start_date)}
            </span>
          </div>
          {trip.schedule_type === 'Blanket' && (
            <>
              <div className="detail-item">
                <span className="detail-label">End Date:</span>
                <span className="detail-value">
                  {formatDate(trip.end_date)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Days of Week:</span>
                <span className="detail-value">{trip.schedule_days || 'N/A'}</span>
              </div>
            </>
          )}
          <div className="detail-item">
            <span className="detail-label">Trip Type:</span>
            <span className="detail-value">
            {trip.trip_type === 'Round Trip' 
  ? 'Round Trip' 
  : trip.trip_type === 'Standard' 
    ? 'One Way' 
    : trip.trip_type}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total Distance:</span>
            <span className="detail-value">
              {trip.total_distance ? `${trip.total_distance} miles` : 'Not calculated'}
            </span>
          </div>
        </div>
      </div>
      
      {trip.legs && trip.legs.length > 0 && (
        <div className="details-section">
          <h3 className="section-title">Trip Legs</h3>
          {trip.legs.sort((a, b) => a.sequence - b.sequence).map((leg, index) => (
            <div key={leg.leg_id || index} className="leg-container mb-3 p-3 border rounded">
              <div className="leg-header mb-2 d-flex justify-content-between align-items-center">
                <span className="badge bg-primary">Leg {leg.sequence}</span>
                {leg.status && (
                  <span className={`badge bg-${getLegStatusColor(leg.status)}`}>
                    {leg.status}
                  </span>
                )}
              </div>
              
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">From:</span>
                  <span className="detail-value">
                    {leg.pickupLocation 
                      ? `${leg.pickupLocation.street_address}, ${leg.pickupLocation.city}, ${leg.pickupLocation.state}`
                      : 'N/A'}
                  </span>
                </div>
                
                {leg.pickupLocation && leg.pickupLocation.phone && (
                  <div className="detail-item">
                    <span className="detail-label">Pickup Phone:</span>
                    <span className="detail-value">{leg.pickupLocation.phone}</span>
                  </div>
                )}
                
                <div className="detail-item">
                  <span className="detail-label">To:</span>
                  <span className="detail-value">
                    {leg.dropoffLocation 
                      ? `${leg.dropoffLocation.street_address}, ${leg.dropoffLocation.city}, ${leg.dropoffLocation.state}`
                      : 'N/A'}
                  </span>
                </div>
                
                {leg.dropoffLocation && leg.dropoffLocation.phone && (
                  <div className="detail-item">
                    <span className="detail-label">Dropoff Phone:</span>
                    <span className="detail-value">{leg.dropoffLocation.phone}</span>
                  </div>
                )}
                
                <div className="detail-item">
                  <span className="detail-label">Pickup Time:</span>
                  <span className="detail-value">
                    {formatTime(leg.scheduled_pickup)}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Dropoff Time:</span>
                  <span className="detail-value">
                    {formatTime(leg.scheduled_dropoff)}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Driver:</span>
                  <span className="detail-value">
                    {leg.driver 
                      ? `${leg.driver.first_name} ${leg.driver.last_name}` 
                      : 'Not assigned'}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Distance:</span>
                  <span className="detail-value">
                    {leg.leg_distance ? `${leg.leg_distance} miles` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {trip.specialInstructions && (
        <div className="details-section">
          <h3 className="section-title">Special Instructions</h3>
          <div className="details-grid">
            {trip.specialInstructions.mobility_type && (
              <div className="detail-item">
                <span className="detail-label">Mobility Type:</span>
                <span className="detail-value">{trip.specialInstructions.mobility_type}</span>
              </div>
            )}
            
            <div className="detail-item col-span-2 ">
              <span className="detail-label mb-2">Requirements:</span>
              <div className="flex flex-wrap gap-2">
                {trip.specialInstructions.rides_alone && 
                  <span className="detail-value">Rides Alone </span>}
                {trip.specialInstructions.spanish_speaking && 
                  <span className="detail-value">Spanish Speaking</span>}
                {trip.specialInstructions.males_only && 
                  <span className="detail-value">Males Only</span>}
                {trip.specialInstructions.females_only && 
                  <span className="detail-value">Females Only</span>}
                {trip.specialInstructions.special_assist && 
                  <span className="detail-value">Special Assistance</span>}
                {trip.specialInstructions.pickup_time_exact && 
                  <span className="detail-value">Exact Pickup Time</span>}
                {trip.specialInstructions.stay_with_client && 
                  <span className="detail-value">Stay With Client</span>}
                {trip.specialInstructions.car_seat && 
                  <span className="detail-value">Car Seat</span>}
                {trip.specialInstructions.extra_person && 
                  <span className="detail-value">Extra Person</span>}
                {trip.specialInstructions.call_first && 
                  <span className="detail-value">Call First</span>}
                {trip.specialInstructions.knock && 
                  <span className="detail-value">Knock</span>}
              </div>
            </div>
            
            <div className="detail-item col-span-2 mt-3">
              <span className="detail-label mb-2">Vehicle Type:</span>
              <div className="flex gap-2">
                {trip.specialInstructions.van && 
                  <span className="badge detail-value badge-secondary">Van</span>}
                {trip.specialInstructions.sedan && 
                  <span className="badge detail-value badge-secondary">Sedan</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    
      <div className="mt-6 flex space-x-3">
        <button
          type="button"
          className="add-user-btn secondary-btn p-2" 
          onClick={() => {
            onClose();
            onEdit(trip);
          }}
        >
          Edit Trip
        </button>
        <button
          type="button"
          className="m-2 add-user-btn secondary-btn p-2"
          onClick={() => {
            onClose();
            onCopy(trip);
          }}
        >
          Copy Trip
        </button>
      </div>
    </div>
  );
};

export default TripDetails; 