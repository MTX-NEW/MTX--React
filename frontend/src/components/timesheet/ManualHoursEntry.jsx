import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-toastify';
import RightSidebarPopup from '../RightSidebarPopup';
import FormComponent from '../FormComponent';
import { timeSheetApi } from '@/api/baseApi';

const ManualHoursEntry = ({ userId, onSuccess }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Setup form methods
  const methods = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      clock_in: null,
      clock_out: null,
      total_hours: '',
      hour_type: 'regular',
      rate: '',
      notes: ''
    }
  });
  
  // Define form fields for manual hours entry
  const formFields = [
    {
      type: 'date',
      name: 'date',
      label: 'Date',
      required: true
    },
    {
      type: 'time',
      name: 'clock_in',
      label: 'Clock In Time',
      required: true
    },
    {
      type: 'time',
      name: 'clock_out',
      label: 'Clock Out Time',
      required: true
    },
    {
      type: 'number',
      name: 'total_hours',
      label: 'Total Hours',
      placeholder: 'Enter total hours',
      required: true,
      helperText: 'Example: 8.5 for 8 hours and 30 minutes'
    },
    {
      type: 'select',
      name: 'hour_type',
      label: 'Hour Type',
      options: [
        { value: 'regular', label: 'Regular' },
        { value: 'driving', label: 'Driving' },
        { value: 'over_time', label: 'Overtime' },
        { value: 'administrative', label: 'Administrative' },
        { value: 'incentive', label: 'Incentive' }
      ],
      required: true
    },
    {
      type: 'number',
      name: 'rate',
      label: 'Hourly Rate',
      placeholder: 'Enter hourly rate',
      helperText: 'Leave blank to use default rate'
    },
    {
      type: 'textarea',
      name: 'notes',
      label: 'Notes',
      placeholder: 'Enter any additional information'
    }
  ];
  
  // Handle form submission
  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Format time values
      const clockInDate = new Date(data.date);
      const clockOutDate = new Date(data.date);
      
      // Parse clock in time (HH:mm)
      if (data.clock_in) {
        const [hours, minutes] = data.clock_in.split(':');
        clockInDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      
      // Parse clock out time (HH:mm)
      if (data.clock_out) {
        const [hours, minutes] = data.clock_out.split(':');
        clockOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      
      // Prepare data for API call
      const timesheetData = {
        user_id: userId,
        date: data.date,
        clock_in: clockInDate.toISOString(),
        clock_out: clockOutDate.toISOString(),
        total_hours: parseFloat(data.total_hours),
        hour_type: data.hour_type,
        rate: data.rate ? parseFloat(data.rate) : undefined,
        notes: data.notes,
        status: 'submitted'
      };
      
      // Call API to create timesheet entry
      await timeSheetApi.create(timesheetData);
      
      toast.success('Timesheet hours added successfully');
      setShowPopup(false);
      
      // Reset form
      methods.reset({
        date: new Date().toISOString().split('T')[0],
        clock_in: null,
        clock_out: null,
        total_hours: '',
        hour_type: 'regular',
        rate: '',
        notes: ''
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding timesheet hours:', error);
      toast.error(error.response?.data?.message || 'Failed to add timesheet hours');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <button 
        className="btn btn-primary"
        onClick={() => setShowPopup(true)}
      >
        <i className="fas fa-plus-circle me-2"></i>
        Add Manual Time
      </button>
      
      <RightSidebarPopup
        show={showPopup}
        title="Add Timesheet Hours Manually"
        onClose={() => setShowPopup(false)}
        width="400px"
      >
        <FormProvider {...methods}>
          <FormComponent
            fields={formFields}
            onSubmit={handleSubmit}
            submitText="Add Hours"
            isSubmitting={isSubmitting}
            additionalButtons={[
              {
                text: 'Cancel',
                className: 'btn btn-outline-secondary',
                onClick: () => setShowPopup(false)
              }
            ]}
          />
        </FormProvider>
      </RightSidebarPopup>
    </>
  );
};

export default ManualHoursEntry; 