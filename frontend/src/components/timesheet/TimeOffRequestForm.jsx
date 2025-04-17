import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { timeOffRequestApi } from '@/api/baseApi';

const TimeOffRequestComponent = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      start_date: dayjs(),
      end_date: dayjs(),
      type: 'vacation',
      notes: ''
    }
  });

  // Fetch existing requests on component mount
  useEffect(() => {
    if (userId) {
      fetchRequests();
    }
  }, [userId]);

  const fetchRequests = async () => {
    try {
      // Get requests for the specific user
      const response = await timeOffRequestApi.getAll({ userId });
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching time off requests:', error);
      setErrorMessage('Failed to fetch time off requests');
    }
  };

  const onSubmit = async (data) => {
    // Clear any previous messages
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Format dates for API
      const formattedData = {
        ...data,
        user_id: userId,
        start_date: formatDate(data.start_date),
        end_date: formatDate(data.end_date)
      };
      
      await timeOffRequestApi.create(formattedData);
      setSuccessMessage('Time off request submitted successfully');
      reset();
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error submitting time off request:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to submit time off request');
    }
  };

  // Helper to format date as YYYY-MM-DD for API
  const formatDate = (date) => {
    return date.format('YYYY-MM-DD');
  };

  // Format date for display
  const displayDate = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).format('MM/DD/YYYY');
  };

  // Get status class based on request status
  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'text-success';
      case 'denied': return 'text-danger';
      default: return 'text-warning';
    }
  };

  return (
    <div className="row">
      <div className="col-md-6 mb-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <h2 className="h4 mb-4">Request Time Off</h2>
          
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">Start Date</label>
              <Controller
                control={control}
                name="start_date"
                rules={{ required: 'Start date is required' }}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          error: !!errors.start_date,
                          helperText: errors.start_date?.message,
                          className: "form-control"
                        }
                      }}
                    />
                  </LocalizationProvider>
                )}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">End Date</label>
              <Controller
                control={control}
                name="end_date"
                rules={{ required: 'End date is required' }}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          error: !!errors.end_date,
                          helperText: errors.end_date?.message,
                          className: "form-control"
                        }
                      }}
                    />
                  </LocalizationProvider>
                )}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Type of Leave</label>
              <select 
                className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                {...register('type', { required: 'Type is required' })}
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="other">Other</option>
              </select>
              {errors.type && (
                <div className="invalid-feedback">{errors.type.message}</div>
              )}
            </div>
            
            <div className="mb-3">
              <label className="form-label">Notes (Optional)</label>
              <textarea 
                className="form-control"
                rows="3"
                {...register('notes')}
                placeholder="Add any additional information here"
              ></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary w-100">
              Submit Request
            </button>
          </form>
        </div>
      </div>

      <div className="col-md-6">
        <div className="bg-white p-4 rounded shadow-sm">
          <h2 className="h4 mb-4">Your Time Off Requests</h2>
          
          {requests.length === 0 ? (
            <p className="text-muted">No time off requests found</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Dates</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request.request_id}>
                      <td>
                        {displayDate(request.start_date)} - {displayDate(request.end_date)}
                      </td>
                      <td className="text-capitalize">{request.type}</td>
                      <td>
                        <span className={`badge ${getStatusClass(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeOffRequestComponent; 