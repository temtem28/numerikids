-- =====================================================
-- COMPREHENSIVE RLS AUDIT MIGRATION
-- Ensures strict parent-child data access control
-- =====================================================

-- Helper function: Get parent profile ID for current user
CREATE OR REPLACE FUNCTION get_parent_profile()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM parent_profiles WHERE user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if current user is parent of child
CREATE OR REPLACE FUNCTION is_parent_of_child(check_child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM children c
    JOIN parent_profiles p ON c.parent_id = p.id
    WHERE c.id = check_child_id AND p.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Get current child from session context
CREATE OR REPLACE FUNCTION get_current_child_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_child_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
