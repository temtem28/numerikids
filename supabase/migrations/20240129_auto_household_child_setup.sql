-- Migration: Auto-create household and default child profile on parent registration
-- Created: 2024-01-29
-- Description: Automatically sets up household, child profile, settings, and welcome messages

-- Function to automatically create household and default child profile when parent profile is created
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
  VALUES (NEW.id, 'My Family', NOW())
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
    'Child 1',
    8,
    'Grade 3',
    0,
    100, -- Starting coins
    0,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_child_id;

  -- Create default parental settings for the child
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

  -- Create default notification preferences for the parent
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

  -- Create welcome message from system to parent
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
    'Welcome to CodeQuest! 🎉 We''ve set up your family household and created a default child profile. You can customize these settings in your dashboard. Start your child''s coding adventure today!',
    false,
    NOW()
  );

  -- Create initial learning goal for the child
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

  RETURN NEW;
END;
$$;

-- Create trigger on parent_profiles table
DROP TRIGGER IF EXISTS on_parent_profile_created ON public.parent_profiles;
CREATE TRIGGER on_parent_profile_created
  AFTER INSERT ON public.parent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_parent_profile();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_new_parent_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_parent_profile() TO service_role;
