import React from 'react';
import TimeOffRequestForm from '@/components/timesheet/TimeOffRequestForm';
import useAuth from '@/hooks/useAuth';

const TimeOffRequest = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return (
    <div className="container-fluid p-4">
      <TimeOffRequestForm userId={userId} />
    </div>
  );
};

export default TimeOffRequest; 