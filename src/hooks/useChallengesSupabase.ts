import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Workout {
  id: string;
  text: string;
  completed: boolean;
  workoutIndex: number;
}

export interface Challenge {
  id: string;
  title: string;
  targetPerWeek: number;
  workouts: Workout[];
  createdAt: string;
}

// Default challenges to seed for new users
const DEFAULT_CHALLENGES_DATA = [
  {
    title: 'אתגר ה-30',
    targetPerWeek: 5,
    workouts: [
      'אימון ריצה + בטן',
      'חזה/כתפיים/יד אחורית',
      'יד קדמית/גב',
      'רגליים',
      'ריצה/יד אחורית/חזה/בטן',
      'יד קדמית/גב/בטן',
      'כתפיים/רגליים',
      'חזה/יד אחורית',
      'רגליים/כתפיים',
      'חזה/יד אחורית',
      'יד קדמית/גב/בטן',
      'רגליים/כתפיים',
      'חזה/יד אחורית/בטן/אירובי',
      'רגליים/כתפיים/בטן',
      'יד קדמית/גב',
      'חזה/יד אחורית/בטן/אירובי',
      'יד קדמית/גב/בטן',
      'רגליים/כתפיים',
      'אירובי/בטן - פעם ראשונה ביום שבת!!!',
      'חזה/יד אחורית/בט',
      'יד קדמית/גב/קפיצה עם חבל',
      'רגליים/כתפיים',
      'אימון חלק עליון+תחתון/קפיצה עם החבל-יום שבת!!!',
      'חזה/יד אחורית/בטן/אירובי',
      'יד קדמית/גב/בטן',
      'רגליים/כתפיים',
      'חזה/יד אחורית/בטן/אירובי (קפיצה עם החבל)',
      'יד קדמית/גב/קפיצה עם חבל/בטן',
      'רגליים/כתפיים/בטן',
      'חזה/יד אחורית/בטן/אירובי',
    ],
  },
  {
    title: 'אתגר ה-60',
    targetPerWeek: 4,
    workouts: [
      'יד קדמית/גב/קפיצה עם חבל/בטן',
      'רגליים/כתפיים',
      'חזה/יד אחורית/אירובי/בטן',
      'יד קדמית/גב/בטן/אירובי/קפיצה עם החבל',
      'רגליים/כתפיים/אירובי/בטן (לא אימון מלא)',
      'רגליים/כתפיים/בטן',
      'חזה/יד אחורית/אירובי/בטן',
      'חזה/יד אחורית/בטן',
      'יד קדמית/גב',
      'כתפיים/אירובי',
      'חזה/יד אחורית/בטן',
      'יד קדמית/גב',
      'בטן',
      'כתפיים/תרגיל אחד רגליים',
      'חזה/יד אחורית/בטן',
      'יד קדמית/גב/אופניים אירובי',
      'כתפיים/בטן',
      'פול באדי',
      'חזה/יד אחורית',
      'יד קדמית/גב/בטן',
      'כתפיים',
      'גב/יד קדמית,אחורית/חזה/אירובי/בטן -סט 1',
      'חזה/יד אחורית/מתח/בטן',
      'יד קדמית/גב/בטן',
      'אימון ריצה',
      'כתפיים/רגליים',
      'גב/יד אחורית וקדמית/חזה/בטן',
      'חזה/יד אחורית/בטן',
      'יד קדמית/גב/בטן',
      'כתפיים/בטן',
      'גב/יד אחורית וקדמית/חזה/כתפיים/בטן',
      'חזה/יד אחורית/בטן',
      'כתפיים/בטן',
      'ריצה/מתח/בטן',
      'מתח/גב/יד קדמית/בטן',
      'מתח/יד אחורית/חזה/בטן',
      'מתח/גב/יד קדמית/בטן',
      'ריצה 30 דקות/מתח/שכיבות שמיכה',
      'כתפיים/מתח/בטן',
      'גב/יד קדמית/חזה/יד אחורית/מתח/בטן',
      'חזה/יד אחורית/מתח/בטן',
      'גב/יד קדמית/חזה/יד אחורית/מתח/בטן',
      'כתפיים/רגליים/מתח/בטן',
      'מתח/חיזוק forearms/בטן',
      'גב/יד קדמית/אמות',
      'כתפיים/רגליים/מתח/בטן',
      'ריצה/רגליים/כתפיים/גב/יד קדמית/אחורית/חזה',
      'חזה/יד אחורית/בטן',
      'גב/יד קדמית/אמות/מתח/בטן',
      'פול באדי כל תרגיל סט אחד',
      'חזה/יד אחורית/בטן/מתח',
      'גב/יד קדמית/אמות',
      'ריצה/מתח/שכיבות שמיכנ',
      'כתפיים/גב/מתח/בטן',
      'חזה/יד אחורית/מתח/בטן',
      'גב/יד קדמית/מתח/בטן',
      'אירובי/מתח/שכיבות שמיכה',
      'כתפיים/רגליים/מתח/בטן',
      'אימון השלמה 1',
      'אימון השלמה 2',
    ],
  },
];

