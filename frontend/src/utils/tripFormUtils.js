/**
 * Helper function to format time
 * @param {string} timeString - The time string in HH:MM format
 * @returns {string} - Time string in HH:MM:00 format for database
 */
export const formatTimeForDB = (timeString) => {
  if (!timeString) return null;
  return `${timeString}:00`; // Add seconds for TIME format
};

/**
 * Helper function to combine date and time
 * @param {string} dateString - The date string in YYYY-MM-DD format
 * @param {string} timeString - The time string in HH:MM format
 * @param {boolean} timeOnly - Whether to return time only or full datetime
 * @returns {string|null} - Combined ISO datetime string or HH:MM:00 time string if timeOnly=true
 */
export const combineDateAndTime = (dateString, timeString, timeOnly = false) => {
  if (!timeString) return null;
  
  if (timeOnly) {
    return formatTimeForDB(timeString);
  }
  
  const [hours, minutes] = timeString.split(':');
  const date = new Date(dateString);
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  return date.toISOString();
};

/**
 * Process form data to prepare it for API submission
 * @param {Object} data - The raw form data
 * @returns {Object} - Processed data ready for API submission
 */
export const processTripFormData = (data) => {
  // Create a copy to avoid mutating the original data
  const processedData = {
    ...data,
    created_by: 9 // TEMP FIX: Replace with actual user ID in production (was 1)
  };
  
  // Convert values
  if (processedData.schedule_days && Array.isArray(processedData.schedule_days)) {
    processedData.schedule_days = processedData.schedule_days.join(',');
  }
  
  // Convert trip_type from UI format to database format
  if (processedData.is_one_way === true || processedData.is_one_way === "true") {
    processedData.trip_type = 'Standard';
  } else if (processedData.is_one_way === false || processedData.is_one_way === "false") {
    processedData.trip_type = 'Round Trip';
  } else if (processedData.is_one_way === 'multiple') {
    processedData.trip_type = 'Multi-stop';
  }
  delete processedData.is_one_way; // Remove the UI-specific field
  
  // Create special instructions object from checkbox arrays
  const special_instructions = {
    // Get mobility type from special_instructions object
    mobility_type: processedData.special_instructions?.mobility_type || 'Ambulatory',
    // Client requirements
    rides_alone: processedData.client_requirements?.some(item => item.value === 'rides_alone') || false,
    spanish_speaking: processedData.client_requirements?.some(item => item.value === 'spanish_speaking') || false,
    males_only: processedData.client_requirements?.some(item => item.value === 'males_only') || false,
    females_only: processedData.client_requirements?.some(item => item.value === 'females_only') || false,
    special_assist: processedData.client_requirements?.some(item => item.value === 'special_assist') || false,
    pickup_time_exact: processedData.client_requirements?.some(item => item.value === 'pickup_time_exact') || false,
    stay_with_client: processedData.client_requirements?.some(item => item.value === 'stay_with_client') || false,
    car_seat: processedData.client_requirements?.some(item => item.value === 'car_seat') || false,
    extra_person: processedData.client_requirements?.some(item => item.value === 'extra_person') || false,
    call_first: processedData.client_requirements?.some(item => item.value === 'call_first') || false,
    knock: processedData.client_requirements?.some(item => item.value === 'knock') || false,
    // Vehicle type
    van: processedData.vehicle_type?.some(item => item.value === 'van') || false,
    sedan: processedData.vehicle_type?.some(item => item.value === 'sedan') || false
  };
  
  // Update special instructions in processed data
  processedData.special_instructions = special_instructions;
  
  // Clean up the data by removing the checkbox arrays
  delete processedData.client_requirements;
  delete processedData.vehicle_type;
  
  // Format dates and times for legs
  if (processedData.legs) {
    processedData.legs = processedData.legs.map((leg, index) => {
      // Ensure sequence is set correctly
      leg.sequence = index + 1;
      
      // Format pickup time if present - now using TIME format
      if (leg.scheduled_pickup) {
        // If only time is provided, just format it for TIME column
        if (!leg.scheduled_pickup.includes('T') && !leg.scheduled_pickup.includes('-')) {
          leg.scheduled_pickup = formatTimeForDB(leg.scheduled_pickup);
        } else {
          // If it's a full date, extract just the time part
          const date = new Date(leg.scheduled_pickup);
          leg.scheduled_pickup = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`;
        }
      }
      
      // Format dropoff time if present - now using TIME format 
      if (leg.scheduled_dropoff) {
        // If only time is provided, just format it for TIME column
        if (!leg.scheduled_dropoff.includes('T') && !leg.scheduled_dropoff.includes('-')) {
          leg.scheduled_dropoff = formatTimeForDB(leg.scheduled_dropoff);
        } else {
          // If it's a full date, extract just the time part
          const date = new Date(leg.scheduled_dropoff);
          leg.scheduled_dropoff = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`;
        }
      }
      
      return leg;
    });
  }
  
  // For round trip, we'll let the backend handle the return leg
  // We just need to pass the return pickup time along
  
  return processedData;
};

