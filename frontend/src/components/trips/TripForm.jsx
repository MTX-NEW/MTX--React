import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { format } from 'date-fns';
import FormComponent from '@/components/FormComponent';
import dayjs from 'dayjs';


const TripForm = ({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  members = [],
  programs = [],
  memberLocations = [],
  isLoadingLocations = false,
  onMemberSelect = () => {}
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
      is_one_way: true,
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
  const watchTripType = formMethods.watch('is_one_way');

  // Initialize from initial data if provided
  useEffect(() => {
    if (initialData) {
      // Set trip type based on initialData
      if (initialData.is_one_way === true) {
        setTripType('one_way');
      } else if (initialData.is_one_way === false) {
        setTripType('round_trip');
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
  }, [initialData, members]);


  

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

  // Update form with member locations when they change
  useEffect(() => {
    // Only update locations if we have valid memberLocations data
    if (memberLocations.length > 0 && selectedMemberId) {
      // Find the default pickup and dropoff locations
      const pickupLocation = memberLocations.find(loc => loc.location_type === 'pickup');
      const dropoffLocation = memberLocations.find(loc => loc.location_type === 'dropoff');
      
      if (pickupLocation || dropoffLocation) {
        // Get current legs
        const legs = formMethods.getValues('legs') || [];
        
        if (legs.length > 0) {
          // Create a copy to modify
          const updatedLegs = [...legs];
          
          if (pickupLocation) {
            updatedLegs[0] = {
              ...updatedLegs[0],
              pickup_location: pickupLocation.location_id
            };
            
            // Set pickup_location individually
            formMethods.setValue('legs[0].pickup_location', pickupLocation.location_id);
          }
          
          if (dropoffLocation) {
            updatedLegs[0] = {
              ...updatedLegs[0],
              dropoff_location: dropoffLocation.location_id
            };
            
            // Set dropoff_location individually
            formMethods.setValue('legs[0].dropoff_location', dropoffLocation.location_id);
          }
          
          // Update the form with modified legs
          formMethods.setValue('legs', updatedLegs);
        }
      }
    }
  }, [
  memberLocations, selectedMemberId]);

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

  // Handle trip type changes
  useEffect(() => {
    const newTripType = watchTripType === true ? 'one_way' : 
                        watchTripType === false ? 'round_trip' : 
                        'multiple';
    
    setTripType(newTripType);
    
    
    // Initialize legs based on trip type
    if (newTripType === 'one_way') {
      // Always set to 1 leg for one way
      setLegCount(1);
      initializeTripLegs(1);
    } else if (newTripType === 'round_trip') {
      // Round trip has 1 visible leg but creates 2 at submission
      setLegCount(1);
      initializeTripLegs(1);
      
      // Set return_pickup_time field
      formMethods.setValue('return_pickup_time', null);
    } else if (newTripType === 'multiple') {
      // Multiple legs starts with at least 2 legs
      const currentLegs = formMethods.getValues('legs') || [];
      const newCount = Math.max(currentLegs.length, 2);
      setLegCount(newCount);
      initializeTripLegs(newCount);
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
  
  const locationOptions = useMemo(() => memberLocations.map(loc => ({
    value: loc.location_id,
    label: loc.street_address 
      ? `${loc.street_address}, ${loc.city || ''}, ${loc.state || ''} ${loc.zip || ''}`
      : `Location #${loc.location_id}`
  })), [memberLocations]);
  
  const programOptions = useMemo(() => programs?.map(program => ({
    value: program.program_id,
    label: program.program_name
  })) || [], [programs]);
  


  // Now use the optimized useMemo with fewer dependencies
  const tripFields = useMemo(() => {
    const currentScheduleType = formMethods.watch('schedule_type');
    const currentTripType = formMethods.watch('is_one_way');
    
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
        options: programOptions,
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
        name: 'is_one_way',
        label: 'Trip Type',
        type: 'radio',
        options: [
          { value: true, label: 'One Way' },
          { value: false, label: 'Round Trip' },
          { value: 'multiple', label: 'Multiple Legs' }
        ],
        required: true,
        col: 12,
        defaultValue: true
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
    
    // Add trip details section
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
    if (currentTripType === false) { // Round Trip
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
    formMethods, 
    memberOptions, 
    programOptions, 
    legCount,
    tripType, 
    addLeg, 
    removeLeg,
    formMethods.watch('schedule_type'),
    formMethods.watch('is_one_way'),
    locationOptions,
    memberLocations,
    isLoadingLocations
  ]);

  const handleSubmitForm = (data) => {
    onSubmit(data);
  };

  return (
    <FormProvider {...formMethods}>
      <FormComponent
        fields={tripFields}
        onSubmit={handleSubmitForm}
        submitText="Create Trip"
        isSubmitting={isSubmitting}
      />
      
    </FormProvider>
  );
};

export default TripForm; 