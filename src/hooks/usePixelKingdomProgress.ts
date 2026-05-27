import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getChildSessionProfile, CHILD_SESSION_EVENT } from '@/utils/childSession';
import {
  loadLocalPixelProgress,
  saveLocalPixelProgress,
  type StoredPixelQuestProgress,
} from '@/utils/childLocalProgress';

export interface QuestProgress {
  questId: number;
  completed: boolean;
  unlocked: boolean;
  xpEarned: number;
  starsEarned: number;
  bestScore: number;
  bestStars: number;
  lastScore: number;
  attempts: number;
}

export interface CollectedItem {
  itemId: string;
  itemName: string;
  itemType: string;
  questId: number;
}

const MAX_QUEST = 15;

function emptyQuest(questId: number, overrides: Partial<QuestProgress> = {}): QuestProgress {
  return {
    questId,
    completed: false,
    unlocked: questId === 1,
    xpEarned: 0,
    starsEarned: 0,
    bestScore: 0,
    bestStars: 0,
    lastScore: 0,
    attempts: 0,
    ...overrides,
  };
}

function fromStored(list: StoredPixelQuestProgress[]): QuestProgress[] {
  return list.map((p) => ({
    questId: p.questId,
    completed: p.completed,
    unlocked: p.unlocked,
    xpEarned: p.xpEarned,
    starsEarned: p.starsEarned,
    bestScore: p.bestScore,
    bestStars: p.bestStars,
    lastScore: p.lastScore,
    attempts: p.attempts,
  }));
}

function toStored(list: QuestProgress[]): StoredPixelQuestProgress[] {
  return list.map((p) => ({ ...p }));
}

/** Recalcule les drapeaux `unlocked` (enchaînement 1 → 15). */
function reconcileUnlocks(list: QuestProgress[]): QuestProgress[] {
  const byId = new Map<number, QuestProgress>();
  for (const p of list) byId.set(p.questId, { ...p });
  const out: QuestProgress[] = [];
  for (let id = 1; id <= MAX_QUEST; id++) {
    const cur = byId.get(id) ?? emptyQuest(id);
    const prev = id > 1 ? byId.get(id - 1) : undefined;
    out.push({
      ...cur,
      questId: id,
      unlocked: id === 1 || prev?.completed === true,
    });
  }
  return out;
}

function mergeLocalQuestComplete(
  list: QuestProgress[],
  questId: number,
  xpEarned: number,
  starsEarned: number,
  score: number
): QuestProgress[] {
  const byId = new Map<number, QuestProgress>();
  for (const p of list) byId.set(p.questId, { ...p });
  const prev = byId.get(questId);
  const bestScore = Math.max(prev?.bestScore ?? 0, score);
  const bestStars = Math.max(prev?.bestStars ?? 0, starsEarned);
  byId.set(questId, {
    questId,
    completed: true,
    unlocked: true,
    xpEarned: (prev?.xpEarned ?? 0) + xpEarned,
    starsEarned: Math.max(prev?.starsEarned ?? 0, starsEarned),
    bestScore,
    bestStars,
    lastScore: score,
    attempts: (prev?.attempts ?? 0) + 1,
  });
  return reconcileUnlocks(Array.from(byId.values()));
}

export const usePixelKingdomProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<QuestProgress[]>([]);
  const [items, setItems] = useState<CollectedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data, error } = await supabase.functions.invoke('pixel-kingdom-progress', {
          body: { action: 'load' },
        });

        if (error) {
          console.debug('Error loading progress:', error);
          setProgress([emptyQuest(1)]);
          setItems([]);
          return;
        }

        const progressMap =
          data?.progress?.map((p: Record<string, unknown>) => ({
            questId: p.quest_id as number,
            completed: p.completed as boolean,
            unlocked: p.unlocked as boolean,
            xpEarned: p.xp_earned as number,
            starsEarned: p.stars_earned as number,
            bestScore: (p.best_score as number) || 0,
            bestStars: (p.best_stars as number) || 0,
            lastScore: (p.last_score as number) || 0,
            attempts: (p.attempts as number) || (p.attempt_count as number) || 0,
          })) || [];

        if (!progressMap.find((p: QuestProgress) => p.questId === 1)) {
          progressMap.push(emptyQuest(1));
        }

        setProgress(progressMap);
        setItems(
          data?.items?.map((i: Record<string, unknown>) => ({
            itemId: i.item_id as string,
            itemName: i.item_name as string,
            itemType: i.item_type as string,
            questId: i.quest_id as number,
          })) || []
        );
        return;
      }

      const child = getChildSessionProfile();
      if (child) {
        const local = fromStored(loadLocalPixelProgress(child.id));
        const reconciled = local.length ? reconcileUnlocks(local) : [emptyQuest(1)];
        setProgress(reconciled);
        saveLocalPixelProgress(child.id, toStored(reconciled));
        setItems([]);
        return;
      }

      setProgress([]);
      setItems([]);
    } catch (error) {
      console.debug('Error loading progress:', error);
      setProgress([emptyQuest(1)]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
    const onChange = () => loadProgress();
    window.addEventListener(CHILD_SESSION_EVENT, onChange);
    return () => window.removeEventListener(CHILD_SESSION_EVENT, onChange);
  }, [user, loadProgress]);

  const completeQuest = async (
    questId: number,
    xpEarned: number,
    starsEarned: number,
    score: number,
    collectedItems?: unknown[]
  ) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      try {
        const { data, error } = await supabase.functions.invoke('pixel-kingdom-progress', {
          body: { action: 'complete', questId, xpEarned, starsEarned, score, items: collectedItems },
        });
        if (error) throw error;
        await loadProgress();
        return data;
      } catch (error) {
        console.error('Error completing quest:', error);
        return null;
      }
    }

    const child = getChildSessionProfile();
    if (!child) {
      console.warn('completeQuest: pas de session parent ni élève');
      return null;
    }

    const current = reconcileUnlocks(fromStored(loadLocalPixelProgress(child.id)));
    const merged = mergeLocalQuestComplete(current, questId, xpEarned, starsEarned, score);
    saveLocalPixelProgress(child.id, toStored(merged));
    setProgress(merged);
    return { success: true, isImprovement: false };
  };

  const getQuestProgress = (questId: number) => {
    return progress.find((p) => p.questId === questId);
  };

  const isQuestUnlocked = (questId: number) => {
    return progress.find((p) => p.questId === questId)?.unlocked || questId === 1;
  };

  const isQuestCompleted = (questId: number) => {
    return progress.find((p) => p.questId === questId)?.completed || false;
  };

  return { progress, items, loading, completeQuest, isQuestUnlocked, isQuestCompleted, getQuestProgress, loadProgress };
};
