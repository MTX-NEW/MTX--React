import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, Button, Badge } from 'react-bootstrap';
import { Box, Pagination } from '@mui/material';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import { tripMemberApi, programApi, tripLegApi } from '@/api/baseApi';
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
    deleteTrip 
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
    availableCities,
    filteredTrips,
    clearFilters
  } = useTripFilters(trips);

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
      console.log('Members data:', response.data);
      return response.data || [];
    }
  });

  // Get programs for dropdown
  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const response = await programApi.getAll();
      console.log('Programs data:', response.data);
      return response.data || [];
    }
  });

  // Get companies for dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await programApi.getCompanies();
      console.log('Companies data:', response.data);
      return response.data || [];
    }
  });

  // Paginated data
  const paginatedTrips = filteredTrips.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [cityFilter, dateFilter, statusFilter]);

  // Initial data fetch
  useEffect(() => {
    fetchTrips();
    console.log('TripManagement component mounted at /trip-system/trip-management');
  }, []);
  
  // Log trip data when it changes
  useEffect(() => {
    console.log('Trips data updated:', trips);
    console.log('Filtered trips:', filteredTrips);
  }, [trips, filteredTrips]);

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
      fetchTrips();
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleLegSubmit = async (data) => {
    try {
      console.log('Submitting new leg:', data);
      await createTripLeg(data);
      fetchTrips();
      setShowAddLegSidebar(false);
    } catch (error) {
      console.error('Error adding leg:', error);
    }
  };

  const handleUpdateStatus = async (legId, status) => {
    try {
      console.log('Updating leg status:', legId, status);
      // Special case for 'refresh' - just refresh the data without updating status
      if (status === 'refresh') {
        await fetchTrips();
        return;
      }
      
      await updateLegStatus(legId, status);
      // Refresh trips data
      await fetchTrips();
    } catch (error) {
      console.error('Error updating leg status:', error);
    }
  };

  const handleUpdateTime = async (legId, timeType, time) => {
    try {
      console.log('Updating leg time:', legId, timeType, time);
      let updateData = {};
      
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
          updateData.scheduled_pickup = ensureValidTimeFormat(time);
          break;
        case 'P/U':
          updateData.actual_pickup = ensureValidTimeFormat(time);
          break;
        case 'APPT':
          updateData.scheduled_dropoff = ensureValidTimeFormat(time);
          break;
        case 'D/O':
          updateData.actual_dropoff = ensureValidTimeFormat(time);
          break;
        default:
          break;
      }
      
      if (Object.keys(updateData).length > 0) {
        console.log('Sending time update to API:', updateData);
        await tripLegApi.updateLeg(legId, updateData);
        // Refresh trips data
        await fetchTrips();
      }
    } catch (error) {
      console.error('Error updating leg time:', error);
    }
  };

  const handleLegUpdate = async (legId, legData) => {
    try {
      console.log('Updating leg data:', legId, legData);
      // Format times for database
      const formattedData = {
        ...legData,
        scheduled_pickup: legData.scheduled_pickup ? formatTimeForDB(legData.scheduled_pickup) : null,
        scheduled_dropoff: legData.scheduled_dropoff ? formatTimeForDB(legData.scheduled_dropoff) : null,
        actual_pickup: legData.actual_pickup ? formatTimeForDB(legData.actual_pickup) : null,
        actual_dropoff: legData.actual_dropoff ? formatTimeForDB(legData.actual_dropoff) : null
      };

      await tripLegApi.updateLeg(legId, formattedData);
      // Refresh trips data
      await fetchTrips();
    } catch (error) {
      console.error('Error updating leg:', error);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
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
        clearFilters={clearFilters}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Trip Management</h4>
        <div className="d-flex">
          <Badge bg="info" className="me-2 p-2 d-flex align-items-center">
            <span className="me-1">Total Trips: </span>
            <span className="fw-bold">{trips.length}</span>
          </Badge>
          <Badge bg="success" className="p-2 d-flex align-items-center">
            <span className="me-1">Filtered: </span>
            <span className="fw-bold">{filteredTrips.length}</span>
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
              {filteredTrips.length > 0 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={Math.ceil(filteredTrips.length / rowsPerPage)}
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
