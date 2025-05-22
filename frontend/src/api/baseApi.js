import axios from 'axios';

// Always send cookies (e.g., refresh token cookie) with requests
axios.defaults.withCredentials = true;

// Using relative URL prevents mixed content issues when site is served over HTTPS
//export const API_BASE_URL = '';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Set up axios interceptor to include auth token in requests
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const createApiService = (endpoint) => {
  const API_URL = `${API_BASE_URL}/api/${endpoint}`;
 // console.log('API_URL:', API_URL);
  return {
    getAll: (params = {}) => {
      // Handle the case where params is passed as { params: {...} }
      const queryParams = params.params ? params.params : params;
      
      // Convert params object to URL query string
      const queryString = Object.keys(queryParams).length 
        ? `?${new URLSearchParams(queryParams).toString()}` 
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

// Auth API service
export const authApi = {
  login: (username, password) => 
    axios.post(`${API_BASE_URL}/api/auth/login`, { username, password }),
  getCurrentUser: () => 
    axios.get(`${API_BASE_URL}/api/auth/me`),
  // Refresh the access token using the refresh token cookie
  refreshToken: () =>
    axios.post(`${API_BASE_URL}/api/auth/refresh-token`),
  // Logout and clear refresh token cookie
  logout: () =>
    axios.post(`${API_BASE_URL}/api/auth/logout`),
};

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
export const tripApi = {
  ...createApiService('trips'),
  getSummary: (params = {}) => {
    const queryString = Object.keys(params).length 
      ? `?${new URLSearchParams(params).toString()}` 
      : '';
    return axios.get(`${API_BASE_URL}/api/trips/summary${queryString}`);
  },
  // Get all trips in a blanket series
  getBlanketSeries: (tripId) => 
    axios.get(`${API_BASE_URL}/api/trips/${tripId}/blanket-series`),
  // Update all trips in a blanket series
  updateBlanketSeries: (tripId, tripData, updateAllTrips = true) => 
    axios.put(`${API_BASE_URL}/api/trips/${tripId}/blanket-series?update_all_trips=${updateAllTrips}`, tripData)
};
export const tripLegApi = {
  ...createApiService('trip-legs'),
  getByTrip: (tripId) => axios.get(`${API_BASE_URL}/api/trip-legs/trip/${tripId}`),
  updateStatus: (legId, status) => axios.put(`${API_BASE_URL}/api/trip-legs/${legId}`, { status }),
  assignDriver: (legId, driverId, sendSms = false) => axios.put(`${API_BASE_URL}/api/trip-legs/${legId}`, { 
    driver_id: driverId,
    send_sms: sendSms,
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
  // Add method to search members by name
  searchMembers: (query) => {
    if (!query || query.length < 2) return Promise.resolve({ data: [] });
    return axios.get(`${API_BASE_URL}/api/trip-members/search?query=${encodeURIComponent(query)}`);
  },
  // Add method to get member by ID with full details
  getMemberById: (memberId) => 
    axios.get(`${API_BASE_URL}/api/trip-members/${memberId}`)
};

export const tripLocationApi = {
  ...createApiService('trip-locations'),
  searchLocations: (query) => {
    if (!query || query.length < 2) return Promise.resolve({ data: [] });
    return axios.get(`${API_BASE_URL}/api/trip-locations/search?query=${encodeURIComponent(query)}`);
  }
};

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
  getAllPages: () => 
    axios.get(`${API_BASE_URL}/api/page-permissions/pages`),
  getAllPermissions: () =>
    axios.get(`${API_BASE_URL}/api/page-permissions`),
  syncPages: () =>
    axios.post(`${API_BASE_URL}/api/page-permissions/sync-pages`),
  getByPage: (pageId) => 
    axios.get(`${API_BASE_URL}/api/page-permissions/by-page/${pageId}`),
  updatePagePermissions: (pageId, permissions) => {
    // Extract only the necessary fields for each permission to reduce payload size
    const minimalPermissions = permissions.map(perm => ({
      permission_id: perm.permission_id,
      page_id: perm.page_id,
      type_id: perm.type_id,
      can_view: perm.can_view,
      can_edit: perm.can_edit
    }));
    
    // Use the page ID from the first permission if available, otherwise use the provided pageId
    const actualPageId = (permissions[0] && permissions[0].page_id) || pageId;
    
    return axios.post(`${API_BASE_URL}/api/page-permissions/by-page/${actualPageId}`, {
      permissions: minimalPermissions
    });
  },
  validatePermission: (pageId, typeId) => 
    axios.get(`${API_BASE_URL}/api/page-permissions/validate/${pageId}/${typeId}`),
  getUserRoutes: (typeId) => 
    axios.get(`${API_BASE_URL}/api/page-permissions/user-routes/${typeId}`)
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
  clockIn: (userId, hourType = 'regular') => axios.post(`${API_BASE_URL}/api/time-sheets/clock-in`, { 
    user_id: userId,
    hour_type: hourType 
  }),
  clockOut: (userId) => axios.post(`${API_BASE_URL}/api/time-sheets/clock-out`, { user_id: userId }),
  getStatus: (userId) => axios.get(`${API_BASE_URL}/api/time-sheets/user/${userId}/status`),
  getByUser: (userId, startDate, endDate) => {
    const params = new URLSearchParams();
    params.append('userId', userId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return axios.get(`${API_BASE_URL}/api/time-sheets?${params.toString()}`);
  },
  getActiveTimesheet: (userId) => axios.get(`${API_BASE_URL}/api/time-sheets/user/${userId}/active`),
  recalculateOvertime: (userId, startDate, endDate) => 
    axios.post(`${API_BASE_URL}/api/time-sheets/recalculate-overtime`, { 
      userId, 
      startDate, 
      endDate 
    }),
  
  // Incentive-related methods
  getAllIncentives: (filters = {}) => {
    const { userId, startDate, endDate } = filters;
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return axios.get(`${API_BASE_URL}/api/time-sheets/incentives${params.toString() ? `?${params.toString()}` : ''}`);
  },
  getIncentive: (id) => axios.get(`${API_BASE_URL}/api/time-sheets/incentives/${id}`),
  createIncentive: (incentiveData) => axios.post(`${API_BASE_URL}/api/time-sheets/incentives`, incentiveData),
  updateIncentive: (id, incentiveData) => axios.put(`${API_BASE_URL}/api/time-sheets/incentives/${id}`, incentiveData),
  deleteIncentive: (id) => axios.delete(`${API_BASE_URL}/api/time-sheets/incentives/${id}`),
  getUserIncentivesForPeriod: (userId, startDate, endDate) => 
    axios.get(`${API_BASE_URL}/api/time-sheets/incentives/user/${userId}/period/${startDate}/${endDate}`),
  
  // Add update method
  update: (id, data) => axios.put(`${API_BASE_URL}/api/time-sheets/${id}`, data)
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