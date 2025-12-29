-- Drop the sync trigger (no longer needed)
DROP TRIGGER IF EXISTS on_weekly_schedule_time_update ON weekly_schedules;

-- Drop the sync function
DROP FUNCTION IF EXISTS sync_challenge_workout_times();

-- Remove the redundant columns from challenge_workouts
ALTER TABLE challenge_workouts DROP COLUMN IF EXISTS workout_time;
ALTER TABLE challenge_workouts DROP COLUMN IF EXISTS scheduled_date;

-- Drop the index that was created for these columns
DROP INDEX IF EXISTS idx_challenge_workouts_pending;