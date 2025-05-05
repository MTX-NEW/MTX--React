import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { tripLocationApi } from '@/api/baseApi';
import { locationValidationSchema } from '@/validations/inputValidation';
import { getCityClassification } from '@/utils/arizonaCityClassification';
import useMemberManagement from './useMemberManagement';

const locationSchema = yup.object().shape({
  street_address: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zip: yup.string().required('ZIP code is required'),
  building_type: yup.string(),
  building: yup.string(),
  phone: yup.string(),
  location_type: yup.string()
});

const useLocationManagement = () => {
  // Get getLocationFields from useMemberManagement to avoid duplication
  const { getLocationFields: getLocationFieldsFromMember } = useMemberManagement();
  
  // State
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form methods
  const addFormMethods = useForm({
    resolver: yupResolver(locationValidationSchema),
    mode: 'onChange',
    defaultValues: {
      street_address: '',
      city: '',
      state: '',
      zip: '',
      building_type: '',
      building: '',
      phone: '',
      location_type: ''
    }
  });

  const editFormMethods = useForm({
    resolver: yupResolver(locationValidationSchema),
    mode: 'onChange'
  });

  // Watch for city changes to update location_type
  useEffect(() => {
    const addSubscription = addFormMethods.watch((value, { name }) => {
      // Set location_type based on city
      if (name === 'city' && value.city) {
        const cityClassification = getCityClassification(value.city);
        if (cityClassification) {
          addFormMethods.setValue('location_type', cityClassification);
        }
      }
    });

    const editSubscription = editFormMethods.watch((value, { name }) => {
      // Set location_type based on city
      if (name === 'city' && value.city) {
        const cityClassification = getCityClassification(value.city);
        if (cityClassification) {
          editFormMethods.setValue('location_type', cityClassification);
        }
      }
    });

    return () => {
      addSubscription.unsubscribe();
      editSubscription.unsubscribe();
    };
  }, [addFormMethods, editFormMethods]);

  // Fetch locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Apply search filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredLocations(locations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = locations.filter(location => 
      location.street_address?.toLowerCase().includes(query) ||
      location.city?.toLowerCase().includes(query) ||
      location.state?.toLowerCase().includes(query) ||
      location.zip?.includes(query) ||
      location.building_type?.toLowerCase().includes(query)
    );
    
    setFilteredLocations(filtered);
  }, [locations, searchQuery]);

  // API calls
  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await tripLocationApi.getAll();
      setLocations(response.data);
      setFilteredLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  const searchLocations = async (query) => {
    if (!query || query.length < 2) return [];
    
    try {
      const response = await tripLocationApi.searchLocations(query);
      return response.data;
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  };

  // Event handlers
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleAddLocation = () => {
    addFormMethods.reset({
      street_address: '',
      city: '',
      state: '',
      zip: '',
      building_type: '',
      building: '',
      phone: '',
      location_type: ''
    });
    setShowAddModal(true);
  };

  const handleEditLocation = (location) => {
    setSelectedLocation(location);
    editFormMethods.reset(location);
    setShowEditModal(true);
  };

  const handleDeleteLocation = async (location) => {
    try {
      await tripLocationApi.delete(location.location_id);
      toast.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    }
  };

  const handleAddSubmit = async (data) => {
    setIsLoading(true);
    try {
      await tripLocationApi.create(data);
      toast.success('Location added successfully');
      setShowAddModal(false);
      fetchLocations();
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (data) => {
    if (!selectedLocation) return;
    
    setIsLoading(true);
    try {
      await tripLocationApi.update(selectedLocation.location_id, data);
      toast.success('Location updated successfully');
      setShowEditModal(false);
      fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
    } finally {
      setIsLoading(false);
    }
  };

  // Use the imported getLocationFields function, but filter out the recipient_default field
  const getLocationFields = () => {
    const fields = getLocationFieldsFromMember();
    // Filter out recipient_default field which is only needed for member locations
    return fields.filter(field => field.name !== 'recipient_default');
  };

  return {
    // State
    locations,
    filteredLocations,
    selectedLocation,
    isLoading,
    showAddModal,
    showEditModal,
    
    // Methods
    setShowAddModal,
    setShowEditModal,
    fetchLocations,
    searchLocations,
    
    // Form methods
    addFormMethods,
    editFormMethods,
    
    // Event handlers
    handleSearchChange,
    handleAddLocation,
    handleEditLocation,
    handleDeleteLocation,
    handleAddSubmit,
    handleEditSubmit,
    
    // Form fields generator
    getLocationFields
  };
};

export default useLocationManagement; 