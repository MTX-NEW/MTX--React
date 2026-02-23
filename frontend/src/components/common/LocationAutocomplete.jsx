import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { tripLocationApi } from '@/api/baseApi';
import useAsyncAutocomplete from '@/hooks/useAsyncAutocomplete';

/**
 * A location autocomplete component that supports both member locations and dynamic search
 */
const LocationAutocomplete = ({
  name,
  label,
  locations = [], // Member-specific locations from parent component
  required = false,
  defaultValue = null,
  isLoading = false,
  onChange
}) => {
  const { control, getValues, watch } = useFormContext();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formattedSearchResults, setFormattedSearchResults] = useState([]);

  // Watch for value changes to update the selectedLocation when field is updated programmatically
  const currentValue = watch(name);
  
  // Use useAsyncAutocomplete to fetch locations dynamically as the user types
  const {
    inputValue,
    options: searchResultsRaw,
    loading: searchLoading,
    open,
    setOpen,
    setInputValue,
    handleInputChange
  } = useAsyncAutocomplete(
    (query) => tripLocationApi.searchLocations(query),
    400, // Debounce time
    2    // Minimum characters
  );

  // Format raw search results into the expected option format whenever they change
  useEffect(() => {
    // Map the raw search results to the format expected by Autocomplete
    const formatted = searchResultsRaw.map(loc => ({
      value: loc.location_id,
      label: loc.street_address 
        ? `${loc.street_address}, ${loc.city || ''}, ${loc.state || ''} ${loc.zip || ''}`
        : `Location #${loc.location_id}`,
      data: loc
    }));
    
    setFormattedSearchResults(formatted);
  }, [searchResultsRaw]);
 

  const formatLocationOption = (loc) => ({
    value: loc.location_id,
    label: loc.street_address
      ? `${loc.street_address}, ${loc.city || ''}, ${loc.state || ''} ${loc.zip || ''}`
      : `Location #${loc.location_id}`,
    data: loc
  });

  const memberLocationOptions = React.useMemo(() => locations.map(loc => ({
    ...formatLocationOption(loc),
    isMemberLocation: true
  })), [locations]);

  // Sync selected location from form value only when form has a value (don't restore when user cleared)
  useEffect(() => {
    if (locations.length > 0 && currentValue) {
      const locId = typeof currentValue === 'object' ? currentValue.location_id : currentValue;
      const foundLocation = locations.find(loc => loc.location_id == locId);
      if (foundLocation && (!selectedLocation || selectedLocation.location_id != locId)) {
        setSelectedLocation(foundLocation);
      }
    } else if (!currentValue) {
      setSelectedLocation(null);
    }
  }, [locations, currentValue]);
  
  let defaultOption = null;
  if (defaultValue && locations.length > 0) {
    const locId = typeof defaultValue === 'object' ? defaultValue.location_id : defaultValue;
    defaultOption = memberLocationOptions.find(opt => opt.value == locId) || null;
  }

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={getValues(name) || ''}
      rules={{ required: required ? 'This field is required' : false }}
      render={({ field, fieldState: { error } }) => {
        // Prepare combined options array
        let displayOptions = [...memberLocationOptions];
        
        // Add search results if we have any (and we're actively searching)
        if (inputValue.length >= 2 && formattedSearchResults.length > 0) {
          // Add a separator if we have member locations
          if (memberLocationOptions.length > 0) {
            displayOptions.push({ 
              value: 'divider', 
              label: '─── Search Results ───', 
              isHeader: true 
            });
          }
          
          // Add all search results
          displayOptions = [...displayOptions, ...formattedSearchResults];
        }
        
        // Resolve form value to option so MUI can show selection and the clear button (including when selected from search results).
        const value = field.value
          ? (typeof field.value === 'object'
              ? field.value
              : displayOptions.find(opt => !opt.isHeader && opt.value == field.value) ||
                (defaultOption && defaultOption.value == field.value ? defaultOption : null) ||
                (selectedLocation && selectedLocation.location_id == field.value ? formatLocationOption(selectedLocation) : null))
          : null;
          
        // Make sure selectedLocation is kept in sync with the field value
        React.useEffect(() => {
          if (value && typeof value !== 'object') {
            // If value is just an ID, try to find the location data
            const locationData = locations.find(loc => loc.location_id == value);
            if (locationData && (!selectedLocation || selectedLocation.location_id != value)) {
              setSelectedLocation(locationData);
            }
          } else if (value && value.data && (!selectedLocation || selectedLocation.location_id != value.value)) {
            setSelectedLocation(value.data);
          }
        }, [value, locations]);
        
        return (
          <div className="mb-2">
            <label>{label} {required && <span className="text-danger">*</span>}</label>
            <Autocomplete
              inputValue={inputValue}
              onInputChange={(event, newInputValue, reason) => {
                if (newInputValue === '') {
                  field.onChange('');
                  setSelectedLocation(null);
                }
                handleInputChange(event, newInputValue);
              }}
              options={displayOptions}
              loading={isLoading || searchLoading}
              value={value}
              onChange={(_, newValue) => {
                if (newValue && newValue.isHeader) return;
                field.onChange(newValue ? newValue.value : '');
                if (newValue) {
                  setSelectedLocation(newValue.data);
                } else {
                  setSelectedLocation(null);
                  setInputValue('');
                }
                if (onChange && newValue) {
                  onChange(newValue.value, newValue.data);
                }
              }}
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              isOptionEqualToValue={(option, val) => {
                if (!option || !val || option.isHeader) return false;
                return option.value === (typeof val === 'object' ? val.value : val);
              }}
              getOptionLabel={(option) => {
                if (!option) return '';
                return typeof option === 'object' ? (option.label || '') : '';
              }}
              getOptionDisabled={(option) => option.isHeader}
              blurOnSelect={false}
              forcePopupIcon={true}
              selectOnFocus={false}
              clearOnBlur={false}
              renderOption={(props, option) => {
                // Handle dividers/headers
                if (option.isHeader) {
                  return (
                    <li 
                      key={option.value} 
                      className="text-muted" 
                      style={{ 
                        fontStyle: 'italic', 
                        textAlign: 'center',
                        padding: '8px 16px',
                        opacity: 0.7
                      }}
                    >
                      {option.label}
                    </li>
                  );
                }
                
                // Extract key from props
                const { key, ...restProps } = props;
                
                // Create custom key that won't change on render
                const itemKey = `location-${option.value}`;
                
                // Handle regular options
                return (
                  <li key={itemKey} {...restProps}>
                    {option.isMemberLocation && (
                      <span style={{ marginRight: '8px', color: '#2196F3' }}>●</span>
                    )}
                    {option.label}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search by address"
                  error={!!error}
                  helperText={error?.message || ''}
                  variant="outlined"
                  className="mt-2"
                  fullWidth
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {(isLoading || searchLoading) ? <CircularProgress color="primary" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              noOptionsText={
                inputValue.length < 2 
                  ? "Type at least 2 characters to search" 
                  : (isLoading || searchLoading)
                    ? "Loading..." 
                    : "No locations found"
              }
            />
            
            {/* Location Details Display */}
            {selectedLocation && (
              <div className="location-details mt-1 small bg-light p-2 rounded">
                <div className="row">
                  <div className="col-md-6">
                    <span className="fw-semibold">Type:</span> {selectedLocation.location_type || "N/A"}
                  </div>
                  <div className="col-md-6">
                    <span className="fw-semibold">City:</span> {selectedLocation.city || "N/A"}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <span className="fw-semibold">Building:</span> {selectedLocation.building || "N/A"}
                  </div>
                  <div className="col-md-6">
                    <span className="fw-semibold">Building Type:</span> {selectedLocation.building_type || "N/A"}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export default React.memo(LocationAutocomplete);