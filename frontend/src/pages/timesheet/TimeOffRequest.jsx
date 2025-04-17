import React from 'react';
import TimeOffRequestForm from '@/components/timesheet/TimeOffRequestForm';

const TimeOffRequest = () => {
  // In a real application, you would get the authenticated user's ID
  // from the authentication context or similar
  const userId = 9; // Currently hardcoded

  return (
    <div className="container-fluid p-4">
      <TimeOffRequestForm userId={userId} />
    </div>
  );
};

export default TimeOffRequest; 