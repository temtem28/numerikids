# Dunning Management System Setup Guide

## Overview
The dunning management system automatically handles failed payments with smart retry logic, escalating email notifications, grace periods, and comprehensive recovery tracking.

## Features
- **Smart Retry Logic**: Automatic retry attempts on days 3, 5, and 7 after payment failure
- **Escalating Notifications**: Progressive email alerts with increasing urgency
- **Grace Periods**: 7-day grace period before service suspension
- **Recovery Tracking**: Comprehensive metrics and analytics
- **Admin Dashboard**: Monitor at-risk subscriptions and recovery rates

## Database Tables

### failed_payments
Tracks all failed payment attempts and their current status.
- `status`: pending, recovering, recovered, suspended, cancelled
- `retry_count`: Number of retry attempts made
- `grace_period_ends_at`: Date when service will be suspended
- `next_retry_at`: Scheduled date for next retry attempt

### payment_retry_attempts
Logs each retry attempt with scheduling and results.

### dunning_notifications
Tracks all dunning emails sent to customers.
- Notification types: initial, reminder_1, reminder_2, final_warning, suspension_notice

### dunning_recovery_metrics
Daily aggregated metrics for recovery analysis.

## Workflow

### 1. Payment Failure Detection
When Stripe webhook receives `invoice.payment_failed`:
- Creates failed_payment record
- Schedules 3 retry attempts (days 3, 5, 7)
- Sets 7-day grace period
- Sends initial dunning email

### 2. Automatic Retry Schedule
```
Day 0: Payment fails → Initial notification
Day 3: First retry attempt → Reminder #1
Day 5: Second retry attempt → Reminder #2
Day 7: Final retry attempt → Final warning
Day 7+: Service suspension → Suspension notice
```

### 3. Email Escalation
Each notification increases in urgency:
1. **Initial**: "Payment Failed - Action Required"
2. **Reminder 1**: "Payment Reminder - Update Required"
3. **Reminder 2**: "Urgent: Payment Still Pending"
4. **Final Warning**: "Final Notice: Update Payment by [Date]"
5. **Suspension**: "Service Suspended - Payment Required"

## Setup Instructions

### 1. Environment Variables
Ensure these are configured in Supabase:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Stripe Webhook Configuration
Configure your Stripe webhook to listen for:
- `invoice.payment_failed`
- `invoice.payment_succeeded`

Webhook URL: `https://[your-project].supabase.co/functions/v1/stripe-webhook`

### 3. Email Templates
Create dunning email templates in your email system:
- `dunning_initial`
- `dunning_reminder_1`
- `dunning_reminder_2`
- `dunning_final_warning`
- `dunning_suspension_notice`
- `payment_recovered`

### 4. Cron Job Setup (Optional)
For automatic retry processing, set up a cron job:
```sql
-- Run every day at 9 AM to process scheduled retries
SELECT cron.schedule(
  'process-dunning-retries',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='https://[your-project].supabase.co/functions/v1/dunning-manager',
    body:='{"action":"process_scheduled_retries"}'::jsonb
  );
  $$
);
```

## Admin Dashboard Usage

### Monitoring At-Risk Subscriptions
1. Navigate to Admin Panel → Dunning tab
2. View all failed payments with current status
3. See retry counts and grace period deadlines
4. Monitor recovery rates and metrics

### Key Metrics
- **At-Risk Subscriptions**: Total active failed payments
- **Amount at Risk**: Total revenue pending recovery
- **Recovery Rate**: Percentage of failed payments recovered
- **Active Retries**: Payments currently in retry cycle

## Customer Experience

### Payment Failure Alert
Customers see a prominent alert on their dashboard:
- Shows amount due
- Displays days until suspension
- Provides "Update Payment Method" button
- Links directly to Stripe Customer Portal

### Email Notifications
Customers receive escalating emails:
- Clear subject lines indicating urgency
- Direct link to update payment method
- Grace period countdown
- Support contact information

## Testing

### Test Failed Payment Flow
1. Use Stripe test card that fails: `4000000000000341`
2. Create subscription with test card
3. Wait for payment failure
4. Verify dunning workflow triggers
5. Check email notifications sent
6. Monitor retry attempts

### Test Recovery
1. Use Stripe Customer Portal to update payment method
2. Verify payment succeeds
3. Check failed_payment status updates to 'recovered'
4. Confirm recovery email sent

## Best Practices

### Grace Period
- Default: 7 days
- Adjust based on your business needs
- Consider customer lifetime value

### Retry Schedule
- Default: Days 3, 5, 7
- Space retries to allow customer action
- Avoid too frequent attempts

### Email Tone
- Start friendly and helpful
- Gradually increase urgency
- Always provide clear action steps
- Include support contact

### Service Suspension
- Clearly communicate suspension date
- Provide easy reactivation path
- Consider partial service degradation first

## Troubleshooting

### Retries Not Processing
- Check cron job is running
- Verify edge function permissions
- Review function logs

### Emails Not Sending
- Verify email templates exist
- Check send-email function
- Review email queue

### Metrics Not Updating
- Ensure webhook events processing
- Check database permissions
- Review recovery calculation logic

## API Reference

### Process Failed Payment
```javascript
await supabase.functions.invoke('dunning-manager', {
  body: {
    action: 'process_failed_payment',
    invoiceId: 'in_xxx',
    userId: 'user-uuid',
    subscriptionId: 'sub_xxx'
  }
});
```

### Process Retry
```javascript
await supabase.functions.invoke('dunning-manager', {
  body: {
    action: 'process_retry',
    failedPaymentId: 'uuid'
  }
});
```

### Get At-Risk Subscriptions
```javascript
const { data } = await supabase.functions.invoke('dunning-manager', {
  body: { action: 'get_at_risk' }
});
```

### Get Recovery Metrics
```javascript
const { data } = await supabase.functions.invoke('dunning-manager', {
  body: { action: 'get_metrics' }
});
```

## Support
For issues or questions, contact your development team or refer to the Stripe documentation for payment retry best practices.
