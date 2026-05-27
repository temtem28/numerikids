# Email Queue Cron Job Setup

## Overview
The email queue processing system requires a scheduled job to run periodically and process pending emails.

## Option 1: Supabase pg_cron (Recommended for Production)

If you have access to pg_cron extension in your Supabase project:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule hourly email processing
SELECT cron.schedule(
  'process-email-queue-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-email-queue',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

## Option 2: External Cron Services (Free Tier Compatible)

### Using cron-job.org (Free)
1. Visit https://cron-job.org
2. Create a free account
3. Create a new cron job:
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-email-queue`
   - Schedule: Every hour (0 * * * *)
   - Add header: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

### Using EasyCron (Free)
1. Visit https://www.easycron.com
2. Create a free account
3. Add new cron job:
   - URL: Your edge function URL
   - Cron Expression: `0 * * * *`
   - HTTP Method: POST
   - Custom Headers: Authorization header

### Using GitHub Actions (Free)
Create `.github/workflows/process-emails.yml`:

```yaml
name: Process Email Queue
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:  # Allow manual trigger

jobs:
  process-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-email-queue
```

## Option 3: Vercel Cron Jobs
If deploying on Vercel, add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/process-emails",
    "schedule": "0 * * * *"
  }]
}
```

## Monitoring
- View email queue status in Admin Panel > Email Queue tab
- Check cron_job_history table for execution logs
- Monitor failed emails and retry as needed

## Testing
Manually trigger the edge function to test:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-email-queue
```
