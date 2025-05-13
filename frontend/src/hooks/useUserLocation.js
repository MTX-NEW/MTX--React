import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { userApi, tripLocationApi } from '@/api/baseApi';

// Simplified schema for user locations
const userLocationValidationSchema = Yup.object().shape({
  street_address: Yup.string()
    .required("Street address is required")
    .max(255, "Street address cannot exceed 255 characters"),
  building: Yup.string()
    .nullable()
    .max(255, "Building cannot exceed 255 characters"),
  building_type: Yup.string()
    .required("Building type is required")
    .oneOf(['Apartment', 'House', 'Lot', 'Other', 'Room', 'Suite', 'Unit'], "Invalid building type"),
  city: Yup.string()
    .required("City is required")
    .max(100, "City cannot exceed 100 characters"),
  state: Yup.string()
    .required("State is required")
    .matches(/^[A-Z]{2}$/, "State must be 2 uppercase letters (e.g., AZ)")
    .transform((value) => value ? value.toUpperCase() : value),
  zip: Yup.string()
    .required("ZIP code is required")
    .matches(/^\d{5}(-\d{4})?$/, "ZIP code must be in format 12345 or 12345-6789")
    .max(10, "ZIP code cannot exceed 10 characters")
});

const useUserLocation = () => {
  // State management
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshCallback, setRefreshCallback] = useState(null);

  // Form methods
  const locationFormMethods = useForm({
    resolver: yupResolver(userLocationValidationSchema),
    mode: 'onChange'
  });

  // Handler to open location modal
  const handleUserLocation = (user, onRefresh) => {
    setSelectedUser(user);
    if (onRefresh) {
      setRefreshCallback(() => onRefresh);
    }

    // Set default values from the user data
    if (user.location) {
      const locationData = {
        location_id: user.location.location_id,
        street_address: user.location.street_address || '',
        building: user.location.building || '',
        building_type: user.location.building_type || '',
        city: user.location.city || '',
        state: user.location.state || '',
        zip: user.location.zip || ''
      };
      
      // Set the form data
      locationFormMethods.reset(locationData);
    } else {
      // Reset the form to empty values
      locationFormMethods.reset({
        street_address: '',
        building: '',
        building_type: '',
        city: '',
        state: '',
        zip: ''
      });
    }

    setShowLocationModal(true);
  };

  // Handler to save location
  const handleLocationSubmit = async (data) => {
    try {
      setIsLoading(true);
      let locationId;
      
      // These fields are not in our form but required by the API
      const locationData = {
        ...data,
        location_type: 'Urban', // Default value
        phone: null,
      };

      console.log("Submitting location data:", locationData);

      // Check if the user already has a location
      if (selectedUser.location_id && selectedUser.location) {
        // Update the existing location record
        await tripLocationApi.update(selectedUser.location_id, locationData);
        locationId = selectedUser.location_id;
        toast.success('User location updated successfully');
      } else {
        // Create a new location
        const response = await tripLocationApi.create(locationData);
        locationId = response.data.location_id;
        toast.success('User location created successfully');
      }

      // Update the user with the location
      await userApi.update(selectedUser.id, {
        location_id: locationId
      });

      setShowLocationModal(false);
      
      // Call the refresh callback if available
      if (refreshCallback) {
        refreshCallback();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error setting user location:', error);
      toast.error('Failed to set user location: ' + (error.response?.data?.message || error.message));
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Get location form fields
  const getLocationFields = () => {
    const buildingTypeOptions = [
      { value: 'Apartment', label: 'Apartment' },
      { value: 'House', label: 'House' },
      { value: 'Lot', label: 'Lot' },
      { value: 'Other', label: 'Other' },
      { value: 'Room', label: 'Room' },
      { value: 'Suite', label: 'Suite' },
      { value: 'Unit', label: 'Unit' }
    ];

    return [
      { name: 'street_address', label: 'Street Address', type: 'text', isRequired: true },
      { name: 'building', label: 'Building/Apt #', type: 'text' },
      {
        name: 'building_type',
        label: 'Building Type',
        type: 'select',
        options: buildingTypeOptions,
        isRequired: true
      },
      { name: 'city', label: 'City', type: 'text', isRequired: true },
      { name: 'state', label: 'State', type: 'text', isRequired: true },
      { name: 'zip', label: 'ZIP Code', type: 'text', isRequired: true }
    ];
  };

  return {
    selectedUser,
    showLocationModal,
    isLoading,
    setShowLocationModal,
    locationFormMethods,
    handleUserLocation,
    handleLocationSubmit,
    getLocationFields
  };
};

export default useUserLocation; 