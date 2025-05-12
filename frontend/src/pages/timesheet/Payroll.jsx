import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi, timeSheetApi, timeSheetBreakApi } from '@/api/baseApi';
import { format, parseISO, addDays, subDays, differenceInDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Payroll = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [timeSheets, setTimeSheets] = useState([]);
  const [breaks, setBreaks] = useState([]);
  const [payPeriod, setPayPeriod] = useState({
    startDate: '',
    endDate: ''
  });
  const [periodOffset, setPeriodOffset] = useState(0); // Track current period offset
  const [hiringDateObj, setHiringDateObj] = useState(null); // Store parsed hiring date
  const [error, setError] = useState(null);

  
  // Default pay rates - will be overridden by employee's actual rate if available
  const DEFAULT_HOURLY_RATE = 15.00;
  const OVERTIME_MULTIPLIER = 1.5;
  
  // Tax and deduction rates
  const TAX_RATE = 0.15;
  const INSURANCE_RATE = 0.05;
  
  // Get two-week period based on hiring date and offset
  const calculatePayPeriod = (hiringDate, offset = 0) => {
    const hireDate = parseISO(hiringDate);
    const today = new Date();
    
    // Find the most recent Saturday before today
    const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const daysToSaturday = (dayOfWeek + 1) % 7; // Days since last Saturday
    const mostRecentSaturday = subDays(today, daysToSaturday);
    
    // Calculate the first Saturday after hiring date to establish a reference point
    const hireDateDayOfWeek = hireDate.getDay();
    const daysToNextSaturday = (6 - hireDateDayOfWeek + 7) % 7; // Days until next Saturday
    const firstSaturdayAfterHire = addDays(hireDate, daysToNextSaturday);
    
    // Calculate number of complete two-week periods between the first Saturday after hire and most recent Saturday
    const daysBetween = differenceInDays(mostRecentSaturday, firstSaturdayAfterHire);
    const completePeriods = Math.floor(daysBetween / 14);
    
    // Apply the offset to navigate between periods (negative for past periods)
    const targetPeriod = completePeriods + offset;
    
    // Don't allow periods before hiring
    if (targetPeriod < 0 && differenceInDays(addDays(firstSaturdayAfterHire, targetPeriod * 14), hireDate) < 0) {
      // If we try to go before hiring date, return the first period starting from first Saturday after hire
      const periodStart = firstSaturdayAfterHire;
      const periodEnd = addDays(periodStart, 13);
      return {
        startDate: format(periodStart, 'yyyy-MM-dd'),
        endDate: format(periodEnd, 'yyyy-MM-dd'),
        isEarliest: true
      };
    } else if (targetPeriod > completePeriods) {
      // If we try to go to the future, return the current period
      return calculatePayPeriod(hiringDate, 0);
    }
    
    // Start of selected period (based on first Saturday after hire + offset periods)
    const periodStart = addDays(firstSaturdayAfterHire, targetPeriod * 14);
    // End of selected period (13 days after start = 2 weeks total)
    const periodEnd = addDays(periodStart, 13);
    
    return {
      startDate: format(periodStart, 'yyyy-MM-dd'),
      endDate: format(periodEnd, 'yyyy-MM-dd'),
      isEarliest: differenceInDays(periodStart, firstSaturdayAfterHire) <= 0,
      isLatest: targetPeriod === completePeriods
    };
  };
  
  // Load employee data and timesheet history for the selected period
  const loadPayPeriodData = async (newOffset = periodOffset) => {
    if (!employeeId || !hiringDateObj) return;
    
    try {
      // Calculate pay period based on hiring date and current offset
      const period = calculatePayPeriod(hiringDateObj, newOffset);
      setPayPeriod(period);
      
      // Get timesheet data for the pay period
      const timeSheetResponse = await timeSheetApi.getByUser(
        employeeId,
        period.startDate,
        period.endDate
      );
      
      const timesheetData = timeSheetResponse.data || [];
      setTimeSheets(timesheetData);
      
      // Get all breaks for the timesheets
      if (timesheetData.length > 0) {
        const breakPromises = timesheetData.map(timesheet => 
          timeSheetBreakApi.getByTimesheet(timesheet.timesheet_id)
        );
        
        const breakResponses = await Promise.all(breakPromises);
        const allBreaks = breakResponses.flatMap(response => response.data || []);
        setBreaks(allBreaks);
      } else {
        setBreaks([]);
      }
    } catch (err) {
      toast.error('Error loading timesheet data');
      console.error('Failed to load timesheet data:', err);
    }
  };
  
  // Load initial employee data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) {
        setError("No employee selected");
        return;
      }
      
      try {
        // Get employee details
        const employeeResponse = await userApi.getOne(employeeId);
        const employeeData = employeeResponse.data;
        setEmployee(employeeData);
        
        // Store the hiring date for later use
        const hiringDate = employeeData.hiringDate || employeeData.created_at;
        setHiringDateObj(hiringDate);
        
      } catch (err) {
        setError('Failed to load employee data: ' + (err.message || ''));
        toast.error('Error loading employee data');
      }
    };
    
    fetchEmployeeData();
  }, [employeeId]);
  
  // Load pay period data when hiring date or offset changes
  useEffect(() => {
    if (hiringDateObj) {
      loadPayPeriodData();
    }
  }, [hiringDateObj, periodOffset]);
  
  // Navigate to previous pay period
  const handlePreviousPeriod = () => {
    const newOffset = periodOffset - 1;
    setPeriodOffset(newOffset);
  };
  
  // Navigate to next pay period
  const handleNextPeriod = () => {
    const newOffset = periodOffset + 1;
    setPeriodOffset(newOffset);
  };
  
  // Navigate to current pay period
  const handleCurrentPeriod = () => {
    setPeriodOffset(0);
  };
  
  // Calculate daily breakdowns
  const calculateDailyData = () => {
    if (!payPeriod.startDate || !payPeriod.endDate) return [];
    
    // Get the employee's hourly rate or use default
    const hourlyRate = employee && employee.hourly_rate ? parseFloat(employee.hourly_rate) : DEFAULT_HOURLY_RATE;
    
    // Create an array of all days in the pay period
    const days = eachDayOfInterval({
      start: parseISO(payPeriod.startDate),
      end: parseISO(payPeriod.endDate)
    });
    
    // Group days by week for weekly totals
    const weeklyHours = {};
    
    // Map each day to its time data
    return days.map(day => {
      // Find timesheets for this day (could be multiple with different hour_types)
      const dayTimesheets = timeSheets.filter(ts => 
        isSameDay(parseISO(ts.date), day)
      );
      
      // If no timesheets, return empty day data
      if (dayTimesheets.length === 0) {
        // Determine which week this day belongs to
        const weekNumber = Math.floor(differenceInDays(day, parseISO(payPeriod.startDate)) / 7);
        
        return {
          date: format(day, 'yyyy-MM-dd'),
          dayOfWeek: format(day, 'EEEE'),
          clockIn: '-',
          clockOut: '-',
          totalHoursForDay: 0,
          breaks: 0,
          breakMinutes: 0,
          weekNumber,
          hourTypes: {},
          totalHours: 0,
          totalPay: 0
        };
      }
      
      // Use first timesheet for basic info like clock in/out
      const firstTimesheet = dayTimesheets[0];
      
      // Get all breaks for these timesheets
      const timesheetBreaks = dayTimesheets.flatMap(timesheet => 
        breaks.filter(b => b.timesheet_id === timesheet.timesheet_id)
      );
      
      // Calculate total break time in minutes
      const breakMinutes = timesheetBreaks.reduce((total, breakItem) => {
        const startTime = parseISO(breakItem.start_time);
        const endTime = breakItem.end_time ? parseISO(breakItem.end_time) : new Date();
        return total + differenceInDays(endTime, startTime) * 24 * 60 + 
               (endTime.getHours() - startTime.getHours()) * 60 + 
               (endTime.getMinutes() - startTime.getMinutes());
      }, 0);
      
      // Group hours by type and calculate pay
      const hourTypes = {};
      let totalPay = 0;
      let totalHoursForDay = 0;
      
      dayTimesheets.forEach(timesheet => {
        const type = timesheet.hour_type || 'regular';
        const hours = parseFloat(timesheet.total_hours || 0);
        const rate = parseFloat(timesheet.rate || hourlyRate);
        
        totalHoursForDay += hours;
        totalPay += hours * rate;
        
        if (!hourTypes[type]) {
          hourTypes[type] = { hours: 0, rate, pay: 0 };
        }
        
        hourTypes[type].hours += hours;
        hourTypes[type].pay += hours * rate;
      });
      
      // For weekly hours tracking
      const weekNumber = Math.floor(differenceInDays(day, parseISO(payPeriod.startDate)) / 7);
      
      // Initialize week if not already done
      if (!weeklyHours[weekNumber]) weeklyHours[weekNumber] = {};
      
      // Add this day's hours to the week total by type
      Object.entries(hourTypes).forEach(([type, data]) => {
        if (!weeklyHours[weekNumber][type]) {
          weeklyHours[weekNumber][type] = { hours: 0, pay: 0 };
        }
        weeklyHours[weekNumber][type].hours += data.hours;
        weeklyHours[weekNumber][type].pay += data.pay;
      });
      
      return {
        date: format(day, 'yyyy-MM-dd'),
        dayOfWeek: format(day, 'EEEE'),
        clockIn: firstTimesheet?.clock_in ? format(parseISO(firstTimesheet.clock_in), 'hh:mm a') : '-',
        clockOut: firstTimesheet?.clock_out ? format(parseISO(firstTimesheet.clock_out), 'hh:mm a') : '-',
        totalHoursForDay,
        breaks: timesheetBreaks.length,
        breakMinutes,
        weekNumber,
        hourTypes,
        totalHours: totalHoursForDay,
        totalPay
      };
    });
  };
  
  // Get daily breakdown
  const dailyData = calculateDailyData();
  
  // Calculate week totals
  const calculateWeekTotals = () => {
    if (dailyData.length === 0) return { week1: null, week2: null };
    
    const week1Data = dailyData.filter(day => day.weekNumber === 0);
    const week2Data = dailyData.filter(day => day.weekNumber === 1);
    
    const calculateWeekTotal = (weekData) => {
      // Initialize accumulators for different hour types
      const hourTypeAccumulator = {};
      
      // Calculate total hours, pay and breaks
      return weekData.reduce((acc, day) => {
        // Add up hour types
        Object.entries(day.hourTypes).forEach(([type, data]) => {
          if (!hourTypeAccumulator[type]) {
            hourTypeAccumulator[type] = { hours: 0, pay: 0 };
          }
          hourTypeAccumulator[type].hours += data.hours;
          hourTypeAccumulator[type].pay += data.pay;
        });
        
        return {
          totalHours: acc.totalHours + day.totalHours,
          breakMinutes: acc.breakMinutes + day.breakMinutes,
          totalPay: acc.totalPay + day.totalPay,
          hourTypes: hourTypeAccumulator
        };
      }, {
        totalHours: 0,
        breakMinutes: 0,
        totalPay: 0,
        hourTypes: {}
      });
    };
    
    return {
      week1: calculateWeekTotal(week1Data),
      week2: calculateWeekTotal(week2Data)
    };
  };
  
  const weekTotals = calculateWeekTotals();
  
  // Calculate overall totals
  const totals = dailyData.reduce((acc, day) => {
    // Add hour types to accumulator
    Object.entries(day.hourTypes).forEach(([type, data]) => {
      if (!acc.hourTypes[type]) {
        acc.hourTypes[type] = { hours: 0, pay: 0 };
      }
      acc.hourTypes[type].hours += data.hours;
      acc.hourTypes[type].pay += data.pay;
    });
    
    return {
      totalHours: acc.totalHours + day.totalHours,
      breakMinutes: acc.breakMinutes + day.breakMinutes,
      totalPay: acc.totalPay + day.totalPay,
      hourTypes: acc.hourTypes
    };
  }, {
    totalHours: 0,
    breakMinutes: 0,
    totalPay: 0,
    hourTypes: {}
  });
  
  // Calculate net pay
  const netPay = totals.totalPay;
  
  // Go back to employee list
  const handleGoBack = () => {
    navigate('/time-sheet/employee');
  };
  
  // Print payroll as PDF
  const printPayroll = () => {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    
    // CSS for better printing
    const printCSS = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { display: flex; justify-content: space-between; }
        .summary { margin: 20px 0; }
        .totals { font-weight: bold; }
        .week-totals { font-weight: bold; background-color: #e6f7ff; }
        .company-info { margin-bottom: 20px; }
        .footer { margin-top: 30px; font-size: 12px; text-align: center; }
      </style>
    `;
    
    // Format dates for display
    const formattedStartDate = payPeriod.startDate ? format(parseISO(payPeriod.startDate), 'MMMM dd, yyyy') : '';
    const formattedEndDate = payPeriod.endDate ? format(parseISO(payPeriod.endDate), 'MMMM dd, yyyy') : '';
    
    // Get the employee's hourly rate
    const hourlyRate = employee && employee.hourly_rate ? parseFloat(employee.hourly_rate) : DEFAULT_HOURLY_RATE;
    const overtimeRate = hourlyRate * OVERTIME_MULTIPLIER;
    
    // Create HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payroll - ${employee?.first_name || ''} ${employee?.last_name || ''}</title>
        ${printCSS}
      </head>
      <body>
        <div class="company-info">
          <h1>MedTrans Express, Inc.</h1>
          <p>123 Main Street, City, State ZIP</p>
          <p>Phone: (123) 456-7890</p>
        </div>
        
        <div class="header">
          <div>
            <h2>Payroll Statement</h2>
            <p>Pay Period: ${formattedStartDate} - ${formattedEndDate}</p>
          </div>
          <div>
            <p><strong>Employee:</strong> ${employee?.first_name || ''} ${employee?.last_name || ''}</p>
            <p><strong>ID:</strong> ${employee?.emp_code || ''}</p>
            <p><strong>Hiring Date:</strong> ${employee?.hiringDate ? format(parseISO(employee.hiringDate), 'MMMM dd, yyyy') : ''}</p>
            <p><strong>Pay Rate:</strong> $${hourlyRate.toFixed(2)}/hr</p>
            <p><strong>Overtime Rate:</strong> $${overtimeRate.toFixed(2)}/hr</p>
          </div>
        </div>
        
        <h3>Daily Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Hour Type</th>
              <th>Hours</th>
              <th>Rate</th>
              <th>Pay</th>
            </tr>
          </thead>
          <tbody>
            ${dailyData.map((day, index) => {
              const isLastDayOfWeek1 = day.weekNumber === 0 && 
                dailyData[index + 1] && dailyData[index + 1].weekNumber === 1;
              
              // Generate rows for each hour type
              const hourTypeRows = Object.entries(day.hourTypes).map(([type, data], typeIndex) => (
                <tr key={`${day.date}-${type}`} className={typeIndex > 0 ? "table-light" : ""}>
                  {typeIndex === 0 && (
                    <>
                      <td rowSpan={Object.keys(day.hourTypes).length || 1}>
                        {format(parseISO(day.date), 'MM/dd/yyyy')}
                      </td>
                      <td rowSpan={Object.keys(day.hourTypes).length || 1}>
                        {day.dayOfWeek}
                      </td>
                      <td rowSpan={Object.keys(day.hourTypes).length || 1}>
                        {day.clockIn}
                      </td>
                      <td rowSpan={Object.keys(day.hourTypes).length || 1}>
                        {day.clockOut}
                      </td>
                    </>
                  )}
                  <td>{type.charAt(0).toUpperCase() + type.slice(1)}</td>
                  <td>{data.hours.toFixed(2)}</td>
                  <td>${data.rate.toFixed(2)}</td>
                  <td>${data.pay.toFixed(2)}</td>
                </tr>
              ));
              
              // If no hour types, show a row with zeros
              if (hourTypeRows.length === 0) {
                hourTypeRows.push(
                  <tr key={day.date}>
                    <td>{format(parseISO(day.date), 'MM/dd/yyyy')}</td>
                    <td>{day.dayOfWeek}</td>
                    <td>{day.clockIn}</td>
                    <td>{day.clockOut}</td>
                    <td>-</td>
                    <td>0.00</td>
                    <td>$0.00</td>
                    <td>$0.00</td>
                  </tr>
                );
              }
              
              // Weekly total row
              const weekTotalRow = isLastDayOfWeek1 && weekTotals.week1 && (
                <tr className="table-info fw-bold">
                  <td colSpan="4">Week 1 Totals</td>
                  <td colSpan="2">{weekTotals.week1.totalHours.toFixed(2)} hours</td>
                  <td colSpan="2">${weekTotals.week1.totalPay.toFixed(2)}</td>
                </tr>
              );
              
              return (
                <React.Fragment key={day.date}>
                  {hourTypeRows}
                  {weekTotalRow}
                </React.Fragment>
              );
            }).join('')}
          </tbody>
          <tfoot>
            <tr className="totals">
              <td colspan="4">Totals</td>
              <td>${totals.totalHours.toFixed(2)}</td>
              <td>${totals.totalPay.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="summary">
          <h3>Pay Summary</h3>
          <table>
            {Object.entries(totals.hourTypes).map(([type, data]) => (
              <tr key={type}>
                <th>{type.charAt(0).toUpperCase() + type.slice(1)} Hours ({data.hours.toFixed(2)})</th>
                <td>${data.pay.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="totals">
              <th>Net Pay</th>
              <td>${netPay.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated document. No signature is required.</p>
          <p>Generated on: ${format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };
  
  // Navigate to employee history
  const navigateToEmployeeHistory = () => {
    navigate(`/time-sheet/employee/${employeeId}/history`);
  };
  
  return (
    <div className="container-fluid p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
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
            <div>
              <button 
                className="btn btn-primary" 
                onClick={printPayroll}
              >
                <i className="fas fa-print me-1"></i> Print Payroll
              </button>
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
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Hour Type</th>
                        <th>Hours</th>
                        <th>Rate</th>
                        <th>Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyData.map((day, index) => {
                        // Add week 1 totals after the last day of week 1
                        const isLastDayOfWeek1 = day.weekNumber === 0 && 
                          dailyData[index + 1] && dailyData[index + 1].weekNumber === 1;
                        
                        // Generate rows for each hour type
                        const hourTypeRows = Object.entries(day.hourTypes).map(([type, data], typeIndex) => (
                          <tr key={`${day.date}-${type}`} className={typeIndex > 0 ? "table-light" : ""}>
                            {typeIndex === 0 && (
                              <>
                                <td rowSpan={Object.keys(day.hourTypes).length || 1}>
                                  {format(parseISO(day.date), 'MM/dd/yyyy')}
                                </td>
                                <td rowSpan={Object.keys(day.hourTypes).length || 1}>
                                  {day.dayOfWeek}
                                </td>
                                <td rowSpan={Object.keys(day.hourTypes).length || 1}>
                                  {day.clockIn}
                                </td>
                                <td rowSpan={Object.keys(day.hourTypes).length || 1}>
                                  {day.clockOut}
                                </td>
                              </>
                            )}
                            <td>{type.charAt(0).toUpperCase() + type.slice(1)}</td>
                            <td>{data.hours.toFixed(2)}</td>
                            <td>${data.rate.toFixed(2)}</td>
                            <td>${data.pay.toFixed(2)}</td>
                          </tr>
                        ));
                        
                        // If no hour types, show a row with zeros
                        if (hourTypeRows.length === 0) {
                          hourTypeRows.push(
                            <tr key={day.date}>
                              <td>{format(parseISO(day.date), 'MM/dd/yyyy')}</td>
                              <td>{day.dayOfWeek}</td>
                              <td>{day.clockIn}</td>
                              <td>{day.clockOut}</td>
                              <td>-</td>
                              <td>0.00</td>
                              <td>$0.00</td>
                              <td>$0.00</td>
                            </tr>
                          );
                        }
                        
                        // Weekly total row
                        const weekTotalRow = isLastDayOfWeek1 && weekTotals.week1 && (
                          <tr className="table-info fw-bold">
                            <td colSpan="4">Week 1 Totals</td>
                            <td colSpan="2">{weekTotals.week1.totalHours.toFixed(2)} hours</td>
                            <td colSpan="2">${weekTotals.week1.totalPay.toFixed(2)}</td>
                          </tr>
                        );
                        
                        return (
                          <React.Fragment key={day.date}>
                            {hourTypeRows}
                            {weekTotalRow}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                    <tfoot className="table-light">
                      <tr className="fw-bold">
                        <td colSpan="4">Pay Period Totals</td>
                        <td colSpan="2">{totals.totalHours.toFixed(2)} hours</td>
                        <td colSpan="2">${totals.totalPay.toFixed(2)}</td>
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
                          <th>{type.charAt(0).toUpperCase() + type.slice(1)} Hours ({data.hours.toFixed(2)})</th>
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

export default Payroll; 