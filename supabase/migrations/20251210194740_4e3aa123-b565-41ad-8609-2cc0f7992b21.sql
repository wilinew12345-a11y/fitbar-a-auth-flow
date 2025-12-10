-- Create workout_history table to store past workouts
CREATE TABLE public.workout_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  exercise_name TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 0,
  sets NUMERIC NOT NULL DEFAULT 0,
  reps NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own workout history"
ON public.workout_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout history"
ON public.workout_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout history"
ON public.workout_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_workout_history_user_exercise ON public.workout_history(user_id, exercise_name, created_at DESC);