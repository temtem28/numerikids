-- Ensure parent resolution works on both schema variants:
-- 1) parent_profiles.id = auth.uid()
-- 2) parent_profiles.user_id = auth.uid()

CREATE OR REPLACE FUNCTION get_parent_profile()
RETURNS UUID AS $$
DECLARE
  resolved_parent_id UUID;
BEGIN
  -- New schema: parent_profiles.id stores auth.uid()
  BEGIN
    EXECUTE 'SELECT id FROM parent_profiles WHERE id = auth.uid() LIMIT 1'
      INTO resolved_parent_id;
    IF resolved_parent_id IS NOT NULL THEN
      RETURN resolved_parent_id;
    END IF;
  EXCEPTION
    WHEN undefined_column THEN
      NULL;
  END;

  -- Legacy schema: parent_profiles.user_id stores auth.uid()
  BEGIN
    EXECUTE 'SELECT id FROM parent_profiles WHERE user_id = auth.uid() LIMIT 1'
      INTO resolved_parent_id;
    IF resolved_parent_id IS NOT NULL THEN
      RETURN resolved_parent_id;
    END IF;
  EXCEPTION
    WHEN undefined_column THEN
      NULL;
  END;

  -- Final fallback keeps behavior predictable for RLS checks.
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_parent_of_child(check_child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM children c
    WHERE c.id = check_child_id
      AND c.parent_id = get_parent_profile()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
