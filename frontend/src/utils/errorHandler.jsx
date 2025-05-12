// src/utils/errorHandler.js
import { toast } from 'react-toastify';

export const handleApiError = (error) => {
  const defaultMessage = 'An unexpected error occurred';
  const message = error.response?.data?.message || defaultMessage;
  const errors = error.response?.data?.errors;

  if (errors) {
    errors.forEach(err => 
      toast.error(`${err.field ? `${err.field}: ` : ''}${err.message}`)
    );
  } else {
    toast.error(message);
  }

  throw error;
};