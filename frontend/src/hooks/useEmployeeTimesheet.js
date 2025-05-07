import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { userApi, timeSheetApi, timeSheetBreakApi } from '@/api/baseApi';
import { useResource } from '@/hooks/useResource';

const useEmployeeTimesheet = () => {
  // Use the useResource hook to fetch employees
  const { 
    data: employees, 
    error, 
    refresh: refreshEmployees 
  } = useResource(userApi);
  
  // State for managing filtered employees and view mode
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [employeesWithStatus, setEmployeesWithStatus] = useState([]);

  // Process employees and fetch their timesheet status
  useEffect(() => {
    if (employees && employees.length > 0) {
      const fetchTimesheetStatus = async () => {
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
                  todayHours = parseFloat(timesheet.total_regular_hours || 0) + 
                               parseFloat(timesheet.total_overtime_hours || 0);
                  
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
        }
      };
      
      fetchTimesheetStatus();
    }
  }, [employees]);

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
  const handleClockIn = async (employeeId) => {
    try {
      // Call API to clock in the employee
      const response = await timeSheetApi.clockIn(employeeId);
      
      // Update local state
      setEmployeesWithStatus((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { ...employee, status: 'clocked_in' }
            : employee
        )
      );
      setFilteredEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { ...employee, status: 'clocked_in' }
            : employee
        )
      );
      
      toast.success('Employee clocked in successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock in employee');
    }
  };

  const handleClockOut = async (employeeId) => {
    try {
      console.log("handleClockOut", employeeId);
      // Call API to clock out the employee
      const response = await timeSheetApi.clockOut(employeeId);
      // log employeeId
      console.log("employeeId", employeeId);
      
      const updatedTimesheet = response.data;
      
      // Calculate today's hours
      const todayHours = parseFloat(updatedTimesheet.total_regular_hours || 0) + 
                         parseFloat(updatedTimesheet.total_overtime_hours || 0);
      
      // Update local state
      setEmployeesWithStatus((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { 
                ...employee, 
                status: 'idle',
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
                status: 'idle',
                today_hours: todayHours 
              }
            : employee
        )
      );
      
      toast.success('Employee clocked out successfully');
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

  // Toggle between card and list view
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'card' ? 'list' : 'card');
  };

  // Form methods for any modals
  const formMethods = useForm();

  return {
    // State
    filteredEmployees,
    selectedEmployee,
    viewMode,
    error,
    
    // Functions
    setSelectedEmployee,
    handleSearchChange,
    handleClockIn,
    handleClockOut,
    handleBreak,
    handleEndBreak,
    toggleViewMode,
    refreshEmployees,
    
    // Form
    formMethods,
  };
};

export default useEmployeeTimesheet; 