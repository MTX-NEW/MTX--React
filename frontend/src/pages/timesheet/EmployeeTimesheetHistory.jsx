import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tab, Tabs, Table, Card, Row, Col, Button } from 'react-bootstrap';
import { userApi, timeSheetApi, timeSheetBreakApi } from '@/api/baseApi';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInMinutes } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const EmployeeTimesheetHistory = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  
  // State for employee data
  const [employee, setEmployee] = useState(null);
  const [timeSheets, setTimeSheets] = useState([]);
  const [breaks, setBreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for date range selection
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfWeek(new Date()), 'yyyy-MM-dd'),
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('daily');
  
  // Load employee data and timesheet history
  useEffect(() => {
    const fetchData = async () => {
      if (!employeeId || employeeId === 'undefined') {
        setError("Invalid employee ID or no employee selected");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Get employee details
        const employeeResponse = await userApi.getOne(employeeId);
        setEmployee(employeeResponse.data);
        
        // Get timesheet data
        const timeSheetResponse = await timeSheetApi.getByUser(
          employeeId,
          dateRange.startDate,
          dateRange.endDate
        );
        
        setTimeSheets(timeSheetResponse.data || []);
        
        // Get all breaks for the timesheets
        if (timeSheetResponse.data && timeSheetResponse.data.length > 0) {
          const breakPromises = timeSheetResponse.data.map(timesheet => 
            timeSheetBreakApi.getByTimesheet(timesheet.timesheet_id)
          );
          
          const breakResponses = await Promise.all(breakPromises);
          const allBreaks = breakResponses.flatMap(response => response.data || []);
          setBreaks(allBreaks);
        } else {
          // Reset breaks if no timesheets
          setBreaks([]);
        }
        
        setError(null);
      } catch (err) {
        // Do not redirect, just show error message
        if (err.response && err.response.status === 404 && err.response.config.url.includes('/users/')) {
          setError(`Employee ID ${employeeId} not found. Please select an existing employee.`);
          toast.error(`Employee ID ${employeeId} not found`);
        } else {
          setError('Failed to load employee timesheet data. ' + (err.message || ''));
          toast.error('Error loading timesheet data');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [employeeId, dateRange.startDate, dateRange.endDate]);
  
  // Handle date range changes
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };
  
  // Set date range for the selected period
  const setViewRange = (view) => {
    const today = new Date();
    
    switch(view) {
      case 'week':
        setDateRange({
          startDate: format(startOfWeek(today), 'yyyy-MM-dd'),
          endDate: format(endOfWeek(today), 'yyyy-MM-dd'),
        });
        break;
      case 'month':
        setDateRange({
          startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
        });
        break;
      default:
        // Default to today
        const todayFormatted = format(today, 'yyyy-MM-dd');
        setDateRange({
          startDate: todayFormatted,
          endDate: todayFormatted,
        });
    }
    
    setActiveTab(view);
  };
  
  // Calculate statistics for the current date range
  const calculateStats = () => {
    if (!timeSheets || timeSheets.length === 0) {
      return {
        totalHours: 0,
        totalDays: 0,
        avgHoursPerDay: 0,
        totalBreakMinutes: 0,
        avgBreakMinutes: 0,
      };
    }
    
    // Calculate working hours
    const totalHours = timeSheets.reduce((total, sheet) => {
      return total + (parseFloat(sheet.total_regular_hours || 0) + parseFloat(sheet.total_overtime_hours || 0));
    }, 0);
    
    // Count unique days
    const uniqueDays = new Set(timeSheets.map(sheet => sheet.date)).size;
    
    // Calculate average hours per day
    const avgHoursPerDay = uniqueDays ? (totalHours / uniqueDays) : 0;
    
    // Calculate break statistics
    const totalBreakMinutes = breaks.reduce((total, breakItem) => {
      // If end_time is null, break is ongoing - use current time
      const endTime = breakItem.end_time ? parseISO(breakItem.end_time) : new Date();
      const startTime = parseISO(breakItem.start_time);
      return total + differenceInMinutes(endTime, startTime);
    }, 0);
    
    const avgBreakMinutes = timeSheets.length ? (totalBreakMinutes / timeSheets.length) : 0;
    
    return {
      totalHours,
      totalDays: uniqueDays,
      avgHoursPerDay,
      totalBreakMinutes,
      avgBreakMinutes,
    };
  };
  
  // Prepare data for charts
  const prepareChartData = () => {
    if (!timeSheets || timeSheets.length === 0) {
      return { 
        dailyHours: [],
        breakDistribution: [
          { name: 'Working', value: 1, color: '#8884d8' },
          { name: 'Break', value: 0, color: '#82ca9d' },
        ] 
      };
    }
    
    // Daily hours chart data
    const dailyHours = timeSheets.map(sheet => {
      return {
        date: format(parseISO(sheet.date), 'MMM dd'),
        hours: parseFloat(sheet.total_regular_hours || 0) + parseFloat(sheet.total_overtime_hours || 0),
      };
    });
    
    // Break distribution chart data
    const stats = calculateStats();
    const totalWorkMinutes = stats.totalHours * 60;
    return {
      dailyHours,
      breakDistribution: [
        { name: 'Working', value: totalWorkMinutes, color: '#8884d8' },
        { name: 'Break', value: stats.totalBreakMinutes, color: '#82ca9d' },
      ]
    };
  };
  
  // Chart data
  const chartData = prepareChartData();
  
  // Stats
  const stats = calculateStats();
  
  // Go back to employee list
  const handleGoBack = () => {
    navigate('/time-sheet/employee');
  };
  
  // Calculate estimated earnings (for payroll preview)
  const calculateEstimatedEarnings = () => {
    if (!timeSheets || timeSheets.length === 0) {
      return {
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        estimatedPay: 0,
        hourlyRate: 15.00 // Always provide a default hourly rate
      };
    }
    
    // Calculate total hours
    const regularHours = timeSheets.reduce((total, sheet) => 
      total + parseFloat(sheet.total_regular_hours || 0), 0);
    const overtimeHours = timeSheets.reduce((total, sheet) => 
      total + parseFloat(sheet.total_overtime_hours || 0), 0);
    const totalHours = regularHours + overtimeHours;
    
    // Use employee's actual hourly rate or default
    const hourlyRate = employee && employee.hourly_rate ? parseFloat(employee.hourly_rate) : 15.00;
    const overtimeRate = hourlyRate * 1.5; // Overtime at 1.5x
    
    // Calculate estimated pay
    const estimatedPay = (regularHours * hourlyRate) + (overtimeHours * overtimeRate);
    
    return {
      totalHours,
      regularHours,
      overtimeHours,
      estimatedPay,
      hourlyRate
    };
  };
  
  // Get estimated earnings
  const earnings = calculateEstimatedEarnings();
  
  // Navigate to payroll
  const navigateToPayroll = () => {
    navigate(`/time-sheet/employee/${employeeId}/payroll`);
  };
  
  // Navigate to employee timesheet history
  const navigateToEmployeeHistory = (employeeId) => {
    // Make sure employeeId is valid before navigating
    if (employeeId) {
      navigate(`/time-sheet/employee/${employeeId}/history`);
    } else {
      toast.error("Cannot view history - invalid employee ID");
    }
  };
  
  // Render loading state
  if (loading && !employee) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex flex-column align-items-center my-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading employee data...</p>
          <button 
            className="btn btn-outline-secondary mt-3"
            onClick={handleGoBack}
          >
            Back to Employee List
          </button>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error && !employee) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger my-4" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-outline-danger" onClick={handleGoBack}>
            Back to Employee List
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-fluid p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-outline-secondary me-3"
            onClick={handleGoBack}
          >
            <i className="bi bi-arrow-left"></i> Back
          </button>
          
          <h1 className="h3 mb-0">
            {employee?.first_name} {employee?.last_name}'s Timesheet History
          </h1>
        </div>
        
        <div>
          <span className="badge bg-secondary me-2">ID: {employee?.emp_code || 'N/A'}</span>
        </div>
      </div>
      
      {/* Employee Info Card */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={2} className="text-center">
              <img
                src={employee?.profile_image || '/assets/images/profile.jpg'}
                alt={`${employee?.first_name} ${employee?.last_name}`}
                className="rounded-circle mb-2"
                width="100"
                height="100"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/images/profile.jpg';
                }}
              />
            </Col>
            <Col md={6}>
              <h5>{employee?.first_name} {employee?.last_name}</h5>
              <p className="mb-1"><strong>Phone:</strong> {employee?.phone || 'N/A'}</p>
              <p className="mb-1"><strong>Email:</strong> {employee?.email || 'N/A'}</p>
              <p className="mb-1"><strong>Hiring Date:</strong> {employee?.hiringDate || 'N/A'}</p>
            </Col>
            <Col md={4}>
              <div className="text-end">
                <h5>Summary Statistics</h5>
                <p className="mb-1"><strong>Total Hours:</strong> {stats.totalHours}</p>
                <p className="mb-1"><strong>Days Worked:</strong> {stats.totalDays}</p>
                <p className="mb-1"><strong>Avg. Hours/Day:</strong> {stats.avgHoursPerDay}</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Tabs for different views */}
      <Tabs
        activeKey={activeTab}
        onSelect={setViewRange}
        className="mb-4"
      >
        <Tab eventKey="daily" title="Daily View">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <h5 className="mb-0">Daily Timesheet</h5>
              <div>
                <input
                  type="date"
                  className="form-control"
                  id="daily-date-picker"
                  name="daily-date-picker"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value, endDate: e.target.value})}
                />
              </div>
            </Card.Header>
            <Card.Body>
              {timeSheets.length === 0 ? (
                <div className="text-center my-4">
                  <p>No timesheet data available for this day</p>
                </div>
              ) : (
                <>
                  <Table responsive striped bordered>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Regular Hours</th>
                        <th>Overtime Hours</th>
                        <th>Total Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeSheets.map((sheet) => (
                        <tr key={sheet.id}>
                          <td>{format(parseISO(sheet.date), 'MMM dd, yyyy')}</td>
                          <td>{sheet.clock_in ? format(parseISO(sheet.clock_in), 'hh:mm a') : 'N/A'}</td>
                          <td>{sheet.clock_out ? format(parseISO(sheet.clock_out), 'hh:mm a') : 'N/A'}</td>
                          <td>{parseFloat(sheet.total_regular_hours || 0).toFixed(2)}</td>
                          <td>{parseFloat(sheet.total_overtime_hours || 0).toFixed(2)}</td>
                          <td>
                            {(
                              parseFloat(sheet.total_regular_hours || 0) + 
                              parseFloat(sheet.total_overtime_hours || 0)
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  
                  <h5 className="mt-4">Breaks</h5>
                  {breaks.length === 0 ? (
                    <p>No breaks recorded</p>
                  ) : (
                    <Table responsive striped bordered>
                      <thead>
                        <tr>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Duration (min)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {breaks.map((breakItem) => {
                          const startTime = parseISO(breakItem.start_time);
                          const endTime = breakItem.end_time ? parseISO(breakItem.end_time) : null;
                          const duration = endTime ? differenceInMinutes(endTime, startTime) : 'Ongoing';
                          
                          return (
                            <tr key={breakItem.id}>
                              <td>{format(startTime, 'hh:mm a')}</td>
                              <td>{endTime ? format(endTime, 'hh:mm a') : 'Ongoing'}</td>
                              <td>{duration !== 'Ongoing' ? duration : 'Ongoing'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="week" title="Weekly View">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <h5 className="mb-0">Weekly Summary</h5>
              <div className="d-flex">
                <input
                  type="date"
                  className="form-control me-2"
                  id="weekly-start-date"
                  name="weekly-start-date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                />
                <span className="align-self-center mx-2">to</span>
                <input
                  type="date"
                  className="form-control"
                  id="weekly-end-date"
                  name="weekly-end-date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                />
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5>Weekly Hours</h5>
                  {chartData.dailyHours.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={chartData.dailyHours}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" name="Hours Worked" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center my-4">
                      <p>No data available for this week</p>
                    </div>
                  )}
                </Col>
                <Col md={6}>
                  <h5>Work vs Break Distribution</h5>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.breakDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.breakDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${(value / 60).toFixed(2)} hours`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
              
              <Row className="mt-4">
                <Col>
                  <h5>Weekly Statistics</h5>
                  <Table responsive bordered>
                    <thead>
                      <tr>
                        <th>Total Days Worked</th>
                        <th>Total Hours</th>
                        <th>Average Hours per Day</th>
                        <th>Total Break Time</th>
                        <th>Average Break Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{stats.totalDays}</td>
                        <td>{stats.totalHours.toFixed(2)}</td>
                        <td>{stats.avgHoursPerDay.toFixed(2)}</td>
                        <td>{(stats.totalBreakMinutes / 60).toFixed(2)} hours</td>
                        <td>{(stats.avgBreakMinutes / 60).toFixed(2)} hours</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
              
              <h5 className="mt-4">Daily Breakdown</h5>
              <Table responsive striped bordered>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Regular Hours</th>
                    <th>Overtime Hours</th>
                    <th>Total Hours</th>
                    <th>Break Time (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {timeSheets.map((sheet) => {
                    // Find breaks for this timesheet
                    const timesheetBreaks = breaks.filter(b => b.timesheet_id === sheet.timesheet_id);
                    const breakMinutes = timesheetBreaks.reduce((total, breakItem) => {
                      const startTime = parseISO(breakItem.start_time);
                      const endTime = breakItem.end_time ? parseISO(breakItem.end_time) : new Date();
                      return total + differenceInMinutes(endTime, startTime);
                    }, 0);
                    
                    return (
                      <tr key={sheet.id}>
                        <td>{format(parseISO(sheet.date), 'MMM dd, yyyy')}</td>
                        <td>{parseFloat(sheet.total_regular_hours || 0).toFixed(2)}</td>
                        <td>{parseFloat(sheet.total_overtime_hours || 0).toFixed(2)}</td>
                        <td>
                          {(
                            parseFloat(sheet.total_regular_hours || 0) + 
                            parseFloat(sheet.total_overtime_hours || 0)
                          ).toFixed(2)}
                        </td>
                        <td>{breakMinutes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="month" title="Monthly View">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <h5 className="mb-0">Monthly Summary</h5>
              <div className="d-flex">
                <input
                  type="month"
                  className="form-control"
                  id="monthly-picker"
                  name="monthly-picker"
                  value={dateRange.startDate.substring(0, 7)}
                  onChange={(e) => {
                    const yearMonth = e.target.value;
                    const year = yearMonth.split('-')[0];
                    const month = yearMonth.split('-')[1];
                    const startDate = `${yearMonth}-01`;
                    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
                    const endDate = `${yearMonth}-${lastDay}`;
                    setDateRange({ startDate, endDate });
                  }}
                />
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Body>
                      <h3 className="display-4">{stats.totalHours.toFixed(2)}</h3>
                      <p className="lead">Total Hours</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Body>
                      <h3 className="display-4">{stats.totalDays}</h3>
                      <p className="lead">Days Worked</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Row>
                <Col md={12}>
                  <h5>Monthly Hours Trend</h5>
                  {chartData.dailyHours.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={chartData.dailyHours}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" name="Hours Worked" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center my-4">
                      <p>No data available for this month</p>
                    </div>
                  )}
                </Col>
              </Row>
              
              <Row className="mt-4">
                <Col>
                  <h5>Monthly Statistics</h5>
                  <Table responsive bordered>
                    <thead>
                      <tr>
                        <th>Total Days Worked</th>
                        <th>Total Hours</th>
                        <th>Average Hours per Day</th>
                        <th>Total Break Time</th>
                        <th>Average Break Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{stats.totalDays}</td>
                        <td>{stats.totalHours.toFixed(2)}</td>
                        <td>{stats.avgHoursPerDay.toFixed(2)}</td>
                        <td>{(stats.totalBreakMinutes / 60).toFixed(2)} hours</td>
                        <td>{(stats.avgBreakMinutes / 60).toFixed(2)} hours</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
              
              <h5 className="mt-4">Weekly Breakdown</h5>
              {timeSheets.length === 0 ? (
                <div className="text-center my-4">
                  <p>No timesheet data available for this month</p>
                </div>
              ) : (
                <Table responsive striped bordered>
                  <thead>
                    <tr>
                      <th>Week</th>
                      <th>Days Worked</th>
                      <th>Total Hours</th>
                      <th>Avg. Hours/Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Group by week and calculate stats */}
                    {(() => {
                      // Group by week
                      const weekMap = timeSheets.reduce((weeks, sheet) => {
                        const date = parseISO(sheet.date);
                        const weekStart = format(startOfWeek(date), 'yyyy-MM-dd');
                        
                        if (!weeks[weekStart]) {
                          weeks[weekStart] = {
                            sheets: [],
                            dates: new Set(),
                          };
                        }
                        
                        weeks[weekStart].sheets.push(sheet);
                        weeks[weekStart].dates.add(format(date, 'yyyy-MM-dd'));
                        
                        return weeks;
                      }, {});
                      
                      // Convert to array and calculate stats
                      return Object.entries(weekMap).map(([weekStart, data]) => {
                        const weekEnd = format(endOfWeek(parseISO(weekStart)), 'MMM dd');
                        const totalHours = data.sheets.reduce((sum, sheet) => {
                          return sum + (
                            parseFloat(sheet.total_regular_hours || 0) + 
                            parseFloat(sheet.total_overtime_hours || 0)
                          );
                        }, 0);
                        
                        const daysWorked = data.dates.size;
                        const avgHoursPerDay = daysWorked ? (totalHours / daysWorked) : 0;
                        
                        return (
                          <tr key={weekStart}>
                            <td>{format(parseISO(weekStart), 'MMM dd')} - {weekEnd}</td>
                            <td>{daysWorked}</td>
                            <td>{totalHours.toFixed(2)}</td>
                            <td>{avgHoursPerDay.toFixed(2)}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      {/* Add Payroll Summary Section */}
      <div className="mt-5 pt-4 border-top">
        <h4 className="mb-4">Payroll Summary</h4>
        <div className="row">
          <div className="col-md-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="card-title mb-3">Earnings Preview</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="text-muted small">Regular Hours</div>
                      <div className="h5">{(earnings && earnings.regularHours !== undefined ? earnings.regularHours : 0).toFixed(2)} hrs</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="text-muted small">Overtime Hours</div>
                      <div className="h5">{(earnings && earnings.overtimeHours !== undefined ? earnings.overtimeHours : 0).toFixed(2)} hrs</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="text-muted small">Hourly Rate</div>
                      <div className="h5">${(earnings && earnings.hourlyRate !== undefined ? earnings.hourlyRate : 15.00).toFixed(2)}/hr</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="text-muted small">Estimated Gross Pay</div>
                      <div className="h5 text-primary">${(earnings && earnings.estimatedPay !== undefined ? earnings.estimatedPay : 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 small text-muted">
                  Note: This is an estimated calculation based on standard rates. Actual pay may vary.
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="card-title mb-3">Payroll Actions</h5>
                <p>View complete payroll details including tax information, benefits, and payment history.</p>
                <button 
                  className="btn btn-primary w-100" 
                  onClick={navigateToPayroll}
                >
                  <i className="fas fa-file-invoice-dollar me-2"></i>
                  Go to Payroll System
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTimesheetHistory; 