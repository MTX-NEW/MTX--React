import React, { useCallback } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { tripMemberApi } from '@/api/baseApi';
import useAsyncAutocomplete from '@/hooks/useAsyncAutocomplete';

/**
 * A simplified member autocomplete component that avoids state loops
 */
const MemberAutocomplete = ({ 
  name, 
  label, 
  placeholder = 'Search member by name (min 2 letters)',
  onSelect,
  required = false,
  defaultValue = null
}) => {
  const { control, getValues } = useFormContext();
  
  // Process member selection callback just once, with complete member data
  const handleSelectMember = useCallback(async (memberId, memberData) => {
    try {
      // Get complete member details with Program information
      const response = await tripMemberApi.getMemberById(memberId);
      const fullMemberData = response.data;
      
      console.log("Member selected in autocomplete (complete data):", fullMemberData);
      
      if (onSelect) {
        onSelect(memberId, fullMemberData);
      }
    } catch (error) {
      console.error("Error fetching complete member data:", error);
      // Fall back to the basic member data if there's an error
      console.log("Member selected in autocomplete (basic data):", memberId, memberData);
      if (onSelect) {
        onSelect(memberId, memberData);
      }
    }
  }, [onSelect]);

  // Get the default value as an option object
  let defaultOption = null;
  if (defaultValue) {
    defaultOption = {
      value: typeof defaultValue === 'object' ? defaultValue.member_id : defaultValue,
      label: typeof defaultValue === 'object' 
        ? `${defaultValue.first_name} ${defaultValue.last_name}`
        : '',
      data: defaultValue
    };
  }

  // Create a key to force re-render when defaultValue changes
  const componentKey = defaultValue 
    ? (typeof defaultValue === 'object' ? defaultValue.member_id : defaultValue) 
    : 'no-member';

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={getValues(name) || ''}
      rules={{ required: required ? 'This field is required' : false }}
      render={({ field, fieldState: { error } }) => {
        const { onChange: fieldOnChange, ...restField } = field;
        
        return (
          <div className="mb-2">
            <label>{label} {required && <span className="text-danger">*</span>}</label>
            <AsyncMemberSearch 
              {...restField}
              fieldOnChange={fieldOnChange}
              defaultOption={defaultOption}
              placeholder={placeholder}
              error={error}
              onSelect={handleSelectMember}
              key={componentKey} // Add key to force re-render
            />
          </div>
        );
      }}
    />
  );
};

// Separate component for async search functionality
const AsyncMemberSearch = React.memo(({ 
  value,
  fieldOnChange,
  defaultOption,
  placeholder,
  error,
  onSelect
}) => {
  // Use the async autocomplete hook for searching
  const {
    inputValue,
    options,
    loading,
    open,
    selectedOption,
    setOpen,
    handleInputChange,
  } = useAsyncAutocomplete(
    (query) => tripMemberApi.searchMembers(query),
    400, // Debounce time - wait 400ms after typing stops
    2    // Minimum characters - start searching after 2 chars
  );

  // Map API response to autocomplete options format
  const mappedOptions = options.map(member => ({
    value: member.member_id,
    label: `${member.first_name} ${member.last_name}`,
    data: member
  }));

  // Use the default option if there's no selected option
  const displayValue = selectedOption || defaultOption;

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      options={mappedOptions}
      loading={loading}
      value={displayValue}
      onChange={(_, newValue) => {
        // Update form field
        fieldOnChange(newValue ? newValue.value : '');
        
        // Call parent onSelect if provided
        if (onSelect && newValue) {
          onSelect(newValue.value, newValue.data);
        }
      }}
      onInputChange={handleInputChange}
      isOptionEqualToValue={(option, value) => {
        if (!option || !value) return false;
        return option.value === (typeof value === 'object' ? value.value : value);
      }}
      getOptionLabel={(option) => {
        if (!option) return '';
        return typeof option === 'object' ? (option.label || '') : '';
      }}
      filterOptions={(x) => x} // Disable client-side filtering
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
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
                {loading ? <CircularProgress color="primary" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText={
        inputValue.length < 2 
          ? "Type at least 2 characters to search" 
          : loading 
            ? "Loading..." 
            : "No members found"
      }
    />
  );
});

export default React.memo(MemberAutocomplete); 