import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { format } from 'date-fns';
import FormComponent from '@/components/FormComponent';
import dayjs from 'dayjs';
import MemberAutocomplete from '@/components/common/MemberAutocomplete';

// Presenter component - responsible for UI rendering
const TripEditFormPresenter = ({
  formMethods,
  tripFields,
  legFields,
  handleSubmitForm,
  handleCreateNewTrip,
  isSubmitting,
  editingLegOnly,
  submitText,
  showCreateNewButton
}) => {
  return (
    <FormProvider {...formMethods}>
      {editingLegOnly ? (
        <div className="p-3">
          <h5 className="mb-3">Leg Details</h5>
          <FormComponent
            fields={legFields}
            onSubmit={handleSubmitForm}
            submitText={submitText || "Save Changes"}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <>
          <FormComponent
            fields={tripFields}
            onSubmit={handleSubmitForm}
            submitText={submitText || "Update Trip"}
            isSubmitting={isSubmitting}
            additionalButtons={
              showCreateNewButton ? [
                {
                  text: "Create New Trip",
                  className: "btn btn-success",
                  onClick: formMethods.handleSubmit(handleCreateNewTrip),
                  disabled: isSubmitting
                }
              ] : []
            }
          />
        </>
      )}
    </FormProvider>
  );
};