// Seed default challenges for a new user
async function seedDefaultChallenges(userId: string) {
  for (const challengeData of DEFAULT_CHALLENGES_DATA) {
    // Create challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .insert({
        user_id: userId,
        title: challengeData.title,
        target_per_week: challengeData.targetPerWeek,
      })
      .select()
      .single();

    if (challengeError || !challenge) {
      console.error('Error creating challenge:', challengeError);
      continue;
    }

    // Create workouts for this challenge
    const workoutsToInsert = challengeData.workouts.map((text, index) => ({
      challenge_id: challenge.id,
      workout_index: index,
      workout_text: text,
      is_completed: false,
    }));

    const { error: workoutsError } = await supabase
      .from('challenge_workouts')
      .insert(workoutsToInsert);

    if (workoutsError) {
      console.error('Error creating workouts:', workoutsError);
    }
  }
}

// Fetch challenges with their workouts
async function fetchChallenges(userId: string): Promise<Challenge[]> {
  const { data: challengesData, error: challengesError } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (challengesError) {
    throw challengesError;
  }

  if (!challengesData || challengesData.length === 0) {
    // Seed default challenges for new user
    await seedDefaultChallenges(userId);
    // Fetch again after seeding
    const { data: seededData, error: seededError } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (seededError) throw seededError;
    if (!seededData) return [];
    
    return await enrichChallengesWithWorkouts(seededData);
  }

  return await enrichChallengesWithWorkouts(challengesData);
}

async function enrichChallengesWithWorkouts(challengesData: any[]): Promise<Challenge[]> {
  const challengeIds = challengesData.map(c => c.id);
  
  const { data: workoutsData, error: workoutsError } = await supabase
    .from('challenge_workouts')
    .select('*')
    .in('challenge_id', challengeIds)
    .order('workout_index', { ascending: true });

  if (workoutsError) {
    throw workoutsError;
  }

  return challengesData.map(challenge => ({
    id: challenge.id,
    title: challenge.title,
    targetPerWeek: challenge.target_per_week,
    createdAt: challenge.created_at,
    workouts: (workoutsData || [])
      .filter(w => w.challenge_id === challenge.id)
      .map(w => ({
        id: w.id,
        text: w.workout_text,
        completed: w.is_completed,
        workoutIndex: w.workout_index,
      })),
  }));
}

