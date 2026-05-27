-- =====================================================
-- TRIGGER LOGGING AND FIXES MIGRATION
-- Created: 2024-02-01
-- Description: Adds comprehensive logging to triggers and creates fallback functions
-- =====================================================

-- =====================================================
-- STEP 1: Create trigger_logs table for debugging
-- =====================================================

CREATE TABLE IF NOT EXISTS public.trigger_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_name TEXT NOT NULL,
  function_name TEXT NOT NULL,
  user_id UUID,
  log_level TEXT DEFAULT 'INFO',
  message TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON public.trigger_logs TO postgres, service_role;
GRANT SELECT, INSERT ON public.trigger_logs TO authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trigger_logs_user_id ON public.trigger_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_trigger_logs_created_at ON public.trigger_logs(created_at DESC);

COMMENT ON TABLE public.trigger_logs IS 'Logs for debugging database triggers';

-- =====================================================
-- STEP 2: Recreate handle_new_user with logging
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_error_message TEXT;
BEGIN
  -- Log trigger start
  INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
  VALUES ('on_auth_user_created', 'handle_new_user', NEW.id, 'INFO', 'Trigger started', 
    jsonb_build_object('email', NEW.email, 'raw_meta', NEW.raw_user_meta_data));

  -- Extract full name from metadata
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'fullName',
    'Parent'
  );

  -- Insert new parent profile
  BEGIN
    INSERT INTO public.parent_profiles (
      id, 
      email, 
      full_name,
      subscription_tier,
      created_at, 
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      v_full_name,
      'free',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, parent_profiles.full_name),
      updated_at = NOW();

    -- Log success
    INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
    VALUES ('on_auth_user_created', 'handle_new_user', NEW.id, 'INFO', 'Parent profile created/updated successfully', 
      jsonb_build_object('email', NEW.email, 'full_name', v_full_name));

  EXCEPTION WHEN OTHERS THEN
    v_error_message := SQLERRM;
    INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
    VALUES ('on_auth_user_created', 'handle_new_user', NEW.id, 'ERROR', 'Failed to create parent profile', 
      jsonb_build_object('error', v_error_message, 'sqlstate', SQLSTATE));
  END;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
  VALUES ('on_auth_user_created', 'handle_new_user', NEW.id, 'ERROR', 'Trigger failed with unhandled error', 
    jsonb_build_object('error', SQLERRM, 'sqlstate', SQLSTATE));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- STEP 3: Recreate handle_new_parent_profile with logging
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_parent_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_household_id UUID;
  v_child_id UUID;
  v_error_message TEXT;
