-- Add cardio metrics columns to BOTH tables (do not delete existing columns)
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS speed numeric,
  ADD COLUMN IF NOT EXISTS incline numeric,
  ADD COLUMN IF NOT EXISTS duration_minutes numeric;

ALTER TABLE public.workout_history
  ADD COLUMN IF NOT EXISTS speed numeric,
  ADD COLUMN IF NOT EXISTS incline numeric,
  ADD COLUMN IF NOT EXISTS duration_minutes numeric;

-- Optional: keep legacy columns if they exist; no drop performed.
