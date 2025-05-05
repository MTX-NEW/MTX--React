import { useState, useCallback } from 'react';
import { tripMemberApi } from '../api/baseApi';

const useMemberLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMemberId, setCurrentMemberId] = useState(null);

  // Wrap in useCallback to maintain reference stability between renders
  const fetchLocations = useCallback(async (memberId) => {
    // If no memberId provided, just clear locations and return
    if (!memberId) {
      setLocations([]);
      setCurrentMemberId(null);
      return;
    }
    
    // Skip fetching if we're already fetching for this member
    if (loading && memberId === currentMemberId) {
      console.log("Already fetching locations for member:", memberId);
      return;
    }
    
    // If we're switching members, clear the old locations first
    if (currentMemberId && memberId !== currentMemberId) {
      setLocations([]);
    }
    
    setLoading(true);
    setError(null);
    setCurrentMemberId(memberId);
    
    try {
      console.log("Fetching locations for member:", memberId);
      const response = await tripMemberApi.getMemberLocations(memberId);
      console.log("Received locations:", response.data?.length || 0);
      setLocations(response.data || []);
    } catch (err) {
      console.error('Error fetching member locations:', err);
      setError('Failed to load member locations');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent re-creation

  return { locations, loading, error, fetchLocations, currentMemberId };
};

export default useMemberLocations; 