import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormComponent from '@/components/FormComponent';

const TripStatusPopup = ({ onSubmit, onClose, currentStatus }) => {
  const methods = useForm({
    defaultValues: {
      status: currentStatus || ''
    }
  });

  // Status options - matching exactly with the backend ENUM
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

  const statusFields = [
    {
      type: 'select',
      name: 'status',
      label: 'Select Status',
      options: statusOptions
    }
  ];

  const handleSubmit = (data) => {
    onSubmit(data.status);
  };

  return (
    <FormProvider {...methods}>
      <FormComponent 
        fields={statusFields} 
        onSubmit={handleSubmit} 
        submitText="Update Status"
      />
    </FormProvider>
  );
};

export default TripStatusPopup; 