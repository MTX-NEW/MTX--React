import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import MemberAutocomplete from '@/components/common/MemberAutocomplete';
import LocationAutocomplete from '@/components/common/LocationAutocomplete';
import TimePickerField from '@/components/common/TimePickerField';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { FaEdit } from 'react-icons/fa';

// Presenter component - responsible for rendering UI
const RequestFormPresenter = ({ 
  formMethods,
  handleSubmitForm,
  handleCreateNewTrip,
  isSubmitting,
  submitText = "Create Trip",
  legCount,
  programs,
  companies,
  addLeg,
  removeLeg,
  renderMemberField,
  renderLocationField,
  selectedMember,
  tripType,
  initialData,
  isEditMode,
  handleEditMember
}) => {
  const { register, control, formState: { errors }, watch, setValue, trigger } = formMethods;
  const currentScheduleType = watch('schedule_type');
  
  return (
    <FormProvider {...formMethods}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <form onSubmit={formMethods.handleSubmit(handleSubmitForm)} className="trip-request-form">
          <div className="compact-form-container">
            {/* Member Container */}
            <div className="form-container-box member-box">
              <h2 className="container-title">Member Information</h2>
              <div className="member-selection">
                {renderMemberField()}
              </div>
              
              {selectedMember && (
                <div className="member-details animate-in">
                  <div className="member-details-header">
                    {handleEditMember && (
                      <button
                        type="button"
                        onClick={() => handleEditMember(selectedMember)}
                        className="btn-secondary btn-sm"
                      >
                        <FaEdit className="me-1" style={{ fontSize: '10px' }} /> Edit
                      </button>
                    )}
                  </div>
                  <div className="member-info-grid">
                    <div className="member-info-item">
                      <span className="info-label">Program</span>
                      <span className="info-value">
                        {selectedMember?.Program?.program_name || 'N/A'}
                      </span>
                    </div>
                    <div className="member-info-item">
                      <span className="info-label">AHCCCS ID</span>
                      <span className="info-value">
                        {selectedMember?.ahcccs_id || 'N/A'}
                      </span>
                    </div>
                    <div className="member-info-item">
                      <span className="info-label">Birth Date</span>
                      <span className="info-value">
                        {selectedMember?.birth_date ? 
                          new Date(selectedMember.birth_date).toLocaleDateString() : 
                          'N/A'}
                      </span>
                    </div>
                    <div className="member-info-item">
                      <span className="info-label">Phone</span>
                      <span className="info-value">
                        {selectedMember?.phone || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Schedule Container */}
            <div className="form-container-box schedule-trip-box">
              <h2 className="container-title">Trip & Schedule Details</h2>
              
              {/* Schedule Type */}
              <div className="schedule-type-container mb-3">
                <div className="radio-group schedule-radio">
                  {[
                    { value: 'Immediate', label: 'Immediate' },
                    { value: 'Once', label: 'Once' },
                    { value: 'Blanket', label: 'Blanket' }
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      className={`radio-option ${watch('schedule_type') === option.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        {...register('schedule_type')}
                        value={option.value}
                        onChange={(e) => {
                          setValue('schedule_type', e.target.value);
                          trigger('schedule_type');
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.schedule_type && (
                  <span className="error-message">{errors.schedule_type.message}</span>
                )}
              </div>

              {/* Trip Type */}
              <div className="trip-type-container mb-3">
                <div className="radio-group trip-type-radio">
                  {[
                    { value: 'one_way', label: 'One Way' },
                    { value: 'round_trip', label: 'Round Trip' },
                    { value: 'multi_stop', label: 'Multiple Stops' }
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      className={`radio-option ${watch('trip_type') === option.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        {...register('trip_type')}
                        value={option.value}
                        onChange={(e) => {
                          setValue('trip_type', e.target.value);
                          trigger('trip_type');
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.trip_type && (
                  <span className="error-message">{errors.trip_type.message}</span>
                )}
              </div>

              {/* Date Selection */}
              <div className="schedule-date-container">
                <div className="date-fields-container">
                  <div className={currentScheduleType === 'Blanket' ? 'date-field half-width' : 'date-field'}>
                    <div className="date-field-label">
                      <span className="field-label">
                        {currentScheduleType === 'Blanket' ? 'Start Date' : 'Date'}
                      </span>
                      <span className="text-danger ms-1">*</span>
                    </div>
                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                          slotProps={{
                            textField: {
                              className: `form-control date-input ${errors.start_date ? 'is-invalid' : ''}`,
                              variant: "outlined",
                              error: !!errors.start_date,
                              helperText: errors.start_date?.message,
                              size: "small"
                            }
                          }}
                        />
                      )}
                    />
                  </div>
                  
                  {currentScheduleType === 'Blanket' && (
                    <div className="date-field half-width">
                      <div className="date-field-label">
                        <span className="field-label">End Date</span>
                        <span className="text-danger ms-1">*</span>
                      </div>
                      <Controller
                        name="end_date"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                            slotProps={{
                              textField: {
                                className: `form-control date-input ${errors.end_date ? 'is-invalid' : ''}`,
                                variant: "outlined",
                                error: !!errors.end_date,
                                helperText: errors.end_date?.message,
                                size: "small"
                              }
                            }}
                          />
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Days of Week for Blanket Schedule */}
                {currentScheduleType === 'Blanket' && (
                  <div className="days-container mt-2">
                    <div className="date-field-label">
                      <span className="field-label">Days of Week</span>
                      <span className="text-danger ms-1">*</span>
                    </div>
                    <div className="days-week-horizontal">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <div key={day} className="day-checkbox">
                          <Controller
                            name="schedule_days"
                            control={control}
                            defaultValue={[]}
                            render={({ field }) => {
                              const { onChange, value = [] } = field;
                              const fullDay = {
                                'Mon': 'Monday',
                                'Tue': 'Tuesday',
                                'Wed': 'Wednesday',
                                'Thu': 'Thursday',
                                'Fri': 'Friday',
                                'Sat': 'Saturday',
                                'Sun': 'Sunday'
                              }[day];
                              const isChecked = Array.isArray(value) && value.includes(fullDay);
                              
                              return (
                                <div className="day-checkbox-container">
                                  <label className="day-checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const newValue = [...(value || [])];
                                        if (e.target.checked) {
                                          newValue.push(fullDay);
                                        } else {
                                          const index = newValue.indexOf(fullDay);
                                          if (index > -1) {
                                            newValue.splice(index, 1);
                                          }
                                        }
                                        onChange(newValue);
                                      }}
                                    />
                                    <span>{day}</span>
                                  </label>
                                </div>
                              );
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {errors.schedule_days && (
                      <span className="error-message">{errors.schedule_days.message}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
                
            {/* Location Containers - Side by Side */}
            <div className="location-containers">
              {/* Pickup Container */}
              <div className="form-container-box pickup-box">
                <h2 className="container-title">Pickup Location</h2>
                {renderLocationField(0, 'pickup')}
                
                {/* Location Details */}
                <div className="location-details">
                  <div className="location-details-grid">
                    <div className="location-detail-row">
                      <div className="location-detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">pickup</span>
                      </div>
                      <div className="location-detail-item">
                        <span className="detail-label">City:</span>
                        <span className="detail-value">{formMethods.getValues(`legs[0]`)?.pickupLocation?.city || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="location-detail-row">
                      <div className="location-detail-item">
                        <span className="detail-label">Building:</span>
                        <span className="detail-value">N/A</span>
                      </div>
                      <div className="location-detail-item">
                        <span className="detail-label">Building Type:</span>
                        <span className="detail-value">N/A</span>
                      </div>
                    </div>
                    <div className="location-detail-row">
                      <div className="location-detail-item">
                        <span className="detail-label">Lat:</span>
                        <span className="detail-value">{formMethods.getValues(`legs[0]`)?.pickupLocation?.latitude || 'N/A'}</span>
                      </div>
                      <div className="location-detail-item">
                        <span className="detail-label">Long:</span>
                        <span className="detail-value">{formMethods.getValues(`legs[0]`)?.pickupLocation?.longitude || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="time-field-container">
                  <TimePickerField
                    name="legs[0].scheduled_pickup"
                    control={control}
                    label="Pickup Time"
                    required={true}
                    compact={true}
                    error={errors.legs?.[0]?.scheduled_pickup}
                    helperText={errors.legs?.[0]?.scheduled_pickup?.message}
                  />
                </div>
              </div>

              {/* Dropoff Container */}
              <div className="form-container-box dropoff-box">
                <h2 className="container-title">Dropoff Location</h2>
                {renderLocationField(0, 'dropoff')}
                
                {/* Location Details */}
                <div className="location-details">
                  <div className="location-details-grid">
                    <div className="location-detail-row">
                      <div className="location-detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">dropoff</span>
                      </div>
                      <div className="location-detail-item">
                        <span className="detail-label">City:</span>
                        <span className="detail-value">{formMethods.getValues(`legs[0]`)?.dropoffLocation?.city || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="location-detail-row">
                      <div className="location-detail-item">
                        <span className="detail-label">Building:</span>
                        <span className="detail-value">N/A</span>
                      </div>
                      <div className="location-detail-item">
                        <span className="detail-label">Building Type:</span>
                        <span className="detail-value">N/A</span>
                      </div>
                    </div>
                    <div className="location-detail-row">
                      <div className="location-detail-item">
                        <span className="detail-label">Lat:</span>
                        <span className="detail-value">{formMethods.getValues(`legs[0]`)?.dropoffLocation?.latitude || 'N/A'}</span>
                      </div>
                      <div className="location-detail-item">
                        <span className="detail-label">Long:</span>
                        <span className="detail-value">{formMethods.getValues(`legs[0]`)?.dropoffLocation?.longitude || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="time-field-container">
                  <TimePickerField
                    name="legs[0].scheduled_dropoff"
                    control={control}
                    label="Dropoff Time (Optional)"
                    compact={true}
                  />
                </div>
              </div>
            </div>

            {/* Return Trip */}
            {tripType === 'round_trip' && (
              <div className="form-container-box return-box">
                <h2 className="container-title">Return Trip</h2>
                <div className="time-field-container">
                  <TimePickerField
                    name="return_pickup_time"
                    control={control}
                    label="Return Pickup Time"
                    compact={true}
                  />
                </div>
              </div>
            )}

            {/* Additional Legs for Multi-stop */}
            {tripType === 'multi_stop' && legCount > 1 && (
              <div className="form-container-box multi-stops-box">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h2 className="container-title mb-0">Additional Stops</h2>
                  <button 
                    type="button" 
                    className="btn-secondary btn-sm"
                    onClick={addLeg}
                  >
                    Add Stop
                  </button>
                </div>
                <div className="additional-legs-container">
                  {Array.from({ length: legCount - 1 }).map((_, i) => {
                    const legIndex = i + 1;
                    return (
                      <div key={`leg-${legIndex}`} className="additional-leg-item">
                        <div className="leg-header">
                          <span className="leg-number">Leg {legIndex + 1}</span>
                          <button 
                            type="button" 
                            className="btn-link-danger btn-sm"
                            onClick={() => removeLeg(legIndex)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="leg-locations">
                          <div className="leg-location">
                            {renderLocationField(legIndex, 'pickup')}
                            <TimePickerField
                              name={`legs[${legIndex}].scheduled_pickup`}
                              control={control}
                              label="Pickup Time"
                              required={true}
                              compact={true}
                              error={errors.legs?.[legIndex]?.scheduled_pickup}
                              helperText={errors.legs?.[legIndex]?.scheduled_pickup?.message}
                            />
                          </div>
                          <div className="leg-location">
                            {renderLocationField(legIndex, 'dropoff')}
                            <TimePickerField
                              name={`legs[${legIndex}].scheduled_dropoff`}
                              control={control}
                              label="Dropoff Time (Optional)"
                              compact={true}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div className="form-container-box instructions-box">
              <h2 className="container-title">Special Instructions</h2>
              
              <div className="special-instructions compact">
                {/* Mobility Type */}
                <div className="instruction-section">
                  <label className="instruction-section-label">Mobility</label>
                  <div className="radio-group compact-radio">
                    {[
                      { value: 'Ambulatory', label: 'Ambulatory' },
                      { value: 'Wheelchair', label: 'Wheelchair' }
                    ].map((option) => (
                      <label 
                        key={option.value} 
                        className={`radio-option py-0 px-2 fs-8 ${watch('mobility_type') === option.value ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          {...register('mobility_type')}
                          value={option.value}
                          onChange={(e) => setValue('mobility_type', e.target.value)}
                          style={{ width: '14px', height: '14px' }}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Vehicle Type */}
                <div className="instruction-section">
                  <label className="instruction-section-label">Vehicle</label>
                  <div className="vehicle-options">
                    {[
                      { value: 'van', label: 'Van' },
                      { value: 'sedan', label: 'Sedan' }
                    ].map((option) => (
                      <div key={option.value} className="vehicle-option">
                        <Controller
                          name={option.value}
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  size="small"
                                />
                              }
                              label={option.label}
                              className="compact-check"
                            />
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Requirements Grid */}
                <div className="instruction-section">
                  <label className="instruction-section-label">Requirements</label>
                  <div className="compact-instructions-grid">
                    {[
                      { value: 'rides_alone', label: 'Rides Alone' },
                      { value: 'spanish_speaking', label: 'Spanish Speaking' },
                      { value: 'males_only', label: 'Males Only' },
                      { value: 'females_only', label: 'Females Only' },
                      { value: 'special_assist', label: 'Special Assistance' },
                      { value: 'pickup_time_exact', label: 'Exact Pickup Time' },
                      { value: 'stay_with_client', label: 'Stay With Client' },
                      { value: 'car_seat', label: 'Car Seat' },
                      { value: 'extra_person', label: 'Extra Person' },
                      { value: 'call_first', label: 'Call First' },
                      { value: 'knock', label: 'Knock' }
                    ].map((option) => (
                      <div key={option.value} className="instruction-option">
                        <Controller
                          name={option.value}
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  size="small"
                                />
                              }
                              label={option.label}
                              className="compact-check"
                            />
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions-container">
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : submitText}
              </button>
              
              {isEditMode && (
                <button 
                  type="button" 
                  className="btn-secondary" 
                  disabled={isSubmitting}
                  onClick={formMethods.handleSubmit(handleCreateNewTrip)}
                >
                  Create New Trip
                </button>
              )}
            </div>
          </div>
        </form>
      </LocalizationProvider>
    </FormProvider>
  );
};

// Container component - responsible for logic and state
const RequestForm = ({
  initialData,
  onSubmit,
  onCreateNew,
  isSubmitting, 
  members = [],
  programs = [],
  memberLocations = [],
  isLoadingLocations = false,
  onMemberSelect = () => {},
  companies = [],
  onEditMember = () => {}
}) => {
  // Initialize form state
  const [tripType, setTripType] = useState('one_way');
  const [legCount, setLegCount] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);


  // Form methods
  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: initialData || {
      member_id: '',
      program_id: '',
      company_id: '',
      schedule_type: 'Once',
      trip_type: 'one_way',
      start_date: dayjs().format('YYYY-MM-DD'),
      return_pickup_time: null,
      legs: [{
        sequence: 1,
        status: 'Scheduled',
        pickup_location: '',
        dropoff_location: '',
        scheduled_pickup: null,
        scheduled_dropoff: null,
        leg_distance: null,
        is_return: false
      }],
      // Set defaults for special instructions directly
      mobility_type: 'Ambulatory',
      rides_alone: false,
      spanish_speaking: false,
      males_only: false,
      females_only: false,
      special_assist: false,
      pickup_time_exact: false,
      stay_with_client: false,
      car_seat: false,
      extra_person: false,
      call_first: true,
      knock: true,
      van: true,
      sedan: true
    }
  });

  // Watch for changes
  const selectedMemberId = formMethods.watch('member_id');
  const watchTripType = formMethods.watch('trip_type');

  // Initialize from initial data if provided
  useEffect(() => {
    if (initialData) {
      // Set trip type directly - no conversion needed with updated API
      setTripType(initialData.trip_type);
      formMethods.setValue('trip_type', initialData.trip_type);
      
      // Set leg count directly from legs array
      if (initialData.legs) {
        setLegCount(initialData.legs.length);
      }

      // Use member data directly from the API response
      if (initialData.TripMember) {
        setSelectedMember(initialData.TripMember);
      }
      
      // Ensure dates are properly formatted for the form (YYYY-MM-DD)
      if (initialData.start_date) {
        formMethods.setValue('start_date', initialData.start_date);
      }
      
      if (initialData.end_date) {
        formMethods.setValue('end_date', initialData.end_date);
      }
      
      // Set special instructions directly from the API response
      if (initialData.specialInstructions) {
        // Set all the special instruction fields directly
        formMethods.setValue('mobility_type', initialData.specialInstructions.mobility_type || 'Ambulatory');
        formMethods.setValue('rides_alone', initialData.specialInstructions.rides_alone || false);
        formMethods.setValue('spanish_speaking', initialData.specialInstructions.spanish_speaking || false);
        formMethods.setValue('males_only', initialData.specialInstructions.males_only || false);
        formMethods.setValue('females_only', initialData.specialInstructions.females_only || false);
        formMethods.setValue('special_assist', initialData.specialInstructions.special_assist || false);
        formMethods.setValue('pickup_time_exact', initialData.specialInstructions.pickup_time_exact || false);
        formMethods.setValue('stay_with_client', initialData.specialInstructions.stay_with_client || false);
        formMethods.setValue('car_seat', initialData.specialInstructions.car_seat || false);
        formMethods.setValue('extra_person', initialData.specialInstructions.extra_person || false);
        formMethods.setValue('call_first', initialData.specialInstructions.call_first || false);
        formMethods.setValue('knock', initialData.specialInstructions.knock || false);
        formMethods.setValue('van', initialData.specialInstructions.van || false);
        formMethods.setValue('sedan', initialData.specialInstructions.sedan || false);
      }
      
      // Format time fields in legs to HH:MM format
      if (initialData.legs?.length > 0) {
        const formattedLegs = initialData.legs.map(leg => {
          const formattedLeg = {
            ...leg,
            // Convert time strings from HH:MM:SS to HH:MM
            scheduled_pickup: leg.scheduled_pickup ? leg.scheduled_pickup.slice(0, 5) : null,
            scheduled_dropoff: leg.scheduled_dropoff ? leg.scheduled_dropoff.slice(0, 5) : null
          };
          
          return formattedLeg;
        });
        
        // For round trips, extract return pickup time
        if (initialData.trip_type === 'round_trip' && formattedLegs.length > 1) {
          const returnLeg = formattedLegs.find(leg => leg.sequence === 2);
          if (returnLeg?.scheduled_pickup) {
            formMethods.setValue('return_pickup_time', returnLeg.scheduled_pickup);
          }
        }
        
        formMethods.setValue('legs', formattedLegs);
        
        // Explicitly set individual leg times
        formattedLegs.forEach((leg, index) => {
          formMethods.setValue(`legs[${index}].scheduled_pickup`, leg.scheduled_pickup);
          formMethods.setValue(`legs[${index}].scheduled_dropoff`, leg.scheduled_dropoff);
        });
      }
    }
  }, [initialData, formMethods]);
  
  // Handle member selection
  const handleMemberSelect = useCallback((memberId, memberData) => {
    console.log("Member selected in form:", memberData);
    
    // Clear previous member locations
    if (selectedMember?.member_id !== memberId) {
      formMethods.setValue('legs[0].pickup_location', '');
      formMethods.setValue('legs[0].dropoff_location', '');
    }
    
    // Set the new selected member
    setSelectedMember(memberData);
    
    // Notify parent component to fetch locations for this member
    if (onMemberSelect && memberId) {
      onMemberSelect(memberId, memberData);
    }
    
    // Set program_id from the complete member data
    if (memberData?.program_id) {
      formMethods.setValue('program_id', memberData.program_id);

    }
  }, [formMethods, onMemberSelect, programs, selectedMember]);

  // Helper function to initialize trip legs - wrap in useCallback
  const initializeTripLegs = useCallback((count = 1) => {
    // Create fresh leg objects for each position
    const newLegs = Array.from({ length: count }, (_, index) => ({
      sequence: index + 1,
      status: 'Scheduled',
      pickup_location: '',
      dropoff_location: '',
      scheduled_pickup: null,
      scheduled_dropoff: null,
      leg_distance: null,
      is_return: index > 0 // first leg is not return, others might be
    }));
    
    // Set the legs array in the form
    formMethods.setValue('legs', newLegs);
    
    // Also set individual fields to ensure they're registered
    newLegs.forEach((leg, index) => {
      formMethods.setValue(`legs[${index}].sequence`, leg.sequence);
      formMethods.setValue(`legs[${index}].status`, leg.status);
      formMethods.setValue(`legs[${index}].pickup_location`, leg.pickup_location);
      formMethods.setValue(`legs[${index}].dropoff_location`, leg.dropoff_location);
      formMethods.setValue(`legs[${index}].scheduled_pickup`, leg.scheduled_pickup);
      formMethods.setValue(`legs[${index}].scheduled_dropoff`, leg.scheduled_dropoff);
      formMethods.setValue(`legs[${index}].leg_distance`, leg.leg_distance);
      formMethods.setValue(`legs[${index}].is_return`, leg.is_return);
      
    });
  }, [formMethods]);

  // Initialize default locations for the first leg if member locations change
  useEffect(() => {
    // Only run if we have valid memberLocations data and a selected member
    if (memberLocations.length > 0 && selectedMemberId) {
      console.log('Processing member locations for default address setup:', memberLocations);
      
      // Find default pickup and dropoff locations
      const pickupLocation = memberLocations.find(loc => loc.location_type === 'pickup');
      const dropoffLocation = memberLocations.find(loc => loc.location_type === 'dropoff');
      
      // Get current legs
      const currentLegs = formMethods.getValues('legs') || [];
      
      // Only update if we have the first leg and it doesn't already have locations set
      if (currentLegs.length > 0) {
        // Create a copy to modify
        const updatedLegs = [...currentLegs];
        
        // Update pickup location if available and not already set
        if (pickupLocation && !formMethods.getValues('legs[0].pickup_location')) {
          updatedLegs[0] = {
            ...updatedLegs[0],
            pickup_location: pickupLocation.location_id
          };
          formMethods.setValue('legs[0].pickup_location', pickupLocation.location_id);
        }
        
        // Update dropoff location if available and not already set
        if (dropoffLocation && !formMethods.getValues('legs[0].dropoff_location')) {
          updatedLegs[0] = {
            ...updatedLegs[0],
            dropoff_location: dropoffLocation.location_id
          };
          formMethods.setValue('legs[0].dropoff_location', dropoffLocation.location_id);
        }
      }
    }
  }, [selectedMemberId, memberLocations, formMethods]);

  // Handle trip type changes
  useEffect(() => {
    const newTripType = watchTripType; // This will be 'one_way', 'round_trip', or 'multiple'
    setTripType(newTripType);
    
    // Initialize legs based on trip type
    if (newTripType === 'one_way') {
      // Always set to 1 leg for one way
      setLegCount(1);
      
      // Get current legs to preserve location data
      const currentLegs = formMethods.getValues('legs') || [];
      if (currentLegs.length > 0) {
        // Keep only the first leg but preserve its data
        const preservedLeg = {
          ...currentLegs[0],
          sequence: 1,
          is_return: false
        };
        
        formMethods.setValue('legs', [preservedLeg]);
      } else {
        initializeTripLegs(1);
      }
    } else if (newTripType === 'round_trip') {
      // Round trip has 1 visible leg but creates 2 at submission
      setLegCount(1);
      
      // Get current legs to preserve location data
      const currentLegs = formMethods.getValues('legs') || [];
      if (currentLegs.length > 0) {
        // Keep only the first leg but preserve its data
        const preservedLeg = {
          ...currentLegs[0],
          sequence: 1,
          is_return: false
        };
        
        formMethods.setValue('legs', [preservedLeg]);
      } else {
        initializeTripLegs(1);
      }
      
      // Set return_pickup_time field
      formMethods.setValue('return_pickup_time', null);
    } else if (newTripType === 'multi_stop') {
      // Multiple legs starts with at least 2 legs
      const currentLegs = formMethods.getValues('legs') || [];
      const newCount = Math.max(currentLegs.length, 2);
      
      if (currentLegs.length > 0) {
        // Preserve existing legs and add more if needed
        if (currentLegs.length < 2) {
          const preservedLeg = { ...currentLegs[0], sequence: 1, is_return: false };
          const newLeg = {
            sequence: 2,
            status: 'Scheduled',
            pickup_location: '',
            dropoff_location: '',
            scheduled_pickup: null,
            scheduled_dropoff: null,
            leg_distance: null,
            is_return: true
          };
          
          formMethods.setValue('legs', [preservedLeg, newLeg]);
        } else {
          // Just update sequence numbers
          const updatedLegs = currentLegs.map((leg, idx) => ({
            ...leg,
            sequence: idx + 1,
            is_return: idx > 0
          }));
          
          formMethods.setValue('legs', updatedLegs);
        }
      } else {
        initializeTripLegs(newCount);
      }
      
      setLegCount(newCount);
    }
  }, [watchTripType, initializeTripLegs, formMethods, setLegCount]);

  // Add a new leg - wrap in useCallback
  const addLeg = useCallback(() => {
    const currentLegs = formMethods.getValues('legs') || [];
    
    const newLeg = {
      sequence: currentLegs.length + 1,
      status: 'Scheduled',
      pickup_location: '',
      dropoff_location: '',
      scheduled_pickup: null,
      scheduled_dropoff: null,
      leg_distance: null,
      is_return: false
    };
    
    formMethods.setValue('legs', [...currentLegs, newLeg]);
    setLegCount(currentLegs.length + 1);
  }, [formMethods, setLegCount]);
  
  // Remove a leg - wrap in useCallback
  const removeLeg = useCallback((index) => {
    const currentLegs = formMethods.getValues('legs') || [];
    
    if (currentLegs.length <= 1) return; // Don't remove the last leg
    
    const newLegs = currentLegs.filter((_, i) => i !== index);
    
    // Update sequence numbers
    newLegs.forEach((leg, i) => {
      leg.sequence = i + 1;
    });
    
    formMethods.setValue('legs', newLegs);
    setLegCount(newLegs.length);
  }, [formMethods, setLegCount]);

  // Custom member field for the form
  const renderMemberField = useCallback(() => {
    // If editing a trip, use the member from initialData or selectedMember
    const memberValue = selectedMember || 
      (initialData?.member_id ? { 
        member_id: initialData.member_id,
        first_name: initialData?.TripMember?.first_name,
        last_name: initialData?.TripMember?.last_name
      } : null);
    
    return (
        <MemberAutocomplete
          name="member_id"
          label="Member"
          placeholder="Search member by name (min 2 letters)"
          required={true}
          onSelect={handleMemberSelect}
        defaultValue={memberValue}
        key={memberValue?.member_id || 'member-select'} // Force re-render on member change
        />
    );
  }, [handleMemberSelect, selectedMember, initialData]);

  // Custom location field for the form
  const renderLocationField = useCallback((legIndex, locationType) => {
    const fieldName = `legs[${legIndex}].${locationType}_location`;
    const label = locationType === 'pickup' ? 'Pickup Location' : 'Dropoff Location';
    
    return (
        <LocationAutocomplete
          name={fieldName}
          label={label}
          locations={memberLocations}
          required={true}
          isLoading={isLoadingLocations}
          defaultValue={
            formMethods.getValues(fieldName) || 
            (initialData?.legs?.[legIndex]?.[`${locationType}_location`] || '')
          }
        />
    );
  }, [memberLocations, isLoadingLocations, formMethods, initialData]);

  // Handle editing a member
  const handleEditMember = useCallback((member) => {
    if (member && onEditMember) {
      onEditMember(member);
    }
  }, [onEditMember]);

  const handleSubmitForm = (data) => {
    onSubmit(data);
  };
  
  const handleCreateNewTrip = (data) => {
    // Always create a new trip, regardless of whether we're editing
    if (onCreateNew) {
      onCreateNew(data);
    } else {
      // Fall back to regular submit if onCreateNew is not provided
      const newTripData = { ...data };
      // Remove any trip_id to ensure it creates a new trip
      if (newTripData.trip_id) delete newTripData.trip_id;
      onSubmit(newTripData);
    }
  };

  // Determine submit text based on context
  const submitText = initialData?.trip_id ? "Update Trip" : "Create Trip";
  const isEditMode = !!initialData?.trip_id;

  return (
    <RequestFormPresenter
      formMethods={formMethods}
      handleSubmitForm={handleSubmitForm}
      handleCreateNewTrip={handleCreateNewTrip}
      isSubmitting={isSubmitting}
      submitText={submitText}
      tripType={tripType}
      legCount={legCount}
      programs={programs}
      companies={companies}
      addLeg={addLeg}
      removeLeg={removeLeg}
      renderMemberField={renderMemberField}
      renderLocationField={renderLocationField}
      selectedMember={selectedMember}
      initialData={initialData}
      isEditMode={isEditMode}
      handleEditMember={handleEditMember}
    />
  );
};

export default RequestForm; 