import React from 'react';
import DatePicker from '@/components/DatePicker';
import dayjs from 'dayjs';
import { Autocomplete, TextField } from '@mui/material';
import { arizonaCities } from '@/utils/arizonaCities';

const TripFilters = ({ 
  cityFilter,
  setCityFilter,
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
  driverFilter,
  setDriverFilter,
  programFilter,
  setProgramFilter,
  driversData = [],
  programsData = [],
  clearFilters
}) => {
  // Filter handlers
  const handleCityFilterChange = (city) => {
    setCityFilter(city);
  };

  const handleDateFilterChange = (startDate, endDate = null) => {
    setDateFilter({ startDate, endDate });
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleDriverFilterChange = (driverId) => {
    setDriverFilter(driverId);
  };

  const handleProgramFilterChange = (programId) => {
    setProgramFilter(programId);
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-2">
            <div className="form-group">
              <label className="form-label">Filter by City</label>
              <Autocomplete
                value={cityFilter || null}
                onChange={(e, newValue) => handleCityFilterChange(newValue || '')}
                options={arizonaCities}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select city" size="small" />
                )}
                fullWidth
                size="small"
              />
            </div>
          </div>
          
          <div className="col-md-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-select"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Attention">Attention</option>
                <option value="Assigned">Assigned</option>
                <option value="Transport confirmed">Transport confirmed</option>
                <option value="Transport enroute">Transport enroute</option>
                <option value="Picked up">Picked up</option>
                <option value="Not going">Not going</option>
                <option value="Not available">Not available</option>
                <option value="Dropped off">Dropped off</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="col-md-2">
            <div className="form-group">
              <label className="form-label">Driver</label>
              <select 
                className="form-select"
                value={driverFilter}
                onChange={(e) => handleDriverFilterChange(e.target.value)}
              >
                <option value="">All Drivers</option>
                {driversData.map(driver => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-md-2">
            <div className="form-group">
              <label className="form-label">Program</label>
              <select 
                className="form-select"
                value={programFilter}
                onChange={(e) => handleProgramFilterChange(e.target.value)}
              >
                <option value="">All Programs</option>
                {programsData.map(program => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Date Range</label>
              <div className="d-flex align-items-center" style={{ marginTop: '4px' }}>
                <div style={{ width: 'calc(50% - 15px)' }}>
                  <DatePicker
                    placeholder="Start Date"
                    value={dateFilter.startDate ? dayjs(dateFilter.startDate) : null}
                    onChange={(newValue) => {
                      const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : null;
                      handleDateFilterChange(formattedDate, dateFilter.endDate);
                    }}
                  />
                </div>
                <div style={{ width: '30px', textAlign: 'center' }}>to</div>
                <div style={{ width: 'calc(50% - 15px)' }}>
                  <DatePicker
                    placeholder="End Date"
                    value={dateFilter.endDate ? dayjs(dateFilter.endDate) : null}
                    onChange={(newValue) => {
                      const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : null;
                      handleDateFilterChange(dateFilter.startDate, formattedDate);
                    }}
                    disabled={!dateFilter.startDate}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-1 d-flex align-items-end">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={clearFilters}
            >
              <i className="material-icons small me-1"></i>
              Clear
            </button>
          </div>
        </div>
        
        {(cityFilter || dateFilter.startDate || statusFilter || driverFilter || programFilter) && (
          <div className="mt-3 d-flex flex-wrap align-items-center">
            <span className="text-muted me-2">Applied:</span>
            
            {cityFilter && (
              <div className="badge bg-primary rounded-pill me-2 d-flex align-items-center">
                <span>{cityFilter}</span>
                <button 
                  className="btn-close btn-close-black ms-2"
                  style={{ fontSize: '0.6rem' }}
                  onClick={() => handleCityFilterChange('')}
                  aria-label="Remove city filter"
                ></button>
              </div>
            )}
            
            {dateFilter.startDate && (
              <div className="badge bg-primary rounded-pill me-2 d-flex align-items-center">
                <span>{dateFilter.startDate}{dateFilter.endDate ? ` - ${dateFilter.endDate}` : ''}</span>
                <button 
                  className="btn-close btn-close-black ms-2"
                  style={{ fontSize: '0.6rem' }}
                  onClick={() => handleDateFilterChange(null, null)}
                  aria-label="Remove date filter"
                ></button>
              </div>
            )}
            
            {statusFilter && (
              <div className="badge bg-primary rounded-pill me-2 d-flex align-items-center">
                <span>{statusFilter}</span>
                <button 
                  className="btn-close btn-close-black ms-2"
                  style={{ fontSize: '0.6rem' }}
                  onClick={() => handleStatusFilterChange('')}
                  aria-label="Remove status filter"
                ></button>
              </div>
            )}

            {driverFilter && driversData.length > 0 && (
              <div className="badge bg-primary rounded-pill me-2 d-flex align-items-center">
                <span>Driver: {driversData.find(d => d.id.toString() === driverFilter.toString())?.name || driverFilter}</span>
                <button 
                  className="btn-close btn-close-black ms-2"
                  style={{ fontSize: '0.6rem' }}
                  onClick={() => handleDriverFilterChange('')}
                  aria-label="Remove driver filter"
                ></button>
              </div>
            )}

            {programFilter && programsData.length > 0 && (
              <div className="badge bg-primary rounded-pill me-2 d-flex align-items-center">
                <span>Program: {programsData.find(p => p.id.toString() === programFilter.toString())?.name || programFilter}</span>
                <button 
                  className="btn-close btn-close-black ms-2"
                  style={{ fontSize: '0.6rem' }}
                  onClick={() => handleProgramFilterChange('')}
                  aria-label="Remove program filter"
                ></button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripFilters; 