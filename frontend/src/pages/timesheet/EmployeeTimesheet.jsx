import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useEmployeeTimesheet, { HOUR_TYPES } from '@/hooks/useEmployeeTimesheet';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import useAuth from '@/hooks/useAuth';

// Break durations options
const BREAK_DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' }
];

// Employee status indicator component
const StatusHeader = ({ status, empCode }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'clocked_in': return 'bg-success';
      case 'on_break': return 'bg-warning';
      case 'clocked_out': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'clocked_in': return 'Clocked In';
      case 'on_break': return 'On Break';
      case 'clocked_out': return 'Clocked Out';
      default: return 'Not Started';
    }
  };

  return (
    <div className={`card-status-header py-2 px-3 text-white d-flex justify-content-between align-items-center ${getStatusColor()}`}>
      <span>{getStatusText()}</span>
      <span className="badge bg-light text-dark rounded-pill">{empCode || 'No ID'}</span>
    </div>
  );
};

// Employee profile component
const EmployeeProfile = ({ employee }) => (
  <div className="d-flex p-3 border-bottom">
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
);

// Hours stats component
const HoursStats = ({ todayHours, weekHours }) => (
  <div className="d-flex p-3 border-bottom bg-light">
    <div className="flex-grow-1 text-center border-end">
      <h3 className="mb-0 fw-bold">{(todayHours || 0).toFixed(2)}</h3>
      <small className="text-muted text-uppercase">Today</small>
    </div>
    <div className="flex-grow-1 text-center">
      <h3 className="mb-0 fw-bold">{(weekHours || 0).toFixed(2)}</h3>
      <small className="text-muted text-uppercase">Week</small>
    </div>
  </div>
);

// Break duration selector component
const BreakDurationSelector = ({ onSelectDuration, onCancel }) => (
  <div className="mb-3">
    <div className="d-flex align-items-center mb-2">
      <i className="fas fa-mug-hot text-warning me-2"></i>
      <label className="form-label fw-bold mb-0">Select Break Duration</label>
    </div>
    <div className="d-flex flex-wrap gap-2">
      {BREAK_DURATIONS.map((duration) => (
        <button 
          key={duration.value} 
          className="btn btn-sm btn-outline-warning flex-grow-1"
          onClick={() => onSelectDuration(duration.value)}
        >
          {duration.label}
        </button>
      ))}
    </div>
    <button 
      className="btn btn-sm btn-link text-secondary w-100 mt-2" 
      onClick={onCancel}
    >
      <i className="fas fa-times me-1"></i> Cancel
    </button>
  </div>
);

// Hour type selector component 
const HourTypeSelector = ({ onSelectHourType, onCancel }) => (
  <div className="mb-3">
    <div className="d-flex align-items-center mb-2">
      <i className="fas fa-clock text-primary me-2"></i>
      <label className="form-label fw-bold mb-0">Select Hour Type</label>
    </div>
    <div className="d-flex flex-wrap gap-2">
      {HOUR_TYPES.map((type) => (
        <button 
          key={type.value} 
          className="btn btn-sm btn-outline-primary flex-grow-1"
          onClick={() => onSelectHourType(type.value)}
        >
          {type.label}
        </button>
      ))}
    </div>
    <button 
      className="btn btn-sm btn-link text-secondary w-100 mt-2" 
      onClick={onCancel}
    >
      <i className="fas fa-times me-1"></i> Cancel
    </button>
  </div>
);

