-- =====================================================
-- UNIFIED RLS POLICIES MIGRATION
-- Comprehensive Row Level Security for all core tables
-- Created: 2024-01-30
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Helper function: Get parent profile ID for current user
-- Note: parent_profiles.id = auth.uid() (set by trigger)
CREATE OR REPLACE FUNCTION get_parent_profile_id()
RETURNS UUID AS $$
BEGIN
  -- The parent_profiles.id is the same as auth.uid() 
  -- because the trigger sets id = NEW.id from auth.users
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Check if current user is parent of a specific child
CREATE OR REPLACE FUNCTION is_parent_of_child(check_child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM children c
    WHERE c.id = check_child_id 
    AND c.parent_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Check if current user owns a household
CREATE OR REPLACE FUNCTION is_household_owner(check_household_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM households h
    WHERE h.id = check_household_id 
    AND h.parent_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Get current child from session context (for child-mode access)
CREATE OR REPLACE FUNCTION get_current_child_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_child_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Verify child belongs to current user's household
CREATE OR REPLACE FUNCTION child_in_user_household(check_child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM children c
    JOIN households h ON c.household_id = h.id
    WHERE c.id = check_child_id 
    AND h.parent_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- PARENT_PROFILES TABLE RLS
-- =====================================================

ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Parents can view own profile" ON parent_profiles;
DROP POLICY IF EXISTS "Parents can insert own profile" ON parent_profiles;
DROP POLICY IF EXISTS "Parents can update own profile" ON parent_profiles;
DROP POLICY IF EXISTS "Service role full access to parent_profiles" ON parent_profiles;

-- Parents can view their own profile (id = auth.uid())
CREATE POLICY "Parents can view own profile"
ON parent_profiles FOR SELECT
USING (id = auth.uid());

-- Allow trigger/service role to insert profiles
CREATE POLICY "Service role can insert parent_profiles"
ON parent_profiles FOR INSERT
WITH CHECK (id = auth.uid() OR auth.role() = 'service_role');

-- Parents can update their own profile
CREATE POLICY "Parents can update own profile"
ON parent_profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- =====================================================
-- HOUSEHOLDS TABLE RLS
-- =====================================================

ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Parents can view own households" ON households;
DROP POLICY IF EXISTS "Parents can insert own households" ON households;
DROP POLICY IF EXISTS "Parents can update own households" ON households;
DROP POLICY IF EXISTS "Parents can delete own households" ON households;
DROP POLICY IF EXISTS "Service role can insert households" ON households;

-- Parents can view their own households
CREATE POLICY "Parents can view own households"
ON households FOR SELECT
USING (parent_id = auth.uid());

-- Allow trigger/service role to insert households
CREATE POLICY "Service role can insert households"
ON households FOR INSERT
WITH CHECK (parent_id = auth.uid() OR auth.role() = 'service_role');

-- Parents can update their own households
CREATE POLICY "Parents can update own households"
ON households FOR UPDATE
USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

-- Parents can delete their own households
CREATE POLICY "Parents can delete own households"
ON households FOR DELETE
USING (parent_id = auth.uid());

-- =====================================================
-- CHILDREN TABLE RLS
-- =====================================================

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Parents can view their children" ON children;
DROP POLICY IF EXISTS "Parents can insert their children" ON children;
DROP POLICY IF EXISTS "Parents can update their children" ON children;
DROP POLICY IF EXISTS "Parents can delete their children" ON children;
DROP POLICY IF EXISTS "Children can view own profile" ON children;
DROP POLICY IF EXISTS "Service role can insert children" ON children;

-- Parents can view their children
CREATE POLICY "Parents can view their children"
ON children FOR SELECT
USING (parent_id = auth.uid() OR id = get_current_child_id());

-- Allow trigger/service role to insert children
CREATE POLICY "Service role can insert children"
ON children FOR INSERT
WITH CHECK (parent_id = auth.uid() OR auth.role() = 'service_role');

-- Parents can update their children
CREATE POLICY "Parents can update their children"
ON children FOR UPDATE
USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

-- Parents can delete their children
CREATE POLICY "Parents can delete their children"
ON children FOR DELETE
USING (parent_id = auth.uid());

-- =====================================================
-- PARENTAL_SETTINGS TABLE RLS
-- =====================================================

ALTER TABLE parental_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Parents can view child settings" ON parental_settings;
DROP POLICY IF EXISTS "Parents can insert child settings" ON parental_settings;
DROP POLICY IF EXISTS "Parents can update child settings" ON parental_settings;
DROP POLICY IF EXISTS "Service role can insert parental_settings" ON parental_settings;

-- Parents can view settings for their children
CREATE POLICY "Parents can view child settings"
ON parental_settings FOR SELECT
USING (is_parent_of_child(child_id));

-- Allow trigger/service role to insert settings
CREATE POLICY "Service role can insert parental_settings"
ON parental_settings FOR INSERT
WITH CHECK (is_parent_of_child(child_id) OR auth.role() = 'service_role');

-- Parents can update settings for their children
CREATE POLICY "Parents can update child settings"
ON parental_settings FOR UPDATE
USING (is_parent_of_child(child_id))
WITH CHECK (is_parent_of_child(child_id));

-- =====================================================
-- NOTIFICATION_PREFERENCES TABLE RLS
-- =====================================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Service role can insert notification_preferences" ON notification_preferences;

-- Users can view their own notification preferences
CREATE POLICY "Users can view own notification preferences"
ON notification_preferences FOR SELECT
USING (user_id = auth.uid());

-- Allow trigger/service role to insert preferences
CREATE POLICY "Service role can insert notification_preferences"
ON notification_preferences FOR INSERT
WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

-- Users can update their own notification preferences
CREATE POLICY "Users can update own notification preferences"
ON notification_preferences FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- MESSAGES TABLE RLS
-- =====================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Service role can insert messages" ON messages;

-- Users can view messages where they are sender or receiver
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
USING (receiver_id = auth.uid() OR sender_id = auth.uid());

-- Allow trigger/service role to insert messages (for system messages)
CREATE POLICY "Service role can insert messages"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid() OR auth.role() = 'service_role');

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update own messages"
ON messages FOR UPDATE
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());

-- =====================================================
-- LEARNING_GOALS TABLE RLS
-- =====================================================

ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Parents can view child learning goals" ON learning_goals;
DROP POLICY IF EXISTS "Parents can insert child learning goals" ON learning_goals;
DROP POLICY IF EXISTS "Parents can update child learning goals" ON learning_goals;
DROP POLICY IF EXISTS "Service role can insert learning_goals" ON learning_goals;

-- Parents can view learning goals for their children
CREATE POLICY "Parents can view child learning goals"
ON learning_goals FOR SELECT
USING (is_parent_of_child(child_id));

-- Allow trigger/service role to insert learning goals
CREATE POLICY "Service role can insert learning_goals"
ON learning_goals FOR INSERT
WITH CHECK (is_parent_of_child(child_id) OR auth.role() = 'service_role');

-- Parents can update learning goals for their children
CREATE POLICY "Parents can update child learning goals"
ON learning_goals FOR UPDATE
USING (is_parent_of_child(child_id))
WITH CHECK (is_parent_of_child(child_id));

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_parent_profile_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_parent_of_child(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_household_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_child_id() TO authenticated;
GRANT EXECUTE ON FUNCTION child_in_user_household(UUID) TO authenticated;

-- Grant service role full access for triggers
GRANT ALL ON parent_profiles TO service_role;
GRANT ALL ON households TO service_role;
GRANT ALL ON children TO service_role;
GRANT ALL ON parental_settings TO service_role;
GRANT ALL ON notification_preferences TO service_role;
GRANT ALL ON messages TO service_role;
GRANT ALL ON learning_goals TO service_role;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_parent_profile_id() IS 'Returns the parent profile ID (same as auth.uid())';
COMMENT ON FUNCTION is_parent_of_child(UUID) IS 'Checks if current user is the parent of specified child';
COMMENT ON FUNCTION is_household_owner(UUID) IS 'Checks if current user owns the specified household';
COMMENT ON FUNCTION get_current_child_id() IS 'Gets child ID from session context for child-mode access';
COMMENT ON FUNCTION child_in_user_household(UUID) IS 'Verifies child belongs to current user household';