/**
 * Prepares trip data from API for use in the edit form
 * @param {Object} trip - The trip data from the API
 * @returns {Object} - Trip data formatted for the form
 */
export const prepareTripForEdit = (trip) => {
  console.log('Original trip data:', JSON.stringify(trip, null, 2));
  
  if (!trip) return null;

  // Clone the trip to avoid modifying the original data
  const tripToEdit = { ...trip };
  
  // Set trip type state based on database trip_type
  if (tripToEdit.trip_type === 'one_way' || tripToEdit.trip_type === 'Standard') {
    tripToEdit.is_one_way = true;
  } else if (tripToEdit.trip_type === 'round_trip' || tripToEdit.trip_type === 'Round Trip') {
    tripToEdit.is_one_way = false;
  } else if (tripToEdit.trip_type === 'multi-stop' || tripToEdit.trip_type === 'Multi-stop') {
    tripToEdit.is_one_way = 'multiple';
  }
  
  // Create client requirements array from special instructions boolean values
  const clientRequirements = [];
  const vehicleTypes = [];
  
  if (tripToEdit.specialInstructions) {
    // Map boolean fields to client requirements array
    if (tripToEdit.specialInstructions.rides_alone) clientRequirements.push({ value: 'rides_alone' });
    if (tripToEdit.specialInstructions.spanish_speaking) clientRequirements.push({ value: 'spanish_speaking' });
    if (tripToEdit.specialInstructions.males_only) clientRequirements.push({ value: 'males_only' });
    if (tripToEdit.specialInstructions.females_only) clientRequirements.push({ value: 'females_only' });
    if (tripToEdit.specialInstructions.special_assist) clientRequirements.push({ value: 'special_assist' });
    if (tripToEdit.specialInstructions.pickup_time_exact) clientRequirements.push({ value: 'pickup_time_exact' });
    if (tripToEdit.specialInstructions.stay_with_client) clientRequirements.push({ value: 'stay_with_client' });
    if (tripToEdit.specialInstructions.car_seat) clientRequirements.push({ value: 'car_seat' });
    if (tripToEdit.specialInstructions.extra_person) clientRequirements.push({ value: 'extra_person' });
    if (tripToEdit.specialInstructions.call_first) clientRequirements.push({ value: 'call_first' });
    if (tripToEdit.specialInstructions.knock) clientRequirements.push({ value: 'knock' });
    
    // Map vehicle type boolean fields to vehicle types array
    if (tripToEdit.specialInstructions.van) vehicleTypes.push({ value: 'van' });
    if (tripToEdit.specialInstructions.sedan) vehicleTypes.push({ value: 'sedan' });
    
    // Save the mobility type in the special_instructions
    tripToEdit.special_instructions = { 
      mobility_type: tripToEdit.specialInstructions?.mobility_type || 'Ambulatory' 
    };
    
    // Delete the original specialInstructions to avoid duplication
    delete tripToEdit.specialInstructions;
  } else {
    // Initialize with empty special instructions
    tripToEdit.special_instructions = { mobility_type: 'Ambulatory' };
  }
  
  // Add the client requirements and vehicle types to the trip
  tripToEdit.client_requirements = clientRequirements;
  tripToEdit.vehicle_type = vehicleTypes;
  
  // Format dates
  if (tripToEdit.start_date) {
    const startDate = new Date(tripToEdit.start_date);
    tripToEdit.start_date = startDate.toISOString().substring(0, 10); // YYYY-MM-DD format
  }
  
  if (tripToEdit.end_date) {
    const endDate = new Date(tripToEdit.end_date);
    tripToEdit.end_date = endDate.toISOString().substring(0, 10); // YYYY-MM-DD format
  }
  
  // Format leg dates and times
  if (tripToEdit.legs && tripToEdit.legs.length > 0) {
    // Sort legs by sequence
    const sortedLegs = [...tripToEdit.legs].sort((a, b) => a.sequence - b.sequence);
    
    console.log('Legs before processing:', JSON.stringify(sortedLegs, null, 2));
    
    // Format times for all legs - from TIME format to HH:MM for the form
    sortedLegs.forEach(leg => {
      console.log('Processing leg:', JSON.stringify(leg, null, 2));
      
      // Ensure pickup and dropoff locations are using location_id
      if (leg.pickupLocation && leg.pickupLocation.location_id) {
        console.log('Setting pickup_location from', leg.pickup_location, 'to', leg.pickupLocation.location_id);
        leg.pickup_location = leg.pickupLocation.location_id;
      }
      
      if (leg.dropoffLocation && leg.dropoffLocation.location_id) {
        console.log('Setting dropoff_location from', leg.dropoff_location, 'to', leg.dropoffLocation.location_id);
        leg.dropoff_location = leg.dropoffLocation.location_id;
      }
      
      // Direct property access as a fallback
      if (!leg.pickup_location && leg.PickupLocationId) {
        console.log('Setting pickup_location from PickupLocationId:', leg.PickupLocationId);
        leg.pickup_location = leg.PickupLocationId;
      }
      
      if (!leg.dropoff_location && leg.DropoffLocationId) {
        console.log('Setting dropoff_location from DropoffLocationId:', leg.DropoffLocationId);
        leg.dropoff_location = leg.DropoffLocationId;
      }
      
      if (leg.scheduled_pickup) {
        // Extract hours and minutes, ignoring seconds
        const [hours, minutes] = leg.scheduled_pickup.split(':');
        leg.scheduled_pickup = `${hours}:${minutes}`;
        console.log('Formatted scheduled_pickup to:', leg.scheduled_pickup);
      }
      
      if (leg.scheduled_dropoff) {
        // Extract hours and minutes, ignoring seconds
        const [hours, minutes] = leg.scheduled_dropoff.split(':');
        leg.scheduled_dropoff = `${hours}:${minutes}`;
        console.log('Formatted scheduled_dropoff to:', leg.scheduled_dropoff);
      }
    });
    
    // Handle round trip separately - extract return leg
    if ((tripToEdit.trip_type === 'round_trip' || tripToEdit.trip_type === 'Round Trip') && sortedLegs.length > 1) {
      const firstLeg = sortedLegs[0];
      const returnLeg = sortedLegs[1];
      
      // Set return pickup time
      tripToEdit.return_pickup_time = returnLeg.scheduled_pickup || null;
      
      // Set visible legs to just the first leg
      tripToEdit.legs = [firstLeg];
    } else {
      // For all other trip types (one_way, Standard, or multi-stop) - preserve the legs
      tripToEdit.legs = sortedLegs;
    }
    
    console.log('Legs after processing:', JSON.stringify(tripToEdit.legs, null, 2));
  } else {
    // Initialize with at least one leg
    tripToEdit.legs = [
      {
        sequence: 1,
        status: 'Scheduled',
        pickup_location: '',
        dropoff_location: '',
        scheduled_pickup: null,
        scheduled_dropoff: null,
        leg_distance: null,
        is_return: false
      }
    ];
    tripToEdit.return_pickup_time = null;
  }
  
  // Convert schedule days from string to array
  if (tripToEdit.schedule_type === 'Blanket' && typeof tripToEdit.schedule_days === 'string') {
    tripToEdit.schedule_days = tripToEdit.schedule_days.split(',').filter(day => day.trim());
  }
  
  // Handle program and company
  if (tripToEdit.TripMember) {
    tripToEdit.member_id = tripToEdit.TripMember.member_id || '';
    tripToEdit.program_id = tripToEdit.TripMember.program_id || '';
    
    // If we have a Program object
    if (tripToEdit.Program && tripToEdit.Program.company_id) {
      tripToEdit.company_id = tripToEdit.Program.company_id;
    } else {
      tripToEdit.company_id = '';
    }
  } else {
    tripToEdit.program_id = '';
    tripToEdit.company_id = '';
  }
  
  console.log('Final processed trip data:', JSON.stringify(tripToEdit, null, 2));
  return tripToEdit;
}; 