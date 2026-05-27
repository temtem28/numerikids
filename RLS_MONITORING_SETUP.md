# RLS Monitoring System Setup Guide

## Overview
The RLS Monitoring System automatically runs security tests daily and alerts administrators when violations are detected.

## Components Created

### 1. Database Tables
- **rls_test_runs**: Stores historical test run results
- **rls_test_results**: Stores individual test results per run
- **rls_alert_preferences**: Manages admin notification settings

### 2. Admin Dashboard Components
- **RLSMonitoringDashboard**: Visual dashboard showing test history and trends
- **RLSAlertSettings**: Interface for managing email alert preferences

### 3. Edge Function
- **rls-test-runner**: Executes RLS tests and stores results

## Setting Up Automated Daily Tests

### Option 1: Supabase Cron (Recommended)
Supabase supports pg_cron for scheduled tasks. Run this SQL:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily RLS tests at 2 AM UTC
SELECT cron.schedule(
  'daily-rls-security-tests',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/rls-test-runner',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body := jsonb_build_object('action', 'runAll')
  );
  $$
);
```

### Option 2: External Cron Service
Use services like:
- **GitHub Actions** (free for public repos)
- **Render Cron Jobs** (free tier available)
- **Vercel Cron** (requires Pro plan)

Example GitHub Actions workflow (.github/workflows/rls-tests.yml):

```yaml
name: Daily RLS Security Tests
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  run-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run RLS Tests
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            https://YOUR_PROJECT.supabase.co/functions/v1/rls-test-runner \
            -d '{"action":"runAll"}'
```

### Option 3: Cloud Functions
Deploy a simple cloud function (AWS Lambda, Google Cloud Functions) that runs daily.

## Email Alert Configuration

### 1. Add Admin Emails
Navigate to: **Admin Panel → RLS Monitor → Alert Settings**

Add admin email addresses and configure:
- Alert on Test Failures
- Alert on System Errors
- Daily Summary Report

### 2. Email Templates
The system sends alerts using the existing `send-email` edge function with:
- Subject: "🚨 RLS Security Test Failures Detected"
- Body: List of failed tests with details

### 3. Testing Alerts
Manually trigger a test run to verify email delivery:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  https://YOUR_PROJECT.supabase.co/functions/v1/rls-test-runner \
  -d '{"action":"runAll"}'
```

## Monitoring Dashboard Features

### Key Metrics
- **Latest Status**: Pass/Fail indicator
- **Average Success Rate**: Historical performance
- **Total Tests**: Number of security checks
- **Last Run**: Timestamp of most recent test

### Trend Chart
Line graph showing:
- Passed tests over time
- Failed tests over time
- Success rate percentage

### Recent Test Runs
List of last 10 test runs with:
- Timestamp
- Pass/fail counts
- Overall status badge

## Alert Thresholds

Configure when to send alerts:
- **Immediate**: Any test failure triggers alert
- **Threshold**: Alert after X consecutive failures
- **Daily Summary**: Send report regardless of status

## Troubleshooting

### Tests Not Running
1. Verify cron job is scheduled correctly
2. Check edge function logs: `supabase functions logs rls-test-runner`
3. Ensure service role key has proper permissions

### Alerts Not Sending
1. Check `rls_alert_preferences` table has entries
2. Verify `send-email` function is working
3. Check email service configuration (Resend API key)

### Dashboard Not Loading
1. Verify RLS policies allow admin access
2. Check browser console for errors
3. Ensure admin user has proper permissions

## Best Practices

1. **Multiple Admins**: Add 2-3 admin emails for redundancy
2. **Test Schedule**: Run during low-traffic hours (2-4 AM)
3. **Review Frequency**: Check dashboard weekly
4. **Immediate Response**: Investigate failures within 24 hours
5. **Backup Monitoring**: Use external uptime monitoring as backup

## Security Considerations

- Service role key should be stored securely
- Limit admin panel access to authorized users only
- Review alert preferences quarterly
- Keep test data retention to 30-90 days
- Monitor for unusual patterns in test results

## Next Steps

1. Set up automated daily tests using one of the options above
2. Add admin email addresses in Alert Settings
3. Run manual test to verify system works
4. Document incident response procedures
5. Schedule monthly review of monitoring data
