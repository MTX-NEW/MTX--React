import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTrip } from '@/hooks/useTrip';
import useTripFilters from '@/hooks/useTripFilters';
import { processTripFormData } from '@/utils/tripFormUtils';
import '@/components/trips/v2/TripSections.css';


// Card Components
import MemberCard from '@/components/trips/v2/MemberCard';
import PickupLocationCard from '@/components/trips/v2/PickupLocationCard';
import DropoffLocationCard from '@/components/trips/v2/DropoffLocationCard';
import SpecialInstructionsCard from '@/components/trips/v2/SpecialInstructionsCard';
import ProgramCard from '@/components/trips/v2/ProgramCard';
import ScheduleCard from '@/components/trips/v2/ScheduleCard';
import TripRequestFilters from '@/components/trips/TripRequestFilters';

const TripRequests = () => {
  // Use existing hooks
  const {
    trips, 
    loading: tripsLoading, 
    error: tripsError, 
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip 
  } = useTrip();

  // Use our filters hook
  const { 
    searchQuery,
    setSearchQuery,
    cityFilter,
    setCityFilter,
    dateFilter,
    setDateFilter,
    tripTypeFilter,
    setTripTypeFilter,
    clearFilters
  } = useTripFilters(trips);

  // State to manage form data
  const [tripData, setTripData] = useState({
    member: null,
    pickup_location: null,
    dropoff_location: null,
    special_instructions: '',
    program: null,
    legs: [],
    scheduled_date: null,
    trip_type: 'One-way'
  });

  // Fetch trips when filters change explicitly
  useEffect(() => {
    const filters = {};
    
    if (searchQuery) filters.search = searchQuery;
    if (cityFilter) filters.city = cityFilter;
    if (dateFilter.startDate) filters.startDate = dateFilter.startDate;
    if (dateFilter.endDate) filters.endDate = dateFilter.endDate;
    if (tripTypeFilter) filters.tripType = tripTypeFilter;
    
    // Send the query with whatever filters we have (or none)
    fetchTrips(filters);
  }, [searchQuery, cityFilter, dateFilter.startDate, dateFilter.endDate, tripTypeFilter, fetchTrips]);
  
  // Custom handler for clearing filters
  const handleClearFilters = () => {
    clearFilters();
    // Fetch all trips when filters are cleared
    fetchTrips({});
  };

  // Handler for form submission
  const handleSubmit = async () => {
    try {
      const processedData = processTripFormData(tripData);
      await createTrip(processedData);
      // Reset form after successful submission
      setTripData({
        member: null,
        pickup_location: null,
        dropoff_location: null,
        special_instructions: '',
        program: null,
        legs: [],
        scheduled_date: null,
        trip_type: 'One-way'
      });
    } catch (error) {
      console.error('Failed to create trip', error);
    }
  };

  // Update individual fields in the trip data
  const updateTripData = (field, value) => {
    setTripData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h2 className="mb-4">Create Trip Request</h2>

      <TripRequestFilters 
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        tripTypeFilter={tripTypeFilter}
        setTripTypeFilter={setTripTypeFilter}
        clearFilters={handleClearFilters}
      />

      <div className="trip-form-container">
        <MemberCard 
          className="trip-section section-member"
          selectedMember={tripData.member}
          onMemberSelect={(member) => updateTripData('member', member)}
        />
        
        <PickupLocationCard 
          className="trip-section section-pickup"
          selectedMember={tripData.member}
          selectedLocation={tripData.pickup_location}
          onLocationSelect={(location) => updateTripData('pickup_location', location)}
        />
        
        <DropoffLocationCard 
          className="trip-section section-dropoff"
          selectedMember={tripData.member}
          selectedLocation={tripData.dropoff_location}
          onLocationSelect={(location) => updateTripData('dropoff_location', location)}
        />
        
        <ProgramCard 
          className="trip-section section-program"
          selectedMember={tripData.member}
          selectedProgram={tripData.program}
          onProgramSelect={(program) => updateTripData('program', program)}
        />
        
        <ScheduleCard 
          className="trip-section section-schedule"
          selectedDate={tripData.scheduled_date}
          tripType={tripData.trip_type}
          onDateSelect={(date) => updateTripData('scheduled_date', date)}
          onTripTypeSelect={(type) => updateTripData('trip_type', type)}
        />
        
        <SpecialInstructionsCard 
          className="trip-section section-instructions"
          instructions={tripData.special_instructions}
          onInstructionsChange={(instructions) => 
            updateTripData('special_instructions', instructions)
          }
        />
      </div>
      
      <div className="trip-actions">
        <button 
          className="btn btn-secondary" 
          type="button"
        >
          Cancel
        </button>
        <button 
          className="btn btn-primary" 
          type="button" 
          onClick={handleSubmit}
          disabled={tripsLoading || !tripData.member || !tripData.pickup_location || !tripData.dropoff_location}
        >
          Create Trip Request
        </button>
      </div>
    </div>
  );
};

export default TripRequests; 