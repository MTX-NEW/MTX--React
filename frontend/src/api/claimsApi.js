import axios from 'axios';
import { API_BASE_URL } from './baseApi';

// Claims API service
export const claimsApi = {
  // Get all claims
  getAllClaims: (params = {}) => {
    const queryString = Object.keys(params).length 
      ? `?${new URLSearchParams(params).toString()}` 
      : '';
    return axios.get(`${API_BASE_URL}/api/claims${queryString}`);
  },

  // Get specific claim
  getClaim: (id) => axios.get(`${API_BASE_URL}/api/claims/${id}`),

  // Generate claims for multiple trips in batch
  generateBatch: (tripIds) => 
    axios.post(`${API_BASE_URL}/api/claims/generate-batch`, { tripIds }),

  // Generate claim for single trip
  generateClaimForTrip: (tripId) => 
    axios.post(`${API_BASE_URL}/api/claims/generate/${tripId}`),

  // Generate EDI file for claim
  generateEDIFile: (claimId) => 
    axios.post(`${API_BASE_URL}/api/claims/${claimId}/generate-edi`)
};

// Trips API service (for billing-related endpoints)
export const tripsApi = {
  // Get all trips
  getAllTrips: (params = {}) => {
    const queryString = Object.keys(params).length 
      ? `?${new URLSearchParams(params).toString()}` 
      : '';
    return axios.get(`${API_BASE_URL}/api/trips${queryString}`);
  },

  // Get trips ready for billing
  getTripsForBilling: (params = {}) => {
    const queryString = Object.keys(params).length 
      ? `?${new URLSearchParams(params).toString()}` 
      : '';
    return axios.get(`${API_BASE_URL}/api/trips/for-billing${queryString}`);
  },

  // Get specific trip
  getTrip: (id) => axios.get(`${API_BASE_URL}/api/trips/${id}`),

  // Update trip
  updateTrip: (id, data) => axios.put(`${API_BASE_URL}/api/trips/${id}`, data)
};

export default { claimsApi, tripsApi };
