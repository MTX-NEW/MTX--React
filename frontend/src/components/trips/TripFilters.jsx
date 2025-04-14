import React, { useEffect } from 'react';
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
  clearFilters
}) => {
  // Filter handlers
  const handleCityFilterChange = (city) => {
    setCityFilter(city);
    // Save to session storage
    sessionStorage.setItem('tripCityFilter', city || '');
  };

  const handleDateFilterChange = (startDate, endDate = null) => {
    const newDateFilter = { startDate, endDate };
    setDateFilter(newDateFilter);
    
    // Save to session storage
    sessionStorage.setItem('tripDateFilter', JSON.stringify(newDateFilter));
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    // Save to session storage
    sessionStorage.setItem('tripStatusFilter', status || '');
  };

  // Load saved filters from sessionStorage on component mount
  useEffect(() => {
    // Try to load saved filters from session storage
    const savedDateFilter = sessionStorage.getItem('tripDateFilter');
    const savedStatusFilter = sessionStorage.getItem('tripStatusFilter');
    const savedCityFilter = sessionStorage.getItem('tripCityFilter');
    
    // Apply saved date filter or default to today
    if (savedDateFilter) {
      try {
        const parsedDateFilter = JSON.parse(savedDateFilter);
        setDateFilter(parsedDateFilter);
      } catch (e) {
        console.error('Error parsing saved date filter:', e);
        // Set today as fallback if no date filter
        if (!dateFilter.startDate) {
          const today = dayjs().format('YYYY-MM-DD');
          handleDateFilterChange(today);
        }
      }
    } else if (!dateFilter.startDate) {
      // No saved filter and no current date, set to today
      const today = dayjs().format('YYYY-MM-DD');
      handleDateFilterChange(today);
    }
    
    // Apply saved status filter
    if (savedStatusFilter) {
      setStatusFilter(savedStatusFilter);
    }
    
    // Apply saved city filter
    if (savedCityFilter) {
      setCityFilter(savedCityFilter);
    }
  }, []);

  // Override the clear filters function to also clear session storage
  const handleClearFilters = () => {
    clearFilters();
    // Clear session storage
    sessionStorage.removeItem('tripDateFilter');
    sessionStorage.removeItem('tripStatusFilter');
    sessionStorage.removeItem('tripCityFilter');
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-3">
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

          <div className="col-md-6">
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
              onClick={handleClearFilters}
            >
              <i className="material-icons small me-1"></i>
              Clear
            </button>
          </div>
        </div>
        
        {(cityFilter || dateFilter.startDate || statusFilter) && (
          <div className="mt-3 d-flex flex-wrap align-items-center">
            <span className="text-muted me-2">Applied:</span>
            
            {cityFilter && (
              <div className="badge bg-primary rounded-pill me-2 d-flex align-items-center">
                <span>{cityFilter}</span>
                <button 
                  className="btn-close btn-close-white ms-2"
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => handleCityFilterChange('')}
                  aria-label="Remove city filter"
                ></button>
              </div>
            )}
            
            {dateFilter.startDate && (
              <div className="badge bg-primary rounded-pill me-2 d-flex align-items-center">
                <span>{dateFilter.startDate}{dateFilter.endDate ? ` - ${dateFilter.endDate}` : ''}</span>
                <button 
                  className="btn-close btn-close-white ms-2"
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => handleDateFilterChange(null, null)}
                  aria-label="Remove date filter"
                ></button>
              </div>
            )}
            
            {statusFilter && (
              <div className="badge bg-primary rounded-pill me-2 d-flex align-items-center">
                <span>{statusFilter}</span>
                <button 
                  className="btn-close btn-close-white ms-2"
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => handleStatusFilterChange('')}
                  aria-label="Remove status filter"
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