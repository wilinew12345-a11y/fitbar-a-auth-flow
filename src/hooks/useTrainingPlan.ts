import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTrainingPlan() {
  const [isPlanMissing, setIsPlanMissing] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [schedulesCount, setSchedulesCount] = useState(0);

  useEffect(() => {
    const checkPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('weekly_schedules')
        .select('id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking training plan:', error);
        setLoading(false);
        return;
      }

      const count = data?.length || 0;
      setSchedulesCount(count);
      setIsPlanMissing(count === 0);
      setLoading(false);
    };

    checkPlan();
  }, []);

  const refetch = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('weekly_schedules')
      .select('id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error checking training plan:', error);
      setLoading(false);
      return;
    }

    const count = data?.length || 0;
    setSchedulesCount(count);
    setIsPlanMissing(count === 0);
    setLoading(false);
  };

  return {
    isPlanMissing,
    loading,
    schedulesCount,
    refetch,
  };
}
