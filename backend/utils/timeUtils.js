/**
 * Utility functions for handling time formats
 */

/**
 * Formats a time string to the database TIME format (HH:MM:SS)
 * @param {string|Date} timeInput - Time in various formats
 * @returns {string|null} - Formatted time string or null if input is invalid
 */
function formatTimeForDB(timeInput) {
  if (!timeInput) return null;
  
  try {
    // If it's a date object or ISO string
    if (timeInput instanceof Date || (typeof timeInput === 'string' && timeInput.includes('T'))) {
      const date = timeInput instanceof Date ? timeInput : new Date(timeInput);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`;
    }
    
    // If it's already a time string (HH:MM or HH:MM:SS)
    if (typeof timeInput === 'string') {
      const parts = timeInput.split(':');
      // If it's HH:MM, add seconds
      if (parts.length === 2) {
        return `${parts[0]}:${parts[1]}:00`;
      }
      // If it's already HH:MM:SS, use as is
      if (parts.length === 3) {
        return timeInput;
      }
    }
    
    // If we couldn't format it, return null
    return null;
  } catch (error) {
    console.error('Error formatting time:', error);
    return null;
  }
}

/**
 * Formats a time string from the database to display format (HH:MM)
 * @param {string} timeString - Time string from database (HH:MM:SS)
 * @returns {string|null} - Formatted time string or null if input is invalid
 */
function formatTimeForDisplay(timeString) {
  if (!timeString) return null;
  
  try {
    // If it's a TIME string (HH:MM:SS), truncate seconds
    const parts = timeString.split(':');
    if (parts.length === 3) {
      return `${parts[0]}:${parts[1]}`;
    }
    
    // If it's already in HH:MM format
    if (parts.length === 2) {
      return timeString;
    }
    
    // If it's a datetime string or date object, extract time
    if (timeString.includes('T') || timeString instanceof Date) {
      const date = timeString instanceof Date ? timeString : new Date(timeString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error formatting time for display:', error);
    return null;
  }
}

module.exports = {
  formatTimeForDB,
  formatTimeForDisplay
}; 