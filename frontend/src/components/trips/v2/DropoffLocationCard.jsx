import React, { useEffect, useRef } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { FaMapMarkerAlt, FaSearch, FaPencilAlt, FaPlus } from 'react-icons/fa';
import { tripLocationApi } from '@/api/baseApi';
import useMemberLocations from '@/hooks/useMemberLocations';
import useMemberManagement from '@/hooks/useMemberManagement';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import FormComponent from '@/components/FormComponent';

// Container component
const DropoffLocationCard = ({ selectedMember, selectedLocation, onLocationSelect }) => {
  // Use the member locations hook for member-specific locations
  const { 
    locations: memberLocations, 
    fetchLocations 
  } = useMemberLocations();
  
  // Use the member management hook for location form handling
  const {
    // Methods
    handleDropoffLocation,
    handleDropoffSubmit,
    showDropoffModal,
    setShowDropoffModal,
    
    // Form methods
    dropoffFormMethods,
    
    // Form field generators
    getLocationFields
  } = useMemberManagement();
  
  // Track previous member ID to prevent unnecessary fetches
  const prevMemberIdRef = useRef(null);
  
  // Initialize form with react-hook-form
  const { watch, setValue, reset } = useForm({
    defaultValues: {
      searchQuery: '',
      showLocationsList: false,
      allLocations: [],
      filteredLocations: []
    }
  });
  
  // Watch form values
  const watchSearchQuery = watch('searchQuery');
  const watchShowLocationsList = watch('showLocationsList');
  const allLocations = watch('allLocations');
  const filteredLocations = watch('filteredLocations');
  
  // Fetch all locations when component mounts
  useEffect(() => {
    const fetchAllLocations = async () => {
      try {
        const response = await tripLocationApi.getAll();
        setValue('allLocations', response.data || []);
      } catch (error) {
        console.error('Error fetching all locations:', error);
      }
    };

    fetchAllLocations();
  }, [setValue]);
  
  // Fetch member-specific locations when member changes
  useEffect(() => {
    if (selectedMember && selectedMember.member_id !== prevMemberIdRef.current) {
      fetchLocations(selectedMember.member_id);
      prevMemberIdRef.current = selectedMember.member_id;
    }
  }, [selectedMember, fetchLocations]);
  
  // Auto-select member's default dropoff location if available
  useEffect(() => {
    if (selectedMember && !selectedLocation && memberLocations.length > 0) {
      // Check for default dropoff location
      const defaultDropoff = memberLocations.find(
        location => location.location_id === selectedMember.dropoff_location
      );
      
      if (defaultDropoff) {
        onLocationSelect(defaultDropoff);
      }
    }
  }, [selectedMember, memberLocations, selectedLocation, onLocationSelect]);
  
  // Filter locations based on search query
  useEffect(() => {
    // Only filter locations if the user has typed something
    if (watchSearchQuery) {
      const locationsToFilter = selectedMember ? memberLocations : allLocations;
      
      // Only search in street_address
      const filtered = locationsToFilter.filter(location => 
        location.street_address?.toLowerCase().includes(watchSearchQuery.toLowerCase())
      );
      
      setValue('filteredLocations', filtered);
      setValue('showLocationsList', true);
    } else {
      // Don't show any locations when query is empty
      setValue('filteredLocations', []);
      setValue('showLocationsList', false);
    }
  }, [watchSearchQuery, memberLocations, allLocations, selectedMember, setValue]);
  
  // Handle search input change
  const handleSearchChange = (value) => {
    setValue('searchQuery', value);
  };
  
  // Handle location selection
  const handleLocationSelect = (location) => {
    if (onLocationSelect) onLocationSelect(location);
    setValue('showLocationsList', false);
    setValue('searchQuery', '');
  };
  
  // Handle search focus
  const handleSearchFocus = () => {
    if (watchSearchQuery.length > 0) {
      setValue('showLocationsList', true);
    }
  };
  
  // Handle search blur
  const handleSearchBlur = () => {
    // Delay hiding the list to allow for clicks to register
    setTimeout(() => {
      setValue('showLocationsList', false);
    }, 200);
  };
  
  const handleAddLocation = () => {
    handleDropoffLocation(selectedMember);
  };
  
  const handleEditLocation = () => {
    if (selectedLocation) {
      handleDropoffLocation(selectedMember, selectedLocation);
    }
  };

  return (
    <>
      <DropoffLocationPresenter
        selectedLocation={selectedLocation}
        filteredLocations={filteredLocations}
        showLocationsList={watchShowLocationsList}
        searchQuery={watchSearchQuery}
        onLocationSelect={handleLocationSelect}
        onSearchChange={handleSearchChange}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        onEditLocation={handleEditLocation}
        onAddLocation={handleAddLocation}
      />
      
      {/* Location Modal */}
      {showDropoffModal && (
        <RightSidebarPopup
          show={showDropoffModal}
          title={selectedLocation ? "Edit Dropoff Location" : "Add Dropoff Location"}
          onClose={() => {
            setShowDropoffModal(false);
            dropoffFormMethods.reset();
          }}
        >
          {selectedMember && (
            <p className="mb-4 font-medium text-gray-700">
              Member: {selectedMember.first_name} {selectedMember.last_name}
              {selectedMember.Program?.program_name ? ` - ${selectedMember.Program.program_name}` : ''}
            </p>
          )}
          <FormProvider {...dropoffFormMethods}>
            <FormComponent
              fields={getLocationFields()}
              onSubmit={handleDropoffSubmit}
              submitText={selectedLocation ? "Update Location" : "Save Location"}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
    </>
  );
};

// Presenter component
const DropoffLocationPresenter = ({
  selectedLocation,
  filteredLocations,
  showLocationsList,
  searchQuery,
  onLocationSelect,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onEditLocation,
  onAddLocation
}) => {
  return (
    <>
      <div className="trip-section-header">
        <h5 className="trip-section-title">Dropoff Location</h5>
        <div className="d-flex align-items-center">
          <div className="member-search-container me-2 position-relative">
            <TextField
              size="small"
              placeholder="Search by address..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={onSearchFocus}
              onBlur={onSearchBlur}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaSearch className="text-muted" />
                  </InputAdornment>
                ),
              }}
              style={{ width: '180px' }}
            />
            
            {/* Search Results Dropdown */}
            {showLocationsList && filteredLocations.length > 0 && (
              <div className="position-absolute start-0 mt-1 shadow rounded" style={{ zIndex: 1000 }}>
                <div className="bg-white rounded border" style={{ width: '280px', maxHeight: '250px', overflowY: 'auto' }}>
                  {filteredLocations.map((location) => (
                    <div 
                      key={location.location_id} 
                      className="p-2 border-bottom cursor-pointer"
                      onClick={() => onLocationSelect(location)}
                      style={{ transition: "background-color 0.2s ease" }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="d-flex align-items-start">
                        <div className="location-icon me-3">
                          <FaMapMarkerAlt className="text-primary" />
                        </div>
                        <div>
                          <div className="fw-medium small">{location.street_address}</div>
                          <div className="small text-muted">{location.city}, {location.state} {location.zip}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <IconButton 
              color="primary" 
              size="small" 
              onClick={onEditLocation}
              disabled={!selectedLocation}
              title="Edit Location"
              className="me-1"
            >
              <FaPencilAlt />
            </IconButton>
            <IconButton 
              color="primary" 
              size="small" 
              onClick={onAddLocation}
              title="Add Location"
            >
              <FaPlus />
            </IconButton>
          </div>
        </div>
      </div>
      
      <div className="trip-section-body">
        {/* Selected Location */}
        {selectedLocation ? (
          <div className="selected-location">
            <div className="d-flex align-items-start">
              <div className="location-icon me-3">
                <FaMapMarkerAlt className="text-primary fs-4" />
              </div>
              <div className="location-details">
                <h6 className="mb-1">{selectedLocation.street_address}</h6>
                <p className="mb-1 text-muted small">{selectedLocation.city}, {selectedLocation.state} {selectedLocation.zip}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted mt-3">
            <p className="mb-1">Type to search for a location</p>
            <small>Search by street address</small>
          </div>
        )}
      </div>
    </>
  );
};

export default DropoffLocationCard; 