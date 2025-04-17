import React from 'react';
import TimeOffRequestsManager from '@/components/timesheet/TimeOffRequestsManager';

const ManageTimeOffRequests = () => {
  // In a real app, you would check if the current user is an admin
  // For now, we'll assume the user has admin privileges to approve/deny requests
  const isAdmin = true;

  return (
    <div className="container-fluid p-4">
      <TimeOffRequestsManager isAdmin={isAdmin} />
    </div>
  );
};

export default ManageTimeOffRequests; 