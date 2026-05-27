# Automatic Household & Child Profile Setup

## Overview

This system automatically creates a complete household environment when a new parent profile is created, including:
- Default household
- First child profile with starter resources
- Parental control settings
- Notification preferences
- Welcome message
- Initial learning goals

## What Gets Created Automatically

### 1. Household
- **Name**: "My Family" (customizable by parent)
- **Parent ID**: Linked to the new parent profile
- **Created**: Immediately upon parent profile creation

### 2. Default Child Profile
- **Name**: "Child 1" (customizable)
- **Age**: 8 years old (default)
- **Grade Level**: "Grade 3" (default)
- **Starting XP**: 0 points
- **Starting Coins**: 100 coins (welcome bonus)
- **Streak**: 0 days

### 3. Parental Settings
- **Daily Time Limit**: 60 minutes
- **Allowed Hours**: 8:00 AM - 8:00 PM
- **Content Filters**: Violence and mature content disabled
- **AI Help**: Enabled by default

### 4. Notification Preferences
- **Email Notifications**: Enabled
- **Achievement Alerts**: Enabled
- **Progress Reports**: Enabled
- **Weekly Summary**: Enabled
- **Daily Summary**: Disabled (to avoid email overload)
- **Struggle Alerts**: Enabled (parent notified when child needs help)
- **Milestone Alerts**: Enabled

### 5. Welcome Message
A system-generated welcome message is sent to the parent's inbox with:
- Platform introduction
- Information about default setup
- Encouragement to customize settings
- Call-to-action to start learning

### 6. Initial Learning Goal
- **Type**: Weekly lessons
- **Target**: Complete 3 lessons per week
- **Deadline**: 7 days from creation
- **Status**: Active

## How It Works

### Trigger Flow
```
New User Signs Up
       ↓
auth.users INSERT
       ↓
handle_new_user() trigger
       ↓
parent_profiles INSERT
       ↓
handle_new_parent_profile() trigger
       ↓
Creates: Household → Child → Settings → Preferences → Message → Goal
```

### Database Trigger

The trigger is defined in `supabase/migrations/20240129_auto_household_child_setup.sql`:

```sql
CREATE TRIGGER on_parent_profile_created
  AFTER INSERT ON public.parent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_parent_profile();
```

## Customization Options

### Modify Default Values

Edit the trigger function to change defaults:

```sql
-- Change default child age
age => 10,  -- Instead of 8

-- Change starting coins
coins => 200,  -- Instead of 100

-- Change daily time limit
daily_time_limit => 90,  -- Instead of 60 minutes

-- Change household name
name => 'Our Learning Space',  -- Instead of 'My Family'
```

### Add Additional Setup Steps

You can extend the trigger to create:
- Multiple default children
- Starter achievements
- Sample lessons in progress
- Tutorial messages
- Referral codes

Example - Add second child:
```sql
INSERT INTO public.children (
  parent_id,
  household_id,
  name,
  age,
  grade_level,
  xp_points,
  coins,
  streak_days
)
VALUES (
  NEW.id,
  v_household_id,
  'Child 2',
  6,
  'Grade 1',
  0,
  100,
  0
);
```

## Testing the Trigger

### Test New Parent Registration

1. **Sign up a new user**:
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'newparent@example.com',
  password: 'securepassword123'
});
```

2. **Verify household creation**:
```sql
SELECT * FROM households WHERE parent_id = 'parent-uuid';
```

3. **Verify child profile**:
```sql
SELECT * FROM children WHERE parent_id = 'parent-uuid';
```

4. **Verify settings**:
```sql
SELECT * FROM parental_settings WHERE child_id = 'child-uuid';
```

5. **Verify notification preferences**:
```sql
SELECT * FROM notification_preferences WHERE user_id = 'parent-uuid';
```

6. **Verify welcome message**:
```sql
SELECT * FROM messages WHERE receiver_id = 'parent-uuid';
```

7. **Verify learning goal**:
```sql
SELECT * FROM learning_goals WHERE child_id = 'child-uuid';
```

### Manual Trigger Test

Test the trigger independently:

```sql
-- Create test parent profile
INSERT INTO parent_profiles (id, email, full_name)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  'Test Parent'
);

-- Check all created records
SELECT 
  p.email as parent_email,
  h.name as household_name,
  c.name as child_name,
  c.coins as starting_coins,
  ps.daily_time_limit,
  np.email_notifications,
  m.content as welcome_message,
  lg.goal_type,
  lg.target_value
FROM parent_profiles p
LEFT JOIN households h ON h.parent_id = p.id
LEFT JOIN children c ON c.parent_id = p.id
LEFT JOIN parental_settings ps ON ps.child_id = c.id
LEFT JOIN notification_preferences np ON np.user_id = p.id
LEFT JOIN messages m ON m.receiver_id = p.id
LEFT JOIN learning_goals lg ON lg.child_id = c.id
WHERE p.email = 'test@example.com';
```

## Frontend Integration

The trigger works automatically - no frontend changes needed! However, you can enhance the user experience:

### Show Setup Completion

```typescript
// After successful signup
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  // Check if household was created
  const { data: household } = await supabase
    .from('households')
    .select('*')
    .eq('parent_id', user.id)
    .single();

  if (household) {
    toast.success('Your family household is ready!');
  }
}
```

### Display Welcome Message

```typescript
// Fetch and display welcome message
const { data: messages } = await supabase
  .from('messages')
  .select('*')
  .eq('receiver_id', user.id)
  .eq('is_read', false)
  .order('created_at', { ascending: false });

if (messages && messages.length > 0) {
  // Show welcome message modal or notification
}
```

### Guide User to Customize

```typescript
// Check if using default values
const { data: child } = await supabase
  .from('children')
  .select('*')
  .eq('parent_id', user.id)
  .single();

if (child?.name === 'Child 1') {
  // Show onboarding modal to customize child profile
  setShowOnboarding(true);
}
```

## Troubleshooting

### Household Not Created

**Check trigger is active**:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_parent_profile_created';
```

**Check function exists**:
```sql
SELECT proname FROM pg_proc WHERE proname = 'handle_new_parent_profile';
```

### Partial Setup (Some Records Missing)

**Check for errors in function**:
```sql
-- Enable logging
SET client_min_messages TO DEBUG;

-- Test trigger
INSERT INTO parent_profiles (id, email) 
VALUES (gen_random_uuid(), 'debug@test.com');
```

**Check foreign key constraints**:
- Ensure `households` table exists
- Ensure `children` table has proper foreign keys
- Ensure `parental_settings` references children correctly

### Duplicate Records

The trigger includes safeguards:
- Uses `ON CONFLICT DO NOTHING` for notification preferences
- Each insert uses new UUIDs to prevent conflicts

If duplicates occur, check for:
- Multiple trigger executions
- Manual insertions conflicting with trigger

## Security Considerations

### SECURITY DEFINER

The function runs with elevated privileges to insert into multiple tables:
```sql
SECURITY DEFINER
SET search_path = public
```

### Permissions

Only authenticated users and service role can execute:
```sql
GRANT EXECUTE ON FUNCTION handle_new_parent_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_parent_profile() TO service_role;
```

### Data Validation

Add validation if needed:
```sql
-- Ensure parent_id is valid
IF NEW.id IS NULL THEN
  RAISE EXCEPTION 'Parent ID cannot be null';
END IF;

-- Ensure email is provided
IF NEW.email IS NULL OR NEW.email = '' THEN
  RAISE EXCEPTION 'Parent email is required';
END IF;
```

## Maintenance

### Update Default Values

To change defaults for all new parents:
```sql
-- Update the migration file and re-run
-- Or use ALTER FUNCTION to modify the trigger function
```

### Disable Trigger Temporarily

```sql
ALTER TABLE parent_profiles DISABLE TRIGGER on_parent_profile_created;
-- Do maintenance
ALTER TABLE parent_profiles ENABLE TRIGGER on_parent_profile_created;
```

### Monitor Trigger Performance

```sql
-- Check trigger execution time
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('households', 'children', 'parental_settings', 'notification_preferences', 'messages', 'learning_goals');
```

## Best Practices

1. **Keep defaults sensible**: Don't overwhelm new users with too much data
2. **Make customization easy**: Provide clear UI for parents to modify defaults
3. **Monitor trigger performance**: Ensure it doesn't slow down registration
4. **Test thoroughly**: Verify all related records are created correctly
5. **Handle errors gracefully**: Use exception handling in the trigger function
6. **Document changes**: Update this file when modifying default values

## Related Documentation

- `PARENT_PROFILE_AUTO_CREATION.md` - Parent profile trigger setup
- `CHILD_PROFILE_MANAGEMENT.md` - Managing child profiles
- `PARENT_CHILD_SCHEMA.md` - Database schema overview
