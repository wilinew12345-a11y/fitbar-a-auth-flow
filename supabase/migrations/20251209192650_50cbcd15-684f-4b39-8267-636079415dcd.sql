-- Create weekly_schedules table for the new workout builder
CREATE TABLE public.weekly_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_of_week TEXT NOT NULL,
  workout_types TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);

-- Enable Row Level Security
ALTER TABLE public.weekly_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own schedules"
ON public.weekly_schedules
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules"
ON public.weekly_schedules
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
ON public.weekly_schedules
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
ON public.weekly_schedules
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_weekly_schedules_updated_at
BEFORE UPDATE ON public.weekly_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();