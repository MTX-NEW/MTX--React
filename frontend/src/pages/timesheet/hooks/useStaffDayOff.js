import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const useStaffDayOff = () => {
  // State for employee schedules
  const [employees, setEmployees] = useState([]);

  // State for cell selection and editing
  const [selectedCell, setSelectedCell] = useState(null);
  const [shiftStartTime, setShiftStartTime] = useState("");
  const [shiftEndTime, setShiftEndTime] = useState("");

  // Days of the week for column headers
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Mock employee schedule data
  const mockEmployees = [
    {
      id: 1,
      name: "Abdullah Talib",
      schedule: {
        Sunday: { time: "6:00 - 12:00", isDayOff: false },
        Monday: { time: "6:00 - 12:00", isDayOff: false },
        Tuesday: { time: "6:00 - 12:00", isDayOff: false },
        Wednesday: { time: "6:00 - 12:00", isDayOff: false },
        Thursday: { time: "6:00 - 12:00", isDayOff: false },
        Friday: { time: "6:00 - 12:00", isDayOff: false },
        Saturday: { time: "6:00 - 12:00", isDayOff: false }
      }
    },
    {
      id: 2,
      name: "Cheryl Marshall",
      schedule: {
        Sunday: { time: "6:00 - 12:00", isDayOff: false },
        Monday: { time: "6:00 - 12:00", isDayOff: false },
        Tuesday: { time: "6:00 - 12:00", isDayOff: false },
        Wednesday: { time: "6:00 - 12:00", isDayOff: false },
        Thursday: { time: "6:00 - 12:00", isDayOff: false },
        Friday: { time: "6:00 - 12:00", isDayOff: false },
        Saturday: { time: "6:00 - 12:00", isDayOff: false }
      }
    },
    {
      id: 3,
      name: "Andrew Obongo",
      schedule: {
        Sunday: { time: "6:00 - 12:00", isDayOff: false },
        Monday: { time: "6:00 - 12:00", isDayOff: false },
        Tuesday: { time: "6:00 - 12:00", isDayOff: false },
        Wednesday: { time: "", isDayOff: true },
        Thursday: { time: "6:00 - 12:00", isDayOff: false },
        Friday: { time: "6:00 - 12:00", isDayOff: false },
        Saturday: { time: "", isDayOff: true }
      }
    },
    {
      id: 4,
      name: "Christopher",
      schedule: {
        Sunday: { time: "", isDayOff: true },
        Monday: { time: "", isDayOff: true },
        Tuesday: { time: "6:00 - 12:00", isDayOff: false },
        Wednesday: { time: "6:00 - 12:00", isDayOff: false },
        Thursday: { time: "6:00 - 12:00", isDayOff: false },
        Friday: { time: "6:00 - 12:00", isDayOff: false },
        Saturday: { time: "6:00 - 12:00", isDayOff: false }
      }
    },
    {
      id: 5,
      name: "Abdullah Talib",
      schedule: {
        Sunday: { time: "6:00 - 12:00", isDayOff: false },
        Monday: { time: "6:00 - 12:00", isDayOff: false },
        Tuesday: { time: "6:00 - 12:00", isDayOff: false },
        Wednesday: { time: "6:00 - 12:00", isDayOff: false },
        Thursday: { time: "6:00 - 12:00", isDayOff: false },
        Friday: { time: "", isDayOff: true },
        Saturday: { time: "6:00 - 12:00", isDayOff: false }
      }
    },
    {
      id: 6,
      name: "Cheryl Marshall",
      schedule: {
        Sunday: { time: "6:00 - 12:00", isDayOff: false },
        Monday: { time: "6:00 - 12:00", isDayOff: false },
        Tuesday: { time: "6:00 - 12:00", isDayOff: false },
        Wednesday: { time: "6:00 - 12:00", isDayOff: false },
        Thursday: { time: "6:00 - 12:00", isDayOff: false },
        Friday: { time: "6:00 - 12:00", isDayOff: false },
        Saturday: { time: "6:00 - 12:00", isDayOff: false }
      }
    },
    {
      id: 7,
      name: "Andrew Obongo",
      schedule: {
        Sunday: { time: "6:00 - 12:00", isDayOff: false },
        Monday: { time: "6:00 - 12:00", isDayOff: false },
        Tuesday: { time: "6:00 - 12:00", isDayOff: false },
        Wednesday: { time: "6:00 - 12:00", isDayOff: false },
        Thursday: { time: "6:00 - 12:00", isDayOff: false },
        Friday: { time: "6:00 - 12:00", isDayOff: false },
        Saturday: { time: "6:00 - 12:00", isDayOff: false }
      }
    },
    {
      id: 8,
      name: "Abdullah Talib",
      schedule: {
        Sunday: { time: "6:00 - 12:00", isDayOff: false },
        Monday: { time: "6:00 - 12:00", isDayOff: false },
        Tuesday: { time: "6:00 - 12:00", isDayOff: false },
        Wednesday: { time: "6:00 - 12:00", isDayOff: false },
        Thursday: { time: "6:00 - 12:00", isDayOff: false },
        Friday: { time: "6:00 - 12:00", isDayOff: false },
        Saturday: { time: "6:00 - 12:00", isDayOff: false }
      }
    },
    {
      id: 9,
      name: "Christopher",
      schedule: {
        Sunday: { time: "6:00 - 12:00", isDayOff: false },
        Monday: { time: "6:00 - 12:00", isDayOff: false },
        Tuesday: { time: "", isDayOff: true },
        Wednesday: { time: "6:00 - 12:00", isDayOff: false },
        Thursday: { time: "6:00 - 12:00", isDayOff: false },
        Friday: { time: "", isDayOff: true },
        Saturday: { time: "6:00 - 12:00", isDayOff: false }
      }
    },
    {
      id: 10,
      name: "Andrew Obongo",
      schedule: {
        Sunday: { time: "6:00 - 12:00", isDayOff: false },
        Monday: { time: "6:00 - 12:00", isDayOff: false },
        Tuesday: { time: "6:00 - 12:00", isDayOff: false },
        Wednesday: { time: "6:00 - 12:00", isDayOff: false },
        Thursday: { time: "6:00 - 12:00", isDayOff: false },
        Friday: { time: "6:00 - 12:00", isDayOff: false },
        Saturday: { time: "6:00 - 12:00", isDayOff: false }
      }
    },
    {
      id: 11,
      name: "Cheryl Marshall",
      schedule: {
        Sunday: { time: "6:00 - 12:00", isDayOff: false },
        Monday: { time: "6:00 - 12:00", isDayOff: false },
        Tuesday: { time: "6:00 - 12:00", isDayOff: false },
        Wednesday: { time: "6:00 - 12:00", isDayOff: false },
        Thursday: { time: "6:00 - 12:00", isDayOff: false },
        Friday: { time: "6:00 - 12:00", isDayOff: false },
        Saturday: { time: "6:00 - 12:00", isDayOff: false }
      }
    },
    {
      id: 12,
      name: "Abdullah Talib",
      schedule: {
        Sunday: { time: "6:00 - 12:00", isDayOff: false },
        Monday: { time: "6:00 - 12:00", isDayOff: false },
        Tuesday: { time: "6:00 - 12:00", isDayOff: false },
        Wednesday: { time: "6:00 - 12:00", isDayOff: false },
        Thursday: { time: "6:00 - 12:00", isDayOff: false },
        Friday: { time: "6:00 - 12:00", isDayOff: false },
        Saturday: { time: "6:00 - 12:00", isDayOff: false }
      }
    }
  ];

  // Load employee data on component mount
  useEffect(() => {
    setEmployees(mockEmployees);
  }, []);

  // Handle cell click for editing
  const handleCellClick = (employeeId, day) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    setSelectedCell({ employeeId, day });
    
    // Set current times if available
    if (employee.schedule[day].time) {
      const [start, end] = employee.schedule[day].time.split(' - ');
      setShiftStartTime(start);
      setShiftEndTime(end);
    } else {
      setShiftStartTime('');
      setShiftEndTime('');
    }
  };

  // Handle time input changes
  const handleStartTimeChange = (time) => {
    setShiftStartTime(time);
  };

  const handleEndTimeChange = (time) => {
    setShiftEndTime(time);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedCell) return;
    
    const { employeeId, day } = selectedCell;
    
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => {
        if (emp.id === employeeId) {
          const newSchedule = { ...emp.schedule };
          if (shiftStartTime && shiftEndTime) {
            newSchedule[day] = { 
              time: `${shiftStartTime} - ${shiftEndTime}`, 
              isDayOff: false 
            };
          } else {
            newSchedule[day] = { 
              time: '', 
              isDayOff: true 
            };
          }
          return { ...emp, schedule: newSchedule };
        }
        return emp;
      })
    );

    // Clear selection and form
    setSelectedCell(null);
    setShiftStartTime('');
    setShiftEndTime('');
    
    toast.success('Schedule updated successfully');
  };

  // Handle cancel editing
  const handleCancel = () => {
    setSelectedCell(null);
    setShiftStartTime('');
    setShiftEndTime('');
  };

  // Toggle day off status
  const toggleDayOff = (employeeId, day) => {
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => {
        if (emp.id === employeeId) {
          const newSchedule = { ...emp.schedule };
          const isDayOff = !newSchedule[day].isDayOff;
          
          newSchedule[day] = { 
            time: isDayOff ? '' : (newSchedule[day].time || '6:00 - 12:00'), 
            isDayOff 
          };
          
          return { ...emp, schedule: newSchedule };
        }
        return emp;
      })
    );
    
    toast.success('Day off status updated');
  };

  return {
    employees,
    weekDays,
    selectedCell,
    shiftStartTime,
    shiftEndTime,
    handleCellClick,
    handleStartTimeChange,
    handleEndTimeChange,
    handleSubmit,
    handleCancel,
    toggleDayOff
  };
};

export default useStaffDayOff; 