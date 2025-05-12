import React, { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import FormComponent from '../../components/FormComponent';
import LocationAutocomplete from '@/components/common/LocationAutocomplete';
import { useTripLeg } from '../../hooks/useTripLeg';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import '../../assets/RightSidebarPopup.css';

const TripLegSidebar = ({ 
  isOpen, 
  onClose, 
  trip, 
  onSubmit 
}) => {
  const { createTripLeg } = useTripLeg();
  
  // Extract member locations from trip data
  const memberLocations = useMemo(() => {
    if (!trip?.TripMember) return [];
    
    const locations = [];
    
    // Add pickup location if exists
    if (trip.TripMember.memberPickupLocation) {
      locations.push({
        ...trip.TripMember.memberPickupLocation,
        location_type: 'pickup'
      });
    }
    
    // Add dropoff location if exists
    if (trip.TripMember.memberDropoffLocation) {
      locations.push({
        ...trip.TripMember.memberDropoffLocation,
        location_type: 'dropoff'
      });
    }
    
    // Add locations from existing legs
    if (trip.legs && trip.legs.length > 0) {
      trip.legs.forEach(leg => {
        // Add pickup location if not already included
        if (leg.pickupLocation && !locations.some(loc => loc.location_id === leg.pickupLocation.location_id)) {
          locations.push({
            ...leg.pickupLocation,
            location_type: 'pickup'
          });
        }
        
        // Add dropoff location if not already included
        if (leg.dropoffLocation && !locations.some(loc => loc.location_id === leg.dropoffLocation.location_id)) {
          locations.push({
            ...leg.dropoffLocation,
            location_type: 'dropoff'
          });
        }
      });
    }
    
    return locations;
  }, [trip]);
  
  const formMethods = useForm({
    defaultValues: {
      pickup_location: '',
      dropoff_location: '',
      scheduled_pickup: dayjs().format('HH:mm'),
      scheduled_dropoff: dayjs().add(1, 'hour').format('HH:mm'),
      sequence: 0,
      status: 'Scheduled',
      trip_id: trip?.trip_id || ''
    }
  });

  // Calculate the next sequence number
  useEffect(() => {
    if (trip && trip.legs) {
      let nextSequence = 1;
      if (trip.legs.length > 0) {
        nextSequence = Math.max(...trip.legs.map(leg => leg.sequence || 0)) + 1;
      }
      formMethods.setValue('sequence', nextSequence);
      formMethods.setValue('trip_id', trip.trip_id);
    }
  }, [trip, formMethods]);

  // Status options
  const statusOptions = [
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Attention', label: 'Attention' },
    { value: 'Assigned', label: 'Assigned' },
    { value: 'Transport confirmed', label: 'Transport confirmed' },
    { value: 'Transport enroute', label: 'Transport enroute' },
    { value: 'Picked up', label: 'Picked up' },
    { value: 'Not going', label: 'Not going' },
    { value: 'Not available', label: 'Not available' },
    { value: 'Dropped off', label: 'Dropped off' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  // Render location fields
  const renderLocationField = (locationType) => {
    const fieldName = `${locationType}_location`;
    const label = locationType === 'pickup' ? 'Pickup Location' : 'Dropoff Location';
    
    return (
      <LocationAutocomplete
        name={fieldName}
        label={label}
        locations={memberLocations}
        required={true}
        isLoading={false}
      />
    );
  };

  // Form fields
  const legFields = [
    {
      type: 'custom',
      name: 'pickup_location',
     
      render: () => renderLocationField('pickup')
    },
    {
      type: 'custom',
      name: 'dropoff_location',
   
      render: () => renderLocationField('dropoff')
    },
    {
      type: 'time',
      name: 'scheduled_pickup',
      label: 'Scheduled Pickup Time'
    },
    {
      type: 'time',
      name: 'scheduled_dropoff',
      label: 'Scheduled Dropoff Time'
    },
    {
      type: 'select',
      name: 'status',
      label: 'Status',
      options: statusOptions
    },
    {
      type: 'number',
      name: 'sequence',
      label: 'Sequence',
      inputProps: {
        min: 1
      },
      helperText: 'The order of this leg in the trip.'
    },
    {
      type: 'hidden',
      name: 'trip_id'
    }
  ];

  // Handle form submission
  const handleSubmit = async (data) => {
    try {
      // Pass the data to the parent component to handle the API call
      // instead of calling createTripLeg directly
      await onSubmit(data);
      
      // Remove the toast since the parent will handle notifications
      formMethods.reset();
      onClose();
    } catch (err) {
      console.error('Error adding leg:', err);
      toast.error('Failed to add leg. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="popup-overlay" onClick={onClose}></div>
      <div className="right-sidebar-popup">
        <div className="popup-header">
          <h2>Add Trip Leg</h2>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="popup-content">
          <FormProvider {...formMethods}>
            <FormComponent
              fields={legFields}
              onSubmit={handleSubmit}
              submitText="Add Leg"
            />
          </FormProvider>
        </div>
      </div>
    </>
  );
};

export default TripLegSidebar; 