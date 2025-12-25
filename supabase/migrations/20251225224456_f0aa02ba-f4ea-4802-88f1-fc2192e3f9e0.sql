-- Add unique constraint to prevent duplicate schedules per user per day
ALTER TABLE weekly_schedules 
ADD CONSTRAINT weekly_schedules_user_day_unique 
UNIQUE (user_id, day_of_week);

-- Clean up any existing duplicates (keep the most recent one)
DELETE FROM weekly_schedules a
USING weekly_schedules b
WHERE a.user_id = b.user_id 
  AND a.day_of_week = b.day_of_week 
  AND a.created_at < b.created_at;