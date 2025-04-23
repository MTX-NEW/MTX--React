import React, { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import FormComponent from '../../components/FormComponent';
import { useTripLeg } from '../../hooks/useTripLeg';
import { useResource } from '../../hooks/useResource';
import { tripLocationApi } from '../../api/baseApi';
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
  const { data: locations, loading: loadingLocations } = useResource(tripLocationApi);
  
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

  // Format locations for dropdown
  const locationOptions = useMemo(() => {
    if (!locations) return [];
    return locations.map(location => ({
      value: location.location_id.toString(),
      label: `${location.street_address}, ${location.city}, ${location.state} ${location.zip}${location.phone ? ` • Ph: ${location.phone}` : ''}`
    }));
  }, [locations]);

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

  // Form fields
  const legFields = [
    {
      type: 'autocomplete',
      name: 'pickup_location',
      label: 'Pickup Location',
      options: locationOptions,
      placeholder: 'Select a pickup location',
      autocompleteProps: {
        loading: loadingLocations,
        disabled: loadingLocations
      }
    },
    {
      type: 'autocomplete',
      name: 'dropoff_location',
      label: 'Dropoff Location',
      options: locationOptions,
      placeholder: 'Select a dropoff location',
      autocompleteProps: {
        loading: loadingLocations,
        disabled: loadingLocations
      }
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
      // Create the trip leg and get the response data
      const newLeg = await createTripLeg(data);
      
      toast.success('New leg added successfully');
      formMethods.reset();
      
      // Pass the created leg data to the onSubmit callback
      if (onSubmit) onSubmit(newLeg);
      
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