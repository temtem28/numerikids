# Automatic Parent Profile Creation

## Overview

This system automatically creates a `parent_profiles` entry whenever a new user registers in the application. This ensures that every authenticated user has a corresponding parent profile without requiring manual database operations.

## How It Works

### Database Trigger Flow

1. **User Registration**: When a user signs up via Supabase Auth, a new record is inserted into `auth.users`
2. **Trigger Activation**: The `on_auth_user_created` trigger fires automatically
3. **Profile Creation**: The `handle_new_user()` function creates a matching entry in `public.parent_profiles`
4. **Data Sync**: The profile is created with the user's ID and email from `auth.users`

### SQL Components

#### Function: `handle_new_user()`
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.parent_profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Trigger: `on_auth_user_created`
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Benefits

✅ **Automatic**: No manual intervention required
✅ **Consistent**: Every user gets a profile
✅ **Reliable**: Runs at database level, can't be bypassed
✅ **Safe**: Uses `ON CONFLICT DO NOTHING` to prevent duplicates
✅ **Secure**: Function runs with `SECURITY DEFINER` privileges

## Testing the Trigger

### Test New User Registration

```sql
-- This will automatically create a parent_profiles entry
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW()
);

-- Verify the parent profile was created
SELECT * FROM parent_profiles WHERE email = 'test@example.com';
```

### Verify Trigger Exists

```sql
-- Check if trigger is active
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### Check Function Definition

```sql
-- View the function code
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

## Troubleshooting

### Profile Not Created

**Check if trigger is enabled:**
```sql
SELECT tgenabled FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
-- Should return 'O' (origin/enabled)
```

**Check function permissions:**
```sql
SELECT has_function_privilege('public.handle_new_user()', 'execute');
```

### Duplicate Key Errors

The function uses `ON CONFLICT (id) DO NOTHING` to handle duplicates gracefully. If you see errors:

```sql
-- Check for existing profiles without users
SELECT p.* FROM parent_profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;
```

### Manual Profile Creation

If you need to manually create profiles for existing users:

```sql
-- Create profiles for users without them
INSERT INTO parent_profiles (id, email, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN parent_profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

## Migration History

- **20240128_auto_parent_profile_trigger.sql**: Initial trigger creation

## Security Considerations

- Function runs with `SECURITY DEFINER` to ensure it has permission to insert into `parent_profiles`
- Trigger only fires on INSERT, not UPDATE or DELETE
- Uses `ON CONFLICT` to prevent duplicate entries
- Grants are properly configured for all roles

## Integration with Application

The trigger works seamlessly with:
- Supabase Auth signup flows
- Email/password registration
- OAuth providers (Google, GitHub, etc.)
- Magic link authentication
- Phone authentication

No changes needed in frontend code - profiles are created automatically!
