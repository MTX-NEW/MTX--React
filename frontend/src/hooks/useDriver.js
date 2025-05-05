import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { driverApi, tripLegApi } from '@/api/baseApi';

export const useDriver = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await driverApi.getAll();
      
      // Format driver data if needed
      const formattedDrivers = response.data.map(driver => ({
        id: driver.id,
        first_name: driver.first_name,
        last_name: driver.last_name,
        email: driver.email,
        phone: driver.phone,
        status: driver.status,
        user_type: driver.UserType,
        name: `${driver.first_name} ${driver.last_name}`
      }));
      
      setDrivers(formattedDrivers || []);
      return formattedDrivers;
    } catch (err) {
      console.error('Error fetching drivers:', err);
      // More detailed error message
      const errorMsg = err.response?.status === 404 
        ? 'Driver API endpoint not found. Please check server configuration.' 
        : 'Failed to fetch drivers. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const assignDriverToLeg = async (legId, driverId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tripLegApi.assignDriver(legId, driverId);
      
      // Refresh drivers list after assignment
      fetchDrivers();
      
      return response.data;
    } catch (err) {
      // Extract backend error message or use fallback
      const backendMessage = err.response?.data?.message;
      const errorMsg = backendMessage || 'Failed to assign driver. Please try again.';
      setError(errorMsg);
      // Propagate the error message to the caller
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDrivers();
  }, []);

  return {
    drivers,
    loading,
    error,
    fetchDrivers,
    assignDriverToLeg
  };
};

export default useDriver; 