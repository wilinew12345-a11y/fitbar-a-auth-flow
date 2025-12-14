-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_per_week INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge_workouts table (stores individual workouts within a challenge)
CREATE TABLE public.challenge_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  workout_index INTEGER NOT NULL,
  workout_text TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, workout_index)
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_workouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for challenges
CREATE POLICY "Users can view their own challenges"
ON public.challenges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenges"
ON public.challenges FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
ON public.challenges FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges"
ON public.challenges FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for challenge_workouts (via challenge ownership)
CREATE POLICY "Users can view their challenge workouts"
ON public.challenge_workouts FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.challenges 
  WHERE challenges.id = challenge_workouts.challenge_id 
  AND challenges.user_id = auth.uid()
));

CREATE POLICY "Users can create their challenge workouts"
ON public.challenge_workouts FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.challenges 
  WHERE challenges.id = challenge_workouts.challenge_id 
  AND challenges.user_id = auth.uid()
));

CREATE POLICY "Users can update their challenge workouts"
ON public.challenge_workouts FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.challenges 
  WHERE challenges.id = challenge_workouts.challenge_id 
  AND challenges.user_id = auth.uid()
));

CREATE POLICY "Users can delete their challenge workouts"
ON public.challenge_workouts FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.challenges 
  WHERE challenges.id = challenge_workouts.challenge_id 
  AND challenges.user_id = auth.uid()
));