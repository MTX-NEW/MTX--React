import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const createApiService = (endpoint) => {
  const API_URL = `${API_BASE_URL}/api/${endpoint}`;

  return {
    getAll: (params = {}) => {
      // Convert params object to URL query string
      const queryString = Object.keys(params).length 
        ? `?${new URLSearchParams(params).toString()}` 
        : '';
      
      return axios.get(`${API_URL}${queryString}`);
    },
    getOne: (id) => axios.get(`${API_URL}/${id}`),
    create: (data) => axios.post(API_URL, data),
    update: (id, data) => axios.put(`${API_URL}/${id}`, data),
    delete: (id) => axios.delete(`${API_URL}/${id}`)
  };
};

export const createApi = createApiService;

export const userApi = createApiService('users');

export const groupApi = createApiService('user-groups');
export const userTypeApi = createApiService('user-types');
// Use the dedicated drivers endpoint 
export const driverApi = createApiService('drivers');
export const partsSupplierApi = createApiService('parts-suppliers');
// Add new API services for parts and services catalogs
export const vehiclePartsApi = createApiService('vehicle-parts');
export const vehicleServicesApi = createApiService('vehicle-services');
export const vehicleApi = createApiService('vehicles');
// Trip System API services
export const tripApi = createApiService('trips');
export const tripLegApi = {
  ...createApiService('trip-legs'),
  getByTrip: (tripId) => axios.get(`${API_BASE_URL}/api/trip-legs/trip/${tripId}`),
  updateStatus: (legId, status) => axios.put(`${API_BASE_URL}/api/trip-legs/${legId}`, { status }),
  assignDriver: (legId, driverId) => axios.put(`${API_BASE_URL}/api/trip-legs/${legId}`, { 
    driver_id: driverId,
    updated_at: new Date() 
  }),
  // New methods for updating leg data
  updateLeg: (legId, legData) => axios.put(`${API_BASE_URL}/api/trip-legs/${legId}`, {
    ...legData,
    updated_at: new Date()
  }),
  updateMultipleLegs: (legs) => {
    // Create an array of promises for each leg update
    const updatePromises = legs.map(leg => 
      axios.put(`${API_BASE_URL}/api/trip-legs/${leg.leg_id}`, {
        ...leg,
        updated_at: new Date()
      })
    );
    return Promise.all(updatePromises);
  }
};
export const tripMemberApi = {
  ...createApiService('trip-members'),
  // Add custom method for member locations
  getMemberLocations: (memberId) => 
    axios.get(`${API_BASE_URL}/api/trip-members/${memberId}/locations`),
};

export const tripLocationApi = createApiService('trip-locations');

// Driver Panel API services
export const driverPanelApi = {
  ...createApiService('driver-panel'),
  getDriverTrips: (driverId, status) => {
    const queryParams = status ? `?status=${status}` : '';
    return axios.get(`${API_BASE_URL}/api/driver-panel/trips/${driverId}${queryParams}`);
  },
  getTripLeg: (legId, driverId) => 
    axios.get(`${API_BASE_URL}/api/driver-panel/trip-leg/${legId}/${driverId}`),
  updateTripLegStatus: (legId, status, driverId) => 
    axios.put(`${API_BASE_URL}/api/driver-panel/trip-leg/${legId}/status`, { status, driverId }),
  updateTripLegOdometer: (legId, driverId, pickup_odometer, dropoff_odometer) => 
    axios.put(`${API_BASE_URL}/api/driver-panel/trip-leg/${legId}/odometer`, {
      pickup_odometer,
      dropoff_odometer,
      driverId
    }),
  getTodayTrips: (driverId) => 
    axios.get(`${API_BASE_URL}/api/driver-panel/today-trips/${driverId}`),
  getWeeklySchedule: (driverId, startDate) => {
    const queryParams = startDate ? `?startDate=${startDate}` : '';
    return axios.get(`${API_BASE_URL}/api/driver-panel/weekly-schedule/${driverId}${queryParams}`);
  },
  updateDriverSignature: (driverId, signature) => 
    axios.put(`${API_BASE_URL}/api/driver-panel/driver/${driverId}/signature`, { signature }),
  updateTripMemberSignature: (memberId, signature) => 
    axios.put(`${API_BASE_URL}/api/driver-panel/trip-member/${memberId}/signature`, { signature })
};

// Trip Special Instructions API
export const tripSpecialInstructionApi = createApiService('trip-special-instructions');

