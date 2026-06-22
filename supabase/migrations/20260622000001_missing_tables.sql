-- ================================================================
-- TABLES MANQUANTES – À exécuter dans le SQL Editor Supabase
-- Projet : nmxoizmqrdjovgvlxynq
-- Date   : 2026-06-22
-- ================================================================

-- ---------------------------------------------------------------
-- 1. SAGAS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sagas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  difficulty    TEXT DEFAULT 'beginner',
  thumbnail_url TEXT,
  order_index   INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  required_tier TEXT DEFAULT 'free',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sagas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sagas lisibles par tous les authentifiés" ON public.sagas
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Sagas modifiables par service_role" ON public.sagas
  FOR ALL USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------
-- 2. CHAPTERS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chapters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id     UUID NOT NULL REFERENCES public.sagas(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chapters lisibles par tous les authentifiés" ON public.chapters
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Chapters modifiables par service_role" ON public.chapters
  FOR ALL USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------
-- 3. USER_SESSIONS (gestion des sessions de sécurité)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token   TEXT NOT NULL UNIQUE,
  device_id       TEXT,
  device_type     TEXT,
  device_name     TEXT,
  browser         TEXT,
  browser_version TEXT,
  os              TEXT,
  os_version      TEXT,
  ip_address      TEXT,
  country         TEXT,
  city            TEXT,
  is_current      BOOLEAN DEFAULT FALSE,
  is_trusted      BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  last_activity   TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token   ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active  ON public.user_sessions(user_id, revoked_at)
  WHERE revoked_at IS NULL;

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users voient leurs sessions"     ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users maj leurs sessions"        ON public.user_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users suppriment leurs sessions" ON public.user_sessions FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- 4. SESSION_PREFERENCES
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.session_preferences (
  user_id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_timeout_minutes   INTEGER DEFAULT 10080,
  alert_new_location        BOOLEAN DEFAULT TRUE,
  alert_new_device          BOOLEAN DEFAULT TRUE,
  auto_logout_inactive      BOOLEAN DEFAULT FALSE,
  inactive_timeout_minutes  INTEGER DEFAULT 30,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.session_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users gèrent leurs prefs de session" ON public.session_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- 5. LOGIN_ALERTS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.login_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type   TEXT NOT NULL,
  session_id   UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  ip_address   TEXT,
  location     TEXT,
  device_info  TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_alerts_user_id ON public.login_alerts(user_id, acknowledged);

ALTER TABLE public.login_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users voient leurs alertes"  ON public.login_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users maj leurs alertes"     ON public.login_alerts FOR UPDATE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- 6. COLONNES SÉCURITÉ sur profiles (si absentes)
-- ---------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_strength    INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS security_score        INTEGER DEFAULT 0;
