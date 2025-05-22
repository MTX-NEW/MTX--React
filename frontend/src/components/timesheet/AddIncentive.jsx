import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-toastify';
import RightSidebarPopup from '../RightSidebarPopup';
import FormComponent from '../FormComponent';
import { timeSheetApi } from '@/api/baseApi';
import useAuth from '@/hooks/useAuth';

// Presenter component - handles UI rendering
const AddIncentivePresenter = ({ 
  showPopup, 
  setShowPopup, 
  methods, 
  formFields, 
  handleSubmit, 
  isSubmitting, 
  buttonText, 
  buttonIcon 
}) => {
  return (
    <>
      <button 
        className="btn btn-primary me-2"
        onClick={() => setShowPopup(true)}
      >
        <i className={`fas ${buttonIcon} me-1`}></i>
        {buttonText}
      </button>
      
      <RightSidebarPopup
        show={showPopup}
        title="Add Incentive Payment"
        onClose={() => setShowPopup(false)}
        width="400px"
      >
        <FormProvider {...methods}>
          <FormComponent
            fields={formFields}
            onSubmit={handleSubmit}
            submitText="Add Incentive"
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

// Container component - handles business logic and state
const AddIncentive = ({ userId, payPeriod, onSuccess, buttonText = "Add Incentive", buttonIcon = "fa-award" }) => {
  const { user: currentUser } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set default date to the middle of the pay period if available
  let defaultDate = new Date().toISOString().split('T')[0];
  if (payPeriod?.startDate) {
    const startDate = new Date(payPeriod.startDate);
    const middleDate = new Date(startDate);
    middleDate.setDate(startDate.getDate() + 7); // Set to middle of pay period
    defaultDate = middleDate.toISOString().split('T')[0];
  }
  
  // Setup form methods
  const methods = useForm({
    defaultValues: {
      amount: '',
      date: defaultDate,
      notes: ''
    }
  });
  
  // Define form fields for incentive entry
  const formFields = [
    {
      type: 'number',
      name: 'amount',
      label: 'Amount ($)',
      placeholder: 'Enter incentive amount',
      required: true,
      inputProps: {
        min: '0',
        step: '0.01'
      }
    },
    {
      type: 'date',
      name: 'date',
      label: 'Date',
      required: true,
      helperText: 'Date should be within the current pay period'
    },
    {
      type: 'textarea',
      name: 'notes',
      label: 'Notes',
      placeholder: 'Enter reason for the incentive (optional)'
    }
  ];
  
  // Handle form submission
  const handleSubmit = async (data) => {
    if (!userId || !data.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert amount to a float
      const amount = parseFloat(data.amount);
      
      // Create incentive
      await timeSheetApi.createIncentive({
        user_id: userId,
        amount,
        notes: data.notes || 'Incentive payment',
        date: data.date,
        created_by: currentUser?.id || 1 // Default to admin (1) if not available
      });
      
      toast.success('Incentive added successfully');
      setShowPopup(false);
      
      // Reset form
      methods.reset({
        amount: '',
        date: defaultDate,
        notes: ''
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to add incentive: ' + (error.response?.data?.message || error.message || ''));
      console.error('Error adding incentive:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render the presenter component with all necessary props
  return (
    <AddIncentivePresenter
      showPopup={showPopup}
      setShowPopup={setShowPopup}
      methods={methods}
      formFields={formFields}
      handleSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      buttonText={buttonText}
      buttonIcon={buttonIcon}
    />
  );
};

export default AddIncentive; 