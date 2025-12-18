-- Drop the restrictive SELECT policies
DROP POLICY IF EXISTS "Users can view their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can view their challenge workouts" ON public.challenge_workouts;

-- Create new policies for public read access
CREATE POLICY "Anyone can view challenges"
ON public.challenges
FOR SELECT
USING (true);

CREATE POLICY "Anyone can view challenge workouts"
ON public.challenge_workouts
FOR SELECT
USING (true);