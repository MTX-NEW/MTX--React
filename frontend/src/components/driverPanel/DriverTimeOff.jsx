import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import TimeOffRequestForm from '@/components/timesheet/TimeOffRequestForm';
import useAuth from '@/hooks/useAuth';

const DriverTimeOff = () => {
  const { user } = useAuth();
  const currentUserId = user?.id;

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