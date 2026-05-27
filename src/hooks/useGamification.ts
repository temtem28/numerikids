import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useGamification(userId: string | undefined) {
  const [userProgress, setUserProgress] = useState({ total_xp: 0, level: 1, lessons_completed: 0 });
  const [unlockedBadge, setUnlockedBadge] = useState<any>(null);

  useEffect(() => {
    if (userId) loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) setUserProgress(data);
    else {
      await supabase.from('user_progress').insert({ user_id: userId });
      setUserProgress({ total_xp: 0, level: 1, lessons_completed: 0 });
    }
  };

  const awardXP = useCallback(async (xp: number) => {
    if (!userId) return;
    const newXP = userProgress.total_xp + xp;
    const newLevel = Math.floor(newXP / 500) + 1;

    await supabase.from('user_progress').upsert({
      user_id: userId,
      total_xp: newXP,
      level: newLevel,
      lessons_completed: userProgress.lessons_completed + 1,
      updated_at: new Date().toISOString()
    });

    setUserProgress(prev => ({ ...prev, total_xp: newXP, level: newLevel, lessons_completed: prev.lessons_completed + 1 }));
    await checkAchievements(newXP, newLevel, userProgress.lessons_completed + 1);
  }, [userId, userProgress]);

  const checkAchievements = async (xp: number, level: number, lessons: number) => {
    if (!userId) return;
    const { data: achievements } = await supabase.from('achievements').select('*');
    const { data: unlocked } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', userId);
    const unlockedIds = new Set(unlocked?.map(u => u.achievement_id));

    for (const achievement of achievements || []) {
      if (unlockedIds.has(achievement.id)) continue;
      let shouldUnlock = false;

      if (achievement.requirement_type === 'lesson_count' && lessons >= achievement.requirement_value) shouldUnlock = true;
      if (achievement.requirement_type === 'xp_total' && xp >= achievement.requirement_value) shouldUnlock = true;
      if (achievement.requirement_type === 'level_reached' && level >= achievement.requirement_value) shouldUnlock = true;

      if (shouldUnlock) {
        await supabase.from('user_achievements').insert({ user_id: userId, achievement_id: achievement.id });
        setUnlockedBadge(achievement);
        setTimeout(() => setUnlockedBadge(null), 5000);
      }
    }
  };

  return { userProgress, awardXP, unlockedBadge, setUnlockedBadge };
}
