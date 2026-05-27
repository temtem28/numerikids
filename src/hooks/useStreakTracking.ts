import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export const useStreakTracking = (childId: string | undefined) => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchStreak = async () => {
    if (!childId) return;
    
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('child_id', childId)
      .single();

    if (data) {
      setStreakData({
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastActivityDate: data.last_activity_date,
      });
    }
    setLoading(false);
  };

  const updateStreak = async () => {
    if (!childId) return null;

    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingStreak } = await supabase
      .from('streaks')
      .select('*')
      .eq('child_id', childId)
      .single();

    let newStreak = 1;
    let bonusCoins = 0;
    let milestone = null;

    if (existingStreak) {
      const lastDate = existingStreak.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === today) {
        return null;
      } else if (lastDate === yesterdayStr) {
        newStreak = existingStreak.current_streak + 1;
      }

      if (newStreak === 3) {
        bonusCoins = 5;
        milestone = '3 jours';
      } else if (newStreak === 7) {
        bonusCoins = 10;
        milestone = '7 jours';
      } else if (newStreak === 30) {
        bonusCoins = 25;
        milestone = '30 jours';
      }

      const longestStreak = Math.max(newStreak, existingStreak.longest_streak);

      await supabase
        .from('streaks')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('child_id', childId);
    } else {
      await supabase
        .from('streaks')
        .insert({
          child_id: childId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
        });
    }

    if (bonusCoins > 0) {
      await supabase.from('child_coins').upsert({
        child_id: childId,
        coins: bonusCoins,
      }, { onConflict: 'child_id', ignoreDuplicates: false });

      await supabase.from('coin_transactions').insert({
        child_id: childId,
        amount: bonusCoins,
        type: 'earned',
        description: `Bonus série ${milestone}! 🔥`,
      });
    }

    await fetchStreak();
    return { newStreak, bonusCoins, milestone };
  };

  useEffect(() => {
    fetchStreak();
  }, [childId]);

  return { streakData, loading, updateStreak, refetch: fetchStreak };
};
