import React, { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, Button, Badge } from 'react-bootstrap';
import { Box, Pagination } from '@mui/material';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import { tripMemberApi, programApi } from '@/api/baseApi';
import { useTrip } from '@/hooks/useTrip';
import { useTripLeg } from '@/hooks/useTripLeg';
import useTripFilters from '@/hooks/useTripFilters';
import useDriver from '@/hooks/useDriver';
import { useResource } from '@/hooks/useResource';
import '@/assets/TripManagement.css';

// Import components
import TripFilters from '@/components/trips/TripFilters';
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
  
  const { createTripLeg, updateLegStatus, updateTripLeg, assignLegDriver } = useTripLeg();

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

  // Build current filters object for fetching
  const currentFilters = useMemo(() => {
    const f = {};
    if (cityFilter) f.city = cityFilter;
    if (dateFilter.startDate) f.startDate = dateFilter.startDate;
    if (dateFilter.endDate) f.endDate = dateFilter.endDate;
    if (statusFilter) f.status = statusFilter;
    if (driverFilter) f.driverId = driverFilter;
    if (programFilter) f.programId = programFilter;
    return f;
  }, [cityFilter, dateFilter.startDate, dateFilter.endDate, statusFilter, driverFilter, programFilter]);

  // Fetch data via hooks
  const { drivers, loading: driversLoading, error: driversError } = useDriver();
  const driversData = drivers.map(d => ({ id: d.id, name: d.name }));

  const { data: programs = [], loading: programsLoading, error: programsError } = useResource(programApi, { idField: 'program_id' });
  const programsData = programs.map(p => ({ id: p.program_id, name: p.program_name }));

  const { data: members = [], loading: membersLoading, error: membersError } = useResource(tripMemberApi, { idField: 'member_id' });

  // Fetch companies via programApi.getCompanies
  const companiesApiService = { getAll: programApi.getCompanies };
  const { data: companies = [], loading: companiesLoading, error: companiesError } = useResource(companiesApiService, { idField: 'company_id' });

  // UI State
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddLegSidebar, setShowAddLegSidebar] = useState(false);
  
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
    fetchTrips(currentFilters);
  }, [currentFilters]);

  const handleViewTrip = (trip) => {
    console.log('Viewing trip:', trip);
    setSelectedTrip(trip);
    setShowViewModal(true);
  };

  const handleEditTrip = (legWithTripContext) => {
    console.log('Editing leg details:', legWithTripContext);
    setSelectedTrip(legWithTripContext);
    // Member location lookup will be performed in the edit form
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
      fetchTrips(currentFilters);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleUpdateStatus = async (legId, status) => {
    try {
      // Special case for 'refresh' - just refetch data
      if (status === 'refresh') {
        fetchTrips(currentFilters);
        return;
      }
      
      // Handle driver assignment update
      if (status && typeof status === 'object' && status.type === 'driver') {
        const driverId = status.driverId;
        // Safely find driver info if assigning, otherwise null
        const driverInfo = driverId != null
          ? (drivers.find(d => String(d.id) === String(driverId)) || null)
          : null;
        // Optimistic update: clear or set driver
        setTrips(prevTrips =>
          prevTrips.map(trip => ({
            ...trip,
            legs: trip.legs.map(leg =>
              leg.leg_id === legId
                ? {
                    ...leg,
                    driver_id: driverId,
                    driver: driverInfo,
                    // Only set status to 'Assigned' when assigning; leave unchanged when clearing
                    status: driverId ? 'Assigned' : leg.status
                  }
                : leg
            )
          }))
        );
        // Delegate to hook to assign driver
        try {
          await assignLegDriver(legId, driverId);
        } catch (error) {
          console.error('Error assigning driver:', error);
          fetchTrips(currentFilters);
        }
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
            fetchTrips(currentFilters);
        }
    };

  const handleUpdateTime = async (legId, timeType, time) => {
    const fieldMap = {
      'R/U': 'scheduled_pickup',
      'P/U': 'actual_pickup',
      'APPT': 'scheduled_dropoff',
      'D/O': 'actual_dropoff'
    };
    const key = fieldMap[timeType];
    if (!key) return;
    const payload = { [key]: time || null };
    try {
      // Optimistic UI update
      setTrips(prevTrips =>
        prevTrips.map(trip => ({
          ...trip,
          legs: trip.legs?.map(leg =>
            leg.leg_id === legId ? { ...leg, [key]: time } : leg
          )
        }))
      );
      // Delegate to hook
      await updateTripLeg(legId, payload);
    } catch (error) {
      console.error('Error updating leg time:', error);
      fetchTrips(currentFilters);
    }
  };

  const handleLegUpdate = async (legId, legData) => {
    try {
      const updated = await updateTripLeg(legId, legData);
      setTrips(prevTrips =>
        prevTrips.map(trip => ({
          ...trip,
          legs: trip.legs?.map(leg =>
            leg.leg_id === legId ? { ...leg, ...updated } : leg
          )
        }))
      );
    } catch (error) {
      console.error('Error updating leg:', error);
      fetchTrips(currentFilters);
    }
  };

  const handleLegSubmit = async (data) => {
    try {
      console.log('Submitting leg data:', data);
      // Submit the new leg to the API
      const newLeg = await createTripLeg(data);
      
      // Make sure we have the trip_id from the data
      const tripId = data.trip_id;
      
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
        toast.error('Error creating leg. Please try again.');
        fetchTrips(currentFilters);
      }
      
      setShowAddLegSidebar(false);
    } catch (error) {
      console.error('Error adding leg:', error);
      toast.error('Failed to create new leg. Please try again.');
      fetchTrips(currentFilters);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
        
  // Custom handler for clearing filters
  const handleClearFilters = () => {
    clearFilters();
    // Fetch all trips when filters are cleared
    fetchTrips({}); // no filters returns all
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
