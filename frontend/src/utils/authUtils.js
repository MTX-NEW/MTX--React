/**
 * Utility functions for authentication
 */

/**
 * Get the current user from localStorage
 * @returns {Object|null} The current user object or null if not logged in
 */
export const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  return null;
};

/**
 * Get the current user ID from localStorage
 * @returns {number|null} The current user ID or null if not logged in
 */
export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user ? user.id : null;
};

/**
 * Check if the user has a specific role or user type
 * @param {string} typeName - The user type name to check
 * @returns {boolean} True if the user has the specified type, false otherwise
 */
export const hasUserType = (typeName) => {
  const user = getCurrentUser();
  return user && user.userType && user.userType.type_name === typeName;
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getCurrentUser() && !!localStorage.getItem('token');
};

import { authApi } from '../api/baseApi';

/**
 * Refresh the access token using the refresh token cookie and update localStorage
 * @returns {string|null} The new access token or null on failure
 */
/* 
export const refreshToken = async () => {
  try {
    const response = await authApi.refreshToken();
    const newToken = response.data.accessToken;
    localStorage.setItem('token', newToken);
    return newToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};
*/

/**
 * Perform logout by clearing tokens and making server-side logout call
 */
export const logout = async () => {
  try {
    await authApi.logout();
  } catch (error) {
    console.error('Error during logout:', error);
  }
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = '/login';
};

// authUtils.js - Pure utility functions only, no state or API calls
export const getStoredToken = () => localStorage.getItem('token');
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

export const storeAuthData = (user, token) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

export const clearAuthData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// No duplicated isAuthenticated checks 