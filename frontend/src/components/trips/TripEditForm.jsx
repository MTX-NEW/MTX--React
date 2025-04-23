import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { format } from 'date-fns';
import FormComponent from '@/components/FormComponent';
import dayjs from 'dayjs';

const TripEditForm = ({ 
  initialData, 
  onSubmit, 
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
      // Set trip type based on initialData
      if (initialData.is_one_way === true) {
        setTripType('one_way');
        formMethods.setValue('trip_type', 'one_way');
      } else if (initialData.is_one_way === false) {
        setTripType('round_trip');
        formMethods.setValue('trip_type', 'round_trip');
      } else if (initialData.is_one_way === 'multiple') {
        setTripType('multiple');
        formMethods.setValue('trip_type', 'multiple');
      } else if (initialData.trip_type) {
        // If trip_type is directly provided in initialData
        setTripType(initialData.trip_type);
      }

      // Set leg count
      if (initialData.legs) {
        setLegCount(initialData.legs.length);
      }

      // Find selected member
      if (initialData.member_id) {
        const member = members.find(m => m.member_id === initialData.member_id);
        if (member) {
          setSelectedMember(member);
        }
      }
    }
  }, [initialData, members, formMethods]);

  // Watch for changes in member_id to update selected member
  useEffect(() => {
    if (selectedMemberId) {
      const member = members.find(m => m.member_id == selectedMemberId);
      setSelectedMember(member);
      
      // Notify parent component to fetch locations for this member
      onMemberSelect(selectedMemberId);
      
      // If member has a program, find the company for that program
      if (member?.program_id && programs.length > 0) {
        const memberProgram = programs.find(p => p.program_id === member.program_id);
        if (memberProgram && memberProgram.company_id) {
          formMethods.setValue('company_id', memberProgram.company_id);
        }
        
        // Set program ID if member has one
        if (member.program_id) {
          formMethods.setValue('program_id', member.program_id);
        }
      }
    } else {
      setSelectedMember(null);
    }
  }, [selectedMemberId, members, programs]);

  // NOTE: We remove the useEffect that automatically sets pickup and dropoff locations
  // This is the key difference from TripForm - we don't auto-reset locations when editing

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
      } else if (newTripType === 'multiple') {
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
      } else if (newTripType === 'multiple' && currentLegs.length < 2) {
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
  const memberOptions = useMemo(() => members.map(member => ({
    value: member.member_id,
    label: `${member.first_name} ${member.last_name}`
  })), [members]);
  
  const programOptions = useMemo(() => programs?.map(program => ({
    value: program.program_id,
    label: program.program_name
  })) || [], [programs]);
  
  const companyOptions = useMemo(() => companies?.map(company => ({
    value: company.company_id,
    label: company.company_name
  })) || [], [companies]);

  // Now use the optimized useMemo with fewer dependencies
  const tripFields = useMemo(() => {
    const currentScheduleType = formMethods.watch('schedule_type');
    const currentTripType = formMethods.watch('trip_type');
    
    const fields = [
      {
        name: 'member_id',
        label: 'Member',
        type: 'autocomplete',
        options: memberOptions,
        placeholder: 'Select Member',
        required: true,
        col: 12
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
          { value: 'multiple', label: 'Multiple Legs' }
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
        options: memberLocations.map(loc => ({
          value: loc.location_id,
          label: `${loc.street_address}, ${loc.city || ''}, ${loc.state || ''} ${loc.zip || ''}`
        }), [memberLocations]),
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
        options: memberLocations.map(loc => ({
          value: loc.location_id,
          label: `${loc.street_address}, ${loc.city || ''}, ${loc.state || ''} ${loc.zip || ''}`
        }), [memberLocations]),
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
    if (currentTripType === 'multiple' && legCount > 1) {
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
            options: memberLocations.map(loc => ({
              value: loc.location_id,
              label: `${loc.street_address}, ${loc.city}, ${loc.state} ${loc.zip}${loc.phone ? ` • Ph: ${loc.phone}` : ''}`
            }), [memberLocations]),
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
            options: memberLocations.map(loc => ({
              value: loc.location_id,
              label: `${loc.street_address}, ${loc.city}, ${loc.state} ${loc.zip}${loc.phone ? ` • Ph: ${loc.phone}` : ''}`
            }), [memberLocations]),
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
    formMethods, 
    memberOptions, 
    programOptions, 
    companyOptions, 
    memberLocations,
    legCount,
    tripType, 
    addLeg, 
    removeLeg,
    formMethods.watch('schedule_type'),
    formMethods.watch('trip_type'),
    isLoadingLocations
  ]);

  // Handle form submission
  const handleSubmitForm = (data) => {
    // Process the form data
    const processedData = { ...data };
    
    // Map trip_type to is_one_way for backend compatibility
    if (data.trip_type === 'one_way') {
      processedData.is_one_way = true;
    } else if (data.trip_type === 'round_trip') {
      processedData.is_one_way = false;
    } else if (data.trip_type === 'multiple') {
      processedData.is_one_way = 'multiple';
    }
    
    // If we're editing a leg only, just return the relevant leg data
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

    // For trip editing, continue with normal processing
    
    // Process legs
    if (processedData.legs) {
      processedData.legs = processedData.legs.map(leg => ({
        ...leg,
        scheduled_pickup: leg.scheduled_pickup ? formatTimeForDB(leg.scheduled_pickup) : null,
        scheduled_dropoff: leg.scheduled_dropoff ? formatTimeForDB(leg.scheduled_dropoff) : null
      }));
    }
    
    // Process return pickup time if this is a round trip
    if (tripType === 'round_trip' && processedData.return_pickup_time) {
      // Get the first leg information
      const firstLeg = processedData.legs[0];
      
      // Only create a return leg if we have valid pickup and dropoff locations
      if (firstLeg && firstLeg.pickup_location && firstLeg.dropoff_location) {
        // Create a second leg for the return trip
        const returnLeg = {
          sequence: 2,
          status: 'Scheduled',
          pickup_location: firstLeg.dropoff_location, // Swap pickup and dropoff
          dropoff_location: firstLeg.pickup_location,
          scheduled_pickup: formatTimeForDB(processedData.return_pickup_time),
          scheduled_dropoff: null,
          leg_distance: firstLeg.leg_distance,
          is_return: true
        };
        
        // Verify that we have valid location IDs before adding the leg
        if (returnLeg.pickup_location && returnLeg.dropoff_location) {
          processedData.legs.push(returnLeg);
        } else {
          console.error('Cannot create return leg: Invalid location data', {
            pickup: returnLeg.pickup_location,
            dropoff: returnLeg.dropoff_location
          });
        }
      } else {
        console.error('Cannot create return leg: Missing leg data or locations', {
          firstLeg
        });
      }
    }
    
    // Process special instructions
    if (processedData.client_requirements) {
      const requirementMap = {};
      processedData.client_requirements.forEach(req => {
        requirementMap[req.value] = true;
      });
      
      processedData.special_instructions = {
        ...processedData.special_instructions,
        ...requirementMap
      };
      
      delete processedData.client_requirements;
    }
    
    // Process vehicle type
    if (processedData.vehicle_type) {
      const vehicleMap = {};
      processedData.vehicle_type.forEach(type => {
        vehicleMap[type.value] = true;
      });
      
      processedData.special_instructions = {
        ...processedData.special_instructions,
        ...vehicleMap
      };
      
      delete processedData.vehicle_type;
    }
    
    // Pass the data to the parent component
    onSubmit(processedData);
  };
  
  // Define helper function for time formatting
  const formatTimeForDB = (timeString) => {
    if (!timeString) return null;
    return timeString.includes(':') ? timeString : `${timeString}:00`;
  };

  // Leg-specific form (when editing just a leg)
  if (editingLegOnly) {
    // Create a fields array for the leg edit form
    const legFields = [
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
        options: memberLocations.map(loc => ({
          value: loc.location_id,
          label: `${loc.street_address}, ${loc.city}, ${loc.state} ${loc.zip}${loc.phone ? ` • Ph: ${loc.phone}` : ''}`
        })),
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
        options: memberLocations.map(loc => ({
          value: loc.location_id,
          label: `${loc.street_address}, ${loc.city}, ${loc.state} ${loc.zip}${loc.phone ? ` • Ph: ${loc.phone}` : ''}`
        })),
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

    return (
      <FormProvider {...formMethods}>
        <div className="p-3">
          <h5 className="mb-3">Leg Details</h5>
          <FormComponent
            fields={legFields}
            onSubmit={handleSubmitForm}
            submitText="Save Changes"
            isSubmitting={isSubmitting}
          />
        </div>
      </FormProvider>
    );
  }

  // Full trip form (original form)
  return (
    <FormProvider {...formMethods}>
      <FormComponent
        fields={tripFields}
        onSubmit={handleSubmitForm}
        submitText="Update Trip"
        isSubmitting={isSubmitting}
      />
    </FormProvider>
  );
};

export default TripEditForm; 