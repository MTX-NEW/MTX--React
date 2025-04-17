import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import TimeOffRequestForm from '@/components/timesheet/TimeOffRequestForm';

const DriverTimeOff = () => {
  // Hardcoded user ID for now
  const currentUserId = 11;

  return (
    <div className="time-off-container pb-5">
      <h5 className="mb-4">
        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
        Time Off Requests
      </h5>
      
      <TimeOffRequestForm userId={currentUserId} />
    </div>
  );
};

export default DriverTimeOff; 