-- Allow public read access to challenges (guests can view shared challenges)
CREATE POLICY "Public Read Access for challenges" 
ON public.challenges FOR SELECT 
USING (true);

-- Allow public read access to challenge_workouts (guests can view shared challenge workouts)
CREATE POLICY "Public Read Access for challenge_workouts" 
ON public.challenge_workouts FOR SELECT 
USING (true);