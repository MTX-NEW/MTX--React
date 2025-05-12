import React, { useState, useEffect } from 'react';
import { timeOffRequestApi } from '@/api/baseApi';
import dayjs from 'dayjs';

const TimeOffRequestsManager = ({ isAdmin = false }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'denied'

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await timeOffRequestApi.getAll();
      setRequests(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching time off requests:', err);
      setError('Failed to load time off requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await timeOffRequestApi.update(requestId, { status: newStatus });
      // Refresh the requests after update
      fetchRequests();
    } catch (err) {
      console.error('Error updating request status:', err);
      setError('Failed to update request status. Please try again.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'approved': return 'bg-success';
      case 'denied': return 'bg-danger';
      default: return 'bg-warning';
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM D, YYYY');
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading time off requests...</p>
      </div>
    );
  }

  return (
    <div className="time-off-requests-manager">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Time Off Requests</h2>
        
        <div className="btn-group" role="group">
          <button 
            type="button" 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            type="button" 
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            type="button" 
            className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button 
            type="button" 
            className={`btn ${filter === 'denied' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('denied')}
          >
            Denied
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="alert alert-info">
          No time off requests found{filter !== 'all' ? ` with status: ${filter}` : ''}.
        </div>
      ) : (
        <div className="row">
          {filteredRequests.map(request => (
            <div key={request.request_id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className={`card-header d-flex justify-content-between align-items-center ${request.status === 'pending' ? 'bg-light' : request.status === 'approved' ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                  <span className="text-capitalize fw-bold">{request.type}</span>
                  <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <strong>Employee:</strong> {request.User?.first_name} {request.User?.last_name}
                  </div>
                  <div className="mb-3">
                    <strong>Dates:</strong> {formatDate(request.start_date)} - {formatDate(request.end_date)}
                  </div>
                  {request.notes && (
                    <div className="mb-3">
                      <strong>Notes:</strong>
                      <p className="text-muted mb-0">{request.notes}</p>
                    </div>
                  )}
                  
                  {isAdmin && request.status === 'pending' && (
                    <div className="d-flex gap-2 mt-3">
                      <button 
                        className="btn btn-success btn-sm flex-grow-1"
                        onClick={() => handleUpdateStatus(request.request_id, 'approved')}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn btn-danger btn-sm flex-grow-1"
                        onClick={() => handleUpdateStatus(request.request_id, 'denied')}
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </div>
                <div className="card-footer text-muted">
                  <small>Requested on {formatDate(request.created_at)}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeOffRequestsManager; 