import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for handling async autocomplete functionality
 * @param {Function} searchFunction - The async function to call for searching
 * @param {number} debounceMs - Debounce time in milliseconds
 * @param {number} minChars - Minimum characters before search is triggered
 * @returns {Object} - State and handlers for the autocomplete
 */
const useAsyncAutocomplete = (searchFunction, debounceMs = 300, minChars = 2) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Use a ref to store the timeout ID for debouncing
  const debounceTimeout = useRef(null);

  // Clear the timeout when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Handle input change with debounce
  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Only search if we have enough characters
    if (newInputValue && newInputValue.length >= minChars) {
      setLoading(true);
      
      // Set a new timeout
      debounceTimeout.current = setTimeout(async () => {
        try {
          const results = await searchFunction(newInputValue);
          setOptions(results?.data || []);
        //  console.log("results", results);
        } catch (error) {
          console.error('Error fetching autocomplete options:', error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    } else {
      setOptions([]);
      setLoading(false);
    }
  };

  // Handle option selection
  const handleChange = (event, newValue) => {
    setSelectedOption(newValue);
  };

  return {
    inputValue,
    options,
    loading,
    open,
    selectedOption,
    setOpen,
    setSelectedOption,
    handleInputChange,
    handleChange
  };
};

export default useAsyncAutocomplete; 