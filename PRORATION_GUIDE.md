# Proration Calculator Guide

## Overview
The Proration Calculator provides transparent pricing when users upgrade or downgrade their subscription plans mid-billing cycle. It shows detailed breakdowns of credits, charges, and the net amount due.

## Features

### Visual Breakdown
- **Current vs New Plan Comparison**: Side-by-side display of plan details
- **Remaining Days Calculation**: Shows days left in current billing period
- **Credit Calculation**: Displays unused credit from current plan
- **Prorated Charge**: Shows prorated cost for new plan
- **Net Amount**: Clear display of total amount due today
- **Next Billing Preview**: Shows upcoming billing date and amount

### Calculation Logic

#### Proration Formula
```
Remaining Days = Days until current period end
Total Days = 30 (monthly) or 365 (yearly)
Unused Ratio = Remaining Days / Total Days

Current Plan Credit = Current Plan Price × Unused Ratio
New Plan Charge = New Plan Price × Unused Ratio
Net Amount = New Plan Charge - Current Plan Credit
```

### User Experience Flow

1. **User clicks plan change button** → System checks for active subscription
2. **If active subscription exists** → Proration calculator modal opens
3. **User reviews breakdown** → Sees all costs transparently
4. **User confirms or cancels** → Proceeds to Stripe Checkout or closes modal

## Implementation Details

### Component: ProrationCalculator
Located: `src/components/billing/ProrationCalculator.tsx`

**Props:**
- `currentPlanId`: ID of user's current plan
- `currentPlanName`: Display name of current plan
- `currentPlanPrice`: Price of current plan (monthly or yearly)
- `newPlanId`: ID of plan user wants to switch to
- `newPlanName`: Display name of new plan
- `newPlanPrice`: Price of new plan
- `billingCycle`: 'monthly' or 'yearly'
- `currentPeriodEnd`: Date when current period ends
- `onConfirm`: Callback when user confirms change
- `onCancel`: Callback when user cancels
- `isLoading`: Loading state during processing

### Integration with SubscriptionPlans

The calculator automatically appears when:
- User has an active paid subscription
- User clicks to change to a different plan
- Plan change is not to the free tier

### Stripe Integration

When user confirms the plan change:
1. Modal closes
2. System creates Stripe Checkout session
3. Stripe handles actual proration automatically
4. User completes payment in Stripe
5. Webhook updates subscription status

## Stripe Proration Behavior

Stripe automatically handles proration when subscriptions change:

### Upgrades
- Immediate charge for prorated difference
- New plan features activate immediately
- Next billing at full new plan price

### Downgrades
- Credit applied to account
- Credit used toward next invoice
- Change takes effect immediately or at period end (configurable)

## Configuration

### Proration Settings in Stripe

```typescript
// In subscription-manager edge function
const subscription = await stripe.subscriptions.update(subscriptionId, {
  items: [{
    id: subscriptionItemId,
    price: newPriceId,
  }],
  proration_behavior: 'create_prorations', // or 'always_invoice'
  billing_cycle_anchor: 'unchanged' // Keep same billing date
});
```

### Proration Behavior Options
- `create_prorations`: Creates proration items (default)
- `none`: No proration, change at period end
- `always_invoice`: Immediately invoice for changes

## Testing Proration

### Test Scenarios

1. **Upgrade Mid-Cycle**
   - Start with Premium monthly ($19.99)
   - Wait 15 days
   - Upgrade to Family monthly ($29.99)
   - Verify credit: ~$10 credit, ~$15 charge, ~$5 net

2. **Downgrade Mid-Cycle**
   - Start with Family monthly ($29.99)
   - Wait 15 days
   - Downgrade to Premium monthly ($19.99)
   - Verify credit: ~$15 credit, ~$10 charge, ~$5 refund

3. **Yearly to Monthly**
   - Start with Premium yearly ($199)
   - Switch to Premium monthly ($19.99)
   - Verify calculations adjust for different cycles

### Test Mode
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Best Practices

1. **Always show proration before confirming**
2. **Display clear breakdown of all charges**
3. **Show next billing date and amount**
4. **Provide cancel option at any time**
5. **Handle loading states during processing**
6. **Show success/error messages after completion**

## Troubleshooting

### Common Issues

**Proration not showing:**
- Check if user has active subscription
- Verify subscription status is 'active'
- Ensure current_period_end is valid date

**Incorrect calculations:**
- Verify billing cycle matches subscription
- Check if prices are in same currency
- Ensure dates are properly formatted

**Stripe mismatch:**
- Proration preview is estimate only
- Actual Stripe calculation may differ slightly
- Stripe uses precise timestamps, we use days

## Future Enhancements

- [ ] Add tax calculations to proration
- [ ] Support multiple currencies
- [ ] Show historical proration adjustments
- [ ] Add proration preview API endpoint
- [ ] Support custom billing cycles
- [ ] Add proration to invoice PDFs
