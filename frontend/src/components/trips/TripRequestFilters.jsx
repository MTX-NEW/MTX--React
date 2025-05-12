import React from 'react';
import DatePicker from '@/components/DatePicker';
import dayjs from 'dayjs';
import { Autocomplete, TextField } from '@mui/material';
import { arizonaCities } from '@/utils/arizonaCities';

// Presenter component for rendering UI only
const TripRequestFiltersPresenter = ({ 
  cityFilter,
  onCityFilterChange,
  dateFilter,
  onDateFilterChange,
  tripTypeFilter,
  onTripTypeFilterChange,
  onClearFilters,
  appliedFilters
}) => {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Filter by City</label>
              <Autocomplete
                value={cityFilter || null}
                onChange={(e, newValue) => onCityFilterChange(newValue || '')}
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
                onChange={(e) => onTripTypeFilterChange(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="one_way">One Way</option>
                <option value="round_trip">Round Trip</option>
                <option value="multi_stop">Multi-stop</option>
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
                      onDateFilterChange(formattedDate, dateFilter.endDate);
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
                      onDateFilterChange(dateFilter.startDate, formattedDate);
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
              onClick={onClearFilters}
            >
              <i className="material-icons small me-1"></i>
              Clear
            </button>
          </div>
        </div>
        
        {appliedFilters && (
          <div className="mt-3 d-flex flex-wrap align-items-center">
            <span className="text-muted me-2">Applied:</span>
            
            {cityFilter && (
              <div className="badge bg-primary rounded-pill me-2 d-flex align-items-center">
                <span>{cityFilter}</span>
                <button 
                  className="btn-close btn-close-white ms-2"
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => onCityFilterChange('')}
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
                  onClick={() => onDateFilterChange(null, null)}
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
                  onClick={() => onTripTypeFilterChange('')}
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

// Container component for handling logic
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
  };

  const handleDateFilterChange = (startDate, endDate = null) => {
    setDateFilter({ startDate, endDate });
  };

  const handleTripTypeFilterChange = (type) => {
    setTripTypeFilter(type);
  };

  // Determine if any filters are applied
  const appliedFilters = !!(cityFilter || dateFilter.startDate || tripTypeFilter);

  return (
    <TripRequestFiltersPresenter
      cityFilter={cityFilter}
      onCityFilterChange={handleCityFilterChange}
      dateFilter={dateFilter}
      onDateFilterChange={handleDateFilterChange}
      tripTypeFilter={tripTypeFilter}
      onTripTypeFilterChange={handleTripTypeFilterChange}
      onClearFilters={clearFilters}
      appliedFilters={appliedFilters}
    />
  );
};

export default TripRequestFilters; 