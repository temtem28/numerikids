import { supabase } from '@/lib/supabase';

export type ChildFormPayload = {
  pseudo?: string;
  name?: string;
  birth_year?: number;
  grade_level?: string;
  avatar_url?: string;
  pincode?: string;
  daily_time_limit?: number;
  learning_preferences?: string[];
  allowed_content_types?: string[];
};

/** Résout l'identifiant parent utilisé en base (id direct ou ancien user_id). */
export async function resolveParentId(authUserId: string): Promise<string> {
  // 1) Source de vérité côté DB (même logique que les policies RLS).
  try {
    const { data: fromRpc, error: rpcError } = await supabase.rpc('get_parent_profile');
    if (!rpcError && fromRpc) return String(fromRpc);
  } catch {
    // Fonction absente ou non accessible: on continue avec les fallback.
  }

  const { data: byId, error: byIdError } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('id', authUserId)
    .maybeSingle();

  if (!byIdError && byId?.id) return byId.id;

  // Compatibilité avec anciens schémas (parent_profiles.user_id)
  const { data: byUserId, error: byUserIdError } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('user_id', authUserId)
    .maybeSingle();

  if (!byUserIdError && byUserId?.id) return byUserId.id;

  return authUserId;
}

/** Récupère ou crée le foyer du parent. */
export async function ensureHouseholdForParent(parentId: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from('households')
    .select('id')
    .eq('parent_id', parentId)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data: created, error } = await supabase
    .from('households')
    .insert({
      parent_id: parentId,
      name: 'Ma Famille',
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !created?.id) {
    console.error('ensureHouseholdForParent:', error);
    return null;
  }
  return created.id;
}

export function buildChildInsertRow(parentId: string, householdId: string, childData: ChildFormPayload) {
  const displayName = (childData.pseudo || childData.name || 'Enfant').trim() || 'Enfant';
  const year = childData.birth_year ?? new Date().getFullYear() - 8;
  const age = Math.max(1, Math.min(17, new Date().getFullYear() - year));
  const generatedPin = `${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    parent_id: parentId,
    household_id: householdId,
    name: displayName,
    pseudo: displayName,
    pincode: childData.pincode ?? generatedPin,
    birth_year: year,
    age,
    grade_level: childData.grade_level || 'CE2',
    avatar_url: childData.avatar_url || null,
    xp_points: 0,
    coins: 100,
    streak_days: 0,
    is_active: true,
    daily_time_limit: childData.daily_time_limit ?? 60,
    learning_preferences: childData.learning_preferences ?? [],
    allowed_content_types: childData.allowed_content_types ?? ['video', 'quiz', 'exercise', 'game'],
  };
}

type InsertChildResult = {
  childId: string;
  generatedPin?: string;
};

/**
 * Insère un enfant avec compatibilité de schéma (colonnes anciennes/nouvelles).
 * On tente plusieurs payloads pour éviter les échecs "colonne inconnue".
 */
export async function insertChildProfileCompat(
  parentId: string,
  householdId: string,
  childData: ChildFormPayload
): Promise<InsertChildResult> {
  const fullRow = buildChildInsertRow(parentId, householdId, childData);

  const variants: Array<Record<string, unknown>> = [
    fullRow,
    // Schéma "gamification legacy" (colonnes level/xp)
    {
      parent_id: fullRow.parent_id,
      household_id: fullRow.household_id,
      name: fullRow.name,
      pseudo: fullRow.pseudo,
      birth_year: fullRow.birth_year,
      age: fullRow.age,
      grade_level: fullRow.grade_level,
      avatar_url: fullRow.avatar_url,
      level: 1,
      xp: 0,
      coins: fullRow.coins,
      streak_days: fullRow.streak_days,
      is_active: fullRow.is_active,
      pincode: fullRow.pincode,
    },
    // Schéma legacy sans pseudo/pincode
    {
      parent_id: fullRow.parent_id,
      household_id: fullRow.household_id,
      name: fullRow.name,
      birth_year: fullRow.birth_year,
      age: fullRow.age,
      grade_level: fullRow.grade_level,
      avatar_url: fullRow.avatar_url,
      level: 1,
      xp: 0,
      coins: fullRow.coins,
      streak_days: fullRow.streak_days,
      is_active: fullRow.is_active,
    },
    // Schéma sans pseudo/pincode/birth_year
    {
      parent_id: fullRow.parent_id,
      household_id: fullRow.household_id,
      name: fullRow.name,
      age: fullRow.age,
      grade_level: fullRow.grade_level,
      avatar_url: fullRow.avatar_url,
      xp_points: fullRow.xp_points,
      coins: fullRow.coins,
      streak_days: fullRow.streak_days,
      is_active: fullRow.is_active,
      daily_time_limit: fullRow.daily_time_limit,
      learning_preferences: fullRow.learning_preferences,
      allowed_content_types: fullRow.allowed_content_types,
    },
    // Schéma plus ancien
    {
      parent_id: fullRow.parent_id,
      household_id: fullRow.household_id,
      name: fullRow.name,
      age: fullRow.age,
      avatar_url: fullRow.avatar_url,
      xp_points: fullRow.xp_points,
      coins: fullRow.coins,
      streak_days: fullRow.streak_days,
    },
    // Minimum vital
    {
      parent_id: fullRow.parent_id,
      household_id: fullRow.household_id,
      name: fullRow.name,
      age: fullRow.age,
    },
  ];

  let lastError: any = null;
  for (const row of variants) {
    const { data, error } = await supabase
      .from('children')
      .insert(row)
      .select('id')
      .single();

    if (!error && data?.id) {
      return { childId: data.id, generatedPin: fullRow.pincode };
    }
    lastError = error;
  }

  throw lastError || new Error("Échec de création du profil enfant.");
}
