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

// Presenter component - responsible for rendering UI
const TripFormPresenter = ({ 
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
  isEditMode
}) => {
  const { register, control, formState: { errors }, watch, setValue, trigger } = formMethods;
  const currentScheduleType = watch('schedule_type');
  
  // Determine if we should show member details section
  const showMemberDetails = selectedMember || initialData?.TripMember;
  const memberData = selectedMember || initialData?.TripMember;
  
  return (
    <FormProvider {...formMethods}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <form onSubmit={formMethods.handleSubmit(handleSubmitForm)}>
          {/* Member Field */}
          <div className="row">
            <div className="col-12 mb-2">
              {renderMemberField()}
            </div>
          </div>
          
          {/* Member Details Section */}
          {showMemberDetails && (
            <div className="row mb-3">
              <div className="col-12">
                <div className="member-details-container p-3 bg-light rounded small">
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <span className="fw-semibold">Program:</span> {memberData?.Program?.program_name || 
                       (memberData?.program_id ? `Program ID: ${memberData.program_id}` : "N/A")}
                    </div>
                    <div className="col-md-6">
                      <span className="fw-semibold">AHCCCS ID:</span> {memberData?.ahcccs_id || "N/A"}
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <span className="fw-semibold">Birth Date:</span> {memberData?.birth_date 
                        ? new Date(memberData.birth_date).toLocaleDateString() 
                        : "N/A"}
                    </div>
                    <div className="col-md-6">
                      <span className="fw-semibold">Phone:</span> {memberData?.phone || "N/A"}
                    </div>
                  </div>
                  <div className="row justify-content-start">
                    <div className="col-md-6">
                      <span className="fw-semibold">Gender:</span> {memberData?.gender || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Schedule Type & Trip Type */}
          <div className="row">
            <div className="col-md-6 mb-2">
              <label>Schedule Type <span className="text-danger">*</span></label>
              <div className="radio-background">
                {[
                  { value: 'Immediate', label: 'Immediate' },
                  { value: 'Once', label: 'Once' },
                  { value: 'Blanket', label: 'Blanket' }
                ].map((option, index) => (
                  <label key={index} className="me-3">
                    <input
                      type="radio"
                      {...register('schedule_type')}
                      value={option.value}
                      className="me-2"
                      onChange={(e) => {
                        setValue('schedule_type', e.target.value);
                        trigger('schedule_type');
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {errors.schedule_type && <span className="form-warning">{errors.schedule_type.message}</span>}
            </div>
            
            <div className="col-md-6 mb-2">
              <label>Trip Type <span className="text-danger">*</span></label>
              <div className="radio-background">
                {[
                  { value: 'one_way', label: 'OW' },
                  { value: 'round_trip', label: 'RT' },
                  { value: 'multi_stop', label: 'Multiple Legs' }
                ].map((option, index) => (
                  <label key={index} className="me-3">
                    <input
                      type="radio"
                      {...register('trip_type')}
                      value={option.value}
                      className="me-2"
                      onChange={(e) => {
                        setValue('trip_type', e.target.value);
                        trigger('trip_type');
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {errors.trip_type && <span className="form-warning">{errors.trip_type.message}</span>}
            </div>
          </div>
          
          {/* Date Fields */}
          <div className="row justify-content-start ">
            <div className={currentScheduleType === 'Blanket' ? 'col-md-6 mb-2' : 'col-md-6 mb-2'}>
              <label>{currentScheduleType === 'Blanket' ? 'Start Date' : 'Date'} <span className="text-danger">*</span></label>
              <div>
                <Controller
                  name="start_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                      slotProps={{
                        textField: {
                          className: "form-control mt-2",
                          variant: "outlined",
                          error: !!errors.start_date,
                          helperText: errors.start_date?.message
                        }
                      }}
                    />
                  )}
                />
              </div>
            </div>
            
            {currentScheduleType === 'Blanket' ? (
              <div className="col-md-6 mb-2">
                <label>End Date <span className="text-danger">*</span></label>
                <div>
                  <Controller
                    name="end_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                        slotProps={{
                          textField: {
                            className: "form-control mt-2",
                            variant: "outlined",
                            error: !!errors.end_date,
                            helperText: errors.end_date?.message
                          }
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            ) : null}
          </div>
          
          {/* Days of Week for Blanket Schedule */}
          {currentScheduleType === 'Blanket' && (
            <div className="row">
              <div className="col-12 mb-2">
                <label>Days of Week <span className="text-danger">*</span></label>
                <div className="multiselect-container">
                  <FormGroup row>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <FormControlLabel
                        key={day}
                        className="col-md-3"
                        control={
                          <Controller
                            name="schedule_days"
                            control={control}
                            defaultValue={[]}
                            render={({ field }) => {
                              const { onChange, value = [] } = field;
                              const isChecked = Array.isArray(value) && value.includes(day);
                              
                              return (
                                <Checkbox
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const newValue = [...(value || [])];
                                    if (e.target.checked) {
                                      newValue.push(day);
                                    } else {
                                      const index = newValue.indexOf(day);
                                      if (index > -1) {
                                        newValue.splice(index, 1);
                                      }
                                    }
                                    onChange(newValue);
                                  }}
                                />
                              );
                            }}
                          />
                        }
                        label={day}
                      />
                    ))}
                  </FormGroup>
                </div>
                {errors.schedule_days && <span className="form-warning">{errors.schedule_days.message}</span>}
              </div>
            </div>
          )}
          
          {/* Trip Details */}
       
          
          {/* First Leg */}
          <div className="row">
            <div className="col-md-6 mb-2">
              {renderLocationField(0, 'pickup')}
            </div>
            
            <div className="col-md-6 mb-2">
              {renderLocationField(0, 'dropoff')}
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-2">
              <TimePickerField
                name="legs[0].scheduled_pickup"
                control={control}
                label="Pickup Time"
                required={true}
                error={errors.legs?.[0]?.scheduled_pickup}
                helperText={errors.legs?.[0]?.scheduled_pickup?.message}
              />
            </div>
            
            <div className="col-md-6 mb-2">
              <TimePickerField
                name="legs[0].scheduled_dropoff"
                control={control}
                label="Dropoff Time (Optional)"
              />
            </div>
          </div>
          
          {/* Return Trip */}
          {tripType === 'round_trip' && (
            <div className="row justify-content-start">
              <div className="col-12 mb-2">
                <h5>Return Trip</h5>
              </div>
              <div className="col-md-6 mb-2">
                <TimePickerField
                  name="return_pickup_time"
                  control={control}
                  label="Return Pickup Time (Optional)"
                />
              </div>
            </div>
          )}
          
          {/* Additional Legs for Multiple Trip Type */}
          {tripType === 'multi_stop' && legCount > 1 && (
            <>
              {Array.from({ length: legCount - 1 }).map((_, i) => {
                const legIndex = i + 1;
                return (
                  <div key={`leg-${legIndex}`} className="row mb-4 border-top pt-3">
                    <div className="col-12 d-flex justify-content-between align-items-center">
                      <h5>Leg {legIndex + 1}</h5>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-danger mt-2"
                        onClick={() => removeLeg(legIndex)}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="col-md-6 mb-2">
                      {renderLocationField(legIndex, 'pickup')}
                    </div>
                    
                    <div className="col-md-6 mb-2">
                      {renderLocationField(legIndex, 'dropoff')}
                    </div>
                    
                    <div className="col-md-6 mb-2">
                      <TimePickerField
                        name={`legs[${legIndex}].scheduled_pickup`}
                        control={control}
                        label="Pickup Time"
                        required={true}
                        error={errors.legs?.[legIndex]?.scheduled_pickup}
                        helperText={errors.legs?.[legIndex]?.scheduled_pickup?.message}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-2">
                      <TimePickerField
                        name={`legs[${legIndex}].scheduled_dropoff`}
                        control={control}
                        label="Dropoff Time (Optional)"
                      />
                    </div>
                  </div>
                );
              })}
              
              <div className="row">
                <div className="col-12">
                  <button 
                    type="button" 
                    className="btn btn-primary mb-3"
                    onClick={addLeg}
                  >
                    Add Another Leg
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* Special Instructions */}
          <div className="row">
            <div className="col-12 mb-1">
              <h4 className="section-heading">Special Instructions</h4>
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-12">
              <div className="special-instructions-container">
                {/* Mobility Type */}
                <div className="mobility-section px-3 py-2">
                  {[
                    { value: 'Ambulatory', label: 'Ambulatory' },
                    { value: 'Wheelchair', label: 'Wheelchair' }
                  ].map((option, index) => (
                    <label key={index} className="radio-option me-4">
                      <input
                        type="radio"
                        {...register('mobility_type')}
                        value={option.value}
                        className="me-2"
                        onChange={(e) => {
                          setValue('mobility_type', e.target.value);
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                {/* Vehicle Type */}
                <div className="vehicle-section px-3 pt-2">
                  {[
                    { value: 'van', label: 'Van' },
                    { value: 'sedan', label: 'Sedan' }
                  ].map((option) => (
                    <div key={option.value} className="me-4 d-inline-block">
                      <label className="checkbox-label">
                        <Controller
                          name={option.value}
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          )}
                        />
                        <span className="ms-2">{option.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
                
                {/* Client Requirements */}
                <div className="requirements-section px-3 pt-3">
                  <div className="row g-2">
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
                      <div key={option.value} className="col-md-3 col-sm-6">
                        <label className="checkbox-label">
                          <Controller
                            name={option.value}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                              />
                            )}
                          />
                          <span className="ms-2">{option.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="row mt-3">
            <div className="col-12 d-flex justify-content-between">
              <button type="submit" className="save-user-btn" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : submitText}
              </button>
              
              {isEditMode && (
                <button 
                  type="button" 
                  className="btn btn-success" 
                  disabled={isSubmitting}
                  onClick={formMethods.handleSubmit(handleCreateNewTrip)}
                >
                  {isSubmitting ? "Submitting..." : "Create New Trip"}
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
const TripForm = ({
  initialData,
  onSubmit,
  onCreateNew,
  isSubmitting, 
  members = [],
  programs = [],
  memberLocations = [],
  isLoadingLocations = false,
  onMemberSelect = () => {},
  companies = []
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
    console.log('initialData', initialData);
    if (initialData) {
      // Set trip type directly - no conversion needed with updated API
      console.log('initialData.trip_type', initialData.trip_type);
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
        const formattedLegs = initialData.legs.map(leg => ({
          ...leg,
          // Convert time strings from HH:MM:SS to HH:MM
          scheduled_pickup: leg.scheduled_pickup ? leg.scheduled_pickup.slice(0, 5) : null,
          scheduled_dropoff: leg.scheduled_dropoff ? leg.scheduled_dropoff.slice(0, 5) : null
        }));
        
        // For round trips, extract return pickup time
        if (initialData.trip_type === 'round_trip' && formattedLegs.length > 1) {
          const returnLeg = formattedLegs.find(leg => leg.sequence === 2);
          if (returnLeg?.scheduled_pickup) {
            formMethods.setValue('return_pickup_time', returnLeg.scheduled_pickup);
          }
        }
        
        formMethods.setValue('legs', formattedLegs);
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
    <TripFormPresenter
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
    />
  );
};

export default TripForm; 