export const maintenanceApi = {
  ...createApiService('maintenance'),
  getServices: (id) => axios.get(`${API_BASE_URL}/api/maintenance/${id}/services`),
  updateServices: (id, services) => axios.put(`${API_BASE_URL}/api/maintenance/${id}/services`, services),
  getParts: (id) => axios.get(`${API_BASE_URL}/api/maintenance/${id}/parts`),
  updateParts: (id, parts) => axios.put(`${API_BASE_URL}/api/maintenance/${id}/parts`, parts),
  getVehicleHistory: (vehicleId) => axios.get(`${API_BASE_URL}/api/maintenance/vehicle/${vehicleId}`)
};

// Custom API service for group permissions with specific endpoints
export const groupPermissionsApi = {
  getGroupPermissions: (groupId) => 
    axios.get(`${API_BASE_URL}/api/group-permissions/group/${groupId}`),
  updateGroupPermissions: (groupId, typeIds) => 
    axios.post(`${API_BASE_URL}/api/group-permissions/group/${groupId}`, { typeIds }),
  validatePermission: (groupId, typeId) => 
    axios.get(`${API_BASE_URL}/api/group-permissions/validate/${groupId}/${typeId}`),
};

// Custom API service for page permissions management
export const pagePermissionsApi = createApiService('page-permissions');

// Add custom methods to pagePermissionsApi
Object.assign(pagePermissionsApi, {
  getByPage: (pageName) => 
    axios.get(`${API_BASE_URL}/api/page-permissions/by-page/${encodeURIComponent(pageName)}`),
  updatePagePermissions: (pageName, permissions) => 
    axios.post(`${API_BASE_URL}/api/page-permissions/by-page/${encodeURIComponent(pageName)}`, {
      permissions: permissions.map(p => ({
        type_id: p.type_id,
        page_name: pageName,
        can_view: p.can_view ? 1 : 0,
        can_edit: p.can_edit ? 1 : 0
      }))
    }),
  validatePermission: (pageName, typeId) => 
    axios.get(`${API_BASE_URL}/api/page-permissions/validate/${encodeURIComponent(pageName)}/${typeId}`)
});

export const documentsApi = {
  upload: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // Increased timeout to 60 seconds
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Progress tracking without logging
        }
      });
      return response;
    } catch (error) {
      console.error('Upload API error:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timed out. Please try again with a smaller file or check your connection.');
      }
      throw error;
    }
  },
  getByEntity: (type, id) => axios.get(`${API_BASE_URL}/api/documents/${type}/${id}`)
};

// Trip API with custom endpoints
export const tripsApi = {
  ...createApiService('trips'),
  createWithLegs: (tripData) => axios.post(`${API_BASE_URL}/api/trips`, tripData),
  updateWithLegs: (id, tripData) => axios.put(`${API_BASE_URL}/api/trips/${id}`, tripData),
  copyTrip: (id, data) => axios.post(`${API_BASE_URL}/api/trips/${id}/copy`, data)
};

export const programApi = {
  ...createApiService('programs'),
  getCompanies: () => axios.get(`${API_BASE_URL}/api/programs/companies`)
};

// Time sheets API services
export const timeSheetApi = {
  ...createApiService('time-sheets'),
  clockIn: (userId) => axios.post(`${API_BASE_URL}/api/time-sheets/clock-in`, { user_id: userId }),
  clockOut: (userId) => axios.post(`${API_BASE_URL}/api/time-sheets/clock-out`, { user_id: userId }),
  getStatus: (userId) => axios.get(`${API_BASE_URL}/api/time-sheets/status/${userId}`),
  getByUser: (userId, startDate, endDate) => {
    const params = new URLSearchParams();
    params.append('userId', userId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return axios.get(`${API_BASE_URL}/api/time-sheets?${params.toString()}`);
  },
  getActiveTimesheet: (userId) => axios.get(`${API_BASE_URL}/api/time-sheets/active/${userId}`)
};

// Time sheet breaks API services
export const timeSheetBreakApi = {
  ...createApiService('time-sheet-breaks'),
  startBreak: (userId, duration = 30) => 
    axios.post(`${API_BASE_URL}/api/time-sheet-breaks/start-by-user/${userId}`, { duration_minutes: duration }),
  endBreak: (userId) => 
    axios.post(`${API_BASE_URL}/api/time-sheet-breaks/end-by-user/${userId}`),
  getByTimesheet: (timesheetId) => 
    axios.get(`${API_BASE_URL}/api/time-sheet-breaks/timesheet/${timesheetId}`)
};

// Time off requests API services
export const timeOffRequestApi = createApiService('time-off-requests');