-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule automatic football data fetching every 5 minutes
SELECT cron.schedule(
  'fetch-football-data-live',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://dptmmfreazjdxtahfjgj.supabase.co/functions/v1/fetch-football-data?operation=live',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdG1tZnJlYXpqZHh0YWhmamdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTU4MTEsImV4cCI6MjA2OTU3MTgxMX0.cr1f6G_0IFXncN8kt4rcxwfZ8zw5AeoeBBOUP_9x4qk"}'::jsonb
    ) as request_id;
  $$
);

-- Schedule fixtures and standings update every 2 hours
SELECT cron.schedule(
  'fetch-football-data-full',
  '0 */2 * * *', -- every 2 hours
  $$
  SELECT
    net.http_post(
        url:='https://dptmmfreazjdxtahfjgj.supabase.co/functions/v1/fetch-football-data?operation=all',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdG1tZnJlYXpqZHh0YWhmamdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTU4MTEsImV4cCI6MjA2OTU3MTgxMX0.cr1f6G_0IFXncN8kt4rcxwfZ8zw5AeoeBBOUP_9x4qk"}'::jsonb
    ) as request_id;
  $$
);