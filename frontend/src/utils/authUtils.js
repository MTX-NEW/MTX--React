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