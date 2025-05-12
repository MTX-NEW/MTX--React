// src/hooks/useResource.js
import { useState, useEffect } from 'react';
import { handleApiError } from '@/utils/errorHandler';

export const useResource = (apiService, options = {}) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { idField = 'id', skip = false } = options;

  const fetchData = async () => {
    if (skip) return;
    setLoading(true);
    try {
      const response = await apiService.getAll();
      setData(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
      setData([]);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!skip) {
      fetchData();
    }
  }, [skip]);

  const create = async (itemData) => {
    try {
      const response = await apiService.create(itemData);
      setData(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  const update = async (id, itemData) => {
    try {
      const response = await apiService.update(id, itemData);
      setData(prev => prev.map(item => 
        item[idField] === id ? response.data : item
      ));
      return response.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  const remove = async (id) => {
    try {
      await apiService.delete(id);
      setData(prev => prev.filter(item => item[idField] !== id));
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  return {
    data, 
    error, 
    loading,
    create, 
    update, 
    remove, 
    refresh: fetchData,
    setData
  };
};

export const usePaginatedResource = (apiService, options = {}) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: options.pageSize || 10
  });
  
  const { idField = 'id', skip = false, dataPath, countPath, pagePath, totalPagesPath } = options;

  const fetchData = async (page = pagination.currentPage, pageSize = pagination.pageSize, query = '') => {
    if (skip) return;
    setLoading(true);
    try {
      const response = await apiService.getAll({ 
        params: { page, limit: pageSize, query } 
      });
      
      // Handle different API response structures
      if (dataPath) {
        // If dataPath is provided, extract data using it
        setData(response.data[dataPath] || []);
      } else {
        // For memberApi that returns { members: [...] }
        setData(response.data.members || response.data.locations || response.data || []);
      }
      
      // Extract pagination information
      setPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.total || 0,
        pageSize: pageSize
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
      setData([]);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!skip) {
      fetchData();
    }
  }, [skip]);

  const create = async (itemData) => {
    try {
      const response = await apiService.create(itemData);
      // Refresh data after creation instead of manually updating the state
      await fetchData();
      return response.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  const update = async (id, itemData) => {
    try {
      const response = await apiService.update(id, itemData);
      // Refresh data after update
      await fetchData();
      return response.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  const remove = async (id) => {
    try {
      await apiService.delete(id);
      // Refresh data after deletion
      await fetchData();
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  const handlePageChange = (newPage) => {
    fetchData(newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (newPageSize) => {
    fetchData(1, newPageSize);
  };

  const handleSearch = (query) => {
    fetchData(1, pagination.pageSize, query);
  };

  return {
    data, 
    error, 
    loading,
    create, 
    update, 
    remove, 
    refresh: fetchData,
    setData,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    handleSearch
  };
};