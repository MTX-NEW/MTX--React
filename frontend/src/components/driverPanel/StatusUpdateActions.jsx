import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faTimes, 
  faExchangeAlt, 
  faDirections, 
  faUser,
  faClock
} from '@fortawesome/free-solid-svg-icons';

const StatusUpdateActions = ({ 
  currentStatus, 
  onStatusChange, 
  isLoading, 
  buttonSize = 'sm', 
  showTitle = true,
  centerButtons = false,
  statusProgression = {
    'Assigned': ['Transport confirmed'],
    'Transport confirmed': ['Transport enroute'],
    'Transport enroute': ['Picked up', 'Not going', 'Not available'],
    'Picked up': ['Dropped off'],
    'Not going': [],
    'Not available': [],
    'Dropped off': []
  }
}) => {
  
  // Get next possible statuses based on current status
  const getNextStatuses = (status) => {
    return statusProgression[status] || [];
  };
  
  const nextStatuses = getNextStatuses(currentStatus);
  
  if (nextStatuses.length === 0) {
    return null;
  }
  
  return (
    <div className={`d-flex flex-column ${centerButtons ? 'justify-content-center' : ''} mb-3`}>
      {showTitle && nextStatuses.length > 0 && (
        <h6 className={`${centerButtons ? 'text-center' : ''} mb-3 fs-7`}>Update Status:</h6>
      )}
      <div className={`d-flex flex-wrap ${centerButtons ? 'justify-content-center' : ''} status-action-buttons gap-2`}>
        {nextStatuses.map(nextStatus => {
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
            btnIcon = faExchangeAlt;
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
              size={buttonSize}
              className={`py-1 px-3 ${btnClass}`}
              onClick={() => onStatusChange(nextStatus)}
              disabled={isLoading}
            >
              <div className="d-flex align-items-center">
                <div className="status-icon-circle me-2">
                  <FontAwesomeIcon icon={btnIcon} className="fs-8" />
                </div>
                <span className="fs-7">{btnLabel}</span>
                {(nextStatus === 'Picked up' || nextStatus === 'Dropped off') && (
                  <div className="auto-time-badge ms-2">
                    <FontAwesomeIcon icon={faClock} className="me-1" />
                    <span className="fs-8">Auto-timed</span>
                  </div>
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default StatusUpdateActions; 