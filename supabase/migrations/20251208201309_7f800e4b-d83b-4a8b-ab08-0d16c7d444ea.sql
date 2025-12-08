-- Create table for weekly workout schedule
CREATE TABLE public.weekly_workout_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  planned_workouts_count INTEGER NOT NULL DEFAULT 3 CHECK (planned_workouts_count >= 1 AND planned_workouts_count <= 7),
  sunday TEXT NOT NULL DEFAULT 'rest',
  monday TEXT NOT NULL DEFAULT 'rest',
  tuesday TEXT NOT NULL DEFAULT 'rest',
  wednesday TEXT NOT NULL DEFAULT 'rest',
  thursday TEXT NOT NULL DEFAULT 'rest',
  friday TEXT NOT NULL DEFAULT 'rest',
  saturday TEXT NOT NULL DEFAULT 'rest',
  skipped_setup BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.weekly_workout_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own schedule" 
ON public.weekly_workout_schedule 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedule" 
ON public.weekly_workout_schedule 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedule" 
ON public.weekly_workout_schedule 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_weekly_workout_schedule_updated_at
BEFORE UPDATE ON public.weekly_workout_schedule
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();