BEGIN
  -- Log trigger start
  INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
  VALUES ('on_parent_profile_created', 'handle_new_parent_profile', NEW.id, 'INFO', 'Trigger started', 
    jsonb_build_object('email', NEW.email, 'full_name', NEW.full_name));

  -- Step 1: Create household
  BEGIN
    INSERT INTO public.households (parent_id, name, created_at)
    VALUES (NEW.id, 'Ma Famille', NOW())
    RETURNING id INTO v_household_id;

    INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
    VALUES ('on_parent_profile_created', 'handle_new_parent_profile', NEW.id, 'INFO', 'Household created', 
      jsonb_build_object('household_id', v_household_id));
  EXCEPTION WHEN OTHERS THEN
    v_error_message := SQLERRM;
    INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
    VALUES ('on_parent_profile_created', 'handle_new_parent_profile', NEW.id, 'ERROR', 'Failed to create household', 
      jsonb_build_object('error', v_error_message, 'sqlstate', SQLSTATE));
    v_household_id := NULL;
  END;

  -- Step 2: Create child profile
  IF v_household_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.children (
        parent_id, household_id, name, age, grade_level,
        xp_points, coins, streak_days, created_at, updated_at
      )
      VALUES (
        NEW.id, v_household_id, 'Enfant 1', 8, 'CE2',
        0, 100, 0, NOW(), NOW()
      )
      RETURNING id INTO v_child_id;

      INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
      VALUES ('on_parent_profile_created', 'handle_new_parent_profile', NEW.id, 'INFO', 'Child profile created', 
        jsonb_build_object('child_id', v_child_id, 'household_id', v_household_id));
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
      VALUES ('on_parent_profile_created', 'handle_new_parent_profile', NEW.id, 'ERROR', 'Failed to create child profile', 
        jsonb_build_object('error', SQLERRM));
      v_child_id := NULL;
    END;
  END IF;

  -- Step 3: Create parental settings
  IF v_child_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.parental_settings (
        child_id, daily_time_limit, allowed_hours_start, allowed_hours_end,
        content_filters, ai_help_enabled, created_at, updated_at
      )
      VALUES (
        v_child_id, 60, '08:00', '20:00',
        '{"violence": false, "mature": false}'::jsonb, true, NOW(), NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
      VALUES ('on_parent_profile_created', 'handle_new_parent_profile', NEW.id, 'WARNING', 'Failed to create parental settings', 
        jsonb_build_object('error', SQLERRM));
    END;
  END IF;

  -- Step 4: Create notification preferences
  BEGIN
    INSERT INTO public.notification_preferences (
      user_id, email_notifications, achievement_alerts, progress_reports,
      weekly_summary, daily_summary, struggle_alerts, milestone_alerts, created_at, updated_at
    )
    VALUES (NEW.id, true, true, true, true, false, true, true, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
    VALUES ('on_parent_profile_created', 'handle_new_parent_profile', NEW.id, 'WARNING', 'Failed to create notification preferences', 
      jsonb_build_object('error', SQLERRM));
  END;

  -- Step 5: Create learning goal
  IF v_child_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.learning_goals (
        child_id, goal_type, target_value, current_value, deadline, status, created_at
      )
      VALUES (v_child_id, 'weekly_lessons', 3, 0, (NOW() + INTERVAL '7 days')::date, 'active', NOW());
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
      VALUES ('on_parent_profile_created', 'handle_new_parent_profile', NEW.id, 'WARNING', 'Failed to create learning goal', 
        jsonb_build_object('error', SQLERRM));
    END;
  END IF;

  -- Log completion
  INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
  VALUES ('on_parent_profile_created', 'handle_new_parent_profile', NEW.id, 'INFO', 'Trigger completed', 
    jsonb_build_object('household_id', v_household_id, 'child_id', v_child_id));

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
  VALUES ('on_parent_profile_created', 'handle_new_parent_profile', NEW.id, 'ERROR', 'Trigger failed with unhandled error', 
    jsonb_build_object('error', SQLERRM, 'sqlstate', SQLSTATE));
  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 4: Recreate triggers
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_parent_profile_created ON public.parent_profiles;
CREATE TRIGGER on_parent_profile_created
  AFTER INSERT ON public.parent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_parent_profile();

-- =====================================================
-- STEP 5: Create manual setup function as fallback
-- =====================================================

CREATE OR REPLACE FUNCTION public.setup_new_account(p_user_id UUID, p_email TEXT, p_full_name TEXT DEFAULT 'Parent')
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_household_id UUID;
  v_child_id UUID;
  v_result JSONB;
  v_profile_exists BOOLEAN;
  v_household_exists BOOLEAN;
  v_child_exists BOOLEAN;
BEGIN
  -- Check what already exists
  SELECT EXISTS(SELECT 1 FROM parent_profiles WHERE id = p_user_id) INTO v_profile_exists;
  SELECT EXISTS(SELECT 1 FROM households WHERE parent_id = p_user_id) INTO v_household_exists;
  SELECT EXISTS(SELECT 1 FROM children WHERE parent_id = p_user_id) INTO v_child_exists;

  -- Log the setup attempt
  INSERT INTO trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
  VALUES ('manual_setup', 'setup_new_account', p_user_id, 'INFO', 'Manual setup started', 
    jsonb_build_object('profile_exists', v_profile_exists, 'household_exists', v_household_exists, 'child_exists', v_child_exists));

  -- Create parent profile if not exists
  IF NOT v_profile_exists THEN
    INSERT INTO parent_profiles (id, email, full_name, subscription_tier, created_at, updated_at)
    VALUES (p_user_id, p_email, p_full_name, 'free', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, parent_profiles.full_name),
      updated_at = NOW();
    
    INSERT INTO trigger_logs (trigger_name, function_name, user_id, log_level, message)
    VALUES ('manual_setup', 'setup_new_account', p_user_id, 'INFO', 'Parent profile created manually');
  END IF;

  -- Create household if not exists
  IF NOT v_household_exists THEN
    INSERT INTO households (parent_id, name, created_at)
    VALUES (p_user_id, 'Ma Famille', NOW())
    RETURNING id INTO v_household_id;
    
    INSERT INTO trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
    VALUES ('manual_setup', 'setup_new_account', p_user_id, 'INFO', 'Household created manually', 
      jsonb_build_object('household_id', v_household_id));
  ELSE
    SELECT id INTO v_household_id FROM households WHERE parent_id = p_user_id LIMIT 1;
  END IF;

  -- Create child if not exists
  IF NOT v_child_exists AND v_household_id IS NOT NULL THEN
    INSERT INTO children (
      parent_id, household_id, name, age, grade_level, 
      xp_points, coins, streak_days, created_at, updated_at
    )
    VALUES (
      p_user_id, v_household_id, 'Enfant 1', 8, 'CE2',
      0, 100, 0, NOW(), NOW()
    )
    RETURNING id INTO v_child_id;
    
    INSERT INTO trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
    VALUES ('manual_setup', 'setup_new_account', p_user_id, 'INFO', 'Child profile created manually', 
      jsonb_build_object('child_id', v_child_id));

    -- Create parental settings
    INSERT INTO parental_settings (
      child_id, daily_time_limit, allowed_hours_start, allowed_hours_end,
      content_filters, ai_help_enabled, created_at, updated_at
    )
    VALUES (
      v_child_id, 60, '08:00', '20:00',
      '{"violence": false, "mature": false}'::jsonb, true, NOW(), NOW()
    )
    ON CONFLICT DO NOTHING;

    -- Create learning goal
    INSERT INTO learning_goals (
      child_id, goal_type, target_value, current_value, deadline, status, created_at
    )
    VALUES (
      v_child_id, 'weekly_lessons', 3, 0, (NOW() + INTERVAL '7 days')::date, 'active', NOW()
    );
  ELSE
    SELECT id INTO v_child_id FROM children WHERE parent_id = p_user_id LIMIT 1;
  END IF;

  -- Create notification preferences
  INSERT INTO notification_preferences (
    user_id, email_notifications, achievement_alerts, progress_reports,
    weekly_summary, daily_summary, struggle_alerts, milestone_alerts, created_at, updated_at
  )
  VALUES (
    p_user_id, true, true, true, true, false, true, true, NOW(), NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'parent_profile_id', p_user_id,
    'household_id', v_household_id,
    'child_id', v_child_id,
    'created_new', jsonb_build_object(
      'profile', NOT v_profile_exists,
      'household', NOT v_household_exists,
      'child', NOT v_child_exists
    )
  );

  INSERT INTO trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
  VALUES ('manual_setup', 'setup_new_account', p_user_id, 'INFO', 'Manual setup completed', v_result);

  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO trigger_logs (trigger_name, function_name, user_id, log_level, message, details)
  VALUES ('manual_setup', 'setup_new_account', p_user_id, 'ERROR', 'Manual setup failed', 
    jsonb_build_object('error', SQLERRM, 'sqlstate', SQLSTATE));
  
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =====================================================
-- STEP 6: Create verify_account_setup function
-- =====================================================

CREATE OR REPLACE FUNCTION public.verify_account_setup(p_user_id UUID)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
  v_profile RECORD;
  v_household RECORD;
  v_child RECORD;
BEGIN
  -- Get profile info
  SELECT id, email, full_name, subscription_tier INTO v_profile
  FROM parent_profiles WHERE id = p_user_id;

  -- Get household info
  SELECT id, name INTO v_household
  FROM households WHERE parent_id = p_user_id LIMIT 1;

  -- Get child info
  SELECT id, name, age, grade_level INTO v_child
  FROM children WHERE parent_id = p_user_id LIMIT 1;

  v_result := jsonb_build_object(
    'parent_profile', CASE WHEN v_profile.id IS NOT NULL THEN jsonb_build_object(
      'exists', true,
      'id', v_profile.id,
      'email', v_profile.email,
      'full_name', v_profile.full_name,
      'subscription_tier', v_profile.subscription_tier
    ) ELSE jsonb_build_object('exists', false) END,
    'household', CASE WHEN v_household.id IS NOT NULL THEN jsonb_build_object(
      'exists', true,
      'id', v_household.id,
      'name', v_household.name
    ) ELSE jsonb_build_object('exists', false) END,
    'child_profile', CASE WHEN v_child.id IS NOT NULL THEN jsonb_build_object(
      'exists', true,
      'id', v_child.id,
      'name', v_child.name,
      'age', v_child.age,
      'grade_level', v_child.grade_level
    ) ELSE jsonb_build_object('exists', false) END,
    'complete', (v_profile.id IS NOT NULL AND v_household.id IS NOT NULL AND v_child.id IS NOT NULL)
  );

  RETURN v_result;
END;
$$;

-- =====================================================
-- STEP 7: Create helper function to get trigger logs
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_trigger_logs(p_user_id UUID DEFAULT NULL, p_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  trigger_name TEXT,
  function_name TEXT,
  user_id UUID,
  log_level TEXT,
  message TEXT,
  details JSONB,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tl.id,
    tl.trigger_name,
    tl.function_name,
    tl.user_id,
    tl.log_level,
    tl.message,
    tl.details,
    tl.created_at
  FROM trigger_logs tl
  WHERE (p_user_id IS NULL OR tl.user_id = p_user_id)
  ORDER BY tl.created_at DESC
  LIMIT p_limit;
END;
$$;

-- =====================================================
-- STEP 8: Grant permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_parent_profile() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.setup_new_account(UUID, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_account_setup(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_trigger_logs(UUID, INT) TO authenticated, service_role;

-- Ensure tables have proper permissions for trigger functions
GRANT ALL ON public.parent_profiles TO postgres, service_role;
GRANT ALL ON public.households TO postgres, service_role;
GRANT ALL ON public.children TO postgres, service_role;
GRANT ALL ON public.parental_settings TO postgres, service_role;
GRANT ALL ON public.notification_preferences TO postgres, service_role;
GRANT ALL ON public.learning_goals TO postgres, service_role;
GRANT ALL ON public.trigger_logs TO postgres, service_role;

-- Grant authenticated users appropriate permissions
GRANT SELECT, INSERT, UPDATE ON public.parent_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.households TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.children TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parental_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_goals TO authenticated;

-- =====================================================
-- STEP 9: Add comments
-- =====================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates a parent profile when a new user registers. Includes comprehensive logging.';

COMMENT ON FUNCTION public.handle_new_parent_profile() IS 
  'Automatically creates household, child profile, and settings when a new parent profile is created. Includes comprehensive logging.';

COMMENT ON FUNCTION public.setup_new_account(UUID, TEXT, TEXT) IS 
  'Manual fallback function to set up a new account if triggers fail. Creates parent profile, household, and child.';

COMMENT ON FUNCTION public.verify_account_setup(UUID) IS 
  'Verifies that all account setup steps (profile, household, child) are complete for a user.';

COMMENT ON FUNCTION public.get_trigger_logs(UUID, INT) IS 
  'Retrieves trigger logs for debugging. Can filter by user_id and limit results.';
