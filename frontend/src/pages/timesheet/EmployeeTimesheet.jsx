import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useEmployeeTimesheet from '@/hooks/useEmployeeTimesheet';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const EmployeeTimesheet = () => {
  const navigate = useNavigate();
  const {
    filteredEmployees,
    error,
    handleSearchChange,
    handleClockIn,
    handleClockOut,
    handleBreak,
    handleEndBreak,
    refreshEmployees
  } = useEmployeeTimesheet();

  // State for managing break duration dropdown
  const [breakDurations] = useState([
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' }
  ]);
  
  // State to track which employee is selecting break duration
  const [selectingBreakEmployee, setSelectingBreakEmployee] = useState(null);

  // Dialog states for confirmation
  const [confirmDialogState, setConfirmDialogState] = useState({
    show: false,
    title: '',
    message: '',
    action: null,
    employeeId: null,
    additionalData: null
  });

  // Handle selecting break duration
  const handleSelectBreak = (employeeId) => {
    setSelectingBreakEmployee(employeeId);
  };

  // Show confirmation dialog
  const showConfirmDialog = (title, message, action, employeeId, additionalData = null) => {
    setConfirmDialogState({
      show: true,
      title,
      message,
      action,
      employeeId,
      additionalData
    });
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setConfirmDialogState({
      ...confirmDialogState,
      show: false
    });
  };

  // Handle dialog confirm
  const handleDialogConfirm = () => {
    const { action, employeeId, additionalData } = confirmDialogState;
    
    // Execute the appropriate action
    if (action === 'clockIn') {
      handleClockIn(employeeId);
    } else if (action === 'clockOut') {
      handleClockOut(employeeId);
    } else if (action === 'startBreak') {
      handleBreak(employeeId, additionalData);
      setSelectingBreakEmployee(null);
    } else if (action === 'endBreak') {
      handleEndBreak(employeeId);
    }
    
    // Close the dialog
    handleDialogClose();
  };

  // Request confirmation for clock in
  const confirmClockIn = (employeeId) => {
    const employee = filteredEmployees.find(emp => emp.id === employeeId);
    const name = employee ? `${employee.first_name} ${employee.last_name}` : 'this employee';
    
    showConfirmDialog(
      'Confirm Clock In',
      `Are you sure you want to clock in ${name}?`,
      'clockIn',
      employeeId
    );
  };

  // Request confirmation for clock out
  const confirmClockOut = (employeeId) => {
    const employee = filteredEmployees.find(emp => emp.id === employeeId);
    const name = employee ? `${employee.first_name} ${employee.last_name}` : 'this employee';
    
    showConfirmDialog(
      'Confirm Clock Out',
      `Are you sure you want to clock out ${name}? This will end their work day.`,
      'clockOut',
      employeeId
    );
  };

  // Start break with selected duration - with confirmation
  const confirmStartBreak = (employeeId, duration) => {
    const employee = filteredEmployees.find(emp => emp.id === employeeId);
    const name = employee ? `${employee.first_name} ${employee.last_name}` : 'this employee';
    const durationText = breakDurations.find(d => d.value === duration)?.label || `${duration} minutes`;
    
    showConfirmDialog(
      'Confirm Break',
      `Are you sure you want to start a ${durationText} break for ${name}?`,
      'startBreak',
      employeeId,
      duration
    );
  };

  // Confirm end break
  const confirmEndBreak = (employeeId) => {
    const employee = filteredEmployees.find(emp => emp.id === employeeId);
    const name = employee ? `${employee.first_name} ${employee.last_name}` : 'this employee';
    
    showConfirmDialog(
      'Confirm End Break',
      `Are you sure you want to end the break for ${name}?`,
      'endBreak',
      employeeId
    );
  };

  // Cancel break selection
  const cancelBreakSelection = () => {
    setSelectingBreakEmployee(null);
  };

  // Navigate to employee timesheet history
  const navigateToEmployeeHistory = (employeeId) => {
    console.log("Navigating to employee history:", employeeId);
    // Make sure employeeId is valid before navigating
    if (employeeId) {
      navigate(`/time-sheet/employee/${employeeId}/history`);
    } else {
      console.error("Cannot navigate - invalid employee ID:", employeeId);
      toast.error("Cannot view history - invalid employee ID");
    }
  };

  // Handle card click - navigate to employee details
  const handleCardClick = (employeeId, event) => {
    // Prevent navigation if clicking on a button
    if (event.target.tagName === 'BUTTON' || 
        event.target.closest('button') || 
        event.target.closest('.time-actions')) {
      return;
    }
    navigateToEmployeeHistory(employeeId);
  };

  // Render employee cards
  const renderEmployeeCards = () => {
    if (error) {
      return (
        <div className="alert alert-danger my-4" role="alert">
          <h4 className="alert-heading">Error Loading Data</h4>
          <p>{error.message || 'An unexpected error occurred'}</p>
          <hr />
          <button className="btn btn-outline-danger" onClick={refreshEmployees}>
            Try Again
          </button>
        </div>
      );
    }

    if (!filteredEmployees || filteredEmployees.length === 0) {
      return (
        <div className="text-center mt-5">
          <p>No employees found. Try adjusting your search criteria.</p>
        </div>
      );
    }

    return (
      <div className="row g-4">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="col-xl-4 col-lg-4 col-md-6">
            <div 
              className="card h-100 border-0 rounded-lg shadow-sm employee-card" 
              onClick={(e) => handleCardClick(employee.id, e)}
            >
              {/* Card Status Header */}
              <div 
                className={`card-status-header py-2 px-3 text-white d-flex justify-content-between align-items-center ${
                  employee.status === 'clocked_in' ? 'bg-success' : 
                  employee.status === 'on_break' ? 'bg-warning' : 
                  employee.status === 'clocked_out' ? 'bg-secondary' : 'bg-light text-dark'
                }`}
              >
                <span>
                  {employee.status === 'clocked_in' ? 'Clocked In' : 
                   employee.status === 'on_break' ? 'On Break' : 
                   employee.status === 'clocked_out' ? 'Clocked Out' : 'Not Started'}
                </span>
                <span className="badge bg-light text-dark rounded-pill">{employee.emp_code || 'No ID'}</span>
              </div>

              <div className="card-body p-0">
                <div className="d-flex p-3 border-bottom">
                  {/* Employee Image & Name */}
                  <div className="me-3">
                    <img
                      src={employee.profile_image || '/assets/images/profile.jpg'}
                      alt={`${employee.first_name} ${employee.last_name}`}
                      className="rounded-circle"
                      width="70"
                      height="70"
                      style={{ objectFit: 'cover', border: '2px solid #f1f1f1' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/images/profile.jpg';
                      }}
                    />
                  </div>
                  <div className="d-flex flex-column justify-content-center employee-details">
                    <h5 className="card-title fw-bold mb-1">
                      {employee.first_name} {employee.last_name}
                    </h5>
                    <div className="employee-details small text-muted">
                      <p className="mb-0">
                        <i className="fas fa-phone-alt me-1"></i> {employee.phone || 'N/A'}
                      </p>
                      <p className="mb-0">
                        <i className="fas fa-calendar-alt me-1"></i> Hired: {employee.hiringDate || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hours Stats */}
                <div className="d-flex p-3 border-bottom bg-light">
                  <div className="flex-grow-1 text-center border-end">
                    <h3 className="mb-0 fw-bold">{(employee.today_hours || 0).toFixed(2)}</h3>
                    <small className="text-muted text-uppercase">Today</small>
                  </div>
                  <div className="flex-grow-1 text-center">
                    <h3 className="mb-0 fw-bold">{(employee.week_hours || 0).toFixed(2)}</h3>
                    <small className="text-muted text-uppercase">Week</small>
                  </div>
                </div>

                {/* Time Action Buttons Section */}
                <div className="time-actions p-3">
                  {/* Break Duration Selection */}
                  {selectingBreakEmployee === employee.id && (
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-mug-hot text-warning me-2"></i>
                        <label className="form-label fw-bold mb-0">Select Break Duration</label>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {breakDurations.map((duration) => (
                          <button 
                            key={duration.value} 
                            className="btn btn-sm btn-outline-warning flex-grow-1"
                            onClick={() => confirmStartBreak(employee.id, duration.value)}
                          >
                            {duration.label}
                          </button>
                        ))}
                      </div>
                      <button 
                        className="btn btn-sm btn-link text-secondary w-100 mt-2" 
                        onClick={cancelBreakSelection}
                      >
                        <i className="fas fa-times me-1"></i> Cancel
                      </button>
                    </div>
                  )}
                  
                  {/* Normal Action Buttons (when not selecting break) */}
                  {selectingBreakEmployee !== employee.id && (
                    <>
                      {/* Clock In Button - Only show for idle or not_started status */}
                      {(employee.status === 'idle' || employee.status === 'not_started' || !employee.status) && (
                        <button
                          onClick={() => confirmClockIn(employee.id)}
                          className="btn btn-success w-100 d-flex align-items-center justify-content-center"
                          style={{ borderRadius: '4px' }}
                        >
                          <i className="fas fa-sign-in-alt me-2"></i> Clock In
                        </button>
                      )}
                      
                      {/* Clock Out and Break Buttons */}
                      {employee.status === 'clocked_in' && (
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleSelectBreak(employee.id)}
                            className="btn btn-warning flex-grow-1 d-flex align-items-center justify-content-center"
                            style={{ borderRadius: '4px' }}
                          >
                            <i className="fas fa-coffee me-2"></i> Take Break
                          </button>
                          <button
                            onClick={() => confirmClockOut(employee.id)}
                            className="btn btn-danger flex-grow-1 d-flex align-items-center justify-content-center"
                            style={{ borderRadius: '4px' }}
                          >
                            <i className="fas fa-sign-out-alt me-2"></i> End Day
                          </button>
                        </div>
                      )}
                      
                      {/* End Break Button */}
                      {employee.status === 'on_break' && (
                        <button
                          onClick={() => confirmEndBreak(employee.id)}
                          className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                          style={{ borderRadius: '4px' }}
                        >
                          <i className="fas fa-play me-2"></i> End Break
                        </button>
                      )}
                      
                      {/* Show status message for clocked_out employees */}
                      {employee.status === 'clocked_out' && (
                        <div className="alert alert-light border text-center mb-0 py-2">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          Shift completed for today
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* View Details Footer */}
                <div className="card-footer bg-white border-top p-2 d-flex justify-content-between">
                  <button 
                    className="btn btn-sm btn-link text-primary flex-grow-1 d-flex align-items-center justify-content-center"
                    onClick={() => navigateToEmployeeHistory(employee.id)}
                  >
                    <i className="fas fa-chart-line me-1"></i> History & Stats
                  </button>
                  <div className="vr mx-1"></div>
                  <button 
                    className="btn btn-sm btn-link text-primary flex-grow-1 d-flex align-items-center justify-content-center"
                    onClick={() => navigate(`/time-sheet/employee/${employee.id}/payroll`)}
                  >
                    <i className="fas fa-dollar-sign me-1"></i> Payroll
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        show={confirmDialogState.show}
        title={confirmDialogState.title}
        message={confirmDialogState.message}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        action={confirmDialogState.action}
      />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Employee Timesheet</h4>
        <div className="d-flex gap-2">
          <div className="search-container position-relative">
            <i className="fas fa-search position-absolute" 
              style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}></i>
            <input
              type="text"
              className="form-control ps-4"
              placeholder="Search employees..."
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ borderRadius: '20px', paddingLeft: '30px' }}
            />
          </div>
          <button 
            className="btn btn-outline-primary d-flex align-items-center" 
            onClick={refreshEmployees}
            style={{ borderRadius: '20px' }}
          >
            <i className="fas fa-sync-alt me-1"></i> Refresh
          </button>
        </div>
      </div>
      
      <div className="bg-white p-3 p-lg-4 rounded shadow-sm">
        {renderEmployeeCards()}
      </div>
    </div>
  );
};

export default EmployeeTimesheet; 