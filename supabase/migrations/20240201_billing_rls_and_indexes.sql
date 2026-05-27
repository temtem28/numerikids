-- Migration: Billing RLS and Indexes
-- Created: 2024-02-01
-- Description: Enable RLS on billing tables and add performance indexes

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);

-- Payment history indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- Failed payments indexes
CREATE INDEX IF NOT EXISTS idx_failed_payments_user_id ON failed_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_failed_payments_status ON failed_payments(status);
CREATE INDEX IF NOT EXISTS idx_failed_payments_invoice ON failed_payments(invoice_id);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);

-- Subscription plans indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on billing tables
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view own payment history" ON payment_history;
DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
DROP POLICY IF EXISTS "Users can view own failed payments" ON failed_payments;
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;

-- User Subscriptions Policies
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Payment History Policies
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage payment history
CREATE POLICY "Service role can manage payment history" ON payment_history
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Usage Tracking Policies
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage usage tracking
CREATE POLICY "Service role can manage usage tracking" ON usage_tracking
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Failed Payments Policies
CREATE POLICY "Users can view own failed payments" ON failed_payments
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage failed payments
CREATE POLICY "Service role can manage failed payments" ON failed_payments
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Subscription Plans Policies (public read for active plans)
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Service role can manage subscription plans
CREATE POLICY "Service role can manage subscription plans" ON subscription_plans
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's current subscription tier
CREATE OR REPLACE FUNCTION get_user_subscription_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_tier TEXT;
BEGIN
  SELECT sp.name INTO v_tier
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status IN ('active', 'trialing')
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(v_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION user_has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = p_user_id
      AND status IN ('active', 'trialing')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription limits for a user
CREATE OR REPLACE FUNCTION get_user_subscription_limits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_limits JSONB;
BEGIN
  SELECT sp.limits INTO v_limits
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status IN ('active', 'trialing')
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- Return free tier limits if no subscription
  IF v_limits IS NULL THEN
    SELECT limits INTO v_limits
    FROM subscription_plans
    WHERE name = 'free'
    LIMIT 1;
  END IF;
  
  RETURN COALESCE(v_limits, '{"ai_help_requests_per_day": 5, "saga_quests_per_month": 3}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_subscription_tier(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_limits(UUID) TO authenticated;
