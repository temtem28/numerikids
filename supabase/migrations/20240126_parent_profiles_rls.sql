-- =====================================================
-- PARENT_PROFILES RLS POLICIES
-- =====================================================

ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Parents can view own profile" ON parent_profiles;
DROP POLICY IF EXISTS "Parents can insert own profile" ON parent_profiles;
DROP POLICY IF EXISTS "Parents can update own profile" ON parent_profiles;

-- Parents can view their own profile
CREATE POLICY "Parents can view own profile"
ON parent_profiles FOR SELECT
USING (user_id = auth.uid());

-- Parents can insert their own profile
CREATE POLICY "Parents can insert own profile"
ON parent_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Parents can update their own profile
CREATE POLICY "Parents can update own profile"
ON parent_profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
