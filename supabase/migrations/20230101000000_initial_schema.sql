-- ================================================================
-- SCHEMA INITIAL NUMERIKIDS
-- Toutes les tables de base (avant les migrations incrémentales)
-- ================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------
-- PARENT_PROFILES
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parent_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free','basic','premium','family')),
  subscription_status TEXT NOT NULL DEFAULT 'trial'
    CHECK (subscription_status IN ('active','inactive','cancelled','trial','past_due')),
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  trial_ends_at   TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 days'),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- PROFILES (alias / security columns used by session tracking)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  full_name       TEXT,
  password_strength INTEGER DEFAULT 0,
  last_password_change TIMESTAMPTZ DEFAULT NOW(),
  security_score  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- HOUSEHOLDS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.households (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT 'Ma famille',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_households_parent_id ON public.households(parent_id);

-- ---------------------------------------------------------------
-- CHILDREN
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.children (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id    UUID REFERENCES public.households(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  pseudo          TEXT,
  birth_year      INTEGER,
  age             INTEGER,
  avatar_url      TEXT,
  grade_level     TEXT DEFAULT 'CE2',
  xp_points       INTEGER NOT NULL DEFAULT 0,
  coins           INTEGER NOT NULL DEFAULT 0,
  streak_days     INTEGER NOT NULL DEFAULT 0,
  last_active     TIMESTAMPTZ,
  pin_hash        TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  daily_time_limit INTEGER DEFAULT 60,
  learning_preferences TEXT[] DEFAULT '{}',
  allowed_content_types TEXT[] DEFAULT ARRAY['video','quiz','exercise','game'],
  level           INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_children_parent_id    ON public.children(parent_id);
CREATE INDEX IF NOT EXISTS idx_children_household_id ON public.children(household_id);

-- ---------------------------------------------------------------
-- PARENTAL_SETTINGS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parental_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  daily_time_limit_minutes INTEGER DEFAULT 60,
  allowed_start_hour INTEGER DEFAULT 8,
  allowed_end_hour   INTEGER DEFAULT 20,
  content_filter_violence BOOLEAN DEFAULT TRUE,
  content_filter_mature   BOOLEAN DEFAULT TRUE,
  ai_help_enabled BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id)
);

-- ---------------------------------------------------------------
-- NOTIFICATION_PREFERENCES
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_weekly_report  BOOLEAN DEFAULT TRUE,
  email_goal_achieved  BOOLEAN DEFAULT TRUE,
  email_payment_failed BOOLEAN DEFAULT TRUE,
  push_enabled         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ---------------------------------------------------------------
-- SAGAS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sagas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT,
  difficulty      TEXT DEFAULT 'beginner',
  thumbnail_url   TEXT,
  order_index     INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  required_tier   TEXT DEFAULT 'free',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- CHAPTERS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chapters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id         UUID NOT NULL REFERENCES public.sagas(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  order_index     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- LESSONS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lessons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id         UUID REFERENCES public.sagas(id) ON DELETE CASCADE,
  chapter_id      UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  content         JSONB,
  type            TEXT DEFAULT 'lesson',
  xp_reward       INTEGER DEFAULT 10,
  order_index     INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- CHILD_PROGRESS (par saga/leçon)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.child_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  saga_id         UUID NOT NULL REFERENCES public.sagas(id) ON DELETE CASCADE,
  lesson_id       UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  completed       BOOLEAN DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  score           INTEGER,
  xp_earned       INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, saga_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_child_progress_child ON public.child_progress(child_id);
CREATE INDEX IF NOT EXISTS idx_child_progress_saga  ON public.child_progress(child_id, saga_id);

-- ---------------------------------------------------------------
-- LEARNING_SESSIONS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  lesson_id       UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  saga_id         UUID REFERENCES public.sagas(id) ON DELETE SET NULL,
  chapter_id      UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  duration_seconds INTEGER,
  completed       BOOLEAN DEFAULT FALSE,
  score           INTEGER,
  xp_earned       INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_child ON public.learning_sessions(child_id);

-- ---------------------------------------------------------------
-- USER_PROGRESS (gamification : XP global, niveau, etc.)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  total_xp        INTEGER DEFAULT 0,
  level           INTEGER DEFAULT 1,
  lessons_completed INTEGER DEFAULT 0,
  streak_days     INTEGER DEFAULT 0,
  last_activity   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id)
);

-- ---------------------------------------------------------------
-- CHILD_COINS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.child_coins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  balance         INTEGER DEFAULT 0,
  total_earned    INTEGER DEFAULT 0,
  total_spent     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id)
);

-- ---------------------------------------------------------------
-- STREAKS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.streaks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  current_streak  INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id)
);

-- ---------------------------------------------------------------
-- ACHIEVEMENTS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  icon            TEXT,
  category        TEXT,
  xp_reward       INTEGER DEFAULT 0,
  coins_reward    INTEGER DEFAULT 0,
  condition_type  TEXT,
  condition_value INTEGER,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  achievement_id  UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, achievement_id)
);

