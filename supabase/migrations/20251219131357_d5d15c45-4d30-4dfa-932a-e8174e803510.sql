-- Fix security issue: Restrict challenges table to private access only

-- Drop the existing public SELECT policy on challenges
DROP POLICY IF EXISTS "Anyone can view challenges" ON public.challenges;

-- Create a new private SELECT policy - users can only view their own challenges
CREATE POLICY "Users can view their own challenges"
ON public.challenges
FOR SELECT
USING (auth.uid() = user_id);

-- Also fix challenge_workouts table which has the same issue
DROP POLICY IF EXISTS "Anyone can view challenge workouts" ON public.challenge_workouts;

-- Create a new private SELECT policy - users can only view workouts for their own challenges
CREATE POLICY "Users can view their own challenge workouts"
ON public.challenge_workouts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.challenges
    WHERE challenges.id = challenge_workouts.challenge_id
    AND challenges.user_id = auth.uid()
  )
);