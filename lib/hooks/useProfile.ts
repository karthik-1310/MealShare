import { useState, useEffect } from 'react';
import { fetchProfile, updateProfile } from '@/lib/profile';
import { Profile, ProfileUpdate } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profileData = await fetchProfile();
        
        if (isMounted) {
          setProfile(profileData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load profile'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const update = async (updates: ProfileUpdate) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const result = await updateProfile(updates);
      
      if (result.success && profile) {
        // Update the local state with the new values
        setProfile({
          ...profile,
          ...updates
        });
      }
      
      return result;
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update profile' 
      };
    }
  };

  return {
    profile,
    loading,
    error,
    update
  };
} 