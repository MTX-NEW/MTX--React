import { useState } from 'react';
import { tripApi } from '../api/baseApi';
import { toast } from 'react-toastify';
import useAuth from './useAuth';

export const useTrip = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trips, setTrips] = useState([]);
  const { user } = useAuth();

  // Fetch all trips
  const fetchTrips = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Pass filters to the API to implement backend filtering
      const response = await tripApi.getAll(filters);
      console.log('tripApi.getAll Response:', response);
      
      // Update trips state with data from API
      setTrips(response.data || []);
      return response.data || [];
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips. Please try again.');
      toast.error("Failed to load trips");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific trip
  const fetchTrip = async (tripId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tripApi.getOne(tripId);
      console.log('tripApi.getOne Response:', response);
      return response.data;
    } catch (err) {
      console.error('Error fetching trip:', err);
      setError('Failed to load trip details. Please try again.');
      toast.error("Failed to load trip details");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new trip with legs
  const createTrip = async (tripData) => {
    
    setLoading(true);
    setError(null);
    try {
      // Add the current user ID to the trip data
      const dataWithUser = {
        ...tripData,
        created_by: user?.id
      };
      
      // Process schedule_days from array to string if it's an array
      if (dataWithUser.schedule_type === 'Blanket' && Array.isArray(dataWithUser.schedule_days)) {
        dataWithUser.schedule_days = dataWithUser.schedule_days.join(',');
      }
      
      // Extract special instruction fields from the main tripData object
      const specialInstructionFields = [
        'mobility_type', 'rides_alone', 'spanish_speaking', 'males_only',
        'females_only', 'special_assist', 'pickup_time_exact', 'stay_with_client',
        'car_seat', 'extra_person', 'call_first', 'knock', 'van', 'sedan'
      ];
      
      // Create the special_instructions object with the extracted fields
      const special_instructions = {};
      specialInstructionFields.forEach(field => {
        if (field in dataWithUser) {
          special_instructions[field] = dataWithUser[field];
          // Remove from main object to avoid duplication
          delete dataWithUser[field];
        }
      });
      
      // Add the special_instructions object to the data
      dataWithUser.special_instructions = special_instructions;
      
      console.log("Creating trip:", dataWithUser);
      const response = await tripApi.create(dataWithUser);
      
      // Update local state
      setTrips(prevTrips => [...prevTrips, response.data]);

      toast.success("Trip created successfully");
      return response.data;
    } catch (err) {
      console.error('Error creating trip:', err);
      setError('Failed to create trip. Please try again.');
      toast.error("Failed to create trip");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing trip with legs
  const updateTrip = async (tripId, tripData) => {
    setLoading(true);
    setError(null);
    try {
      // Process schedule_days from array to string if it's an array
      if (tripData.schedule_type === 'Blanket' && Array.isArray(tripData.schedule_days)) {
        tripData.schedule_days = tripData.schedule_days.join(',');
      }
      
      // Extract special instruction fields from the main tripData object
      const specialInstructionFields = [
        'mobility_type', 'rides_alone', 'spanish_speaking', 'males_only',
        'females_only', 'special_assist', 'pickup_time_exact', 'stay_with_client',
        'car_seat', 'extra_person', 'call_first', 'knock', 'van', 'sedan'
      ];
      
      // Create the special_instructions object with the extracted fields
      const special_instructions = {};
      specialInstructionFields.forEach(field => {
        if (field in tripData) {
          special_instructions[field] = tripData[field];
          // Remove from main object to avoid duplication
          delete tripData[field];
        }
      });
      
      // Add the special_instructions object to the data
      tripData.special_instructions = special_instructions;
      
      const response = await tripApi.update(tripId, tripData);
      
      // Update local state
      setTrips(prevTrips => 
        prevTrips.map(trip => 
          trip.trip_id === tripId ? { ...trip, ...response.data } : trip
        )
      );

      toast.success("Trip updated successfully");
      return response.data;
    } catch (err) {
      console.error('Error updating trip:', err);
      setError('Failed to update trip. Please try again.');
      toast.error("Failed to update trip");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a trip
  const deleteTrip = async (tripId) => {
    setLoading(true);
    setError(null);
    try {
      await tripApi.delete(tripId);
      
      // Update local state
      setTrips(prevTrips => prevTrips.filter(trip => trip.trip_id !== tripId));

      toast.success("Trip deleted successfully");
      return true;
    } catch (err) {
     // console.error('Error deleting trip:', err);
      //setError('Failed to delete trip. Please try again.');
      toast.error("Failed to delete trip");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    trips,
    fetchTrips,
    fetchTrip,
    createTrip,
    updateTrip,
    deleteTrip,
    setTrips
  };
}; 