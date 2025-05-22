import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserActions from '@/components/users/allusers/UserActions';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import { tripMemberApi, programApi } from '@/api/baseApi';
import { useTrip } from '@/hooks/useTrip';
import useTripFilters from '@/hooks/useTripFilters';
import { useResource } from '@/hooks/useResource';
import useMemberLocations from '@/hooks/useMemberLocations';
import useMemberManagement from '@/hooks/useMemberManagement';
import FormComponent from '@/components/FormComponent';

// Import our components
import TripRequestFilters from '@/components/trips/TripRequestFilters';
import TripTable from '@/components/trips/TripTable';
import TripForm from '@/components/trips/TripForm';
import TripDetails from '@/components/trips/TripDetails';


// Presenter component - responsible for UI rendering
const TripRequestsPresenter = ({
  trips,
  tripsLoading,
  tripsError,
  searchQuery,
  setSearchQuery,
  cityFilter,
  setCityFilter,
  dateFilter,
  setDateFilter,
  tripTypeFilter,
  setTripTypeFilter,
  handleClearFilters,
  handleAddTrip,
  handleEditTrip,
  handleViewTrip,
  handleRecreateTrip,
  handleDeleteTrip,
  handleCopyTrip,
  showAddModal,
  setShowAddModal,
  showEditModal,
  setShowEditModal,
  showViewModal,
  setShowViewModal,
  showRecreateModal,
  setShowRecreateModal,
  showEditMemberModal,
  setShowEditMemberModal,
  handleSubmit,
  handleCreateNewTrip,
  selectedTrip,
  selectedMemberForEdit,
  addTripProps,
  editTripProps,
  refreshTrips,
  memberManagement
}) => {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <UserActions
        onSearch={setSearchQuery}
        onAdd={handleAddTrip}
        addButtonText="New Trip Request"
        searchQuery={searchQuery}
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
              onClick={refreshTrips}
            >
              Try Again
            </button>
          </div>
        ) : (
        <TripTable 
          trips={trips}
          onEdit={handleEditTrip}
          onDelete={handleDeleteTrip}
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
          isWide={true}
        >
          <TripForm {...addTripProps} />
        </RightSidebarPopup>
      )}
      
      {showEditModal && selectedTrip && (
        <RightSidebarPopup
          show={showEditModal}
          title="Edit Trip Request"
          onClose={() => setShowEditModal(false)}
          isWide={true}
        >
          <TripForm 
            {...editTripProps}
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
          isWide={true}
        >
          <TripForm
            initialData={selectedTrip}
            onSubmit={handleSubmit}
            isSubmitting={tripsLoading}
            members={selectedTrip?.TripMember ? [selectedTrip.TripMember] : []}
            programs={addTripProps.programs}
            companies={addTripProps.companies}
            memberLocations={addTripProps.memberLocations}
            isLoadingLocations={addTripProps.isLoadingLocations}
            onMemberSelect={addTripProps.onMemberSelect}
            onEditMember={addTripProps.onEditMember}
          />
        </RightSidebarPopup>
      )}
      
      {/* Edit Member Modal */}
      {showEditMemberModal && selectedMemberForEdit && (
        <RightSidebarPopup
          show={showEditMemberModal}
          title="Edit Member"
          onClose={() => setShowEditMemberModal(false)}
        >
          <FormProvider {...memberManagement.editFormMethods}>
            <FormComponent
              fields={memberManagement.getMemberFields(memberManagement.editFormMethods)}
              onSubmit={async (data) => {
                await memberManagement.handleEditSubmit(data);
                setShowEditMemberModal(false);
                // Refresh member data if needed
                if (selectedTrip?.TripMember?.member_id === selectedMemberForEdit.member_id) {
                  refreshTrips();
                }
              }}
              submitText="Update Member"
              isSubmitting={memberManagement.isLoading}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
    </div>
  );
};

