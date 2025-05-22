import { useState, useEffect, useCallback } from 'react';
import { format, parseISO, addDays, subDays, differenceInDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { userApi, timeSheetApi, timeSheetBreakApi } from '@/api/baseApi';
import { toast } from 'react-toastify';

// Default pay rates - will be overridden by employee's actual rate if available
const DEFAULT_HOURLY_RATE = 15.00;
const OVERTIME_MULTIPLIER = 1.5;

const usePayroll = (employeeId, navigate) => {
  const [employee, setEmployee] = useState(null);
  const [timeSheets, setTimeSheets] = useState([]);
  const [breaks, setBreaks] = useState([]);
  const [incentives, setIncentives] = useState([]);
  const [payPeriod, setPayPeriod] = useState({
    startDate: '',
    endDate: ''
  });
  const [periodOffset, setPeriodOffset] = useState(0); // Track current period offset
  const [hiringDateObj, setHiringDateObj] = useState(null); // Store parsed hiring date
  const [error, setError] = useState(null);
  
  // Function to format break minutes as hours:minutes
  const formatBreakDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0 min';
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? 
        `${hours}h ${remainingMinutes}m` : 
        `${hours}h`;
    }
  };
  
  // Get two-week period based on hiring date and offset
  const calculatePayPeriod = useCallback((hiringDate, offset = 0) => {
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
  }, []);
  
  // Get a specific timesheet by ID
  const getTimesheetById = useCallback((timesheetId) => {
    // Find the timesheet in our existing data
    const timesheet = timeSheets.find(ts => ts.timesheet_id === timesheetId);
    if (!timesheet) {
      toast.error('Timesheet not found');
      return null;
    }
    return timesheet;
  }, [timeSheets]);
  
  // Load employee data and timesheet history for the selected period
  const loadPayPeriodData = useCallback(async (newOffset = periodOffset) => {
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
      
      // Get incentives for the pay period
      try {
        const incentiveResponse = await timeSheetApi.getUserIncentivesForPeriod(
          employeeId,
          period.startDate,
          period.endDate
        );
        setIncentives(incentiveResponse.data?.incentives || []);
      } catch (incentiveErr) {
        console.error('Failed to load incentives:', incentiveErr);
        setIncentives([]);
      }
    } catch (err) {
      toast.error('Error loading timesheet data');
      console.error('Failed to load timesheet data:', err);
    }
  }, [employeeId, hiringDateObj, periodOffset, calculatePayPeriod]);
  
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
  }, [hiringDateObj, periodOffset, employeeId, loadPayPeriodData]);
  
  // Navigate to previous pay period
  const handlePreviousPeriod = useCallback(() => {
    setPeriodOffset(prevOffset => prevOffset - 1);
  }, []);
  
  // Navigate to next pay period
  const handleNextPeriod = useCallback(() => {
    setPeriodOffset(prevOffset => prevOffset + 1);
  }, []);
  
  // Navigate to current pay period
  const handleCurrentPeriod = useCallback(() => {
    setPeriodOffset(0);
  }, []);
  
  // Go back to employee list
  const handleGoBack = useCallback(() => {
    navigate('/time-sheet/employee');
  }, [navigate]);
  
  // Navigate to employee history
  const navigateToEmployeeHistory = useCallback(() => {
    navigate(`/time-sheet/employee/${employeeId}/history`);
  }, [navigate, employeeId]);

  // Calculate daily breakdowns
  const calculateDailyData = useCallback(() => {
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
          totalPay: 0,
          timesheets: [] // Empty array for no timesheets
        };
      }
      
      // Sort timesheets by clock in time
      const sortedTimesheets = [...dayTimesheets].sort((a, b) => 
        new Date(a.clock_in) - new Date(b.clock_in)
      );
      
      // Process each timesheet as a separate shift
      const shifts = sortedTimesheets.map(timesheet => {
        // Get breaks for this timesheet
        const timesheetBreaks = breaks.filter(b => b.timesheet_id === timesheet.timesheet_id);
      
        // Calculate total break time in minutes for this timesheet
        const breakMinutes = timesheetBreaks.reduce((total, breakItem) => {
          const startTime = parseISO(breakItem.start_time);
          const endTime = breakItem.end_time ? parseISO(breakItem.end_time) : new Date();
          return total + differenceInDays(endTime, startTime) * 24 * 60 + 
                (endTime.getHours() - startTime.getHours()) * 60 + 
                (endTime.getMinutes() - startTime.getMinutes());
        }, 0);
      
        // Format clock in/out times
        const clockIn = timesheet.clock_in ? format(parseISO(timesheet.clock_in), 'HH:mm') : '-';
        const clockOut = timesheet.clock_out ? format(parseISO(timesheet.clock_out), 'HH:mm') : '-';
        
        // Calculate hours and pay
        const type = timesheet.hour_type || 'regular';
        const hours = parseFloat(timesheet.total_hours || 0);
        const rate = parseFloat(timesheet.rate || hourlyRate);
        const pay = hours * rate;
        
        return {
          timesheetId: timesheet.timesheet_id,
          clockIn,
          clockOut,
          hourType: type,
          hours,
          rate,
          pay,
          breaks: timesheetBreaks.length,
          breakMinutes,
          notes: timesheet.notes
        };
      });
      
      // Calculate totals for the day
      let totalHoursForDay = 0;
      let totalBreakMinutes = 0;
      let totalPay = 0;
      const hourTypes = {};
      
      shifts.forEach(shift => {
        totalHoursForDay += shift.hours;
        totalBreakMinutes += shift.breakMinutes;
        totalPay += shift.pay;
        
        // Group hours by type
        const type = shift.hourType;
        if (!hourTypes[type]) {
          hourTypes[type] = { hours: 0, rate: shift.rate, pay: 0 };
        }
        hourTypes[type].hours += shift.hours;
        hourTypes[type].pay += shift.pay;
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
        totalHoursForDay,
        breaks: shifts.reduce((total, shift) => total + shift.breaks, 0),
        breakMinutes: totalBreakMinutes,
        weekNumber,
        hourTypes,
        totalHours: totalHoursForDay,
        totalPay,
        timesheets: shifts // Store all shifts for this day
      };
    });
  }, [payPeriod, timeSheets, breaks, employee, DEFAULT_HOURLY_RATE]);
  
  // Calculate week totals
  const calculateWeekTotals = useCallback(() => {
    const dailyData = calculateDailyData();
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
  }, [calculateDailyData]);
  
  // Calculate overall totals
  const calculateTotals = useCallback(() => {
    const dailyData = calculateDailyData();
    
    // First calculate timesheet totals
    const timesheetTotals = dailyData.reduce((acc, day) => {
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
    
    // Calculate incentive totals
    const incentiveTotal = incentives.reduce((sum, incentive) => sum + parseFloat(incentive.amount || 0), 0);
    
    // If we have incentives, add them to the hourTypes object
    if (incentiveTotal > 0) {
      timesheetTotals.hourTypes.incentive = {
        hours: 0, // Incentives don't have hours
        pay: incentiveTotal
      };
      timesheetTotals.totalPay += incentiveTotal;
    }
    
    return timesheetTotals;
  }, [calculateDailyData, incentives]);

  // Get calculated data
  const dailyData = calculateDailyData();
  const weekTotals = calculateWeekTotals();
  const totals = calculateTotals();
  const netPay = totals.totalPay;

  return {
    // State
    employee,
    payPeriod,
    dailyData,
    weekTotals,
    totals,
    netPay,
    error,
    periodOffset,
    incentives,
    
    // Constants
    DEFAULT_HOURLY_RATE,
    OVERTIME_MULTIPLIER,
    
    // Functions
    formatBreakDuration,
    handleGoBack,
    handlePreviousPeriod,
    handleCurrentPeriod,
    handleNextPeriod,
    navigateToEmployeeHistory,
    loadPayPeriodData,
    getTimesheetById,
  };
};

export default usePayroll; 