// Container component - responsible for logic and state
const TripEditForm = ({ 
  initialData, 
  onSubmit,
  onCreateNew,
  isSubmitting, 
  members = [],
  programs = [],
  companies = [],
  memberLocations = [],
  isLoadingLocations = false,
  onMemberSelect = () => {},
  editingLegOnly = false
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
      special_instructions: {
        mobility_type: 'Ambulatory'
      },
      client_requirements: [
        { value: 'call_first' },
        { value: 'knock' }
      ],
      vehicle_type: [
        { value: 'van' },
        { value: 'sedan' }
      ]
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
      
      // Set up special instructions format for form
      if (initialData.specialInstructions) {
        setupSpecialInstructions(initialData.specialInstructions);
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
  
 
  // Setup special instructions for the form
  const setupSpecialInstructions = (specialInstructions) => {
    // Set mobility type
    formMethods.setValue('special_instructions.mobility_type', 
      specialInstructions.mobility_type || 'Ambulatory');
    
    // Convert special instructions booleans to client requirements array
    const clientRequirements = [];
    const vehicleTypes = [];
    
    // Check each boolean field and add to client requirements if true
    if (specialInstructions.rides_alone) clientRequirements.push({ value: 'rides_alone' });
    if (specialInstructions.spanish_speaking) clientRequirements.push({ value: 'spanish_speaking' });
    if (specialInstructions.males_only) clientRequirements.push({ value: 'males_only' });
    if (specialInstructions.females_only) clientRequirements.push({ value: 'females_only' });
    if (specialInstructions.special_assist) clientRequirements.push({ value: 'special_assist' });
    if (specialInstructions.pickup_time_exact) clientRequirements.push({ value: 'pickup_time_exact' });
    if (specialInstructions.stay_with_client) clientRequirements.push({ value: 'stay_with_client' });
    if (specialInstructions.car_seat) clientRequirements.push({ value: 'car_seat' });
    if (specialInstructions.extra_person) clientRequirements.push({ value: 'extra_person' });
    if (specialInstructions.call_first) clientRequirements.push({ value: 'call_first' });
    if (specialInstructions.knock) clientRequirements.push({ value: 'knock' });
    
    // Check vehicle type fields
    if (specialInstructions.van) vehicleTypes.push({ value: 'van' });
    if (specialInstructions.sedan) vehicleTypes.push({ value: 'sedan' });
    
    formMethods.setValue('client_requirements', clientRequirements);
    formMethods.setValue('vehicle_type', vehicleTypes);
  };

  // Handle member selection
  const handleMemberSelect = useCallback((memberId, memberData) => {
    // Only update state if the member actually changed
    if (memberId !== selectedMember?.member_id) {
      setSelectedMember(memberData);
      onMemberSelect(memberId);
      
      // If member has a program, set it directly
      if (memberData?.program_id) {
        formMethods.setValue('program_id', memberData.program_id);
        
        // If the member or program has company_id, use it
        if (memberData.company_id) {
          formMethods.setValue('company_id', memberData.company_id);
        } 
        else if (programs.length > 0) {
          const program = programs.find(p => p.program_id === memberData.program_id);
          if (program?.company_id) {
            formMethods.setValue('company_id', program.company_id);
          }
        }
      }
    }
  }, [selectedMember, onMemberSelect, programs, formMethods]);

  // Helper function to initialize trip legs - wrap in useCallback
  const initializeTripLegs = useCallback((count = 1) => {
    // Get existing legs
    const existingLegs = formMethods.getValues('legs') || [];
    
    // Create fresh leg objects for each position, preserving existing data where possible
    const newLegs = Array.from({ length: count }, (_, index) => {
      if (index < existingLegs.length) {
        // Keep existing leg data
        return {
          ...existingLegs[index],
          sequence: index + 1,
          is_return: index > 0
        };
      } else {
        // Create new leg if needed
        return {
          sequence: index + 1,
          status: 'Scheduled',
          pickup_location: '',
          dropoff_location: '',
          scheduled_pickup: null,
          scheduled_dropoff: null,
          leg_distance: null,
          is_return: index > 0
        };
      }
    });
    
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

  // Handle trip type changes
  useEffect(() => {
    const newTripType = watchTripType; // This will be 'one_way', 'round_trip', or 'multiple'
    setTripType(newTripType);
    
    // Only initialize legs if they don't exist yet (preserves existing data)
    const currentLegs = formMethods.getValues('legs') || [];
    if (currentLegs.length === 0) {
      // Initialize legs based on trip type
      if (newTripType === 'one_way') {
        setLegCount(1);
        initializeTripLegs(1);
      } else if (newTripType === 'round_trip') {
        setLegCount(1);
        initializeTripLegs(1);
        formMethods.setValue('return_pickup_time', null);
      } else if (newTripType === 'multi_stop') {
        const newCount = Math.max(2, currentLegs.length);
        setLegCount(newCount);
        initializeTripLegs(newCount);
      }
    } else {
      // Adapt existing legs to the new trip type
      if (newTripType === 'one_way' && currentLegs.length > 1) {
        // For switching to one-way, keep only the first leg
        formMethods.setValue('legs', [currentLegs[0]]);
        setLegCount(1);
      } else if (newTripType === 'round_trip') {
        // For round trip, if we have a return leg, extract its time
        if (currentLegs.length > 1) {
          const returnLeg = currentLegs[1];
          if (returnLeg && returnLeg.scheduled_pickup) {
            formMethods.setValue('return_pickup_time', returnLeg.scheduled_pickup);
          }
          // Keep only the first leg visible
          formMethods.setValue('legs', [currentLegs[0]]);
          setLegCount(1);
        }
      } else if (newTripType === 'multi_stop' && currentLegs.length < 2) {
        // For multiple, ensure we have at least 2 legs
        initializeTripLegs(2);
        setLegCount(2);
      }
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

  // Memoize options arrays separately to reduce computation in the main useMemo
  const programOptions = useMemo(() => programs?.map(program => ({
    value: program.program_id,
    label: program.program_name
  })) || [], [programs]);
  
  const companyOptions = useMemo(() => companies?.map(company => ({
    value: company.company_id,
    label: company.company_name
  })) || [], [companies]);

  // Prepare location options only once
  const locationOptions = useMemo(() => {
    if (!memberLocations || memberLocations.length === 0) return [];
    
    return memberLocations.map(loc => ({
      value: loc.location_id,
      label: `${loc.street_address}, ${loc.city || ''}, ${loc.state || ''} ${loc.zip || ''}${loc.phone ? ` • Ph: ${loc.phone}` : ''}`
    }));
  }, [memberLocations]);

  // Make the custom renderMemberField function not depend on state that changes frequently
  const renderMemberField = useCallback(() => {
    const defaultMemberValue = selectedMember || 
      (initialData?.TripMember || null) ||
      (initialData?.member_id ? { member_id: initialData.member_id } : null);
      
    return (
      <div className="mb-2">
        <MemberAutocomplete
          name="member_id"
          label="Member"
          placeholder="Search member by name (min 2 letters)"
          required={true}
          onSelect={handleMemberSelect}
          defaultValue={defaultMemberValue}
        />
      </div>
    );
  }, [handleMemberSelect, selectedMember, initialData?.TripMember, initialData?.member_id]);

  // Simplify dependencies further
  const tripFields = useMemo(() => {
    const currentScheduleType = formMethods.watch('schedule_type');
    const currentTripType = formMethods.watch('trip_type');
    
    const fields = [
      {
        type: 'custom',
        name: 'member_field',
        col: 12,
        render: renderMemberField
      },
      {
        name: 'program_id',
        label: 'Program',
        type: 'autocomplete',
        options: programOptions,
        placeholder: 'Select Program',
        required: false,
        col: 6
      },
      {
        name: 'company_id',
        label: 'Company',
        type: 'autocomplete',
        options: companyOptions,
        placeholder: 'Select Company',
        required: false,
        col: 6
      },
      {
        name: 'schedule_type',
        label: 'Schedule Type',
        type: 'radio',
        options: [
          { value: 'Immediate', label: 'Immediate' },
          { value: 'Once', label: 'Once' },
          { value: 'Blanket', label: 'Blanket' }
        ],
        required: true,
        col: 12
      },
      {
        name: 'trip_type',
        label: 'Trip Type',
        type: 'radio',
        options: [
          { value: 'one_way', label: 'One Way' },
          { value: 'round_trip', label: 'Round Trip' },
          { value: 'multi_stop', label: 'Multiple Legs' }
        ],
        required: true,
        col: 12,
        defaultValue: 'one_way'
      },
      {
        name: 'start_date',
        label: currentScheduleType === 'Blanket' ? 'Start Date' : 'Date',
        type: 'date',
        required: true,
        col: currentScheduleType === 'Blanket' ? 6 : 12
      }
    ];
    
    // If schedule type is 'Blanket', add end date and days of week
    if (currentScheduleType === 'Blanket') {
      fields.push(
        {
          name: 'end_date',
          label: 'End Date',
          type: 'date',
          required: true,
          col: 6
        },
        {
          name: 'schedule_days',
          label: 'Days of Week',
          type: 'multiselect',
          options: [
            { value: 'Monday', label: 'Monday' },
            { value: 'Tuesday', label: 'Tuesday' },
            { value: 'Wednesday', label: 'Wednesday' },
            { value: 'Thursday', label: 'Thursday' },
            { value: 'Friday', label: 'Friday' },
            { value: 'Saturday', label: 'Saturday' },
            { value: 'Sunday', label: 'Sunday' }
          ],
          required: true,
          col: 12
        }
      );
    }
    
    // Add trip details
    fields.push({
      heading: 'Trip Details',
      type: 'heading',
      col: 12
    });
    
    // For all trip types, we show the first leg's pickup and dropoff
    fields.push(
      {
        name: 'legs[0].pickup_location',
        label: 'Pickup Location',
        type: 'autocomplete',
        options: locationOptions,
        required: true,
        col: 12,
        isLoading: isLoadingLocations
      },
      {
        name: 'legs[0].scheduled_pickup',
        label: 'Pickup Time',
        type: 'time',
        required: true,
        col: 6
      },
      {
        name: 'legs[0].dropoff_location',
        label: 'Dropoff Location',
        type: 'autocomplete',
        options: locationOptions,
        required: true,
        col: 12,
        isLoading: isLoadingLocations
      },
      {
        name: 'legs[0].scheduled_dropoff',
        label: 'Dropoff Time (Optional)',
        type: 'time',
        required: false,
        col: 6
      }
    );
    
    // For round trip, add return pickup time
    if (currentTripType === 'round_trip') {
      fields.push(
        {
          heading: 'Return Trip',
          type: 'subheading',
          col: 12
        },
        {
          name: 'return_pickup_time',
          label: 'Return Pickup Time (Optional)',
          type: 'time',
          required: false,
          helperText: 'Time when return trip starts (from dropoff back to pickup location)',
          col: 6
        }
      );
    }
    
    // Only show additional legs for multiple trip type
    if (currentTripType === 'multi_stop' && legCount > 1) {
      // Add fields for additional legs (leg 2 and beyond)
      for (let i = 1; i < legCount; i++) {
        fields.push(
          {
            heading: `Leg ${i + 1}`,
            type: 'subheading',
            col: 10
          },
          {
            type: 'custom',
            col: 2,
            render: () => (
              <button 
                type="button" 
                className="btn btn-sm btn-danger mt-2"
                onClick={() => removeLeg(i)}
              >
                Remove
              </button>
            )
          },
          {
            name: `legs[${i}].pickup_location`,
            label: 'Pickup Location',
            type: 'autocomplete',
            options: locationOptions,
            required: true,
            col: 12,
            isLoading: isLoadingLocations
          },
          {
            name: `legs[${i}].scheduled_pickup`,
            label: 'Pickup Time',
            type: 'time',
            required: true,
            col: 6
          },
          {
            name: `legs[${i}].dropoff_location`,
            label: 'Dropoff Location',
            type: 'autocomplete',
            options: locationOptions,
            required: true,
            col: 12,
            isLoading: isLoadingLocations
          },
          {
            name: `legs[${i}].scheduled_dropoff`,
            label: 'Dropoff Time (Optional)',
            type: 'time',
            required: false,
            col: 6
          }
        );
      }
      
      // Add button to add more legs
      fields.push({
        type: 'custom',
        col: 12,
        render: () => (
          <button 
            type="button" 
            className="btn btn-primary mb-3"
            onClick={addLeg}
          >
            Add Another Leg
          </button>
        )
      });
    }
    
    // Add special instructions section
    fields.push(
      {
        heading: 'Special Instructions',
        type: 'heading',
        col: 12
      },
      {
        name: 'special_instructions.mobility_type',
        label: 'Mobility Type',
        type: 'radio',
        options: [
          { value: 'Ambulatory', label: 'Ambulatory' },
          { value: 'Wheelchair', label: 'Wheelchair' }
        ],
        defaultValue: 'Ambulatory',
        col: 12
      },
      // Client requirements - using array-checkboxes
      {
        name: 'client_requirements',
        label: 'Client Requirements',
        type: 'array-checkboxes',
        options: [
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
        ],
        valueField: 'value',
        defaultItemValues: {},
        col: 12
      },
      // Vehicle type - using array-checkboxes
      {
        name: 'vehicle_type',
        label: 'Vehicle Type',
        type: 'array-checkboxes',
        options: [
          { value: 'van', label: 'Van' },
          { value: 'sedan', label: 'Sedan' }
        ],
        valueField: 'value',
        defaultItemValues: {},
        col: 12
      }
    );
    
    return fields;
  }, [
    formMethods.watch('schedule_type'),
    formMethods.watch('trip_type'),
    programOptions, 
    companyOptions, 
    locationOptions,
    legCount,
    tripType, 
    addLeg, 
    removeLeg,
    isLoadingLocations,
    renderMemberField
  ]);

  // Leg-specific form fields for when editing just a leg
  const legFields = useMemo(() => {
    return [
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'Scheduled', label: 'Scheduled' },
          { value: 'Confirmed', label: 'Confirmed' },
          { value: 'Transport Enroute', label: 'Transport Enroute' },
          { value: 'Picked Up', label: 'Picked Up' },
          { value: 'Dropped Off', label: 'Dropped Off' },
          { value: 'Cancelled', label: 'Cancelled' },
          { value: 'No Show', label: 'No Show' },
          { value: 'Not Going', label: 'Not Going' },
          { value: 'Attention', label: 'Attention' },
          { value: 'Waiting', label: 'Waiting' },
          { value: 'Incomplete', label: 'Incomplete' }
        ],
        required: true
      },
      {
        name: 'pickup_location',
        label: 'Pickup Location',
        type: 'select',
        options: locationOptions,
        isLoading: isLoadingLocations,
        required: true
      },
      {
        name: 'scheduled_pickup',
        label: 'Scheduled Pickup Time',
        type: 'time',
        required: true
      },
      {
        name: 'actual_pickup',
        label: 'Actual Pickup Time',
        type: 'time'
      },
      {
        name: 'dropoff_location',
        label: 'Dropoff Location',
        type: 'select',
        options: locationOptions,
        isLoading: isLoadingLocations,
        required: true
      },
      {
        name: 'scheduled_dropoff',
        label: 'Scheduled Dropoff Time',
        type: 'time',
        required: true
      },
      {
        name: 'actual_dropoff',
        label: 'Actual Dropoff Time',
        type: 'time'
      },
      {
        name: 'leg_distance',
        label: 'Distance (miles)',
        type: 'number',
        step: '0.1'
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'textarea',
        rows: 3
      }
    ];
  }, [locationOptions, isLoadingLocations]);

  // Handle form submission
  const handleSubmitForm = (data) => {
    // If editing just a leg, only include leg fields
    if (editingLegOnly) {
      // Extract just the fields relevant to a leg
      const legData = {
        driver_id: data.driver_id,
        status: data.status,
        pickup_location: data.pickup_location,
        dropoff_location: data.dropoff_location,
        scheduled_pickup: data.scheduled_pickup,
        scheduled_dropoff: data.scheduled_dropoff,
        actual_pickup: data.actual_pickup,
        actual_dropoff: data.actual_dropoff,
        leg_distance: data.leg_distance,
        notes: data.notes
      };
      
      // Pass only the leg data to the parent component
      onSubmit(legData);
      return;
    }
    
    // For full trip editing, pass the data directly to the parent component
    onSubmit(data);
  };

  // Handle creating a new trip from current data
  const handleCreateNewTrip = (data) => {
    if (onCreateNew) {
      onCreateNew(data);
    } else {
      // If no specific handler is provided, use a default approach
      const newTripData = { ...data };
      
      // Remove any trip_id to ensure it creates a new trip
      if (newTripData.trip_id) delete newTripData.trip_id;
      
      // Remove other fields that should be new
      if (newTripData.legs) {
        newTripData.legs = newTripData.legs.map(leg => ({
          ...leg,
          leg_id: undefined,
          status: 'Scheduled',
          actual_pickup: null,
          actual_dropoff: null
        }));
      }
      
      onSubmit(newTripData);
    }
  };

  // Show create new button only when editing a full trip (not just a leg)
  // and when there's initial data with a trip_id
  const showCreateNewButton = !editingLegOnly && initialData?.trip_id;

  return (
    <TripEditFormPresenter
      formMethods={formMethods}
      tripFields={tripFields}
      legFields={legFields}
      handleSubmitForm={handleSubmitForm}
      handleCreateNewTrip={handleCreateNewTrip}
      isSubmitting={isSubmitting}
      editingLegOnly={editingLegOnly}
      submitText={editingLegOnly ? "Save Changes" : "Update Trip"}
      showCreateNewButton={showCreateNewButton}
    />
  );
};

export default TripEditForm; 