-- Create challenge_logs table for tracking daily progress
CREATE TABLE public.challenge_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  log_value numeric NOT NULL DEFAULT 1,
  logged_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_challenge_logs_challenge_id ON public.challenge_logs(challenge_id);
CREATE INDEX idx_challenge_logs_user_id ON public.challenge_logs(user_id);
CREATE INDEX idx_challenge_logs_logged_at ON public.challenge_logs(logged_at);

-- Enable Row Level Security
ALTER TABLE public.challenge_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own challenge logs"
ON public.challenge_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenge logs"
ON public.challenge_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenge logs"
ON public.challenge_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Function to get today's log sum for a challenge
CREATE OR REPLACE FUNCTION public.get_today_log_sum(p_challenge_id uuid, p_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(log_value), 0)
  FROM public.challenge_logs
  WHERE challenge_id = p_challenge_id
    AND user_id = p_user_id
    AND logged_at::date = CURRENT_DATE;
$$;

-- Function to check if habit was completed today
CREATE OR REPLACE FUNCTION public.has_completed_habit_today(p_challenge_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.challenge_logs
    WHERE challenge_id = p_challenge_id
      AND user_id = p_user_id
      AND logged_at::date = CURRENT_DATE
  );
$$;

-- Function to get total log sum for a challenge (all time)
CREATE OR REPLACE FUNCTION public.get_total_log_sum(p_challenge_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(log_value), 0)
  FROM public.challenge_logs
  WHERE challenge_id = p_challenge_id;
$$;