import { lessonContentData, type LessonContent } from '@/data/lessonContent';

type SagaLessonType = 'scratch' | 'python' | 'quiz';

function getPart(questId: number, suffix: 1 | 2 | 3, prefix: 'nova' | 'art'): LessonContent | undefined {
  const key = `${prefix}-${questId}-${suffix}`;
  return lessonContentData[key];
}

function concatSteps(...parts: (LessonContent | undefined)[]): LessonContent['steps'] {
  const out: NonNullable<LessonContent['steps']> = [];
  for (const p of parts) {
    if (p?.steps?.length) out.push(...p.steps);
  }
  return out.length ? out : undefined;
}

function joinChallenges(...parts: (LessonContent | undefined)[]): string | undefined {
  const texts = parts.map((p) => p?.exerciseChallenge).filter(Boolean) as string[];
  if (!texts.length) return undefined;
  if (texts.length === 1) return texts[0];
  return texts.join('\n\n— Suite de la quête —\n\n');
}

/** Fusionne les 3 sous-leçons d'une quête Nova-Ville (nova-q-1, -2, -3). */
export function mergeNovaVilleQuest(questId: number): LessonContent | null {
  const p1 = getPart(questId, 1, 'nova');
  const p2 = getPart(questId, 2, 'nova');
  const p3 = getPart(questId, 3, 'nova');
  if (!p1 && !p2 && !p3) return null;

  const steps = concatSteps(p1, p2, p3);
  const quizQuestions = p3?.quizQuestions;

  return {
    lessonId: `nova-${questId}-merged`,
    videoTitle: p1?.videoTitle ?? p2?.videoTitle,
    videoDuration: p1?.videoDuration ?? p2?.videoDuration,
    steps,
    exerciseChallenge: joinChallenges(p1, p2),
    starterCode: p2?.starterCode ?? p1?.starterCode,
    hints: [...(p1?.hints ?? []), ...(p2?.hints ?? [])].length
      ? [...(p1?.hints ?? []), ...(p2?.hints ?? [])]
      : undefined,
    expectedOutput: p2?.expectedOutput ?? p1?.expectedOutput,
    quizQuestions,
  };
}

/** Fusionne les sous-leçons Digital Art (art-q-1, -2, -3). */
export function mergeDigitalArtQuest(questId: number): LessonContent | null {
  const p1 = getPart(questId, 1, 'art');
  const p2 = getPart(questId, 2, 'art');
  const p3 = getPart(questId, 3, 'art');
  if (!p1 && !p2 && !p3) return null;

  const steps = concatSteps(p1, p2, p3);
  const quizQuestions = p3?.quizQuestions ?? p2?.quizQuestions;

  return {
    lessonId: `art-${questId}-merged`,
    videoTitle: p1?.videoTitle ?? p2?.videoTitle,
    videoDuration: p1?.videoDuration ?? p2?.videoDuration,
    steps,
    exerciseChallenge: joinChallenges(p1, p2),
    starterCode: p2?.starterCode ?? p1?.starterCode,
    hints: [...(p1?.hints ?? []), ...(p2?.hints ?? [])].length
      ? [...(p1?.hints ?? []), ...(p2?.hints ?? [])]
      : undefined,
    expectedOutput: p2?.expectedOutput ?? p1?.expectedOutput,
    quizQuestions,
  };
}

const NOVA_PREFIX = '__NOVA_MERGE__:';
const ART_PREFIX = '__ART_MERGE__:';

export function getSagaContentLessonKey(sagaId: string, lesson: { id: number; type: SagaLessonType }): string {
  if (sagaId === 'pixel-kingdom') return `pixel-${lesson.id}`;
  if (sagaId === 'novaville') return `${NOVA_PREFIX}${lesson.id}`;
  if (sagaId === 'digitalart') return `${ART_PREFIX}${lesson.id}`;
  if (sagaId === 'ai') return `ai-${lesson.id}`;
  if (sagaId === 'scratch') return `scratch-${lesson.id}`;
  if (sagaId === 'python') return `python-${lesson.id}`;
  return `${lesson.type}-${lesson.id}`;
}

export function tryParseNovaMergeKey(lessonId: string): number | null {
  if (!lessonId.startsWith(NOVA_PREFIX)) return null;
  const n = parseInt(lessonId.slice(NOVA_PREFIX.length), 10);
  return Number.isFinite(n) ? n : null;
}

export function tryParseArtMergeKey(lessonId: string): number | null {
  if (!lessonId.startsWith(ART_PREFIX)) return null;
  const n = parseInt(lessonId.slice(ART_PREFIX.length), 10);
  return Number.isFinite(n) ? n : null;
}

export function localContentToWrapperState(local: LessonContent) {
  return {
    video_title: local.videoTitle,
    video_duration: local.videoDuration,
    steps: local.steps,
    exercise_challenge: local.exerciseChallenge,
    starter_code: local.starterCode,
    hints: local.hints,
    expected_output: local.expectedOutput,
    quiz_questions: local.quizQuestions,
  };
}
