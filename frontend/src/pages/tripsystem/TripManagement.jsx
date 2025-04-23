import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, Button, Badge } from 'react-bootstrap';
import { Box, Pagination } from '@mui/material';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import { tripMemberApi, programApi, tripLegApi, driverApi } from '@/api/baseApi';
import { useTrip } from '@/hooks/useTrip';
import { useTripLeg } from '@/hooks/useTripLeg';
import useTripFilters from '@/hooks/useTripFilters';
import { formatTimeForDB } from '@/utils/tripFormUtils';
import '@/assets/TripManagement.css';

// Import components
import TripFilters from '@/components/trips/TripFilters';
import TripForm from '@/components/trips/TripForm';
import TripEditForm from '@/components/trips/TripEditForm';
import TripDetails from '@/components/trips/TripDetails';
import TripLegSidebar from '@/components/trips/TripLegSidebar';
import NewTripManagementTable from '@/components/trips/management/NewTripManagementTable';

const TripManagement = () => {
  // Use our trip hook
  const {
    trips, 
    loading: tripsLoading, 
    error: tripsError, 
    fetchTrips, 
    createTrip,
    updateTrip,
    deleteTrip,
    setTrips
  } = useTrip();
  
  const { createTripLeg, updateLegStatus, updateTripLeg } = useTripLeg();

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Use our filters hook
  const {
    cityFilter,
    setCityFilter,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    driverFilter,
    setDriverFilter,
    programFilter,
    setProgramFilter,
    clearFilters
  } = useTripFilters(trips);

  // Get all drivers for dropdown
  const { data: driversData = [], isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      try {
        const response = await driverApi.getAll();
        // Format drivers data for dropdown
        return (response.data || []).map(driver => ({
          id: driver.id,
          name: `${driver.first_name} ${driver.last_name}`
        }));
      } catch (error) {
        console.error('Error fetching drivers:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Get all programs for dropdown
  const { data: programsData = [], isLoading: programsLoading } = useQuery({
    queryKey: ['programsForFilter'],
    queryFn: async () => {
      try {
        const response = await programApi.getAll();
        // Format programs data for dropdown
        return (response.data || []).map(program => ({
          id: program.program_id,
          name: program.program_name
        }));
      } catch (error) {
        console.error('Error fetching programs:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // UI State
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddLegSidebar, setShowAddLegSidebar] = useState(false);
  
  // Form State
  const [memberLocations, setMemberLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  
  // Get members for dropdown
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const response = await tripMemberApi.getAll();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Get programs for dropdown (for forms)
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

  // Paginated data - now using trips directly
  const paginatedTrips = trips.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [cityFilter, dateFilter, statusFilter, driverFilter, programFilter]);

  // Initial data fetch with default day filter (today)
  useEffect(() => {
    // Check if we have a stored date filter
    const storedDateFilter = localStorage.getItem('tripFilters_dateFilter');
    let initialDateFilter = { startDate: null, endDate: null };
    
    if (storedDateFilter) {
      // Use the stored date filter if it exists
      initialDateFilter = JSON.parse(storedDateFilter);
    }
    
    // If no stored date or invalid stored date, use today
    if (!initialDateFilter.startDate) {
      const today = new Date().toISOString().split('T')[0];
      initialDateFilter = { startDate: today, endDate: today };
      // Save this to localStorage too
      localStorage.setItem('tripFilters_dateFilter', JSON.stringify(initialDateFilter));
    }

    // Apply the date filter
    setDateFilter(initialDateFilter);
    fetchTrips(initialDateFilter);
  }, []);
  
  // Fetch trips when filters change
  useEffect(() => {
    const filters = {};
    
    if (cityFilter) filters.city = cityFilter;
    if (dateFilter.startDate) filters.startDate = dateFilter.startDate;
    if (dateFilter.endDate) filters.endDate = dateFilter.endDate;
    if (statusFilter) filters.status = statusFilter;
    if (driverFilter) filters.driverId = driverFilter;
    if (programFilter) filters.programId = programFilter;
    
    // If there are no filters applied, fetch all trips
    fetchTrips(filters);
  }, [cityFilter, dateFilter.startDate, dateFilter.endDate, statusFilter, driverFilter, programFilter]);

  // Fetch member locations when member selected
  const fetchMemberLocations = async (memberId) => {
    if (!memberId) {
      setMemberLocations([]);
      return;
    }
    
    setIsLoadingLocations(true);
    try {
      const response = await tripMemberApi.getMemberLocations(memberId);
      console.log('Member locations:', response.data);
      setMemberLocations(response.data || []);
    } catch (error) {
      console.error('Error loading member locations:', error);
      setMemberLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const handleViewTrip = (trip) => {
    console.log('Viewing trip:', trip);
    setSelectedTrip(trip);
    setShowViewModal(true);
  };

  const handleEditTrip = (legWithTripContext) => {
    console.log('Editing leg details:', legWithTripContext);
    setSelectedTrip(legWithTripContext);
    if (legWithTripContext.TripMember?.member_id) {
      fetchMemberLocations(legWithTripContext.TripMember.member_id);
    }
    setShowEditModal(true);
  };

  const handleAddLeg = (trip) => {
    console.log('Adding leg to trip:', trip);
    setSelectedTrip(trip);
    setShowAddLegSidebar(true);
  };

  const handleSubmit = async (data) => {
    try {
      console.log('Submitting leg update:', data);
      if (showEditModal) {
        // If selectedTrip has leg_id, it's a leg we're editing
        if (selectedTrip.leg_id) {
          await handleLegUpdate(selectedTrip.leg_id, data);
        } else {
          // Otherwise it's a trip
          await updateTrip(selectedTrip.trip_id, data);
        }
        setShowEditModal(false);
      }
      fetchTrips(filters);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleUpdateStatus = async (legId, status) => {
    try {
      // Special case for 'refresh' - just refetch data
      if (status === 'refresh') {
        fetchTrips(filters);
        return;
      }
      
      // Handle driver assignment update
      if (status && typeof status === 'object' && status.type === 'driver') {
        // If this is a driver assignment, we need to handle it differently
        const driverId = status.driverId;
        
        // We need to get the driver info
        let driverInfo = null;
        
        if (driverId) {
          try {
            // Try to fetch full driver info from the API
            const driverResponse = await driverApi.getOne(driverId);
            const driver = driverResponse.data;
            
            console.log('Retrieved driver info for optimistic update:', driver);
            
            // Create proper driver object format that matches what the backend would return
            driverInfo = {
              id: driver.id,
              first_name: driver.first_name,
              last_name: driver.last_name,
              email: driver.email,
              phone: driver.phone,
              status: driver.status
            };
          } catch (driverError) {
            console.error('Error fetching driver details:', driverError);
            
            // If we can't get driver info, look in driver data we already have
            const existingDriver = driversData.find(d => d.id.toString() === driverId.toString());
            if (existingDriver && existingDriver.name) {
              const nameParts = existingDriver.name.split(' ');
              driverInfo = {
                id: driverId,
                first_name: nameParts[0] || '',
                last_name: nameParts.slice(1).join(' ') || ''
              };
            }
          }
        }
        
        // Optimistic UI update for driver assignment
        setTrips(prevTrips => 
          prevTrips.map(trip => ({
            ...trip,
            legs: trip.legs?.map(leg => {
              if (leg.leg_id === legId) {
                return { 
                  ...leg, 
                  driver_id: driverId,
                  driver: driverInfo,
                  status: driverId ? "Assigned" : leg.status
                };
              }
              return leg;
            })
          }))
        );
        
        return;
      }
      
      // Regular status update
      // Optimistic UI update
      setTrips(prevTrips => 
        prevTrips.map(trip => ({
          ...trip,
          legs: trip.legs?.map(leg => 
            leg.leg_id === legId ? { ...leg, status } : leg
          )
        }))
      );
      
      // Make API call
      await updateLegStatus(legId, status);
      
      // No need to refetch all trips
    } catch (error) {
            console.error('Error updating leg status:', error);
            // On error, refetch to ensure data consistency
            fetchTrips(filters);
        }
    };

  const handleUpdateTime = async (legId, timeType, time) => {
    try {
      let updateData = {};
      let fieldName = '';
      
      // Function to ensure we have a valid time format for the DB
      const ensureValidTimeFormat = (timeValue) => {
        // If time is empty, return null
        if (!timeValue) return null;
        
        // If time already has seconds, return as is
        if (timeValue.split(':').length === 3) return timeValue;
        
        // Otherwise, add seconds
        return `${timeValue}:00`;
      };
      
      // Map the time type to the correct field in the database
      switch (timeType) {
        case 'R/U':
          fieldName = 'scheduled_pickup';
          updateData.scheduled_pickup = ensureValidTimeFormat(time);
          break;
        case 'P/U':
          fieldName = 'actual_pickup';
          updateData.actual_pickup = ensureValidTimeFormat(time);
          break;
        case 'APPT':
          fieldName = 'scheduled_dropoff';
          updateData.scheduled_dropoff = ensureValidTimeFormat(time);
          break;
        case 'D/O':
          fieldName = 'actual_dropoff';
          updateData.actual_dropoff = ensureValidTimeFormat(time);
          break;
        default:
          break;
      }
      
      if (Object.keys(updateData).length > 0) {
        // Optimistic UI update
        setTrips(prevTrips => 
          prevTrips.map(trip => ({
            ...trip,
            legs: trip.legs?.map(leg => 
              leg.leg_id === legId ? { ...leg, [fieldName]: time } : leg
            )
          }))
        );
        
        // Make API call
        await tripLegApi.updateLeg(legId, updateData);
        
        // No need to refetch all trips
      }
    } catch (error) {
      console.error('Error updating leg time:', error);
      // On error, refetch to ensure data consistency
      fetchTrips(filters);
    }
  };

  const handleLegUpdate = async (legId, legData) => {
    try {
      // Format times for database
      const formattedData = {
        ...legData,
        scheduled_pickup: legData.scheduled_pickup ? formatTimeForDB(legData.scheduled_pickup) : null,
        scheduled_dropoff: legData.scheduled_dropoff ? formatTimeForDB(legData.scheduled_dropoff) : null,
        actual_pickup: legData.actual_pickup ? formatTimeForDB(legData.actual_pickup) : null,
        actual_dropoff: legData.actual_dropoff ? formatTimeForDB(legData.actual_dropoff) : null
      };

      // Make API call
      const updatedLeg = await tripLegApi.updateLeg(legId, formattedData);
      
      // Update local state with the response
      setTrips(prevTrips => 
        prevTrips.map(trip => ({
          ...trip,
          legs: trip.legs?.map(leg => 
            leg.leg_id === legId ? { ...leg, ...updatedLeg.data } : leg
          )
        }))
      );
    } catch (error) {
      console.error('Error updating leg:', error);
      // On error, refetch to ensure data consistency
      fetchTrips(filters);
    }
  };

  const handleLegSubmit = async (data) => {
    try {
      // Only send required fields to the API WITHOUT formatting the time
      const legData = {
        trip_id: data.trip_id,
        pickup_location: data.pickup_location,
        dropoff_location: data.dropoff_location,
        scheduled_pickup: data.scheduled_pickup,  // Send as is, let backend format it
        scheduled_dropoff: data.scheduled_dropoff, // Send as is, let backend format it
        status: data.status,
        sequence: data.sequence
      };
      
      console.log('Submitting leg data:', legData);
      
      // Submit the new leg to the API
      const newLeg = await createTripLeg(legData);
      
      // Make sure we have the trip_id from the data
      const tripId = legData.trip_id;
      
      if (newLeg && tripId) {
        // Update UI with the new leg
        setTrips(prevTrips => 
          prevTrips.map(trip => {
            if (trip.trip_id.toString() === tripId.toString()) {
              const currentLegs = trip.legs || [];
              return {
                ...trip,
                legs: [...currentLegs, newLeg]
              };
            }
            return trip;
          })
        );
        
        toast.success('New leg created successfully');
      } else {
        console.error('Error: Missing leg data or trip ID', {newLeg, tripId});
        toast.error('Error creating leg. Please try again.');
        fetchTrips(filters);
      }
      
      setShowAddLegSidebar(false);
    } catch (error) {
      console.error('Error adding leg:', error);
      toast.error('Failed to create new leg. Please try again.');
      fetchTrips(filters);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
        
  // Custom handler for clearing filters
  const handleClearFilters = () => {
    clearFilters();
    // Fetch all trips when filters are cleared
    fetchTrips({});
  };

  return (
    <div className="">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <TripFilters 
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        driverFilter={driverFilter}
        setDriverFilter={setDriverFilter}
        programFilter={programFilter}
        setProgramFilter={setProgramFilter}
        driversData={driversData}
        programsData={programsData}
        clearFilters={handleClearFilters}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Trip Management</h4>
        <div className="d-flex">
          <Badge bg="info" className="me-2 p-2 d-flex align-items-center">
            <span className="me-1">Total Trips: </span>
            <span className="fw-bold">{trips.length}</span>
          </Badge>
        </div>
      </div>

      <Card>
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold">Trip Legs</span>
            <small className="text-muted">Each row represents one leg of a trip</small>
          </div>
        </Card.Header>
        <Card.Body>
          {tripsError ? (
            <div className="alert alert-danger">
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
            <>
              <NewTripManagementTable 
                trips={paginatedTrips}
                onEdit={handleEditTrip}
                onView={handleViewTrip}
                isLoading={tripsLoading}
                onUpdateStatus={handleUpdateStatus}
                onUpdateTime={handleUpdateTime}
                onAddLeg={handleAddLeg}
              />
              
              {/* Pagination */}
              {trips.length > 0 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={Math.ceil(trips.length / rowsPerPage)}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Edit Trip Modal */}
      {showEditModal && selectedTrip && (
        <RightSidebarPopup
          show={showEditModal}
          title={selectedTrip.leg_id ? "Edit Leg Details" : "Edit Trip Legs"}
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
            editingLegOnly={Boolean(selectedTrip.leg_id)}
          />
        </RightSidebarPopup>
      )}

      {/* View Trip Modal */}
      {showViewModal && selectedTrip && (
        <RightSidebarPopup
          show={showViewModal}
          title="Trip Details"
          onClose={() => setShowViewModal(false)}
        >
          <TripDetails 
            trip={selectedTrip}
            onEdit={handleEditTrip}
            onClose={() => setShowViewModal(false)}
          />
        </RightSidebarPopup>
      )}

      {/* Add Leg Sidebar */}
      {showAddLegSidebar && selectedTrip && (
        <TripLegSidebar
          isOpen={showAddLegSidebar}
          onClose={() => setShowAddLegSidebar(false)}
          trip={selectedTrip}
          onSubmit={handleLegSubmit}
        />
      )}
    </div>
  );
};

export default TripManagement; 
