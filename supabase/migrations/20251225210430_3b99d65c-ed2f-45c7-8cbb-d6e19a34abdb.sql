-- Add push_subscription column to profiles table for storing browser push subscription
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS push_subscription JSONB DEFAULT NULL;

-- Add preferred_language column to profiles for notification language
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'he';

-- Create index for efficient querying of schedules by time
CREATE INDEX IF NOT EXISTS idx_weekly_schedules_workout_time 
ON public.weekly_schedules(workout_time);

-- Create index for users with push subscriptions
CREATE INDEX IF NOT EXISTS idx_profiles_push_subscription 
ON public.profiles USING GIN (push_subscription) 
WHERE push_subscription IS NOT NULL;