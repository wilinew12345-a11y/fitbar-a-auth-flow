-- Add cardio metrics columns to workout_history table
ALTER TABLE public.workout_history 
ADD COLUMN IF NOT EXISTS speed numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS incline numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration numeric DEFAULT 0;