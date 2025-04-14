/**
 * Utility functions for handling time formats in the frontend
 */

/**
 * Formats a time string from the database to display format (h:mm AM/PM)
 * @param {string} timeString - Time string from database (HH:MM:SS)
 * @returns {string|null} - Formatted time string or null if input is invalid
 */
export function formatTimeForDisplay(timeString) {
  if (!timeString) return null;
  
  try {
    // Handle TIME type (HH:MM:SS)
    const timeParts = timeString.split(':');
    
    if (timeParts.length >= 2) {
      // Extract hours and minutes
      let hours = parseInt(timeParts[0], 10);
      const minutes = timeParts[1].padStart(2, '0');
      
      // Convert to 12-hour format
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      
      return `${hours}:${minutes} ${period}`;
    }
    
    // If it's a datetime string, extract time
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        
        return `${hours}:${minutes} ${period}`;
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