export const useChallengesSupabase = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading, error } = useQuery({
    queryKey: ['challenges', user?.id],
    queryFn: () => fetchChallenges(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Toggle workout completion with optimistic update
  const toggleWorkoutMutation = useMutation({
    mutationFn: async ({ workoutId, completed }: { workoutId: string; completed: boolean }) => {
      const { error } = await supabase
        .from('challenge_workouts')
        .update({
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', workoutId);

      if (error) throw error;
    },
    onMutate: async ({ workoutId, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['challenges', user?.id] });

      // Snapshot previous value
      const previousChallenges = queryClient.getQueryData<Challenge[]>(['challenges', user?.id]);

      // Optimistically update
      queryClient.setQueryData<Challenge[]>(['challenges', user?.id], (old) =>
        old?.map(challenge => ({
          ...challenge,
          workouts: challenge.workouts.map(w =>
            w.id === workoutId ? { ...w, completed } : w
          ),
        }))
      );

      return { previousChallenges };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousChallenges) {
        queryClient.setQueryData(['challenges', user?.id], context.previousChallenges);
      }
      toast({
        title: 'Error',
        description: 'Failed to update workout. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Add new challenge
  const addChallengeMutation = useMutation({
    mutationFn: async ({ title, targetPerWeek, workoutsText }: { title: string; targetPerWeek: number; workoutsText: string }) => {
      const workouts = workoutsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Create challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          user_id: user!.id,
          title,
          target_per_week: targetPerWeek,
        })
        .select()
        .single();

      if (challengeError || !challenge) throw challengeError;

      // Create workouts
      const workoutsToInsert = workouts.map((text, index) => ({
        challenge_id: challenge.id,
        workout_index: index,
        workout_text: text,
        is_completed: false,
      }));

      const { error: workoutsError } = await supabase
        .from('challenge_workouts')
        .insert(workoutsToInsert);

      if (workoutsError) throw workoutsError;

      return challenge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges', user?.id] });
      toast({
        title: 'Success',
        description: 'Challenge created successfully!',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create challenge. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete challenge
  const deleteChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges', user?.id] });
      toast({
        title: 'Success',
        description: 'Challenge deleted successfully!',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete challenge. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Reset challenge progress
  const resetChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase
        .from('challenge_workouts')
        .update({
          is_completed: false,
          completed_at: null,
        })
        .eq('challenge_id', challengeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges', user?.id] });
      toast({
        title: 'Success',
        description: 'Challenge progress reset!',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reset challenge. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Add single workout to existing challenge
  const addWorkoutMutation = useMutation({
    mutationFn: async ({ challengeId, workoutText }: { challengeId: string; workoutText: string }) => {
      // Get the current max workout_index for this challenge
      const { data: existingWorkouts, error: fetchError } = await supabase
        .from('challenge_workouts')
        .select('workout_index')
        .eq('challenge_id', challengeId)
        .order('workout_index', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const nextIndex = existingWorkouts && existingWorkouts.length > 0 
        ? existingWorkouts[0].workout_index + 1 
        : 0;

      const { error } = await supabase
        .from('challenge_workouts')
        .insert({
          challenge_id: challengeId,
          workout_index: nextIndex,
          workout_text: workoutText,
          is_completed: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges', user?.id] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add workout. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Remove single workout from challenge
  const removeWorkoutMutation = useMutation({
    mutationFn: async (workoutId: string) => {
      const { error } = await supabase
        .from('challenge_workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges', user?.id] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove workout. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const toggleWorkout = (challengeId: string, workoutId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    const workout = challenge?.workouts.find(w => w.id === workoutId);
    if (workout) {
      toggleWorkoutMutation.mutate({ workoutId, completed: !workout.completed });
    }
  };

  const addChallenge = (title: string, targetPerWeek: number, workoutsText: string) => {
    addChallengeMutation.mutate({ title, targetPerWeek, workoutsText });
  };

  const deleteChallenge = (id: string) => {
    deleteChallengeMutation.mutate(id);
  };

  const resetChallenge = (challengeId: string) => {
    resetChallengeMutation.mutate(challengeId);
  };

  const addWorkoutToChallenge = (challengeId: string, workoutText: string) => {
    addWorkoutMutation.mutate({ challengeId, workoutText });
  };

  const removeWorkoutFromChallenge = (workoutId: string) => {
    removeWorkoutMutation.mutate(workoutId);
  };

  const getProgress = (challenge: Challenge) => {
    const completed = challenge.workouts.filter(w => w.completed).length;
    const total = challenge.workouts.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  return {
    challenges,
    isLoading,
    error,
    addChallenge,
    deleteChallenge,
    toggleWorkout,
    resetChallenge,
    addWorkoutToChallenge,
    removeWorkoutFromChallenge,
    getProgress,
  };
};
