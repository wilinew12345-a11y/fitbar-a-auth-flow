-- Add new columns for challenge types
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS metric_unit text,
ADD COLUMN IF NOT EXISTS target_value numeric,
ADD COLUMN IF NOT EXISTS current_value numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration_days integer,
ADD COLUMN IF NOT EXISTS frequency text,
ADD COLUMN IF NOT EXISTS color_theme text DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS icon text DEFAULT 'dumbbell';

-- Add constraint to ensure type is valid
ALTER TABLE public.challenges 
ADD CONSTRAINT challenges_type_check 
CHECK (type IN ('standard', 'numeric', 'habit'));