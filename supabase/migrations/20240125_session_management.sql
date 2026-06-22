-- Create user_sessions table for comprehensive session tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_id TEXT,
  device_type TEXT, -- mobile, tablet, desktop
  device_name TEXT,
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  is_current BOOLEAN DEFAULT false,
  is_trusted BOOLEAN DEFAULT false,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, revoked_at) WHERE revoked_at IS NULL;

-- Create session_preferences table
CREATE TABLE IF NOT EXISTS session_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_timeout_minutes INTEGER DEFAULT 10080, -- 7 days default
  alert_new_location BOOLEAN DEFAULT true,
  alert_new_device BOOLEAN DEFAULT true,
  auto_logout_inactive BOOLEAN DEFAULT false,
  inactive_timeout_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create login_alerts table
CREATE TABLE IF NOT EXISTS login_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- new_location, new_device, suspicious_activity
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  ip_address TEXT,
  location TEXT,
  device_info TEXT,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_alerts_user_id ON login_alerts(user_id, acknowledged);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON user_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON user_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own preferences" ON session_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON session_preferences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own alerts" ON login_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON login_alerts FOR UPDATE USING (auth.uid() = user_id);


-- Add security tracking columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_strength INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS security_score INTEGER DEFAULT 0;

-- Add is_active column to user_sessions for easier querying
-- is_active est calculé dynamiquement plutôt qu'en colonne générée (NOW() n'est pas immutable)
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
CREATE OR REPLACE VIEW public.active_user_sessions AS
  SELECT *, (revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW())) AS computed_is_active
  FROM user_sessions;
