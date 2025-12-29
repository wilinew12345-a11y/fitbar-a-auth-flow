-- Add workout_time and scheduled_date columns to challenge_workouts
ALTER TABLE challenge_workouts 
ADD COLUMN IF NOT EXISTS workout_time TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS scheduled_date DATE;

-- Add index for efficient querying by the edge function
CREATE INDEX IF NOT EXISTS idx_challenge_workouts_pending 
ON challenge_workouts (workout_time, is_completed) 
WHERE is_completed = FALSE AND workout_time IS NOT NULL;

-- Populate existing challenge workouts with default times from user's weekly schedules
UPDATE challenge_workouts cw
SET workout_time = sub.default_time
FROM (
  SELECT DISTINCT ON (c.id) c.id as challenge_id, ws.workout_time as default_time
  FROM challenges c
  JOIN weekly_schedules ws ON ws.user_id = c.user_id AND ws.workout_time IS NOT NULL
  ORDER BY c.id, ws.updated_at DESC
) sub
WHERE cw.challenge_id = sub.challenge_id
  AND cw.workout_time IS NULL;

-- Function to sync workout time from weekly_schedules to challenge_workouts
CREATE OR REPLACE FUNCTION sync_challenge_workout_times()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a user updates their weekly schedule workout_time,
  -- update all their incomplete challenge workouts that don't have a manually set time
  UPDATE challenge_workouts cw
  SET workout_time = NEW.workout_time
  FROM challenges c
  WHERE c.id = cw.challenge_id
    AND c.user_id = NEW.user_id
    AND cw.is_completed = FALSE;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_weekly_schedule_time_update ON weekly_schedules;

-- Trigger on weekly_schedules updates
CREATE TRIGGER on_weekly_schedule_time_update
  AFTER UPDATE OF workout_time ON weekly_schedules
  FOR EACH ROW
  WHEN (NEW.workout_time IS DISTINCT FROM OLD.workout_time)
  EXECUTE FUNCTION sync_challenge_workout_times();