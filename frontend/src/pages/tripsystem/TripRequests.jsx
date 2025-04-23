import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserActions from '@/components/users/allusers/UserActions';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import { tripMemberApi, programApi } from '@/api/baseApi';
import { useTrip } from '@/hooks/useTrip';
import { useTripLeg } from '@/hooks/useTripLeg';
import useTripFilters from '@/hooks/useTripFilters';
import { processTripFormData, prepareTripForEdit } from '@/utils/tripFormUtils';

// Import our new components
import TripRequestFilters from '@/components/trips/TripRequestFilters';
import TripTable from '@/components/trips/TripTable';
import TripForm from '@/components/trips/TripForm';
import TripEditForm from '@/components/trips/TripEditForm';
import TripDetails from '@/components/trips/TripDetails';

const TripRequests = () => {
  // Use our trip hook
  const {
    trips, 
    loading: tripsLoading, 
    error: tripsError, 
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip 
  } = useTrip();

  const { fetchTripLegs } = useTripLeg();

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

  // UI State
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRecreateModal, setShowRecreateModal] = useState(false);
  
  // Form State
  const [memberLocations, setMemberLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Get members for dropdown
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const response = await tripMemberApi.getAll();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Get programs for dropdown
  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const response = await programApi.getAll();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Get companies for dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await programApi.getCompanies();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch trips when component mounts with default day filter (today)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
   // setDateFilter({ startDate: today, endDate: today });
   // fetchTrips({ startDate: today, endDate: today });
  }, []);

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
  }, [searchQuery, cityFilter, dateFilter.startDate, dateFilter.endDate, tripTypeFilter]);

  // Fetch member locations when member selected
  const fetchMemberLocations = async (memberId) => {
    if (!memberId) {
        setMemberLocations([]);
      return;
    }
    
    setIsLoadingLocations(true);
    
    try {
      const response = await tripMemberApi.getMemberLocations(memberId);
      setMemberLocations(response.data || []);
        } catch (error) {
          console.error('Error loading member locations:', error);
      setMemberLocations([]);
        } finally {
          setIsLoadingLocations(false);
        }
      };

  // Trip handlers
  const handleAddTrip = () => {
    setSelectedTrip(null);
    setMemberLocations([]);
    setShowAddModal(true);
  };

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip);
    setShowViewModal(true);
  };

  const handleEditTrip = (trip) => {
    // Prepare the trip data for editing using our utility function
    const preparedTrip = prepareTripForEdit(trip);
    setSelectedTrip(preparedTrip);
    
    // Load member locations for the trip's member
    if (trip.TripMember?.member_id) {
      fetchMemberLocations(trip.TripMember.member_id);
    }
    
    setShowEditModal(true);
  };

  const handleRecreateTrip = (trip) => {
    // Prepare the trip data for recreating
    const preparedTrip = prepareTripForEdit(trip);
    
    // Reset trip_id to ensure it creates a new trip instead of editing existing one
    preparedTrip.trip_id = null;
    
    // Reset dates and times for recreation
    preparedTrip.start_date = new Date().toISOString().slice(0, 10);
    
    if (preparedTrip.legs) {
      preparedTrip.legs.forEach(leg => {
        // Reset leg_id to create new legs
        leg.leg_id = null; 
        leg.scheduled_pickup = null;
        leg.scheduled_dropoff = null;
        leg.status = 'Scheduled';
      });
    }
    
    setSelectedTrip(preparedTrip);
    
    // Load member locations for the trip's member
    if (trip.TripMember?.member_id) {
      fetchMemberLocations(trip.TripMember.member_id);
    }
    
    setShowRecreateModal(true);
  };

  const handleSubmit = async (data) => {
    console.log("Form Submitted. Raw Data:", data);
    
    // Process form data for submission
    const processedData = processTripFormData(data);
    console.log("Processed Data before API call:", processedData);
    
    try {
      if (showEditModal) {
        console.log("Calling updateTrip with ID:", selectedTrip.trip_id);
        await updateTrip(selectedTrip.trip_id, processedData);
        console.log("updateTrip finished");
        setShowEditModal(false);
      } else {
        console.log("Calling createTrip");
        await createTrip(processedData);
        console.log("createTrip finished");
        setShowAddModal(false);
      }
      
      // Refresh trips list
      console.log("Calling fetchTrips after submit");
      fetchTrips(filters);
    } catch (error) {
      console.error(`Failed to ${showEditModal ? 'update' : 'create'} trip`, error);
    }
  };

  const handleCopyTrip = async (trip) => {
    // Create a modified copy for the new trip
    const { trip_id, created_at, updated_at, ...tripData } = trip;
    
    // Handle nested structures
    let tripCopy = {
      ...tripData,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10)
    };
    
    if (trip.legs) {
      // Copy legs but reset some fields
      tripCopy.legs = trip.legs.map(leg => {
        const { leg_id, created_at, updated_at, actual_pickup, actual_dropoff, ...legData } = leg;
        return {
          ...legData,
          status: 'Scheduled',
          scheduled_pickup: null,
          scheduled_dropoff: null
        };
      });
    }
    
    if (trip.specialInstructions) {
      const { instruction_id, trip_id, created_at, updated_at, ...instructionsData } = trip.specialInstructions;
      tripCopy.special_instructions = instructionsData;
    }
    
    try {
      await createTrip(tripCopy);
      fetchTrips(filters);
    } catch (error) {
      console.error("Failed to copy trip", error);
    }
  };

  // Custom handler for clearing filters
  const handleClearFilters = () => {
    clearFilters();
    // Fetch all trips when filters are cleared
    fetchTrips({});
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <UserActions
        onSearch={setSearchQuery}
        onAdd={handleAddTrip}
        addButtonText="New Trip Request"
      />
      
      <TripRequestFilters 
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        tripTypeFilter={tripTypeFilter}
        setTripTypeFilter={setTripTypeFilter}
        clearFilters={handleClearFilters}
      />

      {tripsError ? (
          <div className="alert alert-danger m-4">
            <h5>Error loading trips</h5>
            <p>{tripsError}</p>
            <button 
              className="btn btn-primary mt-2" 
              onClick={fetchTrips}
            >
              Try Again
            </button>
          </div>
        ) : (
        <TripTable 
          trips={trips}
          onEdit={handleEditTrip}
          onDelete={deleteTrip}
          onView={handleViewTrip}
          onCopy={handleCopyTrip}
          onRecreate={handleRecreateTrip}
          isLoading={tripsLoading}
        />
        )}

      {showAddModal && (
        <RightSidebarPopup
          show={showAddModal}
          title="New Trip Request"
          onClose={() => setShowAddModal(false)}
        >
          <TripForm 
            onSubmit={handleSubmit}
            isSubmitting={tripsLoading}
            members={members}
            programs={programs}
            companies={companies}
            memberLocations={memberLocations}
            isLoadingLocations={isLoadingLocations}
            onMemberSelect={fetchMemberLocations}
          />
        </RightSidebarPopup>
      )}
      
      {showEditModal && selectedTrip && (
        <RightSidebarPopup
          show={showEditModal}
          title="Edit Trip Request"
          onClose={() => setShowEditModal(false)}
        >
          <TripEditForm 
            initialData={selectedTrip}
            onSubmit={handleSubmit}
            isSubmitting={tripsLoading}
            members={members}
            programs={programs}
            companies={companies}
            memberLocations={memberLocations}
            isLoadingLocations={isLoadingLocations}
            onMemberSelect={fetchMemberLocations}
          />
        </RightSidebarPopup>
      )}

      {showViewModal && selectedTrip && (
        <RightSidebarPopup
          show={showViewModal}
          title="Trip Details"
          onClose={() => setShowViewModal(false)}
        >
          <TripDetails 
            trip={selectedTrip}
            onEdit={(trip) => {
                  setShowViewModal(false);
              handleEditTrip(trip);
            }}
            onCopy={(trip) => {
                setShowViewModal(false);
              handleCopyTrip(trip);
            }}
            onClose={() => setShowViewModal(false)}
          />
        </RightSidebarPopup>
      )}
      
      {showRecreateModal && selectedTrip && (
        <RightSidebarPopup
          show={showRecreateModal}
          title="Recreate Trip"
          onClose={() => setShowRecreateModal(false)}
        >
          <TripForm
            initialData={selectedTrip}
            onSubmit={(data) => {
              // Force createTrip instead of updateTrip since this is a new trip
              const processedData = processTripFormData(data);
              
              createTrip(processedData)
                .then(() => {
                  setShowRecreateModal(false);
                  fetchTrips(filters);
                })
                .catch(error => {
                  console.error("Failed to recreate trip", error);
                });
            }}
            isSubmitting={tripsLoading}
            members={members}
            programs={programs}
            companies={companies}
            memberLocations={memberLocations}
            isLoadingLocations={isLoadingLocations}
            onMemberSelect={fetchMemberLocations}
          />
        </RightSidebarPopup>
      )}
    </div>
  );
};

export default TripRequests; 