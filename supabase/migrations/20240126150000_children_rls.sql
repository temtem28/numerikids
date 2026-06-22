-- =====================================================
-- CHILDREN TABLE RLS POLICIES
-- =====================================================

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Parents can view their children" ON children;
DROP POLICY IF EXISTS "Parents can insert their children" ON children;
DROP POLICY IF EXISTS "Parents can update their children" ON children;
DROP POLICY IF EXISTS "Parents can delete their children" ON children;
DROP POLICY IF EXISTS "Children can view own profile" ON children;

-- Parents can view their children
CREATE POLICY "Parents can view their children"
ON children FOR SELECT
USING (parent_id = get_parent_profile());

-- Parents can insert their children
CREATE POLICY "Parents can insert their children"
ON children FOR INSERT
WITH CHECK (parent_id = get_parent_profile());

-- Parents can update their children
CREATE POLICY "Parents can update their children"
ON children FOR UPDATE
USING (parent_id = get_parent_profile())
WITH CHECK (parent_id = get_parent_profile());

-- Parents can delete their children
CREATE POLICY "Parents can delete their children"
ON children FOR DELETE
USING (parent_id = get_parent_profile());

-- Children can view their own profile (via session context)
CREATE POLICY "Children can view own profile"
ON children FOR SELECT
USING (id = get_current_child_id());
