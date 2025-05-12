import { useState } from 'react';
import { tripLegApi } from '../api/baseApi';
import { toast } from 'react-toastify';

export const useTripLeg = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tripLegs, setTripLegs] = useState([]);

  // Fetch legs for a specific trip
  const fetchTripLegs = async (tripId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tripLegApi.getByTrip(tripId);
      setTripLegs(response.data || []);
      return response.data;
    } catch (err) {
      console.error('Error fetching trip legs:', err);
      setError('Failed to load trip legs. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new trip leg
  const createTripLeg = async (legData) => {
    setLoading(true);
    setError(null);
    try {
      // Remove any fields the backend will handle (e.g., primary key, timestamps, metrics)
      const payload = { ...legData };
      delete payload.leg_id;
      delete payload.created_at;
      delete payload.updated_at;
      delete payload.pickup_odometer;
      delete payload.dropoff_odometer;
      delete payload.leg_distance;
      const response = await tripLegApi.create(payload);
      
      // Update local state if needed
      setTripLegs(prevLegs => [...prevLegs, response.data]);
      
      return response.data;
    } catch (err) {
      console.error('Error creating trip leg:', err);
      setError('Failed to create trip leg. Please try again.');
      toast.error('Failed to create trip leg');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a trip leg
  const updateTripLeg = async (legId, legData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tripLegApi.update(legId, legData);
      
      // Update local state
      setTripLegs(prevLegs => 
        prevLegs.map(leg => 
          leg.leg_id === legId ? { ...leg, ...response.data } : leg
        )
      );
      
      return response.data;
    } catch (err) {
      console.error('Error updating trip leg:', err);
      setError('Failed to update trip leg. Please try again.');
      toast.error('Failed to update trip leg');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update leg status
  const updateLegStatus = async (legId, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tripLegApi.updateStatus(legId, status);
      
      // Update local state
      setTripLegs(prevLegs => 
        prevLegs.map(leg => 
          leg.leg_id === legId ? { ...leg, status } : leg
        )
      );
      
      return response.data;
    } catch (err) {
      console.error('Error updating leg status:', err);
      setError('Failed to update leg status. Please try again.');
      toast.error('Failed to update leg status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Assign driver to a leg
  const assignLegDriver = async (legId, driverId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tripLegApi.assignDriver(legId, driverId);
      
      // Update local state
      setTripLegs(prevLegs => 
        prevLegs.map(leg => 
          leg.leg_id === legId ? { ...leg, driver_id: driverId } : leg
        )
      );
      
      return response.data;
    } catch (err) {
      console.error('Error assigning driver:', err);
      setError('Failed to assign driver. Please try again.');
      toast.error('Failed to assign driver');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a trip leg
  const deleteTripLeg = async (legId) => {
    setLoading(true);
    setError(null);
    try {
      await tripLegApi.delete(legId);
      
      // Update local state
      setTripLegs(prevLegs => prevLegs.filter(leg => leg.leg_id !== legId));
      
      return true;
    } catch (err) {
      console.error('Error deleting trip leg:', err);
      setError('Failed to delete trip leg. Please try again.');
      toast.error('Failed to delete trip leg');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    tripLegs,
    fetchTripLegs,
    createTripLeg,
    updateTripLeg,
    updateLegStatus,
    assignLegDriver,
    deleteTripLeg
  };
}; 