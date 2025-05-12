import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FaCalendarAlt, FaClock, FaExchangeAlt } from 'react-icons/fa';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { TextField } from '@mui/material';

// Styled components for better appearance
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: '1rem',
  width: '100%'
}));

// Day labels for blanket schedules
const DAYS_OF_WEEK = [
  { value: 'Monday', label: 'M' },
  { value: 'Tuesday', label: 'T' },
  { value: 'Wednesday', label: 'W' },
  { value: 'Thursday', label: 'T' },
  { value: 'Friday', label: 'F' },
  { value: 'Saturday', label: 'S' },
  { value: 'Sunday', label: 'S' }
];

const ScheduleCard = ({ 
  selectedDate,
  scheduleType = 'Once',
  tripType = 'one_way',
  pickupTime,
  dropoffTime,
  returnTime,
  startDate,
  endDate,
  scheduleDays = [],
  onDateSelect,
  onScheduleTypeSelect,
  onTripTypeSelect,
  onPickupTimeChange,
  onDropoffTimeChange,
  onReturnTimeChange,
  onStartDateChange,
  onEndDateChange,
  onScheduleDaysChange,
  pickupDate,
  onDateChange,
  onTimeChange,
  isRoundTrip = false,
  returnDate,
  onReturnDateChange,
  minDate = new Date()
}) => {
  // Get today's date for defaults
  const today = dayjs().format('YYYY-MM-DD');
  
  // Initialize React Hook Form
  const { control, watch, setValue } = useForm({
    defaultValues: {
      scheduleType,
      tripType,
      selectedDate: selectedDate || today,
      pickupTime: pickupTime || '',
      dropoffTime: dropoffTime || '',
      returnTime: returnTime || '',
      startDate: startDate || today,
      endDate: endDate || today,
      scheduleDays,
      pickupDate: pickupDate || null,
      returnDate: returnDate || null,
    }
  });
  
  // Watch for values to use in UI
  const watchedScheduleType = watch('scheduleType');
  const watchedTripType = watch('tripType');
  const watchedScheduleDays = watch('scheduleDays');
  
  // Handle day selection for blanket schedules
  const handleDayToggle = (day) => {
    const updatedDays = watchedScheduleDays.includes(day)
      ? watchedScheduleDays.filter(d => d !== day)
      : [...watchedScheduleDays, day];
    
    setValue('scheduleDays', updatedDays);
    if (onScheduleDaysChange) {
      onScheduleDaysChange(updatedDays);
    }
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    if (onDateChange) onDateChange(date);
  };

  // Handle time change
  const handleTimeChange = (time) => {
    if (onTimeChange) onTimeChange(time);
  };

  // Handle return date change
  const handleReturnDateChange = (date) => {
    if (onReturnDateChange) onReturnDateChange(date);
  };

  // Handle return time change
  const handleReturnTimeChange = (time) => {
    if (onReturnTimeChange) onReturnTimeChange(time);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="trip-section-header">
        <h5 className="trip-section-title">Schedule</h5>
      </div>
      
      <div className="trip-section-body">
        {/* Schedule Type Selection */}
        <StyledFormControl>
          <FormLabel id="schedule-type-label" className="fw-medium">Schedule Type</FormLabel>
          <Controller
            name="scheduleType"
            control={control}
            render={({ field }) => (
              <RadioGroup
                {...field}
                row
                aria-labelledby="schedule-type-label"
                onChange={(e) => {
                  field.onChange(e);
                  if (onScheduleTypeSelect) onScheduleTypeSelect(e.target.value);
                }}
              >
                <FormControlLabel value="Immediate" control={<Radio />} label="Immediate" />
                <FormControlLabel value="Once" control={<Radio />} label="Once" />
                <FormControlLabel value="Blanket" control={<Radio />} label="Blanket" />
              </RadioGroup>
            )}
          />
        </StyledFormControl>
        
        {/* Trip Type Selection */}
        <StyledFormControl>
          <FormLabel id="trip-type-label" className="fw-medium">Trip Type</FormLabel>
          <Controller
            name="tripType"
            control={control}
            render={({ field }) => (
              <RadioGroup
                {...field}
                row
                aria-labelledby="trip-type-label"
                onChange={(e) => {
                  field.onChange(e);
                  if (onTripTypeSelect) onTripTypeSelect(e.target.value);
                }}
              >
                <FormControlLabel value="one_way" control={<Radio />} label="One Way" />
                <FormControlLabel value="round_trip" control={<Radio />} label="Round Trip" />
              </RadioGroup>
            )}
          />
        </StyledFormControl>
        
        {/* Date Selection - Shown for Once and Immediate schedule types */}
        {watchedScheduleType !== 'Blanket' && (
          <div className="mb-3">
            <FormLabel htmlFor="trip-date" className="fw-medium d-flex align-items-center mb-2">
              <FaCalendarAlt className="me-2 text-primary" /> Trip Date
            </FormLabel>
            <Controller
              name="selectedDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => {
                    const formattedDate = date ? date.format('YYYY-MM-DD') : null;
                    field.onChange(formattedDate);
                    if (onDateSelect) onDateSelect(formattedDate);
                    handleDateChange(date);
                  }}
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      fullWidth: true,
                      size: "small"
                    }
                  }}
                />
              )}
            />
          </div>
        )}
        
        {/* Blanket Schedule Fields */}
        {watchedScheduleType === 'Blanket' && (
          <>
            <div className="row mb-3">
              <div className="col-6">
                <FormLabel htmlFor="start-date" className="fw-medium d-block mb-2">Start Date</FormLabel>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => {
                        const formattedDate = date ? date.format('YYYY-MM-DD') : null;
                        field.onChange(formattedDate);
                        if (onStartDateChange) onStartDateChange(formattedDate);
                      }}
                      slotProps={{
                        textField: {
                          variant: "outlined",
                          fullWidth: true,
                          size: "small"
                        }
                      }}
                    />
                  )}
                />
              </div>
              <div className="col-6">
                <FormLabel htmlFor="end-date" className="fw-medium d-block mb-2">End Date</FormLabel>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => {
                        const formattedDate = date ? date.format('YYYY-MM-DD') : null;
                        field.onChange(formattedDate);
                        if (onEndDateChange) onEndDateChange(formattedDate);
                      }}
                      slotProps={{
                        textField: {
                          variant: "outlined",
                          fullWidth: true,
                          size: "small"
                        }
                      }}
                    />
                  )}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <FormLabel className="fw-medium d-block mb-2">Days of Week</FormLabel>
              <div className="d-flex justify-content-between">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    className={`btn btn-circle ${watchedScheduleDays.includes(day.value) ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleDayToggle(day.value)}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Time Selection */}
        <div className="mb-3">
          <FormLabel htmlFor="pickup-time" className="fw-medium d-flex align-items-center mb-2">
            <FaClock className="me-2 text-primary" /> Pickup Time
          </FormLabel>
          <Controller
            name="pickupTime"
            control={control}
            render={({ field }) => (
              <TimePicker
                value={field.value ? dayjs(field.value, 'HH:mm') : null}
                onChange={(time) => {
                  const formattedTime = time ? time.format('HH:mm') : null;
                  field.onChange(formattedTime);
                  if (onPickupTimeChange) onPickupTimeChange(formattedTime);
                  handleTimeChange(time);
                }}
                slotProps={{
                  textField: {
                    variant: "outlined",
                    fullWidth: true,
                    size: "small"
                  }
                }}
              />
            )}
          />
        </div>
        
        <div className="mb-3">
          <FormLabel htmlFor="dropoff-time" className="fw-medium d-flex align-items-center mb-2">
            <FaClock className="me-2 text-primary" /> Dropoff Time (Optional)
          </FormLabel>
          <Controller
            name="dropoffTime"
            control={control}
            render={({ field }) => (
              <TimePicker
                value={field.value ? dayjs(field.value, 'HH:mm') : null}
                onChange={(time) => {
                  const formattedTime = time ? time.format('HH:mm') : null;
                  field.onChange(formattedTime);
                  if (onDropoffTimeChange) onDropoffTimeChange(formattedTime);
                }}
                slotProps={{
                  textField: {
                    variant: "outlined",
                    fullWidth: true,
                    size: "small"
                  }
                }}
              />
            )}
          />
        </div>
        
        {/* Return Time - Only show for round trip */}
        {watchedTripType === 'round_trip' && (
          <div className="mb-3">
            <FormLabel htmlFor="return-time" className="fw-medium d-flex align-items-center mb-2">
              <FaExchangeAlt className="me-2 text-primary" /> Return Pickup Time
            </FormLabel>
            <Controller
              name="returnTime"
              control={control}
              render={({ field }) => (
                <TimePicker
                  value={field.value ? dayjs(field.value, 'HH:mm') : null}
                  onChange={(time) => {
                    const formattedTime = time ? time.format('HH:mm') : null;
                    field.onChange(formattedTime);
                    if (onReturnTimeChange) onReturnTimeChange(formattedTime);
                    handleReturnTimeChange(time);
                  }}
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      fullWidth: true,
                      size: "small"
                    }
                  }}
                />
              )}
            />
            <small className="text-muted d-block mt-1">Time when return trip starts from dropoff back to pickup location</small>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
};

export default ScheduleCard; 