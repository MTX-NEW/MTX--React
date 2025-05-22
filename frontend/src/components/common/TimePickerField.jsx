import React from 'react';
import { Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

/**
 * A reusable 24-hour TimePicker component with customized styling
 * Includes scrollbar hiding and height fixing
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name used by react-hook-form
 * @param {Object} props.control - react-hook-form control object
 * @param {string} props.label - Label for the TimePicker
 * @param {boolean} props.required - Whether the field is required
 * @param {Object} props.error - Error object from react-hook-form
 * @param {string} props.helperText - Helper text or error message
 * @param {string} props.placeholder - Placeholder for the TimePicker
 * @param {boolean} props.compact - Whether to use compact styling
 * @param {Object} props.fieldProps - Additional props for the TimePicker
 */
const TimePickerField = ({
  name,
  control,
  label = '',
  required = false,
  error = null,
  helperText = '',
  placeholder = '',
  compact = false,
  fieldProps = {}
}) => {
  return (
    <div className={compact ? 'time-picker-compact' : ''}>
      {label && (
        <label className={compact ? 'time-picker-label' : ''}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div>
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            // Parse the time value correctly
            let timeValue = null;
            if (field.value) {
              try {
                // Try to parse the time value as HH:MM
                timeValue = dayjs(`2022-01-01T${field.value}`);
                if (!timeValue.isValid()) {
                  timeValue = null;
                }
              } catch (error) {
                // Silently handle parsing errors
              }
            }
            
            return (
              <TimePicker
                value={timeValue}
                onChange={(time) => {
                  const formattedTime = time ? time.format('HH:mm') : null;
                  field.onChange(formattedTime);
                }}
                ampm={false}
                openTo="hours"
                views={['hours', 'minutes']}
                slotProps={{
                  textField: {
                    className: `form-control ${compact ? 'time-input mt-1' : 'mt-2'}`,
                    variant: "outlined",
                    placeholder: placeholder,
                    error: !!error,
                    helperText: helperText,
                    size: "small"
                  },
                  layout: {
                    sx: {
                      "& .MuiMultiSectionDigitalClock-root > ul": {
                        width: "fit-content",
                        "&::-webkit-scrollbar": {
                          display: "none"
                        },
                        scrollbarWidth: "none", /* Firefox */
                        "-ms-overflow-style": "none", /* IE and Edge */
                        paddingBottom: 0
                      },
                      "& .MuiMultiSectionDigitalClock-root": {
                        maxHeight: "unset",
                        height: "auto"
                      },
                      "& .MuiDigitalClock-root": {
                        height: "auto"
                      }
                    }
                  }
                }}
                {...fieldProps}
              />
            );
          }}
        />
      </div>
    </div>
  );
};

export default TimePickerField; 