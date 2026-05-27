-- =====================================================
-- VERIFY AND ENSURE TRIGGERS SETUP
-- This migration ensures all auto-creation triggers are properly configured
-- Created: 2024-01-31
-- =====================================================

-- =====================================================
-- STEP 1: Ensure parent_profiles table has correct structure
-- =====================================================

-- Add any missing columns to parent_profiles
DO $$
BEGIN
  -- Ensure email column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parent_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE parent_profiles ADD COLUMN email TEXT;
  END IF;

  -- Ensure full_name column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parent_profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE parent_profiles ADD COLUMN full_name TEXT;
  END IF;

  -- Ensure subscription_tier column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parent_profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE parent_profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free';
  END IF;

  -- Ensure avatar_url column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parent_profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE parent_profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- =====================================================
-- STEP 2: Recreate handle_new_user function with full_name support
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new parent profile with user's ID, email, and metadata
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Parent'),
    'free', -- Default to free tier
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, parent_profiles.full_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: Ensure trigger on auth.users exists
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 4: Recreate handle_new_parent_profile with error handling
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_parent_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_household_id UUID;
  v_child_id UUID;
BEGIN
  -- Create household for the parent
  INSERT INTO public.households (parent_id, name, created_at)
  VALUES (NEW.id, 'Ma Famille', NOW())
  RETURNING id INTO v_household_id;

  -- Create default child profile
  INSERT INTO public.children (
    parent_id,
    household_id,
    name,
    age,
    grade_level,
    xp_points,
    coins,
    streak_days,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_household_id,
    'Enfant 1',
    8,
    'CE2',
    0,
    100, -- Starting coins
    0,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_child_id;

  -- Create default parental settings for the child (if table exists)
  BEGIN
    INSERT INTO public.parental_settings (
      child_id,
      daily_time_limit,
      allowed_hours_start,
      allowed_hours_end,
      content_filters,
      ai_help_enabled,
      created_at,
      updated_at
    )
    VALUES (
      v_child_id,
      60, -- 60 minutes default
      '08:00',
      '20:00',
      '{"violence": false, "mature": false}'::jsonb,
      true,
      NOW(),
      NOW()
    );
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, skip
    NULL;
  END;

  -- Create default notification preferences for the parent (if table exists)
  BEGIN
    INSERT INTO public.notification_preferences (
      user_id,
      email_notifications,
      achievement_alerts,
      progress_reports,
      weekly_summary,
      daily_summary,
      struggle_alerts,
      milestone_alerts,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      true,
      true,
      true,
      true,
      false,
      true,
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, skip
    NULL;
  END;

  -- Create welcome message from system to parent (if table exists)
  BEGIN
    INSERT INTO public.messages (
      sender_id,
      receiver_id,
      content,
      is_read,
      created_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000', -- System user ID
      NEW.id,
      'Bienvenue sur CodeQuest ! 🎉 Nous avons configuré votre foyer familial et créé un profil enfant par défaut. Vous pouvez personnaliser ces paramètres dans votre tableau de bord. Commencez l''aventure de codage de votre enfant dès aujourd''hui !',
      false,
      NOW()
    );
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, skip
    NULL;
  END;

  -- Create initial learning goal for the child (if table exists)
  BEGIN
    INSERT INTO public.learning_goals (
      child_id,
      goal_type,
      target_value,
      current_value,
      deadline,
      status,
      created_at
    )
    VALUES (
      v_child_id,
      'weekly_lessons',
      3, -- Complete 3 lessons per week
      0,
      (NOW() + INTERVAL '7 days')::date,
      'active',
      NOW()
    );
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, skip
    NULL;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the trigger
  RAISE WARNING 'Error in handle_new_parent_profile: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 5: Ensure trigger on parent_profiles exists
-- =====================================================

DROP TRIGGER IF EXISTS on_parent_profile_created ON public.parent_profiles;

CREATE TRIGGER on_parent_profile_created
  AFTER INSERT ON public.parent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_parent_profile();

-- =====================================================
-- STEP 6: Grant necessary permissions
-- =====================================================

-- Grant execute permissions on trigger functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION handle_new_parent_profile() TO postgres, anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON public.parent_profiles TO postgres, service_role;
GRANT ALL ON public.households TO postgres, service_role;
GRANT ALL ON public.children TO postgres, service_role;

GRANT SELECT, INSERT, UPDATE ON public.parent_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.households TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.children TO authenticated;

-- =====================================================
-- STEP 7: Add helpful comments
-- =====================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates a parent profile when a new user registers in auth.users. Extracts full_name from user metadata.';

COMMENT ON FUNCTION handle_new_parent_profile() IS 
  'Automatically creates household, default child profile, parental settings, notification preferences, welcome message, and initial learning goal when a new parent profile is created.';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
  'Triggers automatic parent profile creation on user registration';

COMMENT ON TRIGGER on_parent_profile_created ON public.parent_profiles IS 
  'Triggers automatic household and child profile setup on parent profile creation';

-- =====================================================
-- STEP 8: Create verification function for frontend
-- =====================================================

CREATE OR REPLACE FUNCTION verify_account_setup(user_id UUID)
RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  has_profile BOOLEAN;
  has_household BOOLEAN;
  has_child BOOLEAN;
BEGIN
  -- Check parent profile
  SELECT EXISTS (
    SELECT 1 FROM parent_profiles WHERE id = user_id
  ) INTO has_profile;

  -- Check household
  SELECT EXISTS (
    SELECT 1 FROM households WHERE parent_id = user_id
  ) INTO has_household;

  -- Check child
  SELECT EXISTS (
    SELECT 1 FROM children WHERE parent_id = user_id
  ) INTO has_child;

  result := json_build_object(
    'parent_profile', has_profile,
    'household', has_household,
    'child_profile', has_child,
    'complete', (has_profile AND has_household AND has_child)
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION verify_account_setup(UUID) TO authenticated;

COMMENT ON FUNCTION verify_account_setup(UUID) IS 
  'Verifies that all account setup steps (profile, household, child) are complete for a user';
