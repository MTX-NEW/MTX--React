import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormComponent from '@/components/FormComponent';

const TripTimePopup = ({ onSubmit, onClose, timeType, currentTime }) => {
  const methods = useForm({
    defaultValues: {
      time: formatTimeForInput(currentTime) || ''
    }
  });

  // Format time from DB format (HH:MM:SS) to input format (HH:MM)
  function formatTimeForInput(time) {
    if (!time) return '';
    
    // If time already has HH:MM format, return as is
    if (time.split(':').length === 2) return time;
    
    // If time has HH:MM:SS format, remove seconds
    if (time.split(':').length === 3) {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    }
    
    return time;
  }

  let title;
  switch (timeType) {
    case 'R/U':
      title = 'Requested Pickup Time';
      break;
    case 'P/U':
      title = 'Actual Pickup Time';
      break;
    case 'APPT':
      title = 'Appointment Time';
      break;
    case 'D/O':
      title = 'Dropoff Time';
      break;
    case 'R/U2':
      title = 'Round Trip - Requested Pickup Time';
      break;
    case 'P/U2':
      title = 'Round Trip - Actual Pickup Time';
      break;
    case 'ED/O2':
      title = 'Round Trip - Expected Dropoff Time';
      break;
    case 'D/O2':
      title = 'Round Trip - Actual Dropoff Time';
      break;
    default:
      title = 'Update Time';
  }

  const timeFields = [
    {
      type: 'time',
      name: 'time',
      label: title
    }
  ];

  const handleSubmit = (data) => {
    // Ensure time is properly formatted before passing to parent
    let formattedTime = data.time;
    
    // If time is provided and doesn't already have seconds
    if (formattedTime && formattedTime.split(':').length === 2) {
      console.log('Time before formatting:', formattedTime);
      // Add seconds for database
      // formattedTime = `${formattedTime}:00`;
      // Actually, we'll handle this in the parent component to ensure consistency
    }
    
    console.log('Submitting time:', formattedTime);
    onSubmit(formattedTime);
  };

  return (
    <FormProvider {...methods}>
      <FormComponent 
        fields={timeFields} 
        onSubmit={handleSubmit} 
        submitText="Update Time"
      />
    </FormProvider>
  );
};

export default TripTimePopup; 