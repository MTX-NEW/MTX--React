import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/api/baseApi';
import { toast } from 'react-toastify';

// Create driver panel API service
const driverPanelApi = {
  getTrips: (driverId, status) => {
    const queryParams = status ? `?status=${status}` : '';
    return axios.get(`${API_BASE_URL}/api/driver-panel/trips/${driverId}${queryParams}`);
  },
  getTodayTrips: (driverId) => {
    return axios.get(`${API_BASE_URL}/api/driver-panel/today-trips/${driverId}`);
  },
  getWeeklySchedule: (driverId, startDate) => {
    const queryParams = startDate ? `?startDate=${startDate}` : '';
    return axios.get(`${API_BASE_URL}/api/driver-panel/weekly-schedule/${driverId}${queryParams}`);
  },
  getTripLegDetails: (legId, driverId) => {
    return axios.get(`${API_BASE_URL}/api/driver-panel/trip-leg/${legId}/${driverId}`);
  },
  updateTripLegStatus: (legId, status, driverId) => {
    return axios.put(`${API_BASE_URL}/api/driver-panel/trip-leg/${legId}/status`, { 
      status, 
      driverId 
    });
  },
  updateTripLegOdometer: (legId, driverId, pickup_odometer, dropoff_odometer) => {
    return axios.put(`${API_BASE_URL}/api/driver-panel/trip-leg/${legId}/odometer`, {
      pickup_odometer,
      dropoff_odometer,
      driverId
    });
  },
  updateDriverSignature: (driverId, signature) => {
    return axios.put(`${API_BASE_URL}/api/driver-panel/driver/${driverId}/signature`, {
      signature
    });
  },
  updateTripMemberSignature: (memberId, signature) => {
    return axios.put(`${API_BASE_URL}/api/driver-panel/trip-member/${memberId}/signature`, {
      signature
    });
  },
  getDriverDetails: (driverId) => {
    return axios.get(`${API_BASE_URL}/api/users/${driverId}`);
  }
};

