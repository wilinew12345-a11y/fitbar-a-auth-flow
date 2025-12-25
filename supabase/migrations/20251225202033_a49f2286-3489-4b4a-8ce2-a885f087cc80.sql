-- Add AI quota columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ai_chat_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_ai_usage_date date;

-- Create function to check and increment AI usage atomically
CREATE OR REPLACE FUNCTION public.check_and_increment_ai_usage(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  current_date_val date := CURRENT_DATE;
  last_usage_date date;
  daily_limit integer := 20;
BEGIN
  -- Get current values
  SELECT ai_chat_count, last_ai_usage_date 
  INTO current_count, last_usage_date
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Reset count if it's a new day
  IF last_usage_date IS NULL OR last_usage_date < current_date_val THEN
    current_count := 0;
  END IF;
  
  -- Check if limit reached
  IF current_count >= daily_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'current_count', current_count,
      'limit', daily_limit,
      'message', 'Daily limit reached'
    );
  END IF;
  
  -- Increment count atomically
  UPDATE profiles 
  SET ai_chat_count = current_count + 1,
      last_ai_usage_date = current_date_val
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'current_count', current_count + 1,
    'limit', daily_limit
  );
END;
$$;

-- Create function to get current AI usage
CREATE OR REPLACE FUNCTION public.get_ai_usage(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  current_date_val date := CURRENT_DATE;
  last_usage_date date;
  daily_limit integer := 20;
BEGIN
  SELECT ai_chat_count, last_ai_usage_date 
  INTO current_count, last_usage_date
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Reset count if it's a new day
  IF last_usage_date IS NULL OR last_usage_date < current_date_val THEN
    current_count := 0;
  END IF;
  
  RETURN jsonb_build_object(
    'current_count', COALESCE(current_count, 0),
    'limit', daily_limit,
    'remaining', daily_limit - COALESCE(current_count, 0)
  );
END;
$$;