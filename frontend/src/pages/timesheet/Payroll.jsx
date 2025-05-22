import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ManualHoursEntry from '@/components/timesheet/ManualHoursEntry';
import PrintPayroll from '@/components/timesheet/PrintPayroll';
import AddIncentive from '@/components/timesheet/AddIncentive';
import EditShift from '@/components/timesheet/EditShift';
import useAuth from '@/hooks/useAuth';
import usePayroll from '@/hooks/usePayroll';
import { format, parseISO } from 'date-fns';

// Presenter component - responsible for rendering the UI
const PayrollPresenter = ({ 
  employee,
  payPeriod,
  currentUser,
  dailyData,
  weekTotals,
  totals,
  netPay,
  error,
  periodOffset,
  formatBreakDuration,
  handleGoBack,
  handlePreviousPeriod,
  handleCurrentPeriod,
  handleNextPeriod,
  navigateToEmployeeHistory,
  loadPayPeriodData,
  employeeId,
  DEFAULT_HOURLY_RATE,
  OVERTIME_MULTIPLIER,
  incentives,
  onEditShift
}) => {
  const [selectedShift, setSelectedShift] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = (timesheetId) => {
    // Find the timesheet object from the dailyData based on timesheetId
    let foundTimesheet = null;
    
    for (const day of dailyData) {
      for (const shift of day.timesheets) {
        if (shift.timesheetId === timesheetId) {
          // We need the actual timesheet object with date, clock_in, clock_out
          // Let's fetch it from the original data (we need to implement this in the hook)
          foundTimesheet = onEditShift(timesheetId);
          break;
        }
      }
      if (foundTimesheet) break;
    }
    
    if (foundTimesheet) {
      setSelectedShift(foundTimesheet);
      setIsEditModalOpen(true);
    }
  };

  return (
    <div className="container-fluid p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Edit Shift Modal */}
      <EditShift
        timesheet={selectedShift}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadPayPeriodData}
      />
      
      {error ? (
        <div className="alert alert-danger">
          <p>{error}</p>
          <button className="btn btn-outline-secondary mt-2" onClick={handleGoBack}>
            Back to Employees
          </button>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <button className="btn btn-outline-secondary me-3" onClick={handleGoBack}>
                <i className="fas fa-arrow-left me-1"></i> Back
              </button>
              <h1 className="h3 mb-0">
                {employee ? `${employee.first_name} ${employee.last_name}'s Payroll` : 'Employee Payroll'}
              </h1>
            </div>
            <div className="d-flex">
              {currentUser?.user_type?.type_id === 1 && (
                <>
                  <ManualHoursEntry 
                    userId={employeeId} 
                    onSuccess={loadPayPeriodData}
                    buttonText="Add Shift" 
                    buttonIcon="fa-calendar-plus"
                  />
                  <AddIncentive
                    userId={employeeId}
                    payPeriod={payPeriod}
                    onSuccess={loadPayPeriodData}
                    buttonText="Add Incentive"
                    buttonIcon="fa-award"
                  />
                </>
              )}
              <PrintPayroll 
                employee={employee}
                payPeriod={payPeriod}
                dailyData={dailyData}
                weekTotals={weekTotals}
                totals={totals}
              />
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Employee Information</h5>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <p><strong>ID:</strong> {employee?.emp_code || 'N/A'}</p>
                      <p><strong>Phone:</strong> {employee?.phone || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Hiring Date:</strong> {employee?.hiringDate ? 
                          format(parseISO(employee.hiringDate), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                      <button 
                        className="btn btn-sm btn-outline-primary mt-2" 
                        onClick={navigateToEmployeeHistory}
                      >
                        View Timesheet History
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Pay Period Information</h5>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <p>
                        <strong>Start Date:</strong> {payPeriod.startDate ? 
                          format(parseISO(payPeriod.startDate), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                      <p>
                        <strong>End Date:</strong> {payPeriod.endDate ? 
                          format(parseISO(payPeriod.endDate), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Pay Rate:</strong> ${employee && employee.hourly_rate ? 
                          parseFloat(employee.hourly_rate).toFixed(2) : 
                          DEFAULT_HOURLY_RATE.toFixed(2)}/hr
                      </p>
                      <p>
                        <strong>Overtime Rate:</strong> ${employee && employee.hourly_rate ? 
                          (parseFloat(employee.hourly_rate) * OVERTIME_MULTIPLIER).toFixed(2) : 
                          (DEFAULT_HOURLY_RATE * OVERTIME_MULTIPLIER).toFixed(2)}/hr
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pay Period Navigation */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Pay Period Selection</h5>
                <div className="btn-group">
                  <button 
                    className="btn btn-outline-primary" 
                    onClick={handlePreviousPeriod}
                    disabled={payPeriod.isEarliest}
                  >
                    <i className="fas fa-chevron-left me-1"></i> Previous Period
                  </button>
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={handleCurrentPeriod}
                    disabled={periodOffset === 0}
                  >
                    Current Period
                  </button>
                  <button 
                    className="btn btn-outline-primary" 
                    onClick={handleNextPeriod}
                    disabled={payPeriod.isLatest}
                  >
                    Next Period <i className="fas fa-chevron-right ms-1"></i>
                  </button>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="badge bg-info">
                  {periodOffset === 0 ? 'Current Pay Period' : 
                   periodOffset < 0 ? `${Math.abs(periodOffset)} periods ago` : 
                   `${periodOffset} periods from first period`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Daily Breakdown</h5>
            </div>
            <div className="card-body p-0">
              {dailyData.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted">No timesheet data available for this pay period.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Shift</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Hour Type</th>
                        <th>Hours</th>
                        <th>Rate</th>
                        <th>Break Duration</th>
                        <th>Pay</th>
                        {currentUser?.user_type?.type_id === 1 && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {dailyData.map((day, index) => {
                        // Check if this is the last day of any week
                        const isLastDayOfWeek = (index === 6) || // First week
                                              (index === 13) || // Second week
                                              (index === dailyData.length - 1); // Last day of data
                        
                        const weekNumber = day.weekNumber;
                        const currentWeekTotals = weekTotals[`week${weekNumber + 1}`];
                        
                        // If no timesheets for the day
                        if (day.timesheets.length === 0) {
                          const emptyDayRow = (
                            <tr key={day.date}>
                              <td>{format(parseISO(day.date), 'MM/dd/yyyy')}</td>
                              <td>{day.dayOfWeek}</td>
                              <td>-</td>
                              <td>-</td>
                              <td>-</td>
                              <td>-</td>
                              <td>0.00</td>
                              <td>$0.00</td>
                              <td>0 min</td>
                              <td>$0.00</td>
                              {currentUser?.user_type?.type_id === 1 && <td>-</td>}
                            </tr>
                          );

                          // Add weekly total row if it's the last day of the week
                          if (isLastDayOfWeek && currentWeekTotals) {
                            return (
                              <React.Fragment key={day.date}>
                                {emptyDayRow}
                                <tr className="table-info fw-bold">
                                  <td colSpan="5">Week {weekNumber + 1} Totals</td>
                                  <td colSpan="2">{currentWeekTotals.totalHours.toFixed(2)} hours</td>
                                  <td colSpan={currentUser?.user_type?.type_id === 1 ? '4' : '3'}>
                                    ${currentWeekTotals.totalPay.toFixed(2)}
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          }
                          return emptyDayRow;
                        }
                        
                        // Generate rows for each shift
                        const shiftRows = day.timesheets.map((shift, shiftIndex) => (
                          <tr key={`${day.date}-${shift.timesheetId}`} className={shiftIndex > 0 ? "table-light" : ""}>
                            {shiftIndex === 0 && (
                              <>
                                <td rowSpan={day.timesheets.length}>
                                  {format(parseISO(day.date), 'MM/dd/yyyy')}
                                </td>
                                <td rowSpan={day.timesheets.length}>
                                  {day.dayOfWeek}
                                </td>
                              </>
                            )}
                            <td>{shiftIndex + 1}</td>
                            <td>{shift.clockIn}</td>
                            <td>{shift.clockOut}</td>
                            <td>{shift.hourType.charAt(0).toUpperCase() + shift.hourType.slice(1)}</td>
                            <td>{shift.hours.toFixed(2)}</td>
                            <td>${shift.rate.toFixed(2)}</td>
                            <td>{formatBreakDuration(shift.breakMinutes)}</td>
                            <td>${shift.pay.toFixed(2)}</td>
                            {currentUser?.user_type?.type_id === 1 && (
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEditClick(shift.timesheetId)}
                                  title="Edit shift times"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                              </td>
                            )}
                          </tr>
                        ));
                        
                        // Add weekly total row if it's the last day of the week
                        if (isLastDayOfWeek && currentWeekTotals) {
                          return (
                            <React.Fragment key={day.date}>
                              {shiftRows}
                              <tr className="table-info fw-bold">
                                <td colSpan="5">Week {weekNumber + 1} Totals</td>
                                <td colSpan="2">{currentWeekTotals.totalHours.toFixed(2)} hours</td>
                                <td colSpan={currentUser?.user_type?.type_id === 1 ? '4' : '3'}>
                                  ${currentWeekTotals.totalPay.toFixed(2)}
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        }
                        
                        return (
                          <React.Fragment key={day.date}>
                            {shiftRows}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                    <tfoot className="table-light">
                      <tr className="fw-bold">
                        <td colSpan="5">Pay Period Totals</td>
                        <td colSpan="2">{totals.totalHours.toFixed(2)} hours</td>
                        <td colSpan={currentUser?.user_type?.type_id === 1 ? '4' : '3'}>
                          ${totals.totalPay.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Pay Summary</h5>
                </div>
                <div className="card-body">
                  <table className="table table-striped">
                    <tbody>
                      {Object.entries(totals.hourTypes).map(([type, data]) => (
                        <tr key={type}>
                          {type === 'incentive' ? (
                            <th>Incentive (Bonus)</th>
                          ) : (
                            <th>{type.charAt(0).toUpperCase() + type.slice(1)} Hours ({data.hours.toFixed(2)})</th>
                          )}
                          <td className="text-end">${data.pay.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="table-primary fw-bold">
                        <th>Net Pay</th>
                        <td className="text-end">${netPay.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Incentives Section */}
            {/*  {incentives.length > 0 && (
                <div className="card mt-3">
                  <div className="card-header">
                    <h5 className="mb-0">Incentives</h5>
                  </div>
                  <div className="card-body p-0">
                    <table className="table table-striped mb-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incentives.map(incentive => (
                          <tr key={incentive.incentive_id}>
                            <td>{format(parseISO(incentive.date), 'MM/dd/yyyy')}</td>
                            <td>${parseFloat(incentive.amount).toFixed(2)}</td>
                            <td>{incentive.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}*/}
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Pay Period Summary</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="text-muted small">Total Days</div>
                        <div className="h5">{dailyData.length}</div>
                      </div>
                      <div className="mb-3">
                        <div className="text-muted small">Days Worked</div>
                        <div className="h5">{dailyData.filter(day => day.totalHours > 0).length}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="text-muted small">Total Hours</div>
                        <div className="h5">{totals.totalHours.toFixed(2)}</div>
                      </div>
                      <div className="mb-3">
                        <div className="text-muted small">Break Time</div>
                        <div className="h5">{(totals.breakMinutes / 60).toFixed(2)} hours</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Container component - responsible for data management and logic
const Payroll = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // Use the payroll hook to manage state and logic
  const {
    employee,
    payPeriod,
    dailyData,
    weekTotals,
    totals,
    netPay,
    error,
    periodOffset,
    incentives,
    DEFAULT_HOURLY_RATE,
    OVERTIME_MULTIPLIER,
    formatBreakDuration,
    handleGoBack,
    handlePreviousPeriod,
    handleCurrentPeriod,
    handleNextPeriod,
    navigateToEmployeeHistory,
    loadPayPeriodData,
    getTimesheetById
  } = usePayroll(employeeId, navigate);
  
  // Render the presenter component with all necessary props
  return (
    <PayrollPresenter
      employee={employee}
      payPeriod={payPeriod}
      currentUser={currentUser}
      dailyData={dailyData}
      weekTotals={weekTotals}
      totals={totals}
      netPay={netPay}
      error={error}
      periodOffset={periodOffset}
      formatBreakDuration={formatBreakDuration}
      handleGoBack={handleGoBack}
      handlePreviousPeriod={handlePreviousPeriod}
      handleCurrentPeriod={handleCurrentPeriod}
      handleNextPeriod={handleNextPeriod}
      navigateToEmployeeHistory={navigateToEmployeeHistory}
      loadPayPeriodData={loadPayPeriodData}
      employeeId={employeeId}
      DEFAULT_HOURLY_RATE={DEFAULT_HOURLY_RATE}
      OVERTIME_MULTIPLIER={OVERTIME_MULTIPLIER}
      incentives={incentives}
      onEditShift={getTimesheetById}
    />
  );
};

export default Payroll; 