// Action buttons component - handles different states
const TimeActionButtons = ({ 
  employee, 
  isSelectingBreak,
  isSelectingHourType,
  onClockIn, 
  onClockOut, 
  onSelectBreak, 
  onStartBreak,
  onEndBreak,
  onCancelBreakSelection,
  onSelectHourType,
  onStartClockIn,
  onCancelHourTypeSelection
}) => {
  if (isSelectingBreak) {
    return (
      <BreakDurationSelector 
        onSelectDuration={(duration) => onStartBreak(employee.id, duration)}
        onCancel={onCancelBreakSelection}
      />
    );
  }

  if (isSelectingHourType) {
    return (
      <HourTypeSelector 
        onSelectHourType={(hourType) => onStartClockIn(employee.id, hourType)}
        onCancel={onCancelHourTypeSelection}
      />
    );
  }

  // Idle or not started status
  if (employee.status === 'idle' || employee.status === 'not_started' || !employee.status) {
    return (
      <button
        onClick={() => onClockIn(employee.id)}
        className="btn btn-success w-100 d-flex align-items-center justify-content-center"
        style={{ borderRadius: '4px' }}
      >
        <i className="fas fa-sign-in-alt me-2"></i> Clock In
      </button>
    );
  }

  // Clocked in status
  if (employee.status === 'clocked_in') {
    return (
      <div className="d-flex gap-2">
        <button
          onClick={() => onSelectBreak(employee.id)}
          className="btn btn-warning flex-grow-1 d-flex align-items-center justify-content-center"
          style={{ borderRadius: '4px' }}
        >
          <i className="fas fa-coffee me-2"></i> Take Break
        </button>
        <button
          onClick={() => onClockOut(employee.id)}
          className="btn btn-danger flex-grow-1 d-flex align-items-center justify-content-center"
          style={{ borderRadius: '4px' }}
        >
          <i className="fas fa-sign-out-alt me-2"></i> End Day
        </button>
      </div>
    );
  }

  // On break status
  if (employee.status === 'on_break') {
    return (
      <button
        onClick={() => onEndBreak(employee.id)}
        className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
        style={{ borderRadius: '4px' }}
      >
        <i className="fas fa-play me-2"></i> End Break
      </button>
    );
  }

  // Clocked out status
  if (employee.status === 'clocked_out') {
    return (
      <>
        <div className="alert alert-light border text-center mb-2 py-2">
          <i className="fas fa-check-circle text-success me-2"></i>
          Shift completed for today
        </div>
        <button
          onClick={() => onClockIn(employee.id)}
          className="btn btn-success w-100 d-flex align-items-center justify-content-center"
          style={{ borderRadius: '4px' }}
        >
          <i className="fas fa-play me-2"></i> Start New Shift
        </button>
      </>
    );
  }

  return null;
};

// Card footer with navigation buttons
const CardFooter = ({ employeeId, onNavigateToHistory, onNavigateToPayroll }) => (
  <div className="card-footer bg-white border-top p-2 d-flex justify-content-between">
    <button 
      className="btn btn-sm btn-link text-primary flex-grow-1 d-flex align-items-center justify-content-center"
      onClick={() => onNavigateToHistory(employeeId)}
    >
      <i className="fas fa-chart-line me-1"></i> History & Stats
    </button>
    <div className="vr mx-1"></div>
    <button 
      className="btn btn-sm btn-link text-primary flex-grow-1 d-flex align-items-center justify-content-center"
      onClick={() => onNavigateToPayroll(employeeId)}
    >
      <i className="fas fa-dollar-sign me-1"></i> Payroll
    </button>
  </div>
);

// Employee card component
const EmployeeCard = ({ 
  employee, 
  selectingBreakEmployee,
  selectingHourTypeEmployee,
  onCardClick,
  onClockIn, 
  onClockOut, 
  onSelectBreak, 
  onStartBreak,
  onEndBreak,
  onCancelBreakSelection,
  onNavigateToHistory,
  onNavigateToPayroll,
  onSelectHourType,
  onStartClockIn,
  onCancelHourTypeSelection
}) => (
  <div className="col-xl-4 col-lg-4 col-md-6">
    <div 
      className="card h-100 border-0 rounded-lg shadow-sm employee-card" 
      onClick={(e) => onCardClick(employee.id, e)}
    >
      <StatusHeader status={employee.status} empCode={employee.emp_code} />
      
      <div className="card-body p-0">
        <EmployeeProfile employee={employee} />
        <HoursStats todayHours={employee.today_hours} weekHours={employee.week_hours} />
        
        <div className="time-actions p-3">
          <TimeActionButtons 
            employee={employee}
            isSelectingBreak={selectingBreakEmployee === employee.id}
            isSelectingHourType={selectingHourTypeEmployee === employee.id}
            onClockIn={onClockIn}
            onClockOut={onClockOut}
            onSelectBreak={onSelectBreak}
            onStartBreak={onStartBreak}
            onEndBreak={onEndBreak}
            onCancelBreakSelection={onCancelBreakSelection}
            onSelectHourType={onSelectHourType}
            onStartClockIn={onStartClockIn}
            onCancelHourTypeSelection={onCancelHourTypeSelection}
          />
        </div>
      </div>
      
      <CardFooter 
        employeeId={employee.id}
        onNavigateToHistory={onNavigateToHistory}
        onNavigateToPayroll={onNavigateToPayroll}
      />
    </div>
  </div>
);

