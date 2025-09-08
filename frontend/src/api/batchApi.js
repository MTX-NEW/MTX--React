import axios from 'axios';
import { API_BASE_URL } from './baseApi';

// Batch API service
export const batchApi = {
  // Get all batches
  getAllBatches: (params = {}) => {
    const queryString = Object.keys(params).length 
      ? `?${new URLSearchParams(params).toString()}` 
      : '';
    return axios.get(`${API_BASE_URL}/api/batches${queryString}`);
  },

  // Get specific batch
  getBatch: (id) => axios.get(`${API_BASE_URL}/api/batches/${id}`),

  // Get detailed batch information with claims
  getBatchDetails: (id) => axios.get(`${API_BASE_URL}/api/batches/${id}/details`),

  // Create new batch
  createBatch: (data) => 
    axios.post(`${API_BASE_URL}/api/batches`, data),

  // Process batch and generate EDI
  processBatch: (id) => 
    axios.post(`${API_BASE_URL}/api/batches/${id}/process`),

  // Download EDI file for batch
  downloadEDI: (id) => 
    axios.get(`${API_BASE_URL}/api/batches/${id}/download`, {
      responseType: 'blob'
    }),

  // Get batch statistics
  getBatchStats: () => 
    axios.get(`${API_BASE_URL}/api/batches/stats`),

  // Delete batch
  deleteBatch: (id) => 
    axios.delete(`${API_BASE_URL}/api/batches/${id}`)
};
