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
      console.log('Fetching drivers from driverApi...');
      const response = await driverApi.getAll();
      console.log('Drivers data received:', response.data);
      
      // Format driver data if needed
      const formattedDrivers = response.data.map(driver => ({
        id: driver.id,
        first_name: driver.first_name,
        last_name: driver.last_name,
        email: driver.email,
        phone: driver.phone,
        status: driver.status,
        user_type: driver.UserType
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
      console.log('Assigning driver to leg:', legId, driverId);
      const response = await tripLegApi.assignDriver(legId, driverId);
      toast.success('Driver assigned successfully');
      
      // Refresh drivers list after assignment
      fetchDrivers();
      
      return response.data;
    } catch (err) {
      console.error('Error assigning driver:', err);
      const errorMsg = 'Failed to assign driver. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
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