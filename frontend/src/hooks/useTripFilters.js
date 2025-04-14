import { useState, useMemo } from 'react';
import dayjs from 'dayjs';

const useTripFilters = (trips) => {
  // Current date for default filter
  const today = dayjs().format('YYYY-MM-DD');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ startDate: today, endDate: null });
  const [statusFilter, setStatusFilter] = useState('');
  const [tripTypeFilter, setTripTypeFilter] = useState('');

  // Extract available cities from trip data for filtering
  const availableCities = useMemo(() => {
    const cities = new Set();
    
    trips.forEach(trip => {
      if (trip.legs) {
        trip.legs.forEach(leg => {
          if (leg.pickupLocation?.city) {
            cities.add(leg.pickupLocation.city);
          }
          if (leg.dropoffLocation?.city) {
            cities.add(leg.dropoffLocation.city);
          }
        });
      }
    });
    
    return Array.from(cities).sort();
  }, [trips]);

  // Apply filters to trips
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      // Apply search query filter
      if (searchQuery && !trip.trip_id.toString().includes(searchQuery) && 
          !(trip.TripMember && (`${trip.TripMember.first_name} ${trip.TripMember.last_name}`).toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Apply city filter
      if (cityFilter && !(
        (trip.legs?.some(leg => leg.pickupLocation?.city === cityFilter)) ||
        (trip.legs?.some(leg => leg.dropoffLocation?.city === cityFilter))
      )) {
        return false;
      }
      
      // Apply date filter
      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = dateFilter.endDate 
          ? new Date(dateFilter.endDate)
          : new Date(dateFilter.startDate);
        endDate.setHours(23, 59, 59, 999);
        
        const tripDate = trip.start_date ? new Date(trip.start_date) : null;
        
        if (!tripDate || tripDate < startDate || tripDate > endDate) {
          return false;
        }
      }
      
      // Apply status filter
      if (statusFilter && trip.legs) {
        const hasLegWithStatus = trip.legs.some(leg => leg.status === statusFilter);
        if (!hasLegWithStatus) {
          return false;
        }
      }
      
      // Apply trip type filter
      if (tripTypeFilter) {
        // For round trip
        if (tripTypeFilter === "Round Trip" && !trip.is_round_trip) {
          return false;
        }
        
        // For multi-stop trips (those with more than 1 leg)
        if (tripTypeFilter === "Multi-stop" && 
            (!trip.legs || trip.legs.length <= 1)) {
          return false;
        }
        
        // For standard trips (1 leg, not round trip)
        if (tripTypeFilter === "Standard" && 
            (trip.is_round_trip || (trip.legs && trip.legs.length > 1))) {
          return false;
        }
      }
      
      return true;
    });
  }, [trips, searchQuery, cityFilter, dateFilter, statusFilter, tripTypeFilter]);

  // Clear filters function
  const clearFilters = () => {
    setCityFilter('');
    setDateFilter({ startDate: today, endDate: null });
    setStatusFilter('');
    setTripTypeFilter('');
  };

  return {
    searchQuery,
    setSearchQuery,
    cityFilter,
    setCityFilter,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    tripTypeFilter,
    setTripTypeFilter,
    availableCities,
    filteredTrips,
    clearFilters
  };
};

export default useTripFilters; 