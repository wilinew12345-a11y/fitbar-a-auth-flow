-- Enable pg_net extension for HTTP calls from cron
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the workout reminder function to run every minute
SELECT cron.schedule(
  'send-workout-reminders',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wdccaqibuxtgktejushz.supabase.co/functions/v1/send-workout-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkY2NhcWlidXh0Z2t0ZWp1c2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTE4NzksImV4cCI6MjA4MDY4Nzg3OX0.n8JtNza2g5ha6A07dFlpKGFbIPaGKL9ljcYCOri2CmU"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);