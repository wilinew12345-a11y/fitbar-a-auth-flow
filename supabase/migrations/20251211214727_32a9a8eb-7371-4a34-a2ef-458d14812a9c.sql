-- Add aerobic-specific columns to exercises table
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS speed numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS incline numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration numeric DEFAULT 0;