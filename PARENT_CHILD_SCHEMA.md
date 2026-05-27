# Parent-Child Database Schema

## Overview
This document describes the database schema for the parent-child account system in NumériKids.

## Tables

### parent_profiles
Stores parent account details linked to auth.users.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users, UNIQUE)
- `full_name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `subscription_tier` (TEXT) - 'free', 'basic', 'premium', 'family'
- `subscription_status` (TEXT) - 'active', 'inactive', 'cancelled', 'trial'
- `subscription_expires_at` (TIMESTAMPTZ)
- `notification_preferences` (JSONB)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**RLS Policies:**
- Parents can view their own profile
- Parents can update their own profile
- Parents can insert their own profile

### children
Stores child profiles linked to parent_profiles.

**Columns:**
- `id` (UUID, PK)
- `parent_id` (UUID, FK to parent_profiles)
- `name` (TEXT, NOT NULL)
- `age` (INTEGER)
- `grade_level` (TEXT)
- `avatar_url` (TEXT)
- `learning_preferences` (JSONB)
- `daily_time_limit_minutes` (INTEGER, default: 60)
- `allowed_content_types` (TEXT[])
- `is_active` (BOOLEAN, default: true)
- `coins` (INTEGER, default: 0)
- `xp` (INTEGER, default: 0)
- `level` (INTEGER, default: 1)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**RLS Policies:**
- Parents can view their children
- Parents can insert their children
- Parents can update their children
- Parents can delete their children

## Updated Tables with child_id

The following tables now include a `child_id` column:
- `user_progress`
- `user_inventory`
- `child_coins`
- `streaks`
- `user_achievements`
- `user_challenges`
- `leaderboard_entries`
- `pixel_kingdom_progress`
- `messages`

**RLS Policies for all child-related tables:**
- Parents can view/insert/update their children's data
- Children can view/update their own data (using session context)

## Helper Functions

### get_parent_profile()
Returns the parent profile ID for the current authenticated user.

### is_parent_of_child(check_child_id UUID)
Checks if the current user is the parent of the specified child.

### get_parent_children()
Returns all active children for the current parent.

### create_parent_profile_on_signup()
Trigger function that automatically creates a parent profile when a user signs up.

## Views

### parent_dashboard_view
Aggregates parent and child data for dashboard display.

## Usage

### Creating a Child Profile
```sql
INSERT INTO children (parent_id, name, age, grade_level)
VALUES (
  (SELECT id FROM parent_profiles WHERE user_id = auth.uid()),
  'Emma',
  8,
  '3rd Grade'
);
```

### Querying Child Progress
```sql
SELECT * FROM user_progress
WHERE child_id = 'child-uuid-here';
```

### Setting Child Session Context
For child sessions, set the context variable:
```sql
SET app.current_child_id = 'child-uuid-here';
```
