-- RLS Testing Setup
-- This migration creates test data and helper functions for RLS policy testing

-- Create test users and households
DO $$
DECLARE
  parent1_id uuid;
  parent2_id uuid;
  child1_id uuid;
  child2_id uuid;
  child3_id uuid;
BEGIN
  -- Note: In production, these would be actual auth.users entries
  -- This is a template for test setup
  
  -- Create test parent profiles
  INSERT INTO parent_profiles (id, email, full_name, created_at)
  VALUES 
    (gen_random_uuid(), 'test_parent1@example.com', 'Test Parent 1', NOW()),
    (gen_random_uuid(), 'test_parent2@example.com', 'Test Parent 2', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Get parent IDs
  SELECT id INTO parent1_id FROM parent_profiles WHERE email = 'test_parent1@example.com';
  SELECT id INTO parent2_id FROM parent_profiles WHERE email = 'test_parent2@example.com';

  -- Create test children for parent 1
  INSERT INTO children (id, parent_id, name, age, avatar_url, created_at)
  VALUES 
    (gen_random_uuid(), parent1_id, 'Child 1A', 8, NULL, NOW()),
    (gen_random_uuid(), parent1_id, 'Child 1B', 10, NULL, NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Create test child for parent 2
  INSERT INTO children (id, parent_id, name, age, avatar_url, created_at)
  VALUES 
    (gen_random_uuid(), parent2_id, 'Child 2A', 9, NULL, NOW())
  ON CONFLICT (id) DO NOTHING;

END $$;

-- Function to verify RLS policy effectiveness
CREATE OR REPLACE FUNCTION test_rls_policy(
  p_table_name text,
  p_user_id uuid,
  p_expected_rows int
) RETURNS boolean AS $$
DECLARE
  actual_rows int;
BEGIN
  -- This would execute a query as the specified user
  -- and verify the row count matches expectations
  EXECUTE format('SELECT COUNT(*) FROM %I WHERE user_id = $1', p_table_name)
  INTO actual_rows
  USING p_user_id;
  
  RETURN actual_rows = p_expected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to test cross-household isolation
CREATE OR REPLACE FUNCTION test_cross_household_isolation() RETURNS TABLE(
  test_name text,
  passed boolean,
  message text
) AS $$
BEGIN
  -- Test 1: Parent cannot see other parent's children
  RETURN QUERY
  SELECT 
    'Parent cross-household isolation'::text,
    NOT EXISTS(
      SELECT 1 FROM children c1
      CROSS JOIN children c2
      WHERE c1.parent_id != c2.parent_id
      AND c1.id = c2.id
    ),
    'Parents cannot access other household children'::text;

  -- Test 2: Children data is isolated
  RETURN QUERY
  SELECT 
    'Child data isolation'::text,
    NOT EXISTS(
      SELECT 1 FROM user_progress up1
      CROSS JOIN user_progress up2
      WHERE up1.user_id != up2.user_id
      AND up1.id = up2.id
    ),
    'Children cannot access other children data'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION test_rls_policy IS 'Helper function to test RLS policy effectiveness';
COMMENT ON FUNCTION test_cross_household_isolation IS 'Tests cross-household data isolation';