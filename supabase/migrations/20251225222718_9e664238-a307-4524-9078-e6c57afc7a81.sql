-- Add integration settings columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS calendar_sync_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT false;