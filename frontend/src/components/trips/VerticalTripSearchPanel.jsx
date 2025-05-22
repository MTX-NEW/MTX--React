import React from 'react';
import DatePicker from '@/components/DatePicker';
import dayjs from 'dayjs';
import { Autocomplete, TextField } from '@mui/material';
import { arizonaCities } from '@/utils/arizonaCities';

const VerticalTripSearchPanel = ({ 
  cityFilter,
  setCityFilter,
  dateFilter,
  setDateFilter,
  tripTypeFilter,
  setTripTypeFilter,
  scheduleTypeFilter,
  setScheduleTypeFilter,
  clearFilters,
  onSearch
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

  const handleScheduleTypeFilterChange = (type) => {
    setScheduleTypeFilter(type);
  };

  // Determine if any filters are applied
  const appliedFilters = !!(cityFilter || dateFilter.startDate || tripTypeFilter || scheduleTypeFilter);

  return (
    <div className="card h-100">
      {/* <div className="card-header bg-light py-2">
        <h6 className="mb-0 fs-6">Search Trips</h6>
      </div> */}
      <div className="card-body py-2 px-2">
        <div className="mb-2">
          <label className="form-label small mb-1">City</label>
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
        
        <div className="mb-2">
          <label className="form-label small mb-1">Trip Type</label>
          <select 
            className="form-select form-select-sm"
            value={tripTypeFilter}
            onChange={(e) => handleTripTypeFilterChange(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="one_way">One Way</option>
            <option value="round_trip">Round Trip</option>
            <option value="multi_stop">Multi-stop</option>
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label small mb-1">Schedule Type</label>
          <select 
            className="form-select form-select-sm"
            value={scheduleTypeFilter}
            onChange={(e) => handleScheduleTypeFilterChange(e.target.value)}
          >
            <option value="">All Schedules</option>
            <option value="Immediate">Immediate</option>
            <option value="Once">Once</option>
            <option value="Blanket">Blanket</option>
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label small mb-1">Start Date</label>
          <DatePicker
            placeholder="Start Date"
            value={dateFilter.startDate ? dayjs(dateFilter.startDate) : null}
            onChange={(newValue) => {
              const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : null;
              handleDateFilterChange(formattedDate, dateFilter.endDate);
            }}
            size="small"
          />
        </div>
        
        <div className="mb-2">
          <label className="form-label small mb-1">End Date</label>
          <DatePicker
            placeholder="End Date"
            value={dateFilter.endDate ? dayjs(dateFilter.endDate) : null}
            onChange={(newValue) => {
              const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : null;
              handleDateFilterChange(dateFilter.startDate, formattedDate);
            }}
            disabled={!dateFilter.startDate}
            size="small"
          />
        </div>
        
        <div className="d-grid">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={clearFilters}
            disabled={!appliedFilters}
          >
            Clear Filters
          </button>
        </div>
        
        {appliedFilters && (
          <div className="mt-2">
            <div className="text-muted small mb-1">Applied Filters:</div>
            
            <div className="d-flex flex-wrap">
              {cityFilter && (
                <div className="badge bg-primary rounded-pill me-1 mb-1 d-flex align-items-center" style={{ maxWidth: '48%' }}>
                  <span className="small text-truncate">{cityFilter}</span>
                  <button 
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: '0.5rem' }}
                    onClick={() => handleCityFilterChange('')}
                    aria-label="Remove city filter"
                  ></button>
                </div>
              )}
              
              {tripTypeFilter && (
                <div className="badge bg-primary rounded-pill me-1 mb-1 d-flex align-items-center" style={{ maxWidth: '48%' }}>
                  <span className="small text-truncate">{tripTypeFilter}</span>
                  <button 
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: '0.5rem' }}
                    onClick={() => handleTripTypeFilterChange('')}
                    aria-label="Remove trip type filter"
                  ></button>
                </div>
              )}
              
              {scheduleTypeFilter && (
                <div className="badge bg-primary rounded-pill me-1 mb-1 d-flex align-items-center" style={{ maxWidth: '48%' }}>
                  <span className="small text-truncate">{scheduleTypeFilter}</span>
                  <button 
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: '0.5rem' }}
                    onClick={() => handleScheduleTypeFilterChange('')}
                    aria-label="Remove schedule type filter"
                  ></button>
                </div>
              )}
              
              {dateFilter.startDate && (
                <div className="badge bg-primary rounded-pill me-1 mb-1 d-flex align-items-center" style={{ maxWidth: '48%' }}>
                  <span className="small text-truncate">
                    {dateFilter.startDate}{dateFilter.endDate ? ` to ${dateFilter.endDate}` : ''}
                  </span>
                  <button 
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: '0.5rem' }}
                    onClick={() => handleDateFilterChange(null, null)}
                    aria-label="Remove date filter"
                  ></button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerticalTripSearchPanel; 