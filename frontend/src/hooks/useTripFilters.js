import { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';

const useTripFilters = (trips) => {
  // Load initial filter states from localStorage or use defaults
  const loadFilterFromStorage = (key, defaultValue) => {
    const storedValue = localStorage.getItem(`tripFilters_${key}`);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  };

  // Initialize filter states from localStorage
  const [searchQuery, setSearchQuery] = useState(loadFilterFromStorage('searchQuery', ''));
  const [cityFilter, setCityFilter] = useState(loadFilterFromStorage('cityFilter', ''));
  const [dateFilter, setDateFilter] = useState(loadFilterFromStorage('dateFilter', { startDate: null, endDate: null }));
  const [statusFilter, setStatusFilter] = useState(loadFilterFromStorage('statusFilter', ''));
  const [tripTypeFilter, setTripTypeFilter] = useState(loadFilterFromStorage('tripTypeFilter', ''));
  const [driverFilter, setDriverFilter] = useState(loadFilterFromStorage('driverFilter', ''));
  const [programFilter, setProgramFilter] = useState(loadFilterFromStorage('programFilter', ''));

  // Save filter changes to localStorage
  useEffect(() => {
    localStorage.setItem('tripFilters_searchQuery', JSON.stringify(searchQuery));
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('tripFilters_cityFilter', JSON.stringify(cityFilter));
  }, [cityFilter]);

  useEffect(() => {
    localStorage.setItem('tripFilters_dateFilter', JSON.stringify(dateFilter));
  }, [dateFilter]);

  useEffect(() => {
    localStorage.setItem('tripFilters_statusFilter', JSON.stringify(statusFilter));
  }, [statusFilter]);

  useEffect(() => {
    localStorage.setItem('tripFilters_tripTypeFilter', JSON.stringify(tripTypeFilter));
  }, [tripTypeFilter]);

  useEffect(() => {
    localStorage.setItem('tripFilters_driverFilter', JSON.stringify(driverFilter));
  }, [driverFilter]);

  useEffect(() => {
    localStorage.setItem('tripFilters_programFilter', JSON.stringify(programFilter));
  }, [programFilter]);

  // Extract available cities from trip data for filter options
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

  // Extract available drivers from trip data for filter options
  const availableDrivers = useMemo(() => {
    const drivers = new Map();
    
    trips.forEach(trip => {
      if (trip.legs) {
        trip.legs.forEach(leg => {
          if (leg.driver && leg.driver_id) {
            drivers.set(leg.driver_id, `${leg.driver.first_name} ${leg.driver.last_name}`);
          }
        });
      }
    });
    
    return Array.from(drivers).map(([id, name]) => ({ id, name }));
  }, [trips]);

  // Extract available programs from trip data for filter options
  const availablePrograms = useMemo(() => {
    const programs = new Map();
    
    trips.forEach(trip => {
      if (trip.TripMember?.Program && trip.TripMember.program_id) {
        programs.set(trip.TripMember.program_id, trip.TripMember.Program.program_name);
        }
    });
    
    return Array.from(programs).map(([id, name]) => ({ id, name }));
  }, [trips]);

  // Clear filters function - also clear from localStorage
  const clearFilters = () => {
    setCityFilter('');
    setDateFilter({ startDate: null, endDate: null });
    setStatusFilter('');
    setTripTypeFilter('');
    setDriverFilter('');
    setProgramFilter('');
    
    // Clear localStorage items
    localStorage.removeItem('tripFilters_cityFilter');
    localStorage.removeItem('tripFilters_dateFilter');
    localStorage.removeItem('tripFilters_statusFilter');
    localStorage.removeItem('tripFilters_tripTypeFilter');
    localStorage.removeItem('tripFilters_driverFilter');
    localStorage.removeItem('tripFilters_programFilter');
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
    driverFilter,
    setDriverFilter,
    programFilter,
    setProgramFilter,
    availableCities,
    availableDrivers,
    availablePrograms,
    clearFilters
  };
};

export default useTripFilters; 