import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import { tripApi, tripLegApi, tripMemberApi, programApi } from '@/api/baseApi';
import { tripValidationSchema } from '@/validations/inputValidation';
import { toast } from 'react-toastify';
import { useResource } from '@/hooks/useResource';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

const daysOfWeek = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' }
];

const useTripManagement = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberLocations, setMemberLocations] = useState([]);
  const [scheduleType, setScheduleType] = useState('Once');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [willCall, setWillCall] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [tripLegs, setTripLegs] = useState([]);
  
  // New filter states
  const [cityFilter, setCityFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ startDate: null, endDate: null });
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Form methods
  const addFormMethods = useForm({
    resolver: yupResolver(tripValidationSchema),
    mode: 'onChange'
  });

  const editFormMethods = useForm({
    resolver: yupResolver(tripValidationSchema),
    mode: 'onChange'
  });

  // Use the useResource hook for CRUD operations
  const { 
    data: trips = [], 
    loading: isLoading, 
    refresh: refetchTrips
  } = useResource(tripApi, { idField: 'trip_id' });

  // Get members for dropdown using react-query
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const response = await tripMemberApi.getAll();
      return response.data || [];
    }
  });

  // Get programs for dropdown using react-query
  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const response = await programApi.getAll();
      return response.data || [];
    }
  });

  // Watch for changes in form values from both form instances
  const selectedMemberId = showEditModal 
    ? editFormMethods.watch('member_id') 
    : addFormMethods.watch('member_id');

  const selectedScheduleType = showEditModal
    ? editFormMethods.watch('schedule_type')
    : addFormMethods.watch('schedule_type');

  const isOneWay = showEditModal
    ? editFormMethods.watch('is_one_way')
    : addFormMethods.watch('is_one_way');

  // Watch for trip_type changes
  const selectedTripType = showEditModal
    ? editFormMethods.watch('trip_type')
    : addFormMethods.watch('trip_type');

  const startDate = showEditModal
    ? editFormMethods.watch('start_date')
    : addFormMethods.watch('start_date');

  // Watch for appointment time changes
  const appointmentTime = showEditModal
    ? editFormMethods.watch('appt_time')
    : addFormMethods.watch('appt_time');

  // Handle member selection
  useEffect(() => {
    if (selectedMemberId) {
      const member = members.find(m => m.member_id == selectedMemberId);
      setSelectedMember(member);
      
      // Fetch member locations
      const fetchMemberLocations = async () => {
        // Set loading state to true
        setIsLoadingLocations(true);
        
        // Clear previous locations immediately
        setMemberLocations([]);
        
        try {
          const response = await tripMemberApi.getMemberLocations(selectedMemberId);
          const locations = response.data || [];
          
          // Set the locations first
          setMemberLocations(locations);
          
          // THEN set form values AFTER locations are available
          setTimeout(() => {
            if (member) {
              const formMethods = showEditModal ? editFormMethods : addFormMethods;
              
              // Initialize legs array if creating a new trip
              if (!showEditModal) {
                // Initialize with a single leg
                initializeTripLegs(formMethods);
              }
              
              // If member has a default pickup location, set for first leg
              if (member.pickup_location) {
                const legs = formMethods.getValues('legs') || [];
                if (legs.length > 0) {
                  const updatedLegs = [...legs];
                  updatedLegs[0] = {
                    ...updatedLegs[0],
                    pickup_location: member.pickup_location
                  };
                  formMethods.setValue('legs', updatedLegs);
                }
              }
              
              // If member has a default dropoff location, set for first leg
              if (member.dropoff_location) {
                const legs = formMethods.getValues('legs') || [];
                if (legs.length > 0) {
                  const updatedLegs = [...legs];
                  updatedLegs[0] = {
                    ...updatedLegs[0],
                    dropoff_location: member.dropoff_location
                  };
                  formMethods.setValue('legs', updatedLegs);
                }
              }
            }
            // Clear loading state
            setIsLoadingLocations(false);
          }, 50); // Small delay to ensure state updates have propagated
          
        } catch (error) {
          toast.error("Failed to load member locations");
          setIsLoadingLocations(false);
        }
      };
      
      fetchMemberLocations();
    } else {
      setSelectedMember(null);
      setMemberLocations([]);
      
      // Clear location selections if no member selected
      const formMethods = showEditModal ? editFormMethods : addFormMethods;
      initializeTripLegs(formMethods);
    }
  }, [selectedMemberId, members, showEditModal, addFormMethods, editFormMethods]);

  // Initialize trip legs
  const initializeTripLegs = (formMethods) => {
    formMethods.setValue('legs', [
      {
        sequence: 1,
        status: 'Scheduled',
        pickup_location: '',
        dropoff_location: '',
        pickup_time: null,
        dropoff_time: null,
        leg_distance: null,
        is_return: false
      }
    ]);
  };

  // Handle schedule type change
  useEffect(() => {
    if (selectedScheduleType) {
      setScheduleType(selectedScheduleType);
      
      const today = dayjs();
      const formMethods = showEditModal ? editFormMethods : addFormMethods;
      
      // Set dates based on schedule type
      if (selectedScheduleType === 'Immediate') {
        // Set both dates to today
        formMethods.setValue('start_date', today.format('YYYY-MM-DD'));
        formMethods.setValue('end_date', today.format('YYYY-MM-DD'));
      } else if (selectedScheduleType === 'Once') {
        // If start date is set, make end date match
        if (startDate) {
          formMethods.setValue('end_date', startDate);
        }
      } else if (selectedScheduleType === 'Blanket') {
        // For Blanket, ensure we have an end date and empty schedule_days array
        formMethods.setValue('end_date', today.add(30, 'days').format('YYYY-MM-DD'));
        
        // Initialize schedule_days as empty array if not already set
        const currentScheduleDays = formMethods.getValues('schedule_days');
        if (!currentScheduleDays || !Array.isArray(currentScheduleDays)) {
          formMethods.setValue('schedule_days', []);
        }
      }
    }
  }, [selectedScheduleType, addFormMethods, editFormMethods, startDate, showEditModal]);

  // Handle round trip selection
  useEffect(() => {
    setIsRoundTrip(!isOneWay);
    
    // Update legs when round trip status changes
    const formMethods = showEditModal ? editFormMethods : addFormMethods;
    const legs = formMethods.getValues('legs') || [];
    
    if (!isOneWay && legs.length === 1) {
      // Add a return leg with reversed locations
      const outboundLeg = legs[0];
      const returnLeg = {
        sequence: 2,
        status: 'Scheduled',
        pickup_location: outboundLeg.dropoff_location,
        dropoff_location: outboundLeg.pickup_location,
        pickup_time: null,
        dropoff_time: null,
        leg_distance: null,
        is_return: true
      };
      
      formMethods.setValue('legs', [...legs, returnLeg]);
    } else if (isOneWay && legs.length > 1) {
      // Remove return legs
      formMethods.setValue('legs', [legs[0]]);
    }
  }, [isOneWay, showEditModal, editFormMethods, addFormMethods]);

  // Handle start date change for Once schedule type
  useEffect(() => {
    if (scheduleType === 'Once' && startDate) {
      addFormMethods.setValue('end_date', startDate);
    }
  }, [startDate, scheduleType, addFormMethods]);

  // Handle trip type selection
  useEffect(() => {
    if (selectedTripType) {
      const isOneWay = selectedTripType === 'one_way';
      const formMethods = showEditModal ? editFormMethods : addFormMethods;
      
      // Update the hidden is_one_way field
      formMethods.setValue('is_one_way', isOneWay);
      
      // Update round trip state
      setIsRoundTrip(!isOneWay);
      
      // If switching to one-way, remove any return legs
      const legs = formMethods.getValues('legs') || [];
      
      if (isOneWay && legs.length > 1) {
        // Keep only the first leg
        formMethods.setValue('legs', [legs[0]]);
      } else if (!isOneWay && legs.length === 1) {
        // Add a return leg with reversed locations
        const outboundLeg = legs[0];
        const returnLeg = {
          sequence: 2,
          status: 'Scheduled',
          pickup_location: outboundLeg.dropoff_location || '',
          dropoff_location: outboundLeg.pickup_location || '',
          pickup_time: null,
          dropoff_time: null,
          leg_distance: null,
          is_return: true
        };
        
        formMethods.setValue('legs', [...legs, returnLeg]);
      }
    }
  }, [selectedTripType, showEditModal, editFormMethods, addFormMethods]);

  // Add this useEffect to handle appointment time changes
  useEffect(() => {
    if (appointmentTime) {
      const formMethods = showEditModal ? editFormMethods : addFormMethods;
      
      // Parse the time
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      
      // Calculate 1 hour AFTER
      let newHours = hours + 1;
      if (newHours >= 24) newHours = 0; // Handle wrapping around midnight
      
      // Format the new time
      const newTime = `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Get the legs array
      const legs = formMethods.getValues('legs') || [];
      
      if (legs.length > 0) {
        // Update first leg pickup time based on appointment time
        const updatedLegs = [...legs];
        updatedLegs[0] = {
          ...updatedLegs[0],
          pickup_time: newTime
        };
        
        formMethods.setValue('legs', updatedLegs);
      }
    }
  }, [appointmentTime, showEditModal, editFormMethods, addFormMethods]);

  // Handlers for trip legs
  const addTripLeg = () => {
    const formMethods = showEditModal ? editFormMethods : addFormMethods;
    const legs = formMethods.getValues('legs') || [];
    
    // Add a new leg with the next sequence number
    const newLeg = {
      sequence: legs.length + 1,
      status: 'Scheduled',
      pickup_location: '',
      dropoff_location: '',
      pickup_time: null,
      dropoff_time: null,
      leg_distance: null,
      is_return: false
    };
    
    formMethods.setValue('legs', [...legs, newLeg]);
  };
  
  const removeTripLeg = (index) => {
    const formMethods = showEditModal ? editFormMethods : addFormMethods;
    const legs = formMethods.getValues('legs') || [];
    
    if (legs.length > 1) {
      // Remove the leg at the specified index
      const updatedLegs = legs.filter((_, i) => i !== index);
      
      // Update sequence numbers
      updatedLegs.forEach((leg, i) => {
        leg.sequence = i + 1;
      });
      
      formMethods.setValue('legs', updatedLegs);
    } else {
      toast.error("Cannot remove the only leg. A trip must have at least one leg.");
    }
  };
  
  const updateTripLeg = (index, field, value) => {
    const formMethods = showEditModal ? editFormMethods : addFormMethods;
    const legs = formMethods.getValues('legs') || [];
    
    if (index >= 0 && index < legs.length) {
      const updatedLegs = [...legs];
      updatedLegs[index] = {
        ...updatedLegs[index],
        [field]: value
      };
      
      // If updating locations for first leg in a round trip, update the return leg automatically
      if (isRoundTrip && index === 0 && legs.length > 1 && (field === 'pickup_location' || field === 'dropoff_location')) {
        const returnIndex = legs.findIndex(leg => leg.is_return);
        
        if (returnIndex >= 0) {
          if (field === 'pickup_location') {
            updatedLegs[returnIndex].dropoff_location = value;
          } else if (field === 'dropoff_location') {
            updatedLegs[returnIndex].pickup_location = value;
          }
        }
      }
      
      formMethods.setValue('legs', updatedLegs);
    }
  };

  // Handle city filter change
  const handleCityFilterChange = (city) => {
    setCityFilter(city);
  };

  // Handle date filter change
  const handleDateFilterChange = (startDate, endDate = null) => {
    setDateFilter({ startDate, endDate });
  };

  // Handle schedule type filter change
  const handleScheduleTypeFilterChange = (type) => {
    setScheduleTypeFilter(type);
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  // Clear all filters
  const clearFilters = () => {
    setCityFilter('');
    setDateFilter({ startDate: null, endDate: null });
    setScheduleTypeFilter('');
  };

  // Handle search query change
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // Handle add trip action
  const handleAddTrip = () => {
    // Reset form
    addFormMethods.reset({
      member_id: '',
      trip_type: 'one_way',
      is_one_way: true,
      schedule_type: 'Once',
      start_date: dayjs().format('YYYY-MM-DD'),
      end_date: dayjs().format('YYYY-MM-DD'),
      appt_time: '',
      will_call: false,
      legs: [
        {
          sequence: 1,
          status: 'Scheduled',
          pickup_location: '',
          dropoff_location: '',
          pickup_time: null,
          dropoff_time: null,
          leg_distance: null,
          is_return: false
        }
      ],
      special_instructions: {
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
        call_first: false,
        knock: false,
        van: false,
        sedan: false
      }
    });
    
    // Reset state
    setSelectedMember(null);
    setMemberLocations([]);
    setScheduleType('Once');
    setIsRoundTrip(false);
    setWillCall(false);
    
    // Show modal
    setShowAddModal(true);
  };

  // Handle view trip action
  const handleViewTrip = (trip) => {
    setSelectedTrip(trip);
    setShowViewModal(true);
  };

  // Handle delete trip action
  const handleDeleteTrip = async (trip) => {
    try {
      await tripApi.delete(trip.trip_id);
      toast.success("Trip deleted successfully");
      refetchTrips();
    } catch (error) {
      toast.error("Failed to delete trip");
    }
  };

  // Handle copy trip action
  const handleCopyTrip = async (trip) => {
    // Create a modified copy for the new trip
    const { trip_id, created_at, updated_at, ...tripData } = trip;
    
    // Handle nested structures
    let tripCopy = {
      ...tripData,
      start_date: dayjs().format('YYYY-MM-DD'),
      end_date: dayjs().format('YYYY-MM-DD')
    };
    
    if (trip.legs) {
      // Copy legs but reset some fields
      tripCopy.legs = trip.legs.map(leg => {
        const { leg_id, created_at, updated_at, actual_pickup, actual_dropoff, ...legData } = leg;
        return {
          ...legData,
          status: 'Scheduled',
          pickup_time: null,
          dropoff_time: null
        };
      });
    }
    
    if (trip.specialInstructions) {
      const { instruction_id, trip_id, created_at, updated_at, ...instructionsData } = trip.specialInstructions;
      tripCopy.special_instructions = instructionsData;
    }
    
    try {
      await tripApi.createWithLegs(tripCopy);
      toast.success("Trip copied successfully");
      refetchTrips();
    } catch (error) {
      toast.error("Failed to copy trip");
    }
  };

  // Handle form submission
  const handleSubmit = async (data) => {
    // Process form data
    const processedData = {
      ...data,
      created_by: 1 // Replace with actual user ID in production
    };
    
    // Convert values
    if (processedData.schedule_days && Array.isArray(processedData.schedule_days)) {
      processedData.schedule_days = processedData.schedule_days.join(',');
    }
    
    // Convert trip_type from UI format to database format
    processedData.trip_type = processedData.is_one_way ? 'one_way' : 'round_trip';
    delete processedData.is_one_way; // Remove the UI-specific field
    
    // Format dates and times for legs
    if (processedData.legs) {
      processedData.legs = processedData.legs.map(leg => {
        // Format pickup time if present
        if (leg.pickup_time) {
          // If only time is provided, combine with start_date
          if (!leg.pickup_time.includes('T') && !leg.pickup_time.includes('-')) {
            const [hours, minutes] = leg.pickup_time.split(':');
            const date = new Date(processedData.start_date);
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
            leg.pickup_time = date.toISOString();
          }
        }
        
        // Format dropoff time if present
        if (leg.dropoff_time) {
          // If only time is provided, combine with start_date
          if (!leg.dropoff_time.includes('T') && !leg.dropoff_time.includes('-')) {
            const [hours, minutes] = leg.dropoff_time.split(':');
            const date = new Date(processedData.start_date);
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
            leg.dropoff_time = date.toISOString();
          }
        }
        
        return leg;
      });
    }
    
    try {
      if (showEditModal) {
        // Update existing trip
        await tripApi.updateWithLegs(selectedTrip.trip_id, processedData);
        toast.success("Trip updated successfully");
        setShowEditModal(false);
      } else {
        // Create new trip
        await tripApi.createWithLegs(processedData);
        toast.success("Trip created successfully");
        setShowAddModal(false);
      }
      
      // Refresh trips list
      refetchTrips();
    } catch (error) {
      toast.error(`Failed to ${showEditModal ? 'update' : 'create'} trip`);
    }
  };

  // Handle edit trip action
  const handleEditTrip = (trip) => {
    // Clone the trip to avoid modifying the original data
    const tripToEdit = { ...trip };
    
    // Set round trip state
    setIsRoundTrip(tripToEdit.trip_type === 'round_trip');
    
    // Convert database fields to form fields
    if (tripToEdit.specialInstructions) {
      // Rename the field to match form structure
      tripToEdit.special_instructions = { ...tripToEdit.specialInstructions };
      delete tripToEdit.specialInstructions;
    }
    
    // Set is_one_way based on trip_type
    tripToEdit.is_one_way = tripToEdit.trip_type === 'one_way';
    
    // Format dates
    if (tripToEdit.start_date) {
      tripToEdit.start_date = format(new Date(tripToEdit.start_date), 'yyyy-MM-dd');
    }
    
    if (tripToEdit.end_date) {
      tripToEdit.end_date = format(new Date(tripToEdit.end_date), 'yyyy-MM-dd');
    }
    
    // Format leg dates and times
    if (tripToEdit.legs && tripToEdit.legs.length > 0) {
      tripToEdit.legs = tripToEdit.legs.map(leg => {
        const formattedLeg = { ...leg };
        
        // Format pickup time if present
        if (formattedLeg.pickup_time) {
          const pickupDate = new Date(formattedLeg.pickup_time);
          formattedLeg.pickup_time = format(pickupDate, 'HH:mm');
        }
        
        // Format dropoff time if present
        if (formattedLeg.dropoff_time) {
          const dropoffDate = new Date(formattedLeg.dropoff_time);
          formattedLeg.dropoff_time = format(dropoffDate, 'HH:mm');
        }
        
        return formattedLeg;
      });
    } else {
      // Initialize with at least one leg
      tripToEdit.legs = [
        {
          sequence: 1,
          status: 'Scheduled',
          pickup_location: '',
          dropoff_location: '',
          pickup_time: null,
          dropoff_time: null,
          leg_distance: null,
          is_return: false
        }
      ];
    }
    
    // Convert schedule days from string to array
    if (tripToEdit.schedule_type === 'Blanket' && typeof tripToEdit.schedule_days === 'string') {
      tripToEdit.schedule_days = tripToEdit.schedule_days.split(',').filter(day => day.trim());
    }
    
    // Set the trip to edit
    setSelectedTrip(trip);
    
    // Reset form with trip data
    editFormMethods.reset(tripToEdit);
    
    // Fetch member locations if needed
    if (tripToEdit.member_id) {
      // Fetch member locations
      const fetchMemberLocations = async () => {
        try {
          const response = await tripMemberApi.getMemberLocations(tripToEdit.member_id);
          setMemberLocations(response.data || []);
        } catch (error) {
          toast.error("Failed to load member locations");
        }
      };
      
      fetchMemberLocations();
    }
    
    // Show modal
    setShowEditModal(true);
  };

  // Get form fields configuration
  const getTripFields = (formContext) => {
    // ... existing form fields configuration
    return []; // Placeholder - implement the actual field configuration as needed
  };

  // Get view fields configuration
  const getViewFields = () => {
    // ... existing view fields configuration
    return []; // Placeholder - implement the actual field configuration as needed
  };

  // Return the hook interface
  return {
    trips,
    isLoading,
    searchQuery,
    selectedTrip,
    showAddModal,
    showEditModal,
    showViewModal,
    selectedMember,
    memberLocations,
    scheduleType,
    isRoundTrip,
    willCall,
    isLoadingLocations,
    cityFilter,
    dateFilter,
    scheduleTypeFilter,
    showFilters,
    members,
    programs,
    daysOfWeek,
    addFormMethods,
    editFormMethods,
    handleSearchChange,
    handleAddTrip,
    handleViewTrip,
    handleDeleteTrip,
    handleCopyTrip,
    handleSubmit,
    handleEditTrip,
    setShowAddModal,
    setShowEditModal,
    setShowViewModal,
    handleCityFilterChange,
    handleDateFilterChange,
    handleScheduleTypeFilterChange,
    toggleFilters,
    clearFilters,
    setWillCall,
    getTripFields,
    getViewFields,
    // New methods for trip legs
    addTripLeg,
    removeTripLeg,
    updateTripLeg,
    // Other methods
    refetchTrips
  };
};

export default useTripManagement;