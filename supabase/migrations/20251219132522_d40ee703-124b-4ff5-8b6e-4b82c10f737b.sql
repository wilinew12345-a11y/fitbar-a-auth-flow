-- Add missing UPDATE policy for workout_history table
CREATE POLICY "Users can update their own workout history"
ON public.workout_history
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);