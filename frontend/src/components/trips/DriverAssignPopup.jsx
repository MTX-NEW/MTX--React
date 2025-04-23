import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormComponent from '@/components/FormComponent';
import { useDriver } from '@/hooks/useDriver';
import { toast } from 'react-toastify';

const DriverAssignPopup = ({ onSubmit, onClose, legId, currentDriverId }) => {
  const { drivers, loading, error, fetchDrivers } = useDriver();
  const [driverOptions, setDriverOptions] = useState([]);

  const methods = useForm({
    defaultValues: {
      driver_id: currentDriverId || ''
    }
  });

  // Convert drivers to options format when drivers data changes
  useEffect(() => {
    console.log('Converting drivers to options:', drivers);
    if (drivers && drivers.length > 0) {
      const options = drivers.map(driver => ({
        value: driver.id,
        label: `${driver.first_name} ${driver.last_name} - #${driver.id}`
      }));
      
      // Add empty option for clearing assignment
      options.unshift({ value: '', label: 'None (Clear assignment)' });
      
      setDriverOptions(options);
    } else {
      console.log('No drivers found or drivers array is empty');
      setDriverOptions([{ value: '', label: 'No drivers available' }]);
    }
  }, [drivers]);

  const driverFields = [
    {
      type: 'select',
      name: 'driver_id',
      label: 'Assign Driver',
      options: driverOptions,
      helperText: error ? 'Error loading drivers. Please try again.' : ''
    }
  ];

  const handleSubmit = (data) => {
    console.log('Submitting driver assignment:', { legId, driverId: data.driver_id });
    // Convert empty string to null for the API
    const driverId = data.driver_id === '' ? null : data.driver_id;
    onSubmit(legId, driverId);
  };

  return (
    <div className="driver-assign-popup">
      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading drivers...</span>
          </div>
          <p className="mt-2">Loading available drivers...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <p>Error loading drivers: {error}</p>
          <button 
            className="btn btn-outline-danger btn-sm" 
            onClick={() => fetchDrivers()}
          >
            Retry
          </button>
        </div>
      ) : (
        <FormProvider {...methods}>
          <FormComponent 
            fields={driverFields} 
            onSubmit={handleSubmit} 
            submitText="Assign Driver"
            cancelText="Cancel"
            onCancel={onClose}
          />
        </FormProvider>
      )}
    </div>
  );
};

export default DriverAssignPopup; 