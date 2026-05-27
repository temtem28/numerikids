# Child Profile Management System

## Overview
Comprehensive child profile management interface for parents to create, edit, and delete child profiles with enhanced features.

## Features

### Child Profile Form
- **Name**: Child's display name (pseudo)
- **Age**: Birth year selection
- **Grade Level**: School grade (CP through 3ème)
- **Avatar Upload**: Upload to `child-avatars` storage bucket
- **Daily Time Limit**: Slider to set screen time (15-180 minutes)
- **Learning Preferences**: Multiple selection (visual, auditory, kinesthetic, reading)
- **Allowed Content Types**: Checkboxes for video, quiz, exercise, game

### Child Profile Cards
Display each child's:
- Avatar image or default icon
- Name and age
- Grade level badge
- Stats: Coins, XP, Level
- Edit and Delete buttons

## Database Schema

The `children` table includes:
```sql
- id (uuid, primary key)
- parent_id (uuid, references auth.users)
- pseudo (text)
- birth_year (integer)
- grade_level (text) -- NEW
- avatar_url (text)
- coins (integer)
- xp (integer)
- level (integer)
- daily_time_limit (integer) -- NEW
- learning_preferences (text[]) -- NEW
- allowed_content_types (text[]) -- NEW
- created_at (timestamp)
- updated_at (timestamp)
```

## Supabase Edge Function Required

Create `manage-children` edge function with the following code:

\`\`\`typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { action, childId, childData, parentId } = await req.json();

    if (action === 'create') {
      const { data, error } = await supabaseClient.from('children').insert({
        parent_id: parentId,
        pseudo: childData.pseudo,
        birth_year: childData.birth_year,
        grade_level: childData.grade_level,
        avatar_url: childData.avatar_url,
        daily_time_limit: childData.daily_time_limit || 60,
        learning_preferences: childData.learning_preferences || [],
        allowed_content_types: childData.allowed_content_types || ['video', 'quiz', 'exercise', 'game'],
        coins: 0, xp: 0, level: 1
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
      });
    }

    if (action === 'update') {
      const { data, error } = await supabaseClient.from('children').update({
        pseudo: childData.pseudo,
        birth_year: childData.birth_year,
        grade_level: childData.grade_level,
        avatar_url: childData.avatar_url,
        daily_time_limit: childData.daily_time_limit,
        learning_preferences: childData.learning_preferences,
        allowed_content_types: childData.allowed_content_types
      }).eq('id', childId).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
      });
    }

    if (action === 'delete') {
      const { error } = await supabaseClient.from('children').delete().eq('id', childId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
      });
    }

    throw new Error('Invalid action');
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
    });
  }
});
\`\`\`

## Storage Bucket Setup

Create `child-avatars` storage bucket in Supabase:
1. Go to Storage in Supabase Dashboard
2. Create new bucket: `child-avatars`
3. Set as public bucket
4. Configure policies to allow parents to upload avatars

## Usage

Parents can access the profile management through the Parent Dashboard:
1. Navigate to "Enfants" tab
2. Click "Ajouter" to create new profile
3. Fill in all required fields
4. Upload avatar image
5. Set preferences and restrictions
6. Click "Créer le profil"

Edit/Delete profiles using buttons on each child card.
