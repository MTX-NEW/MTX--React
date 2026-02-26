import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useResource } from '@/hooks/useResource';
import { tripMemberApi, programApi, groupApi, tripLocationApi } from '@/api/baseApi';
import { memberValidationSchema, locationValidationSchema } from '@/validations/inputValidation';
import { getCityClassification } from '@/utils/arizonaCityClassification';

const useMemberManagement = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDropoffModal, setShowDropoffModal] = useState(false);

  // Form methods
  const addFormMethods = useForm({
    resolver: yupResolver(memberValidationSchema),
    mode: 'onChange'
  });

  const editFormMethods = useForm({
    resolver: yupResolver(memberValidationSchema),
    mode: 'onChange'
  });

  const pickupFormMethods = useForm({
    resolver: yupResolver(locationValidationSchema),
    mode: 'onChange'
  });

  const dropoffFormMethods = useForm({
    resolver: yupResolver(locationValidationSchema),
    mode: 'onChange'
  });

  // Use the useResource hook for CRUD operations
  const {
    data: members = [],
    loading: isLoading,
    create: createMember,
    update: updateMember,
    remove: deleteMember,
    refresh: refetchMembers
  } = useResource(tripMemberApi, { idField: 'member_id' });

  // Organisations (for Organisation dropdown) from Created Organisation Database
  const { data: organisations = [] } = useQuery({
    queryKey: ['organisations'],
    queryFn: async () => {
      const response = await groupApi.getAll();
      return response.data || [];
    }
  });

  // Programs by organisation: refetch when user selects an organisation (watch active form)
  const addOrgId = addFormMethods.watch('company_id');
  const editOrgId = editFormMethods.watch('company_id');
  const organisationIdForPrograms = showAddModal ? addOrgId : (showEditModal ? editOrgId : null);
  const { data: programsByOrganisation = [] } = useQuery({
    queryKey: ['programs', 'organisation', organisationIdForPrograms],
    queryFn: async () => {
      const response = await programApi.getByOrganisation(organisationIdForPrograms);
      return response.data || [];
    },
    enabled: !!organisationIdForPrograms
  });

  // All programs (for edit: resolve company_id from member's program_id and for program plan options when we have program_id)
  const { data: allPrograms = [] } = useQuery({
    queryKey: ['programs', 'all'],
    queryFn: async () => {
      const response = await programApi.getAll();
      return response.data || [];
    }
  });

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;

    const search = searchQuery.toLowerCase();
    return members.filter(member => {
      const memberName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
      const ahcccsId = member.ahcccs_id?.toLowerCase() || '';
      const programName = member.Program?.program_name?.toLowerCase() || '';

      return memberName.includes(search) ||
        ahcccsId.includes(search) ||
        programName.includes(search);
    });
  }, [members, searchQuery]);


  // Debug form values
  useEffect(() => {
    const pickupSubscription = pickupFormMethods.watch((value, { name }) => {
      // Set location_type based on city
      if (name === 'city' && value.city) {
        const cityClassification = getCityClassification(value.city);
        if (cityClassification) {
          pickupFormMethods.setValue('location_type', cityClassification);
        }
      }
    });

    const dropoffSubscription = dropoffFormMethods.watch((value, { name }) => {
      // Set location_type based on city
      if (name === 'city' && value.city) {
        const cityClassification = getCityClassification(value.city);
        if (cityClassification) {
          dropoffFormMethods.setValue('location_type', cityClassification);
        }
      }
    });

    return () => {
      pickupSubscription.unsubscribe();
      dropoffSubscription.unsubscribe();
    };
  }, [pickupFormMethods, dropoffFormMethods]);

  // Handler functions
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    addFormMethods.reset({
      gender: 'Male' // Set default value
    });
    setShowAddModal(true);
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    // Remove debug logging
    setShowViewModal(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    // Resolve organisation (company_id) from member's program
    const program = (allPrograms || []).find(p => p.program_id === Number(member.program_id));
    const companyId = program ? program.company_id : (member.Program?.company_id ?? '');

    editFormMethods.reset({
      ...member,
      program_id: member.program_id || '',
      company_id: companyId,
      program_plan_id: member.program_plan_id || '',
      birth_date: member.birth_date ? new Date(member.birth_date) : null,
      insurance_expiry: member.insurance_expiry ? new Date(member.insurance_expiry) : null
    });
    setShowEditModal(true);
  };

  const handlePickupLocation = (member) => {
    setSelectedMember(member);
    // Remove debug logging

    // Set default values from the member data
    if (member.memberPickupLocation) {
      // Remove debug logging
      const locationData = {
        location_id: member.memberPickupLocation.location_id,
        street_address: member.memberPickupLocation.street_address || '',
        building: member.memberPickupLocation.building || '',
        building_type: member.memberPickupLocation.building_type || '',
        city: member.memberPickupLocation.city || '',
        state: member.memberPickupLocation.state || '',
        zip: member.memberPickupLocation.zip || '',
        phone: member.memberPickupLocation.phone || '',
        location_type: member.memberPickupLocation.location_type || 'Home',
        latitude: member.memberPickupLocation.latitude || null,
        longitude: member.memberPickupLocation.longitude || null,
        recipient_default: true // Always set to true for pickup
      };
      
      // Set the form data
      pickupFormMethods.reset(locationData);
      
      // If we have a city, check if we should update the location_type
      if (locationData.city) {
        const cityClassification = getCityClassification(locationData.city);
        if (cityClassification) {
          pickupFormMethods.setValue('location_type', cityClassification);
        }
      }
    } else {
      // Reset the form to empty values
      pickupFormMethods.reset({
        street_address: '',
        building: '',
        building_type: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        location_type: 'Home',
        latitude: null,
        longitude: null,
        recipient_default: true // Always set to true for pickup
      });
    }

    setShowPickupModal(true);
  };

  const handleDropoffLocation = (member) => {
    setSelectedMember(member);
    // Remove debug logging
    
    // Set default values from the member data
    if (member.memberDropoffLocation) {
      // Remove debug logging
      const locationData = {
        location_id: member.memberDropoffLocation.location_id,
        street_address: member.memberDropoffLocation.street_address || '',
        building: member.memberDropoffLocation.building || '',
        building_type: member.memberDropoffLocation.building_type || '',
        city: member.memberDropoffLocation.city || '',
        state: member.memberDropoffLocation.state || '',
        zip: member.memberDropoffLocation.zip || '',
        phone: member.memberDropoffLocation.phone || '',
        location_type: member.memberDropoffLocation.location_type || 'Home',
        latitude: member.memberDropoffLocation.latitude || null,
        longitude: member.memberDropoffLocation.longitude || null,
        recipient_default: true // Always set to true for dropoff
      };
      
      // Set the form data
      dropoffFormMethods.reset(locationData);
      
      // If we have a city, check if we should update the location_type
      if (locationData.city) {
        const cityClassification = getCityClassification(locationData.city);
        if (cityClassification) {
          dropoffFormMethods.setValue('location_type', cityClassification);
        }
      }
    } else {
      // Reset the form to empty values
      dropoffFormMethods.reset({
        street_address: '',
        building: '',
        building_type: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        location_type: 'Home',
        latitude: null,
        longitude: null,
        recipient_default: true // Always set to true for dropoff
      });
    }
    
    setShowDropoffModal(true);
  };

  const handleDeleteMember = async (member) => {
    try {
      await deleteMember(member.member_id);
      toast.success('Member deleted successfully');
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    }
  };

  const handleAddSubmit = async (data) => {
    try {
      await createMember(data);
      toast.success('Member created successfully');
      setShowAddModal(false);
      refetchMembers();
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Failed to create member. Please try again.');
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await updateMember(selectedMember.member_id, data);
      toast.success('Member updated successfully');
      setShowEditModal(false);
      refetchMembers();
    } catch (error) {
      console.error('Error in form update:', error);
      toast.error('Failed to update member. Please try again.');
    }
  };

  const handlePickupSubmit = async (data) => {
    try {
      let locationId;

      // Check if the member already has a pickup location
      if (selectedMember.pickup_location && selectedMember.memberPickupLocation) {
        // Always update the existing location record
        await tripLocationApi.update(selectedMember.pickup_location, data);
        locationId = selectedMember.pickup_location;
        toast.success('Pickup location updated successfully');
      } else {
        // Create a new location only if none exists
        const response = await tripLocationApi.create(data);
        locationId = response.data.location_id;
        toast.success('Pickup location created successfully');
      }

      // Update the member with the location
      await updateMember(selectedMember.member_id, {
        pickup_location: locationId
      });

      setShowPickupModal(false);
      refetchMembers();
    } catch (error) {
      console.error('Error setting pickup location:', error);
      toast.error('Failed to set pickup location. Please try again.');
    }
  };

  const handleDropoffSubmit = async (data) => {
    try {
      let locationId;

      // Check if the member already has a dropoff location
      if (selectedMember.dropoff_location && selectedMember.memberDropoffLocation) {
        // Always update the existing location record
        await tripLocationApi.update(selectedMember.dropoff_location, data);
        locationId = selectedMember.dropoff_location;
        toast.success('Dropoff location updated successfully');
      } else {
        // Create a new location only if none exists
        const response = await tripLocationApi.create(data);
        locationId = response.data.location_id;
        toast.success('Dropoff location created successfully');
      }

      // Update the member with the location
      await updateMember(selectedMember.member_id, {
        dropoff_location: locationId
      });

      setShowDropoffModal(false);
      refetchMembers();
    } catch (error) {
      console.error('Error setting dropoff location:', error);
      toast.error('Failed to set dropoff location. Please try again.');
    }
  };

  // Helper functions for generating form fields
  const getMemberFields = (formContext) => {
    // Organisation options from Created Organisation Database (user groups)
    const organisationOptions = (organisations || []).map(org => ({
      value: org.group_id,
      label: org.full_name || org.common_name || `Organisation ${org.group_id}`
    }));

    const selectedOrganisationId = formContext ? formContext.watch('company_id') : null;
    const selectedProgramId = formContext ? formContext.watch('program_id') : null;

    // Programs for selected organisation (from API)
    const programOptions = (programsByOrganisation || []).map(program => ({
      value: program.program_id,
      label: program.program_name
    }));

    // Selected program (from programmes-by-organisation or allPrograms for edit when programme already set)
    const selectedProgram = (programsByOrganisation && programsByOrganisation.length > 0)
      ? programsByOrganisation.find(p => p.program_id === Number(selectedProgramId))
      : (allPrograms || []).find(p => p.program_id === Number(selectedProgramId));

    const programPlanOptions = selectedProgram && selectedProgram.ProgramPlans
      ? selectedProgram.ProgramPlans.map(plan => ({
        value: plan.plan_id,
        label: plan.plan_name
      }))
      : [];

    return [
      { name: 'first_name', label: 'First Name', type: 'text', isRequired: true },
      { name: 'last_name', label: 'Last Name', type: 'text', isRequired: true },
      {
        name: 'company_id',
        label: 'Organisation',
        type: 'select',
        options: organisationOptions,
        onChange: () => {
          if (formContext) {
            formContext.setValue('program_id', '');
            formContext.setValue('program_plan_id', '');
          }
        }
      },
      {
        name: 'program_id',
        label: 'Program',
        type: 'select',
        options: programOptions,
        disabled: !selectedOrganisationId,
        onChange: () => {
          if (formContext) {
            formContext.setValue('program_plan_id', '');
          }
        }
      },
      {
        name: 'program_plan_id',
        label: 'Providers',
        type: 'select',
        options: programPlanOptions,
        disabled: !selectedProgramId
      },
      { name: 'ahcccs_id', label: 'AHCCCS ID', type: 'text' },
      { name: 'insurance_expiry', label: 'Insurance Expiry', type: 'date' },
      { name: 'birth_date', label: 'Birth Date', type: 'date', maxDate: new Date() },
      { name: 'phone', label: 'Phone', type: 'phone' },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        options: [
          { value: 'Male', label: 'Male' },
          { value: 'Female', label: 'Female' },
          { value: 'Other', label: 'Other' }
        ],
        isRequired: true
      },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ];
  };

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
      { 
        name: 'city', 
        label: 'City', 
        type: 'text', 
        isRequired: true,
        validateOnChange: true,
        helperText: 'Enter an Arizona city. Urban/Rural classification will be set automatically.'
      },
      { 
        name: 'state', 
        label: 'State', 
        type: 'text', 
        isRequired: true,
        validateOnChange: true,
        helperText: 'Enter 2-letter state code (e.g., AZ)',
        placeholder: 'AZ'
      },
      { 
        name: 'zip', 
        label: 'ZIP Code', 
        type: 'text', 
        isRequired: true,
        validateOnChange: true,
        helperText: 'Format: 12345 or 12345-6789'
      },
      { name: 'phone', label: 'Phone Number', type: 'phone' },
      {
        name: 'location_type',
        label: 'Location Type',
        type: 'radio',
        options: [
          { value: 'Urban', label: 'Urban' },
          { value: 'Rural', label: 'Rural' }
        ],
        isRequired: true,
        helperText: 'This is automatically set based on the city, but can be manually changed if needed.'
      },
      {
        name: 'recipient_default',
        label: 'Is Default for Member',
        type: 'checkbox',
        defaultValue: true
      }
    ];
  };

  // Return all the state and functions that components need
  return {
    // State
    members,
    filteredMembers,
    programsByOrganisation,
    allPrograms,
    organisations,
    selectedMember,
    isLoading,
    showAddModal,
    showEditModal,
    showViewModal,
    showPickupModal,
    showDropoffModal,

    // Methods
    setSelectedMember,
    setShowAddModal,
    setShowEditModal,
    setShowViewModal,
    setShowPickupModal,
    setShowDropoffModal,

    // Form methods
    addFormMethods,
    editFormMethods,
    pickupFormMethods,
    dropoffFormMethods,

    // Event handlers
    handleSearchChange,
    handleAddMember,
    handleViewMember,
    handleEditMember,
    handlePickupLocation,
    handleDropoffLocation,
    handleDeleteMember,
    handleAddSubmit,
    handleEditSubmit,
    handlePickupSubmit,
    handleDropoffSubmit,

    // Form field generators
    getMemberFields,
    getLocationFields
  };
};

export default useMemberManagement;