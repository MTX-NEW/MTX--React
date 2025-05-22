import React, { useState, useEffect, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { tripMemberApi, programApi } from '@/api/baseApi';
import { useTrip } from '@/hooks/useTrip';
import useTripFilters from '@/hooks/useTripFilters';
import { useResource } from '@/hooks/useResource';
import useMemberLocations from '@/hooks/useMemberLocations';
import useMemberManagement from '@/hooks/useMemberManagement';
import RequestForm from '@/components/trips/RequestForm';
import VerticalTripSearchPanel from '@/components/trips/VerticalTripSearchPanel';
import { Tooltip } from '@mui/material';
import '@/assets/css/TripRequestForm.css';

const TripRequestForm = () => {
  // Core trip hooks
  const {
    createTrip,
    updateTrip,
    loading: tripsLoading,
    error: tripsError,
    fetchTrips
  } = useTrip();

  // Filter hooks
  const { 
    cityFilter,
    setCityFilter,
    dateFilter,
    setDateFilter,
    tripTypeFilter,
    setTripTypeFilter,
    scheduleTypeFilter,
    setScheduleTypeFilter,
    clearFilters
  } = useTripFilters([]);

  // UI State
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [formMode, setFormMode] = useState('create');
  const [allTrips, setAllTrips] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Member management hook
  const memberManagement = useMemberManagement();
  
  // Member locations hook
  const { 
    locations: memberLocations, 
    loading: isLoadingLocations, 
    fetchLocations: fetchMemberLocations 
  } = useMemberLocations();

  // Resources for form data
  const { data: members = [] } = useResource(tripMemberApi, { 
    idField: 'member_id',
    skip: formMode !== 'create'
  });
  
  const { data: programs = [] } = useResource(programApi, { idField: 'program_id' });
  
  const companiesService = { getAll: programApi.getCompanies };
  const { data: companies = [] } = useResource(companiesService, { idField: 'company_id' });

  // Fetch trips initially
  useEffect(() => {
    handleSearch();
  }, []);

  // Handle search with current filters - makes API call
  const handleSearch = () => {
    setIsSearching(true);
    
    const filters = {};
    if (dateFilter.startDate) filters.startDate = dateFilter.startDate;
    
    fetchTrips(filters)
      .then(results => {
        setAllTrips(results || []);
        setIsSearching(false);
      })
      .catch(error => {
        console.error("Error searching trips:", error);
        toast.error("Failed to search trips");
        setIsSearching(false);
      });
  };

  // Filter trips locally based on filter criteria
  const filteredTrips = useMemo(() => {
    if (!allTrips.length) return [];
    
    return allTrips.filter(trip => {
      // Filter by city
      if (cityFilter && trip.legs?.length > 0) {
        const pickupCity = trip.legs[0].pickupLocation?.city;
        const dropoffCity = trip.legs[0].dropoffLocation?.city;
        if (
          (!pickupCity || !pickupCity.includes(cityFilter)) && 
          (!dropoffCity || !dropoffCity.includes(cityFilter))
        ) {
          return false;
        }
      }
      
      // Filter by trip type
      if (tripTypeFilter && trip.trip_type !== tripTypeFilter) {
        return false;
      }
      
      // Filter by schedule type
      if (scheduleTypeFilter && trip.schedule_type !== scheduleTypeFilter) {
        return false;
      }
      
      // Filter by date range
      if (dateFilter.startDate) {
        const tripDate = new Date(trip.start_date);
        const startDate = new Date(dateFilter.startDate);
        
        // If start date is after trip date, exclude
        if (tripDate < startDate) {
          return false;
        }
        
        // If end date is provided and trip date is after end date, exclude
        if (dateFilter.endDate) {
          const endDate = new Date(dateFilter.endDate);
          if (tripDate > endDate) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [allTrips, cityFilter, tripTypeFilter, scheduleTypeFilter, dateFilter.startDate, dateFilter.endDate]);

  // Handle form submission
  const handleSubmit = async (data) => {
    try {
      if (formMode === 'edit' && selectedTrip?.trip_id) {
        await updateTrip(selectedTrip.trip_id, data);
        toast.success('Trip updated successfully');
      } else {
        await createTrip(data);
        toast.success('Trip created successfully');
      }
      
      // Reset form state
      setFormMode('create');
      setSelectedTrip(null);
      
      // Refresh results
      handleSearch();
    } catch (error) {
      console.error(`Failed to ${formMode === 'edit' ? 'update' : 'create'} trip`, error);
      toast.error(`Failed to ${formMode === 'edit' ? 'update' : 'create'} trip: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle editing a member
  const handleEditMember = (member) => {
    if (member) {
      memberManagement.setSelectedMember(member);
      memberManagement.handleEditMember(member);
    }
  };

  // Reset form to create mode
  const handleCancelAction = () => {
    setSelectedTrip(null);
    setFormMode('create');
    fetchMemberLocations(null);
  };

  // Handle member selection
  const handleMemberSelect = async (memberId) => {
    if (!memberId) return;
    try {
      await fetchMemberLocations(memberId);
    } catch (err) {
      console.error("Error loading member locations:", err);
    }
  };

  // Handle selecting a trip from search results
  const handleSelectTrip = async (trip) => {
    try {
      // Set the selected trip directly from the API response
      setSelectedTrip(trip);
      
      // Format leg data to ensure times are in the correct format
      if (trip.legs && trip.legs.length > 0) {
        const formattedLegs = trip.legs.map(leg => ({
          ...leg,
          scheduled_pickup: leg.scheduled_pickup ? leg.scheduled_pickup.slice(0, 5) : null,
          scheduled_dropoff: leg.scheduled_dropoff ? leg.scheduled_dropoff.slice(0, 5) : null
        }));
        
        setSelectedTrip(prev => ({
          ...prev,
          legs: formattedLegs
        }));
      }
      
      // Set to edit mode
      setFormMode('edit');
    } catch (error) {
      console.error("Error selecting trip:", error);
      toast.error("Failed to load trip details");
    }
  };

  // Handle clearing all filters
  const handleClearFilters = () => {
    clearFilters();
  };

  // Form props for edit mode
  const getEditTripProps = () => {
    const editMembers = selectedTrip?.TripMember ? [selectedTrip.TripMember] : [];
    
    // Extract locations from the trip data
    const tripLocations = [];
    
    // Add the member's default locations if they exist
    if (selectedTrip?.TripMember?.memberPickupLocation) {
      tripLocations.push(selectedTrip.TripMember.memberPickupLocation);
    }
    if (selectedTrip?.TripMember?.memberDropoffLocation) {
      tripLocations.push(selectedTrip.TripMember.memberDropoffLocation);
    }
    
    // Add locations from legs
    if (selectedTrip?.legs) {
      selectedTrip.legs.forEach(leg => {
        if (leg.pickupLocation) tripLocations.push(leg.pickupLocation);
        if (leg.dropoffLocation) tripLocations.push(leg.dropoffLocation);
      });
    }
    
    // Remove duplicates by location_id
    const uniqueLocations = tripLocations.filter((location, index, self) =>
      index === self.findIndex((l) => l.location_id === location.location_id)
    );
      
    return {
      initialData: selectedTrip,
      onSubmit: handleSubmit,
      isSubmitting: tripsLoading,
      members: editMembers,
      programs: programs || [],
      companies: companies || [],
      memberLocations: uniqueLocations,
      isLoadingLocations: false,
      onMemberSelect: handleMemberSelect,
      onEditMember: handleEditMember
    };
  };

  // Form props for create mode
  const getAddTripProps = () => {
    return {
      onSubmit: handleSubmit,
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

  // Generate tooltip content for a trip
  const getTripTooltipContent = (trip) => {
    // Format time from HH:MM:SS to HH:MM format
    const formatTime = (timeString) => {
      if (!timeString) return 'N/A';
      return timeString.substring(0, 5);
    };
    
    return (
      <div className="p-2">
        <div><strong>Member:</strong> {trip.TripMember?.first_name} {trip.TripMember?.last_name}</div>
        <div><strong>Date:</strong> {trip.start_date}</div>
        <div><strong>Schedule:</strong> {trip.schedule_type || 'N/A'}</div>
        <div><strong>Trip Type:</strong> {
          trip.trip_type === 'one_way' ? 'One Way' : 
          trip.trip_type === 'round_trip' ? 'Round Trip' : 'Multi-stop'
        }</div>
        
        {trip.legs && trip.legs.map((leg, index) => (
          <div key={leg.leg_id || index} className={index > 0 ? "mt-2 pt-2 border-top" : ""}>
            <div><strong>Leg {leg.sequence}:</strong> <span className="badge bg-info">{leg.status}</span></div>
            <div><strong>Pickup:</strong> {leg.pickupLocation?.street_address || 'N/A'}</div>
            <div><strong>Pickup Time:</strong> {formatTime(leg.scheduled_pickup)}</div>
            <div><strong>Dropoff:</strong> {leg.dropoffLocation?.street_address || 'N/A'}</div>
            <div><strong>Dropoff Time:</strong> {formatTime(leg.scheduled_dropoff)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="trip-request-page py-3">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="container-fluid">
        <div className="row g-3">
          {/* Search Panel */}
          <div className="col-md-3">
            <div className="search-panel-container">
              <div className="card shadow-sm mb-3">
                <div className="card-body p-0">
                  <VerticalTripSearchPanel
                    cityFilter={cityFilter}
                    setCityFilter={setCityFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    tripTypeFilter={tripTypeFilter}
                    setTripTypeFilter={setTripTypeFilter}
                    scheduleTypeFilter={scheduleTypeFilter}
                    setScheduleTypeFilter={setScheduleTypeFilter}
                    clearFilters={handleClearFilters}
                    onSearch={handleSearch}
                  />
                </div>
              </div>
              
              {/* Search Results */}
              {allTrips.length > 0 && (
                <div className="card shadow-sm">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center py-2">
                    <h6 className="mb-0">Search Results</h6>
                    <span className="badge bg-primary rounded-pill">{filteredTrips.length}</span>
                  </div>
                  <div className="card-body p-0">
                    {isSearching ? (
                      <div className="text-center p-3">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Searching trips...
                      </div>
                    ) : filteredTrips.length === 0 ? (
                      <div className="text-center text-muted p-3">
                        No trips found
                      </div>
                    ) : (
                      <div className="list-group list-group-flush" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {filteredTrips.map(trip => (
                          <Tooltip
                            key={trip.trip_id}
                            title={getTripTooltipContent(trip)}
                            arrow
                            placement="right"
                          >
                            <button
                              className="list-group-item list-group-item-action p-3"
                              onClick={() => handleSelectTrip(trip)}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="fw-medium text-primary">
                                    {trip.TripMember?.first_name} {trip.TripMember?.last_name}
                                  </div>
                                  <div className="small text-muted mt-1">
                                    {trip.trip_type === 'one_way' ? 'One Way' :
                                     trip.trip_type === 'round_trip' ? 'Round Trip' : 'Multi-stop'}
                                    <span className="badge bg-info ms-2">{trip.schedule_type}</span>
                                  </div>
                                </div>
                                <div className="text-end">
                                  <div className="small fw-medium">{trip.start_date}</div>
                                </div>
                              </div>
                            </button>
                          </Tooltip>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Form Panel */}
          <div className="col-md-9">
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <h5 className="mb-0 text-primary">
                  {formMode === 'create' ? 'Create New Trip Request' : 'Edit Trip Request'}
                </h5>
                {formMode === 'edit' && (
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleCancelAction}
                  >
                    <i className="fas fa-plus me-1"></i>
                    New Trip
                  </button>
                )}
              </div>
              <div className="card-body p-0">
                <RequestForm 
                  {...(formMode === 'edit' ? getEditTripProps() : getAddTripProps())}
                />
              </div>
            </div>
            
            {tripsError && (
              <div className="alert alert-danger mt-3">
                <i className="fas fa-exclamation-circle me-2"></i>
                {tripsError.message || 'Failed to process trip'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripRequestForm;