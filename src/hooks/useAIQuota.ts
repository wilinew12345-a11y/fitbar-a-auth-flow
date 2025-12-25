import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const MAX_DAILY_MESSAGES = 20;

interface AIQuotaState {
  currentCount: number;
  limit: number;
  remaining: number;
  isLoading: boolean;
  isLimitReached: boolean;
}

export const useAIQuota = () => {
  const { user } = useAuth();
  const [state, setState] = useState<AIQuotaState>({
    currentCount: 0,
    limit: MAX_DAILY_MESSAGES,
    remaining: MAX_DAILY_MESSAGES,
    isLoading: true,
    isLimitReached: false,
  });

  // Fetch current usage from database
  const fetchUsage = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_ai_usage', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching AI usage:', error);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const result = data as { current_count: number; limit: number; remaining: number };
      setState({
        currentCount: result.current_count,
        limit: result.limit,
        remaining: result.remaining,
        isLoading: false,
        isLimitReached: result.remaining <= 0,
      });
    } catch (error) {
      console.error('Error fetching AI usage:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.id]);

  // Check and increment usage atomically
  const checkAndIncrement = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    if (!user?.id) {
      return { success: false, message: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase.rpc('check_and_increment_ai_usage', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error incrementing AI usage:', error);
        return { success: false, message: error.message };
      }

      const result = data as { success: boolean; current_count: number; limit: number; message?: string };
      
      // Update local state
      setState({
        currentCount: result.current_count,
        limit: result.limit,
        remaining: result.limit - result.current_count,
        isLoading: false,
        isLimitReached: !result.success,
      });

      return { success: result.success, message: result.message };
    } catch (error) {
      console.error('Error incrementing AI usage:', error);
      return { success: false, message: 'Failed to check quota' };
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    ...state,
    checkAndIncrement,
    refreshUsage: fetchUsage,
  };
};
