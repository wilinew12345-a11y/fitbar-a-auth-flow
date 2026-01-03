import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

export function useUserProfile() {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch profile and auto-heal email if needed
  const fetchAndSyncProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Auto-heal: sync email from auth if missing in profiles
        const authEmail = session?.user?.email;
        if ((!data.email || data.email === '') && authEmail) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ email: authEmail })
            .eq('id', user.id);

          if (!updateError) {
            setProfile({ ...data, email: authEmail });
          } else {
            setProfile(data);
          }
        } else {
          setProfile(data);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, session?.user?.email]);

  useEffect(() => {
    fetchAndSyncProfile();
  }, [fetchAndSyncProfile]);

  const updateProfile = async (firstName: string, lastName: string) => {
    if (!user?.id) return { error: new Error('No user') };

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          first_name: firstName, 
          last_name: lastName 
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, first_name: firstName, last_name: lastName } : null);
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (!profile) return '';
    const first = profile.first_name?.charAt(0) || '';
    const last = profile.last_name?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  return {
    profile,
    loading,
    saving,
    updateProfile,
    getInitials,
    refetch: fetchAndSyncProfile,
  };
}
