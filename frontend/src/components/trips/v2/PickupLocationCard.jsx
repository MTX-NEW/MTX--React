import React, { useState, useEffect, useRef } from 'react';
import { tripLocationApi } from '@/api/baseApi';
import useMemberLocations from '@/hooks/useMemberLocations';
import useMemberManagement from '@/hooks/useMemberManagement';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import { FaMapMarkerAlt, FaSearch, FaPencilAlt, FaPlus } from 'react-icons/fa';
import { FormProvider } from 'react-hook-form';
import FormComponent from '@/components/FormComponent';
import { IconButton, TextField, InputAdornment } from '@mui/material';

// Container
const PickupLocationCard = ({ selectedMember, selectedLocation, onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showLocationsList, setShowLocationsList] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  
  // Track previous member ID to prevent unnecessary fetches
  const prevMemberIdRef = useRef(null);
  
  // Use the member locations hook for member-specific locations
  const { 
    locations: memberLocations,
    fetchLocations 
  } = useMemberLocations();
  
  // Use the member management hook for location form handling
  const {
    // Methods
    handlePickupLocation,
    handlePickupSubmit,
    showPickupModal,
    setShowPickupModal,
    
    // Form methods
    pickupFormMethods,
    
    // Form field generators
    getLocationFields
  } = useMemberManagement();
  
  // Fetch all locations when component mounts
  useEffect(() => {
    const fetchAllLocations = async () => {
      try {
        const response = await tripLocationApi.getAll();
        setAllLocations(response.data || []);
      } catch (error) {
        console.error('Error fetching all locations:', error);
      }
    };

    fetchAllLocations();
  }, []);
  
  // Fetch member-specific locations when member changes
  useEffect(() => {
    if (selectedMember && selectedMember.member_id !== prevMemberIdRef.current) {
      fetchLocations(selectedMember.member_id);
      prevMemberIdRef.current = selectedMember.member_id;
    }
  }, [selectedMember, fetchLocations]);
  
  // Auto-select member's default pickup location if available
  useEffect(() => {
    if (selectedMember && !selectedLocation && memberLocations.length > 0) {
      // Check for default pickup location
      const defaultPickup = memberLocations.find(
        location => location.location_id === selectedMember.pickup_location
      );
      
      if (defaultPickup) {
        onLocationSelect(defaultPickup);
      }
    }
  }, [selectedMember, memberLocations, selectedLocation, onLocationSelect]);
  
  // Filter locations based on search query
  useEffect(() => {
    // Only filter locations if the user has typed something
    if (searchQuery) {
      const locationsToFilter = selectedMember ? memberLocations : allLocations;
      
      // Only search in street_address
      const filtered = locationsToFilter.filter(location => 
        location.street_address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setFilteredLocations(filtered);
      setShowLocationsList(true);
    } else {
      // Don't show any locations when query is empty
      setFilteredLocations([]);
      setShowLocationsList(false);
    }
  }, [searchQuery, memberLocations, allLocations, selectedMember]);
  
  const handleLocationSelect = (location) => {
    onLocationSelect(location);
    setShowLocationsList(false);
    setSearchQuery('');
  };

  const handleSearchFocus = () => {
    if (searchQuery.length > 0) {
      setShowLocationsList(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding the list to allow for clicks to register
    setTimeout(() => {
      setShowLocationsList(false);
    }, 200);
  };
  
  const handleAddLocation = () => {
    handlePickupLocation(selectedMember);
  };
  
  const handleEditLocation = () => {
    if (selectedLocation) {
      handlePickupLocation(selectedMember, selectedLocation);
    }
  };
  
  return (
    <>
      <LocationPresenter
        title="Pickup Location"
        locations={filteredLocations}
        selectedLocation={selectedLocation}
        onSelectLocation={handleLocationSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddLocation={handleAddLocation}
        onEditLocation={handleEditLocation}
        showLocationsList={showLocationsList}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
      />
      
      {/* Location Modal */}
      {showPickupModal && (
        <RightSidebarPopup
          show={showPickupModal}
          title={selectedLocation ? "Edit Pickup Location" : "Add Pickup Location"}
          onClose={() => {
            setShowPickupModal(false);
            pickupFormMethods.reset();
          }}
        >
          {selectedMember && (
            <p className="mb-4 font-medium text-gray-700">
              Member: {selectedMember.first_name} {selectedMember.last_name}
              {selectedMember.Program?.program_name ? ` - ${selectedMember.Program.program_name}` : ''}
            </p>
          )}
          <FormProvider {...pickupFormMethods}>
            <FormComponent
              fields={getLocationFields()}
              onSubmit={handlePickupSubmit}
              submitText={selectedLocation ? "Update Location" : "Save Location"}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
    </>
  );
};

// Presenter
const LocationPresenter = ({
  title,
  locations,
  selectedLocation,
  onSelectLocation,
  searchQuery,
  onSearchChange,
  onAddLocation,
  onEditLocation,
  showLocationsList,
  onSearchFocus,
  onSearchBlur
}) => {
  return (
    <>
      <div className="trip-section-header">
        <h5 className="trip-section-title">{title}</h5>
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
            {showLocationsList && locations.length > 0 && (
              <div className="position-absolute start-0 mt-1 shadow rounded" style={{ zIndex: 1000 }}>
                <div className="bg-white rounded border" style={{ width: '280px', maxHeight: '250px', overflowY: 'auto' }}>
                  {locations.map((location, index) => (
                    <div 
                      key={location.location_id || index} 
                      className="p-2 border-bottom cursor-pointer"
                      onClick={() => onSelectLocation(location)}
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

export default PickupLocationCard; 