# Stripe Integration Setup Guide

## Environment Variables Required

Add these secrets to your Supabase project:

1. **STRIPE_SECRET_KEY**: Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
2. **STRIPE_WEBHOOK_SECRET**: Your webhook signing secret (starts with `whsec_`)

## Setup Steps

### 1. Create Stripe Account
- Sign up at https://stripe.com
- Get your API keys from the Dashboard

### 2. Create Products and Prices in Stripe

Create three products with recurring prices:

**Premium Plan:**
- Monthly: $9.99/month
- Yearly: $99/year
- Copy the Price IDs (starts with `price_`)

**Family Plan:**
- Monthly: $19.99/month  
- Yearly: $199/year
- Copy the Price IDs

### 3. Update Database with Stripe Price IDs

```sql
-- Update Premium plan
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_xxx_monthly',
    stripe_price_id_yearly = 'price_xxx_yearly'
WHERE name = 'premium';

-- Update Family plan
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_xxx_monthly',
    stripe_price_id_yearly = 'price_xxx_yearly'
WHERE name = 'family';
```

### 4. Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
4. Copy the webhook signing secret (starts with `whsec_`)

### 5. Add Secrets to Supabase

```bash
# Using Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

Or add via Supabase Dashboard → Project Settings → Edge Functions → Secrets

### 6. Configure Customer Portal

1. Go to Stripe Dashboard → Settings → Billing → Customer Portal
2. Enable customer portal
3. Configure features:
   - Update payment methods ✓
   - Cancel subscriptions ✓
   - Update subscriptions ✓
4. Set business information and branding

## Testing

### Test Mode
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

### Test Webhooks Locally
```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

## Features Implemented

✓ Stripe Checkout for subscriptions
✓ Customer Portal for payment management
✓ Webhook handling for subscription events
✓ Trial period support (14 days for Premium/Family)
✓ Payment failure handling
✓ Subscription cancellation
✓ Automatic invoice generation
✓ Proration for plan changes with visual calculator
✓ Usage tracking per billing period
✓ Detailed proration breakdown before plan changes

## Proration Handling

### Visual Proration Calculator
When users upgrade or downgrade plans mid-cycle, they see:
- Remaining days in current billing period
- Credit from unused time on current plan
- Prorated charge for new plan
- Net amount due today
- Next billing date and amount

See `PRORATION_GUIDE.md` for detailed documentation.

### Stripe Proration Configuration
```typescript
// Automatic proration on subscription updates
proration_behavior: 'create_prorations'
billing_cycle_anchor: 'unchanged'
```

### How Proration Works
1. User clicks to change plan
2. System shows proration calculator modal
3. User reviews detailed breakdown
4. User confirms → Stripe processes proration
5. Webhook updates subscription status


## Subscription Lifecycle

1. **New Subscription**: User clicks "Subscribe" → Stripe Checkout → webhook creates subscription
2. **Trial Period**: 14-day trial for Premium/Family plans
3. **Active**: Subscription active, payments processed automatically
4. **Payment Failed**: Status changes to `past_due`, user notified
5. **Cancellation**: Subscription remains active until period end
6. **Renewal**: Automatic renewal, usage tracking resets

## Customer Portal Features

Users can:
- Update payment methods
- View payment history
- Download invoices
- Cancel subscription
- Reactivate canceled subscription
- Update billing information
