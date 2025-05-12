/**
 * Utility functions for handling time formats in the frontend
 */

/**
 * Formats a time string from the database to display format (HH:MM in 24-hour format)
 * @param {string} timeString - Time string from database (HH:MM:SS)
 * @returns {string|null} - Formatted time string or null if input is invalid
 */
export function formatTimeForDisplay(timeString) {
  if (!timeString) return null;
  
  try {
    // If we have a time string with colons (like HH:MM:SS or HH:MM)
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const timeParts = timeString.split(':');
      
      // Always take just the first two parts (hours and minutes)
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10).toString().padStart(2, '0');
        const minutes = timeParts[1].padStart(2, '0');
        
        console.log(`${hours}:${minutes}`);
        // Return in 24-hour format, without seconds
        return `${hours}:${minutes}`;
      }
    }
    
    // If it's a datetime string, extract time
    if (typeof timeString === 'string' && timeString.includes('T')) {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${hours}:${minutes}`;
      }
    }
    
    return timeString; // Return original if we can't format it
  } catch (error) {
    console.error('Error formatting time for display:', error);
    return timeString; // Return original on error
  }
}

/**
 * Formats a time input for database storage (HH:MM:SS)
 * @param {string|Date} timeInput - Time in various formats
 * @returns {string|null} - Formatted time string or null if input is invalid
 */
export function formatTimeForDB(timeInput) {
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