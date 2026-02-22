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
            />
          </div>
        );
      }}
    />
  );
};

// Helper to get display label from an option
const getOptionLabel = (option) => {
  if (!option) return '';
  return typeof option === 'object' ? (option.label || '') : '';
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
  // Use the async autocomplete hook for searching; pass form value so clear (X) syncs internal state
  const {
    inputValue,
    options,
    loading,
    open,
    selectedOption,
    setOpen,
    setSelectedOption,
    setInputValue,
    handleInputChange,
  } = useAsyncAutocomplete(
    (query) => tripMemberApi.searchMembers(query),
    400,
    2
    // Do NOT pass form value here - the sync effect was clearing selection before Controller updated (race). Clear only in handleChange when user clicks X.
  );

  // Map API response to autocomplete options format
  const mappedOptions = options.map(member => ({
    value: member.member_id,
    label: `${member.first_name} ${member.last_name}`,
    data: member
  }));

  // When form value is empty, don't show defaultOption (parent may still pass old member until it re-renders)
  const displayValue = value ? (selectedOption || defaultOption) : selectedOption;

  const handleChange = (_, newValue) => {
    fieldOnChange(newValue ? newValue.value : '');
    if (newValue) {
      setSelectedOption(newValue);
      setInputValue(getOptionLabel(newValue)); // show full name in input; parent onSelect is async (getMemberById)
      if (onSelect) onSelect(newValue.value, newValue.data);
    } else {
      setSelectedOption(null);
      setInputValue('');
    }
  };

  const handleInputChangeWrapper = (event, newInputValue, reason) => {
    // User clicked clear (X) - always clear form and internal state
    if (reason === 'clear') {
      setSelectedOption(null);
      fieldOnChange('');
      handleInputChange(event, '');
      return;
    }
    // MUI fires 'reset' after SELECTING an option (to sync input to value). Do NOT clear - that was wiping the selection.
    if (reason === 'reset') {
      handleInputChange(event, newInputValue);
      return;
    }
    // User cleared the input by typing (empty string)
    if (newInputValue === '') {
      setSelectedOption(null);
      fieldOnChange('');
      handleInputChange(event, '');
      return;
    }
    // User editing (e.g. backspace): clear selection so input is free
    if (displayValue && newInputValue !== getOptionLabel(displayValue)) {
      setSelectedOption(null);
      fieldOnChange('');
    }
    handleInputChange(event, newInputValue);
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      options={mappedOptions}
      loading={loading}
      value={displayValue}
      onChange={handleChange}
      onInputChange={handleInputChangeWrapper}
      isOptionEqualToValue={(option, val) => {
        if (!option || !val) return false;
        return option.value === (typeof val === 'object' ? val.value : val);
      }}
      getOptionLabel={getOptionLabel}
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