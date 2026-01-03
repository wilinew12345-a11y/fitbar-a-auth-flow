import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface ChallengeLog {
  id: string;
  userId: string;
  challengeId: string;
  logValue: number;
  loggedAt: string;
}

interface AddLogParams {
  challengeId: string;
  logValue: number;
}

export const useChallengeLogs = (challengeId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all logs for this challenge
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['challenge-logs', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_logs')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('logged_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(log => ({
        id: log.id,
        userId: log.user_id,
        challengeId: log.challenge_id,
        logValue: Number(log.log_value),
        loggedAt: log.logged_at,
      })) as ChallengeLog[];
    },
    enabled: !!challengeId && !!user?.id,
  });

  // Get today's log sum
  const { data: todaySum = 0 } = useQuery({
    queryKey: ['challenge-logs-today', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_today_log_sum', {
          p_challenge_id: challengeId,
          p_user_id: user!.id,
        });

      if (error) throw error;
      return Number(data) || 0;
    },
    enabled: !!challengeId && !!user?.id,
  });

  // Check if habit was completed today
  const { data: completedToday = false, isLoading: checkingToday } = useQuery({
    queryKey: ['challenge-habit-today', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('has_completed_habit_today', {
          p_challenge_id: challengeId,
          p_user_id: user!.id,
        });

      if (error) throw error;
      return Boolean(data);
    },
    enabled: !!challengeId && !!user?.id,
  });

  // Get total sum (all time)
  const { data: totalSum = 0 } = useQuery({
    queryKey: ['challenge-logs-total', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_total_log_sum', {
          p_challenge_id: challengeId,
        });

      if (error) throw error;
      return Number(data) || 0;
    },
    enabled: !!challengeId,
  });

  // Add a new log entry
  const addLogMutation = useMutation({
    mutationFn: async ({ challengeId, logValue }: AddLogParams) => {
      const { data, error } = await supabase
        .from('challenge_logs')
        .insert({
          user_id: user!.id,
          challenge_id: challengeId,
          log_value: logValue,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['challenge-logs', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenge-logs-today', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenge-logs-total', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenge-habit-today', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (error) => {
      console.error('Error adding log:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשמור את ההתקדמות. נסה שוב.',
        variant: 'destructive',
      });
    },
  });

  // Delete a log entry
  const deleteLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('challenge_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-logs', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenge-logs-today', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenge-logs-total', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenge-habit-today', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (error) => {
      console.error('Error deleting log:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את הרשומה.',
        variant: 'destructive',
      });
    },
  });

  const addLog = (logValue: number) => {
    if (!user?.id) {
      toast({
        title: 'שגיאה',
        description: 'יש להתחבר כדי לשמור התקדמות.',
        variant: 'destructive',
      });
      return;
    }
    addLogMutation.mutate({ challengeId, logValue });
  };

  const deleteLog = (logId: string) => {
    deleteLogMutation.mutate(logId);
  };

  return {
    logs,
    logsLoading,
    todaySum,
    totalSum,
    completedToday,
    checkingToday,
    addLog,
    deleteLog,
    isAdding: addLogMutation.isPending,
    isDeleting: deleteLogMutation.isPending,
  };
};
