-- Add workout_time column to weekly_schedules table for storing preferred workout times
ALTER TABLE weekly_schedules 
ADD COLUMN workout_time TIME DEFAULT NULL;