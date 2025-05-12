import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useStaffDayOff from './hooks/useStaffDayOff';

const StaffDayOff = () => {
  const {
    employees,
    weekDays,
    selectedCell,
    shiftStartTime,
    shiftEndTime,
    handleCellClick,
    handleStartTimeChange,
    handleEndTimeChange,
    handleSubmit,
    handleCancel
  } = useStaffDayOff();

  return (
    <div className="container-fluid p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Manage staff day off</h1>
        
        <div className="d-flex">
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
          />
          <button className="btn btn-primary ms-2">
            Filter
          </button>
        </div>
      </div>
      
      <div className="bg-white p-0 rounded shadow-sm">
        <div className="table-responsive">
          <table className="table table-bordered mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th style={{ width: '15%' }}>Employee name</th>
                {weekDays.map(day => (
                  <th key={day} className="text-center" style={{ width: '12%' }}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.id}>
                  <td className="align-middle fw-bold">{employee.name}</td>
                  {weekDays.map(day => (
                    <td 
                      key={`${employee.id}-${day}`}
                      className={`text-center align-middle ${employee.schedule[day].isDayOff ? 'bg-light-blue' : ''}`}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: employee.schedule[day].isDayOff ? '#e6f7ff' : 'white',
                      }}
                      onClick={() => handleCellClick(employee.id, day)}
                    >
                      {employee.schedule[day].time || ''}
                      
                      {/* Show form if this cell is selected */}
                      {selectedCell && 
                       selectedCell.employeeId === employee.id && 
                       selectedCell.day === day && (
                        <div className="position-absolute bg-white shadow p-3 rounded" 
                             style={{ 
                               top: '50%', 
                               left: '50%', 
                               transform: 'translate(-50%, 0)', 
                               zIndex: 10,
                               minWidth: '280px'
                             }}>
                          <div className="mb-3">
                            <label className="form-label">Shift start time:</label>
                            <input 
                              type="text" 
                              className="form-control"
                              placeholder="00:00:00" 
                              value={shiftStartTime}
                              onChange={(e) => handleStartTimeChange(e.target.value)}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Shift end time:</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="00:00:00"
                              value={shiftEndTime}
                              onChange={(e) => handleEndTimeChange(e.target.value)}
                            />
                          </div>
                          <div className="d-flex justify-content-between">
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={handleCancel}
                            >
                              Cancel
                            </button>
                            <button 
                              className="btn btn-success"
                              onClick={handleSubmit}
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDayOff; 