-- ---------------------------------------------------------------
-- USER_CHALLENGES
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  challenge_type  TEXT NOT NULL,
  title           TEXT,
  description     TEXT,
  target_value    INTEGER DEFAULT 1,
  current_value   INTEGER DEFAULT 0,
  xp_reward       INTEGER DEFAULT 0,
  coins_reward    INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active',
  expires_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- LEADERBOARD_ENTRIES
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  category        TEXT DEFAULT 'global',
  score           INTEGER DEFAULT 0,
  rank            INTEGER,
  period          TEXT DEFAULT 'weekly',
  period_start    DATE,
  period_end      DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, category, period, period_start)
);

-- ---------------------------------------------------------------
-- PIXEL_KINGDOM_PROGRESS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pixel_kingdom_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  level           INTEGER DEFAULT 1,
  area            TEXT DEFAULT 'forest',
  completed_quests TEXT[] DEFAULT '{}',
  inventory       JSONB DEFAULT '{}',
  score           INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id)
);

-- ---------------------------------------------------------------
-- STORE_ITEMS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'avatar',
  price           INTEGER NOT NULL DEFAULT 100,
  image_url       TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  required_level  INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- USER_INVENTORY
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  item_id         UUID NOT NULL REFERENCES public.store_items(id) ON DELETE CASCADE,
  is_equipped     BOOLEAN DEFAULT FALSE,
  acquired_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- ---------------------------------------------------------------
-- MESSAGES
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- SUBSCRIPTION_PLANS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL UNIQUE,
  display_name            TEXT NOT NULL,
  description             TEXT,
  price_monthly           DECIMAL(10,2) DEFAULT 0,
  price_yearly            DECIMAL(10,2) DEFAULT 0,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly  TEXT,
  max_children            INTEGER DEFAULT 1,
  features                JSONB DEFAULT '[]',
  is_active               BOOLEAN DEFAULT TRUE,
  trial_days              INTEGER DEFAULT 15,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Plans par défaut
INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, price_yearly, max_children, trial_days, features) VALUES
  ('free',    'Gratuit',  'Accès aux contenus de base',          9.99,  99.00,  1, 15, '["1 enfant","Parcours débutant","Tableau de bord parent"]'),
  ('premium', 'Premium',  'Accès complet pour 1 enfant',         14.99, 149.00, 1, 15, '["1 enfant","Tous les parcours","Pixel Kingdom","Analytics avancés","Objectifs & récompenses"]'),
  ('family',  'Famille',  'Accès complet pour toute la famille', 20.00, 199.00, 5, 15, '["Jusqu''à 5 enfants","Tous les parcours","Comparaison enfants","Support prioritaire"]')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------
-- USER_SUBSCRIPTIONS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id               UUID REFERENCES public.subscription_plans(id),
  status                TEXT NOT NULL DEFAULT 'trial'
    CHECK (status IN ('trial','active','cancelled','past_due','unpaid','incomplete')),
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  billing_cycle         TEXT DEFAULT 'monthly',
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  trial_end             TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 days'),
  cancel_at_period_end  BOOLEAN DEFAULT FALSE,
  cancelled_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ---------------------------------------------------------------
-- PAYMENT_HISTORY
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount            DECIMAL(10,2) NOT NULL,
  currency          TEXT DEFAULT 'eur',
  status            TEXT NOT NULL,
  stripe_payment_id TEXT,
  stripe_invoice_id TEXT,
  description       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- FAILED_PAYMENTS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.failed_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount          DECIMAL(10,2),
  invoice_id      TEXT,
  stripe_error    TEXT,
  status          TEXT DEFAULT 'pending',
  retry_count     INTEGER DEFAULT 0,
  next_retry_at   TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- USAGE_TRACKING
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  children_count  INTEGER DEFAULT 0,
  ai_requests     INTEGER DEFAULT 0,
  storage_mb      DECIMAL(10,2) DEFAULT 0,
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- ---------------------------------------------------------------
-- LEARNING_GOALS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  parent_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  goal_type       TEXT DEFAULT 'lessons',
  target_value    INTEGER DEFAULT 1,
  current_value   INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active',
  reward_coins    INTEGER DEFAULT 0,
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_goals_child_id ON public.learning_goals(child_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_status   ON public.learning_goals(status);

-- ---------------------------------------------------------------
-- EMAIL_QUEUE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email        TEXT NOT NULL,
  to_name         TEXT,
  subject         TEXT NOT NULL,
  template        TEXT NOT NULL,
  payload         JSONB DEFAULT '{}',
  status          TEXT DEFAULT 'pending',
  attempts        INTEGER DEFAULT 0,
  sent_at         TIMESTAMPTZ,
  error           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status, created_at);

-- ---------------------------------------------------------------
-- REFERRALS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code   TEXT NOT NULL UNIQUE,
  status          TEXT DEFAULT 'pending',
  reward_granted  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);

-- ---------------------------------------------------------------
-- HELPER FUNCTIONS (RLS)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_parent_profile_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_parent_of_child(check_child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM children c
    WHERE c.id = check_child_id AND c.parent_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_household_owner(check_household_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM households h
    WHERE h.id = check_household_id AND h.parent_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_child_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_child_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.child_in_user_household(check_child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM children c
    JOIN households h ON c.household_id = h.id
    WHERE c.id = check_child_id AND h.parent_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------
-- TRIGGER : auto-créer parent_profile + profile + household + enfant
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.parent_profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------
-- GRANTS
-- ---------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated;
