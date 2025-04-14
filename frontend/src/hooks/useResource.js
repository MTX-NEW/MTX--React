// src/hooks/useResource.js
import { useState, useEffect } from 'react';
import { handleApiError } from '@/utils/errorHandler';

export const useResource = (apiService, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { idField = 'id' } = options;

  const fetchData = async () => {
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
    fetchData();
  }, []);

  const create = async (itemData) => {
    setLoading(true);
    try {
      const response = await apiService.create(itemData);
      setData(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, itemData) => {
    setLoading(true);
    try {
      const response = await apiService.update(id, itemData);
      setData(prev => prev.map(item => 
        item[idField] === id ? response.data : item
      ));
      return response.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      await apiService.delete(id);
      setData(prev => prev.filter(item => item[idField] !== id));
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data, 
    loading, 
    error, 
    create, 
    update, 
    remove, 
    refresh: fetchData,
    setData
  };
};