export const useDriverPanel = (driverId) => {
  const [trips, setTrips] = useState([]);
  const [todayTrips, setTodayTrips] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);

  // Fetch driver trips with optional status filter - use useCallback to prevent infinite loop
  const fetchTrips = useCallback(async (status = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await driverPanelApi.getTrips(driverId, status);
      setTrips(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching driver trips:', err);
      setError('Failed to load trips. Please try again later.');
      toast.error('Failed to load trips. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  // Fetch today's trips for driver - use useCallback to prevent infinite loop
  const fetchTodayTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await driverPanelApi.getTodayTrips(driverId);
      
      // Sort trips by scheduled pickup time
      const sortedTrips = response.data.sort((a, b) => {
        if (!a.scheduled_pickup) return 1;
        if (!b.scheduled_pickup) return -1;
        return a.scheduled_pickup.localeCompare(b.scheduled_pickup);
      });
      
      setTodayTrips(sortedTrips);
      return sortedTrips;
    } catch (err) {
      console.error('Error fetching today trips:', err);
      setError('Failed to load today\'s trips. Please try again later.');
      toast.error('Failed to load today\'s trips. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  // Fetch weekly schedule - use useCallback to prevent infinite loop
  const fetchWeeklySchedule = useCallback(async (startDate = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await driverPanelApi.getWeeklySchedule(driverId, startDate);
      setWeeklySchedule(response.data);
      return response.data;
    } catch (err) {
      toast.error('Failed to load weekly schedule. Please try again later.');
      return {};
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  // Fetch trip leg details - use useCallback to prevent infinite loop
  const fetchTripLegDetails = useCallback(async (legId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await driverPanelApi.getTripLegDetails(legId, driverId);
      setCurrentTrip(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching trip details:', err);
      setError('Failed to load trip details. Please try again later.');
      toast.error('Failed to load trip details. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  // Update trip leg status - use useCallback to prevent infinite loop
  const updateTripLegStatus = useCallback(async (legId, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await driverPanelApi.updateTripLegStatus(legId, status, driverId);
      // Update current trip with new status if we're viewing it
      if (currentTrip && currentTrip.leg_id === legId) {
        setCurrentTrip(response.data);
      }
      
      // Show appropriate toast message based on status type
      let message = '';
      let toastType = 'success';
      
      switch(status) {
        case 'Transport confirmed':
          message = 'Trip confirmed successfully';
          break;
        case 'Transport enroute':
          message = 'You are now en route to pickup';
          break;
        case 'Picked up':
          message = 'Passenger picked up successfully. You\'ve been clocked in.';
          break;
        case 'Dropped off':
          message = 'Trip completed successfully. You\'ve been clocked out.';
          break;
        case 'Not going':
          message = 'Trip marked as not going';
          toastType = 'warning';
          break;
        case 'Not available':
          message = 'Passenger marked as not available';
          toastType = 'warning';
          break;
        default:
          message = `Trip status updated to ${status}`;
      }
      
      toast[toastType](message);
      
      return response.data;
    } catch (err) {
      console.error('Error updating trip status:', err);
      setError(err.response?.data?.message || 'Failed to update trip status');
      toast.error(err.response?.data?.message || 'Failed to update trip status');
      return null;
    } finally {
      setLoading(false);
    }
  }, [driverId, currentTrip]);

  // Update trip leg odometer readings - use useCallback to prevent infinite loop
  const updateTripLegOdometer = useCallback(async (legId, pickup_odometer = null, dropoff_odometer = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await driverPanelApi.updateTripLegOdometer(legId, driverId, pickup_odometer, dropoff_odometer);
      // Update current trip with new odometer readings if we're viewing it
      if (currentTrip && currentTrip.leg_id === legId) {
        setCurrentTrip(response.data);
      }
      
      // Show appropriate toast message
      if (pickup_odometer !== null) {
        toast.success('Pickup odometer reading updated successfully');
      } else if (dropoff_odometer !== null) {
        toast.success('Dropoff odometer reading updated successfully');
      } else {
        toast.success('Odometer reading updated successfully');
      }
      
      return response.data;
    } catch (err) {
      console.error('Error updating odometer readings:', err);
      setError(err.response?.data?.message || 'Failed to update odometer readings');
      toast.error(err.response?.data?.message || 'Failed to update odometer readings');
      return null;
    } finally {
      setLoading(false);
    }
  }, [driverId, currentTrip]);

  // Update driver signature
  const updateDriverSignature = useCallback(async (signature) => {
    try {
      setLoading(true);
      setError(null);
      await driverPanelApi.updateDriverSignature(driverId, signature);
      toast.success('Driver signature updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating driver signature:', err);
      setError(err.response?.data?.message || 'Failed to update driver signature');
      toast.error(err.response?.data?.message || 'Failed to update driver signature');
      return false;
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  // Update trip member signature
  const updateTripMemberSignature = useCallback(async (memberId, signature) => {
    try {
      setLoading(true);
      setError(null);
      await driverPanelApi.updateTripMemberSignature(memberId, signature);
      toast.success('Trip member signature updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating trip member signature:', err);
      setError(err.response?.data?.message || 'Failed to update trip member signature');
      toast.error(err.response?.data?.message || 'Failed to update trip member signature');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch driver details - use useCallback to prevent infinite loop
  const fetchDriverDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await driverPanelApi.getDriverDetails(driverId);
      setDriverDetails(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching driver details:', err);
      setError('Failed to load driver details. Please try again later.');
      toast.error('Failed to load driver details. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  return {
    trips,
    todayTrips,
    weeklySchedule,
    currentTrip,
    driverDetails,
    loading,
    error,
    fetchTrips,
    fetchTodayTrips,
    fetchWeeklySchedule,
    fetchTripLegDetails,
    updateTripLegStatus,
    updateTripLegOdometer,
    updateDriverSignature,
    updateTripMemberSignature,
    fetchDriverDetails
  };
}; 