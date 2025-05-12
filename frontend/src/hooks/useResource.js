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
    create, 
    update, 
    remove, 
    refresh: fetchData,
    setData
  };
};