// Container component - responsible for logic and state
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
  
  // Add state for member management
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState(null);
  
  // Initialize member management hook
  const memberManagement = useMemberManagement();
  
  // When selectedMemberForEdit changes, initialize the edit form
  useEffect(() => {
    if (selectedMemberForEdit) {
      // Reset the edit form with the selected member data
      memberManagement.setSelectedMember(selectedMemberForEdit);
      memberManagement.handleEditMember(selectedMemberForEdit);
    }
  }, [selectedMemberForEdit]);
  
  // Form State
  const [selectedMember, setSelectedMember] = useState(null);

  // Member locations state via custom hook
  const { locations: memberLocations, loading: isLoadingLocations, error: locationsError, fetchLocations: fetchMemberLocations } = useMemberLocations();

  // Get necessary data based on current state to avoid loading large datasets unnecessarily
  // Only load full members list when adding a new trip (not when editing)
  const shouldLoadMembers = showAddModal;
  const { data: members = [], loading: membersLoading, error: membersError } = useResource(
    tripMemberApi, 
    { 
      idField: 'member_id',
      skip: !shouldLoadMembers
    }
  );
  
  // Get programs for dropdown via useResource
  const { data: programs = [], loading: programsLoading, error: programsError } = useResource(programApi, { idField: 'program_id' });
  
  // Get companies for dropdown via useResource
  const companiesService = { getAll: programApi.getCompanies };
  const { data: companies = [], loading: companiesLoading, error: companiesError } = useResource(companiesService, { idField: 'company_id' });
  
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

  // Trip handlers
  const handleAddTrip = () => {
    setSelectedTrip(null);
    // Clear member locations
    fetchMemberLocations(null);
    setShowAddModal(true);
  };

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip);
    setShowViewModal(true);
  };

  const handleEditTrip = (trip) => {
    // Set the selected trip directly from the API response - no need for additional processing
    setSelectedTrip(trip);
    
    // Load member locations for the trip's member if needed
    if (trip.TripMember?.member_id) {
      fetchMemberLocations(trip.TripMember.member_id);
    }
    
    setShowEditModal(true);
  };

  const handleRecreateTrip = (trip) => {
    // Create a new simplified copy for recreation
    const recreateTrip = {
      ...trip,
      trip_id: null, // Clear ID to create new trip
      start_date: new Date().toISOString().slice(0, 10), // Reset to today
      end_date: new Date().toISOString().slice(0, 10)
    };
    
    // Reset leg data but preserve locations
    if (recreateTrip.legs) {
      recreateTrip.legs = recreateTrip.legs.map(leg => ({
        ...leg,
        leg_id: null,
        status: 'Scheduled',
        scheduled_pickup: null,
        scheduled_dropoff: null,
        actual_pickup: null,
        actual_dropoff: null
      }));
    }
    
    setSelectedTrip(recreateTrip);
    
    // Load member locations for the trip's member if needed
    if (trip.TripMember?.member_id) {
      fetchMemberLocations(trip.TripMember.member_id);
    }
    
    setShowRecreateModal(true);
  };

  const handleSubmit = async (data) => {
    try {
      // Send data directly to the API
      if (showEditModal && selectedTrip?.trip_id) {
        await updateTrip(selectedTrip.trip_id, data);
        setShowEditModal(false);
      } else if (showRecreateModal) {
        await createTrip(data);
        setShowRecreateModal(false);
      } else {
        await createTrip(data);
        setShowAddModal(false);
      }
      
      // Refresh trips list with current filters
      await fetchTrips(getCurrentFilters());
    } catch (error) {
      console.error(`Failed to ${showEditModal ? 'update' : 'create'} trip`, error);
    }
  };

  const handleCreateNewTrip = async (data) => {
    try {
      // Always create a new trip
      const newTripData = { ...data };
      
      // Remove any trip_id to ensure it creates a new trip
      if (newTripData.trip_id) delete newTripData.trip_id;
      
      // Make sure to reset some fields that should be new
      if (newTripData.legs) {
        newTripData.legs = newTripData.legs.map(leg => ({
          ...leg,
          leg_id: undefined,
          status: 'Scheduled'
        }));
      }
      
      await createTrip(newTripData);
      
      // Close edit modal if open
      setShowEditModal(false);
      
      // Refresh trips list with current filters
      await fetchTrips(getCurrentFilters());
    } catch (error) {
      console.error("Failed to create new trip", error);
    }
  };

  const handleCopyTrip = async (trip) => {
    // Create a simplified copy for the new trip
    const tripCopy = {
      // Keep most of the original data but exclude these fields
      ...trip,
      trip_id: undefined,        // Remove ID to create new trip
      created_at: undefined,     // Let server set these
      updated_at: undefined,
      start_date: new Date().toISOString().slice(0, 10), // Set to today
      end_date: new Date().toISOString().slice(0, 10)
    };
    
    // Reset leg-specific fields but preserve locations
    if (tripCopy.legs) {
      tripCopy.legs = tripCopy.legs.map(leg => ({
        ...leg,
        leg_id: undefined,       // Remove ID for new legs
        status: 'Scheduled',     // Reset status
        scheduled_pickup: null,  // Reset times
        scheduled_dropoff: null,
        actual_pickup: undefined,
        actual_dropoff: undefined,
        created_at: undefined,   // Let server set these
        updated_at: undefined
      }));
    }
    
    // Keep the special instructions but reset the ID
    if (tripCopy.specialInstructions) {
      tripCopy.special_instructions = {
        ...tripCopy.specialInstructions,
        instruction_id: undefined,
        trip_id: undefined,
        created_at: undefined,
        updated_at: undefined
      };
      
      // Remove the original to avoid duplication
      delete tripCopy.specialInstructions;
    }
    
    try {
      await createTrip(tripCopy);
      // Refresh the trip list with current filters
      fetchTrips(getCurrentFilters());
    } catch (error) {
      console.error("Failed to copy trip", error);
    }
  };

  // Helper to get current filters
  const getCurrentFilters = () => {
    const filters = {};
    if (searchQuery) filters.search = searchQuery;
    if (cityFilter) filters.city = cityFilter;
    if (dateFilter.startDate) filters.startDate = dateFilter.startDate;
    if (dateFilter.endDate) filters.endDate = dateFilter.endDate;
    if (tripTypeFilter) filters.tripType = tripTypeFilter;
    return filters;
  };

  // Custom handler for clearing filters
  const handleClearFilters = () => {
    clearFilters();
    // Fetch all trips when filters are cleared
    fetchTrips({});
  };

  // Handle editing a member from the trip form
  const handleEditMember = (member) => {
    if (member) {
      setSelectedMemberForEdit(member);
      setShowEditMemberModal(true);
    }
  };

  // Optimize render for edit mode - don't need to pass entire members list
  const getEditComponentProps = () => {
    // When editing, we don't need all members - just the selected one
    const editMembers = selectedTrip?.TripMember 
      ? [selectedTrip.TripMember] 
      : [];
    
    // Member select handler for edit mode
    const handleEditMemberSelect = async (memberId, memberData) => {
      if (!memberId) return;
      
      console.log("Member data from autocomplete (edit mode):", memberData);
      
      try {
        // Only fetch locations - we already have the member data from autocomplete
        await fetchMemberLocations(memberId);
      } catch (err) {
        console.error("Error loading member locations:", err);
      }
    };
    
    return {
      initialData: selectedTrip,
      onSubmit: handleSubmit,
      onCreateNew: handleCreateNewTrip,
      isSubmitting: tripsLoading,
      members: editMembers,
      programs,
      companies,
      memberLocations,
      isLoadingLocations,
      onMemberSelect: handleEditMemberSelect,
      onEditMember: handleEditMember
    };
  };

  // Optimize Add Trip modal for performance
  const getAddTripProps = () => {
    // Simplified member select handler that uses the data directly from autocomplete
    const handleMemberSelect = async (memberId, memberData) => {
      if (!memberId) return;
      
      console.log("Member data from autocomplete:", memberData);
      
      try {
        // Only fetch locations - we already have the member data from autocomplete
        await fetchMemberLocations(memberId);
      } catch (err) {
        console.error("Error loading member locations:", err);
      }
    };
    
    return {
      onSubmit: handleSubmit,
      onCreateNew: handleCreateNewTrip,
      isSubmitting: tripsLoading,
      members: members || [],
      programs: programs || [],
      companies: companies || [],
      memberLocations: memberLocations || [],
      isLoadingLocations,
      onMemberSelect: handleMemberSelect,
      onEditMember: handleEditMember
    };
  };

  // Function to refresh trips with current filters
  const refreshTrips = () => {
    const filters = {};
    if (searchQuery) filters.search = searchQuery;
    if (cityFilter) filters.city = cityFilter;
    if (dateFilter.startDate) filters.startDate = dateFilter.startDate;
    if (dateFilter.endDate) filters.endDate = dateFilter.endDate;
    if (tripTypeFilter) filters.tripType = tripTypeFilter;
    
    fetchTrips(filters);
  };
  
  return (
    <TripRequestsPresenter
      trips={trips}
      tripsLoading={tripsLoading}
      tripsError={tripsError}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      cityFilter={cityFilter}
      setCityFilter={setCityFilter}
      dateFilter={dateFilter}
      setDateFilter={setDateFilter}
      tripTypeFilter={tripTypeFilter}
      setTripTypeFilter={setTripTypeFilter}
      handleClearFilters={handleClearFilters}
      handleAddTrip={handleAddTrip}
      handleEditTrip={handleEditTrip}
      handleViewTrip={handleViewTrip}
      handleRecreateTrip={handleRecreateTrip}
      handleDeleteTrip={deleteTrip}
      handleCopyTrip={handleCopyTrip}
      showAddModal={showAddModal}
      setShowAddModal={setShowAddModal}
      showEditModal={showEditModal}
      setShowEditModal={setShowEditModal}
      showViewModal={showViewModal}
      setShowViewModal={setShowViewModal}
      showRecreateModal={showRecreateModal}
      setShowRecreateModal={setShowRecreateModal}
      showEditMemberModal={showEditMemberModal}
      setShowEditMemberModal={setShowEditMemberModal}
      handleSubmit={handleSubmit}
      handleCreateNewTrip={handleCreateNewTrip}
      selectedTrip={selectedTrip}
      selectedMemberForEdit={selectedMemberForEdit}
      addTripProps={getAddTripProps()}
      editTripProps={getEditComponentProps()}
      refreshTrips={refreshTrips}
      memberManagement={memberManagement}
    />
  );
};

export default TripRequests; 