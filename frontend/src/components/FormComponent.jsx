import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimeClock } from "@mui/x-date-pickers/TimeClock";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import TimePickerField from './common/TimePickerField';

import dayjs from "dayjs";

const FormComponent = ({ fields, onSubmit, submitText = "Submit", isSubmitting = false, additionalButtons = [] }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    trigger,
    formState: { errors },
  } = useFormContext();

  // Function to handle immediate validation on change
  const handleOnChange = (e, fieldName) => {
    const value = e.target.value;
    setValue(fieldName, value, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => {
          const value = watch(field.name);
          switch (field.type) {
            case "text":
            case "password":
            case "email":
            case "number":
            case "tel":
              const registerOptions = field.validateOnChange 
                ? { ...register(field.name), onChange: (e) => handleOnChange(e, field.name) } 
                : register(field.name);
                
              return (
                <div className="mb-2" key={index}>
                  <label>{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...registerOptions}
                    {...(field.inputProps || {})}
                    className="form-control mt-2"
                    disabled={field.disabled}
                    readOnly={field.readOnly}
                  />
                  {field.helperText && (
                    <small className="form-text text-muted">
                      {field.helperText}
                    </small>
                  )}
                  {errors[field.name] && (
                    <span className="form-warning">
                      {errors[field.name].message}
                    </span>
                  )}
                </div>
              );
            case "textarea":
              return (
                <div className="mb-2" key={index}>
                  <label>{field.label}</label>
                  <textarea
                    placeholder={field.placeholder}
                    {...register(field.name)}
                    {...(field.inputProps || {})}
                    className="form-control mt-2"
                    rows={4}
                  />
                  {errors[field.name] && (
                    <span className="form-warning">
                      {errors[field.name].message}
                    </span>
                  )}
                </div>
              );
            case "select":
              return (
                <div className="mb-2" key={index}>
                  <label>{field.label}</label>
                  <Controller
                    name={field.name}
                    control={control}
                    defaultValue={value || ''}
                    render={({ field: { onChange, value, ref } }) => (
                      <select
                        onChange={onChange}
                        value={value || ''}
                        ref={ref}
                        className="form-control mt-2"
                      >
                        <option value="">Select</option>
                        {field.options.map((option, optIndex) => (
                          <option key={optIndex} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors[field.name] && (
                    <span className="form-warning">
                      {errors[field.name].message}
                    </span>
                  )}
                </div>
              );
            case "radio":
              return (
                <div className="mb-2" key={index}>
                  <label>{field.label}</label>
                  <div className="radio-background">
                    {field.options.map((option, optIndex) => {
                      // Handle defaultValue for radio buttons
                      const isDefaultChecked = field.defaultValue !== undefined && 
                                            String(field.defaultValue) === String(option.value);
                      
                      return (
                        <label key={optIndex} className="me-3">
                          <input
                            type="radio"
                            {...register(field.name)}
                            value={option.value}
                            className="me-2"
                            defaultChecked={isDefaultChecked}
                            onChange={(e) => {
                              setValue(field.name, e.target.value);
                              if (field.validateOnChange) {
                                trigger(field.name);
                              }
                            }}
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                  {errors[field.name] && (
                    <span className="form-warning">
                      {errors[field.name].message}
                    </span>
                  )}
                </div>
              );
            case "date":
              return (
                <div className="mb-2" key={index}>
                  <label>{field.label}</label>
                  <div>
                    <DatePicker
                      value={value ? dayjs(value) : null}
                      onChange={(date) =>
                        setValue(field.name, date ? date.toISOString() : null, {
                          shouldValidate: true,
                        })
                      }
                      slotProps={{
                        textField: {
                          className: "form-control mt-2",
                          variant: "outlined"
                        }
                      }}
                    />
                  </div>
                  {errors[field.name] && (
                    <span className="form-warning">
                      {errors[field.name].message}
                    </span>
                  )}
                </div>
              );
            case "time":
              return (
                <div className="mb-2" key={index}>
                  <TimePickerField
                    name={field.name}
                    control={control}
                    label={field.label}
                    error={errors[field.name]}
                    helperText={field.helperText}
                    placeholder={field.placeholder || ""}
                    fieldProps={{
                      disabled: field.disabled,
                      ...(field.fieldProps || {})
                    }}
                  />
                  {errors[field.name] && (
                    <span className="form-warning">
                      {errors[field.name].message}
                    </span>
                  )}
                </div>
              );
            case "array-checkboxes":
              const selectedItems = watch(field.name) || [];
              return (
                <div className="mb-2" key={index}>
                  <label>{field.label}</label>
                  <div className="checkbox-grid">
                    {field.options.map((option, optIndex) => {
                      const isSelected = selectedItems.some(
                        item => item[field.valueField] === option.value
                      );
                      return (
                        <div key={optIndex} className="checkbox-item">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const currentItems = [...selectedItems];
                                if (e.target.checked) {
                                  currentItems.push({
                                    [field.valueField]: option.value,
                                    ...field.defaultItemValues
                                  });
                                } else {
                                  const idx = currentItems.findIndex(
                                    item => item[field.valueField] === option.value
                                  );
                                  if (idx !== -1) {
                                    currentItems.splice(idx, 1);
                                  }
                                }
                                setValue(field.name, currentItems);
                              }}
                            />
                            <span className="ms-2">{option.label}</span>
                          </label>
                          {isSelected && field.itemFields && (
                            <div className="item-details mt-2">
                              {field.itemFields.map((itemField, fieldIndex) => (
                                <div key={fieldIndex} className="mb-2">
                                  <label className="small">{itemField.label}</label>
                                  {itemField.type === 'date' ? (
                                    <DatePicker className="mb-3"
                                      value={selectedItems.find(
                                        item => item[field.valueField] === option.value
                                      )?.[itemField.name] ? 
                                        dayjs(selectedItems.find(
                                          item => item[field.valueField] === option.value
                                        )[itemField.name]) : 
                                        null
                                      }
                                      onChange={(date) => {
                                        const currentItems = [...selectedItems];
                                        const idx = currentItems.findIndex(
                                          item => item[field.valueField] === option.value
                                        );
                                        if (idx !== -1) {
                                          currentItems[idx] = {
                                            ...currentItems[idx],
                                            [itemField.name]: date ? date.format('YYYY-MM-DD') : null
                                          };
                                          setValue(field.name, currentItems);
                                        }
                                      }}
                                      slotProps={{
                                        textField: {
                                          className: "form-control form-control-sm",
                                          variant: "outlined"
                                        }
                                      }}
                                    />
                                  ) : itemField.type === 'checkbox' ? (
                                    <input
                                      type="checkbox"
                                      checked={selectedItems.find(
                                        item => item[field.valueField] === option.value
                                      )?.[itemField.name] || false}
                                      onChange={(e) => {
                                        const currentItems = [...selectedItems];
                                        const idx = currentItems.findIndex(
                                          item => item[field.valueField] === option.value
                                        );
                                        if (idx !== -1) {
                                          currentItems[idx] = {
                                            ...currentItems[idx],
                                            [itemField.name]: e.target.checked
                                          };
                                          setValue(field.name, currentItems);
                                        }
                                      }}
                                      className="ms-2"
                                    />
                                  ) : (
                                    <input
                                      type={itemField.type}
                                      className="form-control form-control-sm mb-2"
                                      value={selectedItems.find(
                                        item => item[field.valueField] === option.value
                                      )?.[itemField.name] || ''}
                                      onChange={(e) => {
                                        const currentItems = [...selectedItems];
                                        const idx = currentItems.findIndex(
                                          item => item[field.valueField] === option.value
                                        );
                                        if (idx !== -1) {
                                          currentItems[idx] = {
                                            ...currentItems[idx],
                                            [itemField.name]: e.target.value
                                          };
                                          setValue(field.name, currentItems);
                                        }
                                      }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {errors[field.name] && (
                    <span className="form-warning">
                      {errors[field.name].message}
                    </span>
                  )}
                </div>
              );
            case "checkbox":
              return (
                <div className="mb-2" key={index}>
                  <div className="checkbox-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={value || false}
                        disabled={field.disabled}
                        onChange={(e) => {
                          setValue(field.name, e.target.checked);
                          if (field.onChange) field.onChange(e);
                        }}
                      />
                      <span className="ms-2">{field.label}</span>
                    </label>
                  </div>
                  {field.helperText && (
                    <small className="form-text text-muted">
                      {field.helperText}
                    </small>
                  )}
                  {errors[field.name] && (
                    <span className="form-warning">
                      {errors[field.name].message}
                    </span>
                  )}
                </div>
              );
            case "custom":
              return (
                <div className="mb-2" key={index}>
                  <label>{field.label}</label>
                  {field.render && field.render({ field: { 
                    value, 
                    onChange: (newValue) => setValue(field.name, newValue, { shouldValidate: true }) 
                  }})}
                  {errors[field.name] && (
                    <span className="form-warning">{errors[field.name].message}</span>
                  )}
                </div>
              );
            case "autocomplete":
              try {
                // Ensure options is always an array
                const safeOptions = Array.isArray(field.options) ? field.options : [];
                
                // Find matching option safely
                const selectedOption = value ? 
                  safeOptions.find(opt => opt && opt.value === value) || null : 
                  null;
                
                return (
                  <div className="mb-2" key={index}>
                    <label>{field.label}</label>
                    <div>
                      <Autocomplete
                        options={safeOptions}
                        value={selectedOption}
                        onChange={(event, newValue) => {
                          // Handle both object and string values
                          const selectedValue = newValue && typeof newValue === 'object' ? 
                            newValue.value : newValue;
                          setValue(field.name, selectedValue || '', { shouldValidate: true });
                          if (field.onChange) field.onChange(selectedValue);
                        }}
                        getOptionLabel={(option) => {
                          // Handle any type of option safely
                          if (!option) return '';
                          return typeof option === 'object' ? (option.label || '') : String(option);
                        }}
                        isOptionEqualToValue={(option, value) => {
                          // Safe comparison that handles null/undefined
                          if (!option || !value) return false;
                          return option.value === (typeof value === 'object' ? value.value : value);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder={field.placeholder || ''}
                            variant="outlined"
                            className="custom-autocomplete mt-2"
                            error={!!errors[field.name]}
                            helperText={errors[field.name]?.message || ''}
                            fullWidth
                            size="small"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {field.isLoading ? (
                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                      <span className="visually-hidden">Loading...</span>
                                    </div>
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        filterOptions={(x) => x} // Disable client-side filtering as we're doing server-side search
                        noOptionsText={field.noResultsText || "No options"}
                        {...(field.autocompleteProps || {})}
                      />
                    </div>
                    {field.helperText && (
                      <small className="form-text text-muted">
                        {field.helperText}
                      </small>
                    )}
                  </div>
                );
              } catch (error) {
                console.error("Error rendering autocomplete:", error);
                // Fallback to a simple input if autocomplete fails
                return (
                  <div className="mb-2" key={index}>
                    <label>{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder || "Select an option"}
                      {...register(field.name)}
                      className="form-control mt-2"
                    />
                    {errors[field.name] && (
                      <span className="form-warning">
                        {errors[field.name].message}
                      </span>
                    )}
                  </div>
                );
              }
            case "multiselect":
              // Convert value to array if not already
              const selectedValues = Array.isArray(value) ? value : [];
              
              return (
                <div className="multiselect-container">
                  <FormGroup>
                    {field.options.map((option, optIndex) => (
                      <FormControlLabel
                        key={optIndex}
                        control={
                          <Checkbox
                            checked={selectedValues.includes(option.value)}
                            onChange={(e) => {
                              const currentValues = [...selectedValues];
                              if (e.target.checked) {
                                // Add the value if not already present
                                if (!currentValues.includes(option.value)) {
                                  currentValues.push(option.value);
                                }
                              } else {
                                // Remove the value
                                const idx = currentValues.indexOf(option.value);
                                if (idx !== -1) {
                                  currentValues.splice(idx, 1);
                                }
                              }
                              setValue(field.name, currentValues, { shouldValidate: true });
                            }}
                          />
                        }
                        label={option.label}
                      />
                    ))}
                  </FormGroup>
                  {errors[field.name] && (
                    <span className="form-warning">
                      {errors[field.name].message}
                    </span>
                  )}
                </div>
              );
            default:
              return null;
          }
        })}
        <div className="d-flex justify-content-between mt-3">
          <button type="submit" className="save-user-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : submitText}
          </button>
          
          {additionalButtons.length > 0 && (
            <div className="additional-buttons">
              {additionalButtons.map((button, index) => (
                <button
                  key={index}
                  type="button"
                  className={button.className || "btn btn-secondary ms-2"}
                  onClick={button.onClick}
                  disabled={button.disabled}
                >
                  {button.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>
    </LocalizationProvider>
  );
};

export default FormComponent;