// Error display component
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="alert alert-danger my-4" role="alert">
    <h4 className="alert-heading">Error Loading Data</h4>
    <p>{error.message || 'An unexpected error occurred'}</p>
    <hr />
    <button className="btn btn-outline-danger" onClick={onRetry}>
      Try Again
    </button>
  </div>
);

// Search and refresh header
const TimesheetHeader = ({ onSearchChange, onRefresh }) => (
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
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ borderRadius: '20px', paddingLeft: '30px' }}
        />
      </div>
      <button 
        className="btn btn-outline-primary d-flex align-items-center" 
        onClick={onRefresh}
        style={{ borderRadius: '20px' }}
      >
        <i className="fas fa-sync-alt me-1"></i> Refresh
      </button>
    </div>
  </div>
);

// Main EmployeeTimesheet component
const EmployeeTimesheet = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.user_type?.type_id === 1;
  
  const {
    filteredEmployees,
    error,
    handleSearchChange,
    handleClockIn,
    handleClockOut,
    handleBreak,
    handleEndBreak,
    refreshEmployees,
    hourTypes
  } = useEmployeeTimesheet();
  
  // State to track which employee is selecting break duration
  const [selectingBreakEmployee, setSelectingBreakEmployee] = useState(null);
  
  // State to track which employee is selecting hour type
  const [selectingHourTypeEmployee, setSelectingHourTypeEmployee] = useState(null);

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
  
  // Handle selecting hour type (for admin users)
  const handleSelectHourType = (employeeId) => {
    if (isAdmin) {
      setSelectingHourTypeEmployee(employeeId);
    } else {
      confirmClockIn(employeeId);
    }
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
      handleClockIn(employeeId, additionalData);
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
      employeeId,
      'regular'
    );
  };
  
  // Start clock in with selected hour type - with confirmation
  const confirmClockInWithHourType = (employeeId, hourType) => {
    const employee = filteredEmployees.find(emp => emp.id === employeeId);
    const name = employee ? `${employee.first_name} ${employee.last_name}` : 'this employee';
    const hourTypeLabel = HOUR_TYPES.find(t => t.value === hourType)?.label || hourType;
    
    showConfirmDialog(
      'Confirm Clock In',
      `Are you sure you want to clock in ${name} with ${hourTypeLabel} hours?`,
      'clockIn',
      employeeId,
      hourType
    );
    
    // Reset hour type selector
    setSelectingHourTypeEmployee(null);
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
    const durationText = BREAK_DURATIONS.find(d => d.value === duration)?.label || `${duration} minutes`;
    
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
  
  // Cancel hour type selection
  const cancelHourTypeSelection = () => {
    setSelectingHourTypeEmployee(null);
  };

  // Navigate to employee timesheet history
  const navigateToEmployeeHistory = (employeeId) => {
    if (employeeId) {
      navigate(`/time-sheet/employee/${employeeId}/history`);
    } else {
      toast.error("Cannot view history - invalid employee ID");
    }
  };

  // Navigate to employee payroll
  const navigateToEmployeePayroll = (employeeId) => {
    if (employeeId) {
      navigate(`/time-sheet/employee/${employeeId}/payroll`);
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

  // Render employee list
  const renderEmployeeList = () => {
    if (error) {
      return <ErrorDisplay error={error} onRetry={refreshEmployees} />;
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
        {filteredEmployees.map(employee => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            selectingBreakEmployee={selectingBreakEmployee}
            selectingHourTypeEmployee={selectingHourTypeEmployee}
            onCardClick={handleCardClick}
            onClockIn={isAdmin ? handleSelectHourType : confirmClockIn}
            onClockOut={confirmClockOut}
            onSelectBreak={handleSelectBreak}
            onStartBreak={confirmStartBreak}
            onEndBreak={confirmEndBreak}
            onCancelBreakSelection={cancelBreakSelection}
            onNavigateToHistory={navigateToEmployeeHistory}
            onNavigateToPayroll={navigateToEmployeePayroll}
            onSelectHourType={handleSelectHourType}
            onStartClockIn={confirmClockInWithHourType}
            onCancelHourTypeSelection={cancelHourTypeSelection}
          />
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
      
      <TimesheetHeader 
        onSearchChange={handleSearchChange}
        onRefresh={refreshEmployees} 
      />
      
      <div className="bg-white p-3 p-lg-4 rounded shadow-sm">
        {renderEmployeeList()}
      </div>
    </div>
  );
};

export default EmployeeTimesheet; 