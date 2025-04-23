/**
 * Performance optimization utilities for React
 */

/**
 * Tracks and reports component render times
 * @param {string} componentName - Name of the component to track
 * @param {Function} callback - Optional callback to run after timing
 * @returns {Function} - Cleanup function
 */
export const trackRenderTime = (componentName, callback) => {
  if (process.env.NODE_ENV !== 'development') return () => {};
  
  const startTime = performance.now();
  console.log(`[Render Start] ${componentName}`);
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`[Render End] ${componentName}: ${duration.toFixed(2)}ms`);
    
    if (callback) callback(duration);
  };
};

/**
 * Tracks data fetching performance
 * @param {string} queryName - Name of the query to track
 * @param {Function} fetchFn - The fetch function to track
 * @returns {Promise} - The original fetch promise
 */
export const trackQueryPerformance = async (queryName, fetchFn) => {
  const startTime = performance.now();
  
  try {
    const result = await fetchFn();
    const endTime = performance.now();
    console.log(`[Query] ${queryName}: ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const endTime = performance.now();
    console.error(`[Query Error] ${queryName}: ${(endTime - startTime).toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Checks if browser supports performance metrics API and registers performance observers
 */
export const setupPerformanceMonitoring = () => {
  if (typeof window === 'undefined' || !window.PerformanceObserver) return;

  try {
    // Long task observer
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
      });
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });

    // Layout shift observer
    if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.value > 0.1) {
            console.warn(`Significant layout shift detected: ${entry.value.toFixed(3)}`);
          }
        });
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // First Input Delay observer
    if (PerformanceObserver.supportedEntryTypes.includes('first-input')) {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const delay = entry.processingStart - entry.startTime;
          console.log(`FID: ${delay.toFixed(2)}ms`);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'], buffered: true });
    }

    return () => {
      longTaskObserver.disconnect();
      if (layoutShiftObserver) layoutShiftObserver.disconnect();
      if (fidObserver) fidObserver.disconnect();
    };
  } catch (error) {
    console.error('Error setting up performance monitoring:', error);
  }
}; 