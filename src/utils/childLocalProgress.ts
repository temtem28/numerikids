/** Même forme que QuestProgress dans usePixelKingdomProgress (évite import circulaire). */
export type StoredPixelQuestProgress = {
  questId: number;
  completed: boolean;
  unlocked: boolean;
  xpEarned: number;
  starsEarned: number;
  bestScore: number;
  bestStars: number;
  lastScore: number;
  attempts: number;
};

const sagaKey = (childId: string) => `edu_local_saga_progress_${childId}`;
const pixelKey = (childId: string) => `edu_local_pixel_kingdom_${childId}`;

export type LocalSagaProgressMap = { [sagaId: string]: number[] };

export function loadLocalSagaProgress(childId: string): LocalSagaProgressMap {
  try {
    const raw = localStorage.getItem(sagaKey(childId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LocalSagaProgressMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function addLocalCompletedLesson(childId: string, sagaId: string, lessonId: number): LocalSagaProgressMap {
  const all = loadLocalSagaProgress(childId);
  const arr = [...(all[sagaId] || [])];
  if (!arr.includes(lessonId)) arr.push(lessonId);
  all[sagaId] = arr;
  localStorage.setItem(sagaKey(childId), JSON.stringify(all));
  return all;
}

export function loadLocalPixelProgress(childId: string): StoredPixelQuestProgress[] {
  try {
    const raw = localStorage.getItem(pixelKey(childId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredPixelQuestProgress[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalPixelProgress(childId: string, progress: StoredPixelQuestProgress[]): void {
  localStorage.setItem(pixelKey(childId), JSON.stringify(progress));
}
