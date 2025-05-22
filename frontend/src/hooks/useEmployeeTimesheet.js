import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { userApi, timeSheetApi, timeSheetBreakApi } from '@/api/baseApi';
import { useResource } from '@/hooks/useResource';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInMinutes } from 'date-fns';

// Available hour types
export const HOUR_TYPES = [
  { value: 'regular', label: 'Regular' },
  { value: 'driving', label: 'Driving' },
  { value: 'administrative', label: 'Administrative' },
];

const useEmployeeTimesheet = (options = {}) => {
  // Extract options with defaults
  const {
    employeeId = null,
    initialDateRange = {
      startDate: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
      endDate: format(endOfWeek(new Date()), 'yyyy-MM-dd'),
    },
    viewMode: initialViewMode = 'card',
  } = options;

  // Use the useResource hook to fetch employees
  const { 
    data: employees, 
    error: employeesError, 
    refresh: refreshEmployees,
    loading: loadingEmployees,
  } = useResource(userApi, { id: employeeId });
  
  // State for managing filtered employees and view mode
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [employeesWithStatus, setEmployeesWithStatus] = useState([]);
  
  // State for history view
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [timeSheets, setTimeSheets] = useState([]);
  const [breaks, setBreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');

  // Fetch employee timesheet data (for a specific employee or all)
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (employeeId) {
        // Single employee - used in history view
        await fetchEmployeeTimesheet(employeeId);
      } else if (employees && employees.length > 0) {
        // All employees - used in timesheet list view
        await fetchAllEmployeesStatus();
      } else {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId, employees, dateRange.startDate, dateRange.endDate]);

  // Fetch a single employee's timesheet history
  const fetchEmployeeTimesheet = async (empId) => {
    if (!empId || empId === 'undefined') {
      setError("Invalid employee ID or no employee selected");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Get timesheet data for date range
      const timeSheetResponse = await timeSheetApi.getByUser(
        empId,
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
        setBreaks([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load timesheet data. ' + (err.message || ''));
      toast.error('Error loading timesheet data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all employees' current status
  const fetchAllEmployeesStatus = async () => {
    try {
      const employeesWithStatus = await Promise.all(
        employees.map(async (employee) => {
          try {
            // Get employee's current timesheet status
            const statusResponse = await timeSheetApi.getStatus(employee.id);
            
            // Default to 'idle' if no status is returned
            let status = 'idle';
            if (statusResponse.data && statusResponse.data.status) {
              status = statusResponse.data.status;
            }
            
            // Calculate hours for today and week
            let todayHours = 0;
            let weekHours = 0;
            
            if (statusResponse.data && statusResponse.data.timesheet) {
              const timesheet = statusResponse.data.timesheet;
              todayHours = parseFloat(timesheet.total_hours || 0);
              
              // Get weekly hours
              weekHours = todayHours;
            }
            
            return {
              ...employee,
              status,
              today_hours: todayHours,
              week_hours: weekHours,
              profile_image: employee.profile_image || '/assets/images/profile.jpg'
            };
          } catch (error) {
            // Return employee with default status in case of error
            return {
              ...employee,
              status: 'idle',
              today_hours: 0,
              week_hours: 0,
              profile_image: employee.profile_image || '/assets/images/profile.jpg'
            };
          }
        })
      );
      
      setEmployeesWithStatus(employeesWithStatus);
      setFilteredEmployees(employeesWithStatus);
    } catch (error) {
      toast.error('Failed to load employee statuses');
      
      // Set default values in case of error
      const defaultEmployees = employees.map(employee => ({
        ...employee,
        status: 'idle',
        today_hours: 0,
        week_hours: 0,
        profile_image: employee.profile_image || '/assets/images/profile.jpg'
      }));
      
      setEmployeesWithStatus(defaultEmployees);
      setFilteredEmployees(defaultEmployees);
    } finally {
      setLoading(false);
    }
  };

  // Handle search functionality
  const handleSearchChange = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employeesWithStatus);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = employeesWithStatus.filter(
      (employee) =>
        employee.first_name?.toLowerCase().includes(searchLower) ||
        employee.last_name?.toLowerCase().includes(searchLower) ||
        employee.phone?.includes(searchTerm) ||
        employee.emp_code?.includes(searchTerm)
    );

    setFilteredEmployees(filtered);
  };

  // Functions for time tracking
  const handleClockIn = async (employeeId, hourType = 'regular') => {
    try {
      // Call API to clock in the employee
      const response = await timeSheetApi.clockIn(employeeId, hourType);
      
      // Update local state
      setEmployeesWithStatus((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { 
                ...employee, 
                status: 'clocked_in',
                today_hours: 0, // Reset today_hours when starting a new shift
                hour_type: hourType
              }
            : employee
        )
      );
      setFilteredEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { 
                ...employee, 
                status: 'clocked_in',
                today_hours: 0, // Reset today_hours when starting a new shift
                hour_type: hourType
              }
            : employee
        )
      );
      
      toast.success(`Employee clocked in successfully (${hourType})`);
      
      // Refresh timesheet data if in history view
      if (options.employeeId) {
        fetchEmployeeTimesheet(options.employeeId);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock in employee');
    }
  };

  const handleClockOut = async (employeeId) => {
    try {
      // Call API to clock out the employee
      const response = await timeSheetApi.clockOut(employeeId);
      
      const updatedTimesheet = response.data;
      
      // Calculate today's hours
      const todayHours = parseFloat(updatedTimesheet.total_hours || 0);
      
      // Update local state
      setEmployeesWithStatus((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { 
                ...employee, 
                status: 'clocked_out',  // Changed from 'idle' to 'clocked_out'
                today_hours: todayHours 
              }
            : employee
        )
      );
      setFilteredEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { 
                ...employee, 
                status: 'clocked_out',  // Changed from 'idle' to 'clocked_out'
                today_hours: todayHours 
              }
            : employee
        )
      );
      
      toast.success('Employee clocked out successfully');
      
      // Refresh timesheet data if in history view
      if (options.employeeId) {
        fetchEmployeeTimesheet(options.employeeId);
      }
    } catch (error) {
      // Check for specific error messages
      if (error.response?.data?.message === 'No active timesheet found') {
        toast.error('Cannot clock out - employee has not clocked in today');
      } else {
        toast.error(error.response?.data?.message || 'Failed to clock out employee');
      }
      
      // Refresh employee data to ensure UI is in sync with backend
      refreshEmployees();
    }
  };

  const handleBreak = async (employeeId, duration = 30) => {
    try {
      // Call API to start a break with duration
      const response = await timeSheetBreakApi.startBreak(employeeId, duration);
      
      // Update local state
      setEmployeesWithStatus((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { 
                ...employee, 
                status: 'on_break',
                breakDuration: duration 
              }
            : employee
        )
      );
      setFilteredEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { 
                ...employee, 
                status: 'on_break',
                breakDuration: duration 
              }
            : employee
        )
      );
      
      toast.success(`Employee break started (${duration} minutes)`);
      
      // Refresh timesheet data if in history view
      if (options.employeeId) {
        fetchEmployeeTimesheet(options.employeeId);
      }
    } catch (error) {
      // Check for specific error messages
      if (error.response?.data?.message === 'No active timesheet found') {
        toast.error('Cannot start break - employee has not clocked in today');
      } else if (error.response?.data?.message.includes('already on break')) {
        toast.error('Employee is already on break');
      } else {
        toast.error(error.response?.data?.message || 'Failed to start break');
      }
      
      // Refresh employee data to ensure UI is in sync with backend
      refreshEmployees();
    }
  };

  const handleEndBreak = async (employeeId) => {
    try {
      // Call API to end the break
      const response = await timeSheetBreakApi.endBreak(employeeId);
      
      // Update local state
      setEmployeesWithStatus((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { 
                ...employee, 
                status: 'clocked_in',
                breakDuration: null
              }
            : employee
        )
      );
      setFilteredEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { 
                ...employee, 
                status: 'clocked_in',
                breakDuration: null
              }
            : employee
        )
      );
      
      toast.success('Employee break ended');
      
      // Refresh timesheet data if in history view
      if (options.employeeId) {
        fetchEmployeeTimesheet(options.employeeId);
      }
    } catch (error) {
      // Check for specific error messages
      if (error.response?.data?.message === 'No active break found') {
        toast.error('Cannot end break - no active break found');
      } else {
        toast.error(error.response?.data?.message || 'Failed to end break');
      }
      
      // Refresh employee data to ensure UI is in sync with backend
      refreshEmployees();
    }
  };

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
  const calculateStats = useMemo(() => {
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
      return total + parseFloat(sheet.total_hours || 0);
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
  }, [timeSheets, breaks]);
  
  // Prepare data for charts
  const prepareChartData = useMemo(() => {
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
        hours: parseFloat(sheet.total_hours || 0),
      };
    });
    
    // Break distribution chart data
    const totalWorkMinutes = calculateStats.totalHours * 60;
    return {
      dailyHours,
      breakDistribution: [
        { name: 'Working', value: totalWorkMinutes, color: '#8884d8' },
        { name: 'Break', value: calculateStats.totalBreakMinutes, color: '#82ca9d' },
      ]
    };
  }, [timeSheets, calculateStats]);

  // Calculate estimated earnings (for payroll preview)
  const calculateEstimatedEarnings = useMemo(() => {
    if (!timeSheets || timeSheets.length === 0 || !employees || employees.length === 0) {
      return {
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        estimatedPay: 0,
        hourlyRate: 15.00 // Default hourly rate
      };
    }
    
    const employee = employeeId ? employees.find(e => e.id === parseInt(employeeId)) : null;
    
    // Group timesheet entries by hour_type
    const hourTypes = timeSheets.reduce((acc, sheet) => {
      const type = sheet.hour_type || 'regular';
      const hours = parseFloat(sheet.total_hours || 0);
      const rate = parseFloat(sheet.rate || 0);
      
      if (!acc[type]) {
        acc[type] = { hours: 0, rate: rate };
      }
      
      acc[type].hours += hours;
      return acc;
    }, {});
    
    // Calculate total hours and estimate pay based on type and rate
    const totalHours = Object.values(hourTypes).reduce((sum, type) => sum + type.hours, 0);
    
    // Calculate regular and overtime hours
    const regularHours = hourTypes.regular?.hours || 0;
    const overtimeHours = hourTypes.overtime?.hours || 0;
    
    // Calculate estimated pay based on actual rates
    let estimatedPay = 0;
    Object.entries(hourTypes).forEach(([type, data]) => {
      const { hours, rate } = data;
      const effectiveRate = rate > 0 ? rate : (employee?.hourly_rate || 15.00);
      estimatedPay += hours * effectiveRate;
    });
    
    // Use employee's actual hourly rate or default
    const hourlyRate = employee && employee.hourly_rate ? parseFloat(employee.hourly_rate) : 15.00;
    
    return {
      totalHours,
      regularHours,
      overtimeHours,
      estimatedPay,
      hourlyRate
    };
  }, [timeSheets, employees, employeeId]);

  // Toggle between card and list view
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'card' ? 'list' : 'card');
  };

  // Form methods for any modals
  const formMethods = useForm();

  // Reload all data
  const refreshAllData = () => {
    refreshEmployees();
    if (employeeId) {
      fetchEmployeeTimesheet(employeeId);
    }
  };

  return {
    // State
    filteredEmployees,
    selectedEmployee,
    viewMode,
    employeesError,
    error,
    loading,
    dateRange,
    timeSheets,
    breaks,
    activeTab,
    
    // Hour types
    hourTypes: HOUR_TYPES,
    
    // Employee
    employee: employeeId && employees ? employees.find(e => e.id === parseInt(employeeId)) || null : null,
    
    // Stats and calculations
    stats: calculateStats,
    chartData: prepareChartData,
    earnings: calculateEstimatedEarnings,
    
    // Functions
    setSelectedEmployee,
    handleSearchChange,
    handleClockIn,
    handleClockOut,
    handleBreak,
    handleEndBreak,
    toggleViewMode,
    refreshEmployees,
    handleDateRangeChange,
    setViewRange,
    refreshAllData,
    
    // Form
    formMethods,
  };
};

export default useEmployeeTimesheet; 