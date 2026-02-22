import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for handling async autocomplete functionality
 * @param {Function} searchFunction - The async function to call for searching
 * @param {number} debounceMs - Debounce time in milliseconds
 * @param {number} minChars - Minimum characters before search is triggered
 * @param {*} externalValue - Optional. When explicitly null or '', syncs by clearing selectedOption only (not inputValue, so backspace works). Omit (undefined) for components that don't need sync e.g. LocationAutocomplete.
 * @returns {Object} - State and handlers for the autocomplete
 */
const useAsyncAutocomplete = (searchFunction, debounceMs = 300, minChars = 2, externalValue = undefined) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Use a ref to store the timeout ID for debouncing
  const debounceTimeout = useRef(null);
  const prevExternalValueRef = useRef(externalValue);

  // Sync selectedOption only when form value *transitions* from non-empty to empty (e.g. user clicked clear).
  // Do NOT clear when externalValue is already empty: after user selects, hook re-renders from setSelectedOption
  // before Controller has the new value, so we'd see externalValue '' and wrongly clear the selection.
  useEffect(() => {
    if (externalValue === undefined) return;
    const prev = prevExternalValueRef.current;
    prevExternalValueRef.current = externalValue;
    const isEmpty = externalValue === null || externalValue === '';
    const wasNonEmpty = prev !== null && prev !== '' && prev !== undefined;
    if (isEmpty && wasNonEmpty) {
      setSelectedOption(null);
    }
  }, [externalValue]);

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
    setInputValue,
    handleInputChange,
    handleChange
  };
};

export default useAsyncAutocomplete; 