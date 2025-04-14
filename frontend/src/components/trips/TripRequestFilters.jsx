import React, { useEffect } from 'react';
import DatePicker from '@/components/DatePicker';
import dayjs from 'dayjs';
import { Autocomplete, TextField } from '@mui/material';
import { arizonaCities } from '@/utils/arizonaCities';

const TripRequestFilters = ({ 
  cityFilter,
  setCityFilter,
  dateFilter,
  setDateFilter,
  tripTypeFilter,
  setTripTypeFilter,
  clearFilters
}) => {
  // Filter handlers
  const handleCityFilterChange = (city) => {
    setCityFilter(city);
    // Save to session storage
    sessionStorage.setItem('requestCityFilter', city || '');
  };

  const handleDateFilterChange = (startDate, endDate = null) => {
    const newDateFilter = { startDate, endDate };
    setDateFilter(newDateFilter);
    
    // Save to session storage
    sessionStorage.setItem('requestDateFilter', JSON.stringify(newDateFilter));
  };

  const handleTripTypeFilterChange = (type) => {
    setTripTypeFilter(type);
    // Save to session storage
    sessionStorage.setItem('requestTripTypeFilter', type || '');
  };

  // Load saved filters from sessionStorage on component mount
  useEffect(() => {
    // Try to load saved filters from session storage
    const savedDateFilter = sessionStorage.getItem('requestDateFilter');
    const savedTripTypeFilter = sessionStorage.getItem('requestTripTypeFilter');
    const savedCityFilter = sessionStorage.getItem('requestCityFilter');
    
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
    
    // Apply saved trip type filter
    if (savedTripTypeFilter) {
      setTripTypeFilter(savedTripTypeFilter);
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
    sessionStorage.removeItem('requestDateFilter');
    sessionStorage.removeItem('requestTripTypeFilter');
    sessionStorage.removeItem('requestCityFilter');
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
              <label className="form-label">Trip Type</label>
              <select 
                className="form-select"
                value={tripTypeFilter}
                onChange={(e) => handleTripTypeFilterChange(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Standard">Standard</option>
                <option value="Round Trip">Round Trip</option>
                <option value="Multi-stop">Multi-stop</option>
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
        
        {(cityFilter || dateFilter.startDate || tripTypeFilter) && (
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
            
            {tripTypeFilter && (
              <div className="badge bg-primary rounded-pill me-2 d-flex align-items-center">
                <span>{tripTypeFilter}</span>
                <button 
                  className="btn-close btn-close-white ms-2"
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => handleTripTypeFilterChange('')}
                  aria-label="Remove trip type filter"
                ></button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripRequestFilters; 