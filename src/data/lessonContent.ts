import { novaVilleContent } from './novaVilleContent';
import { digitalArtContent } from './digitalArtContent';
import { digitalArtContent2 } from './digitalArtContent2';
import { digitalArtContent3 } from './digitalArtContent3';
import { digitalArtContent4 } from './digitalArtContent4';
import { digitalArtContent5 } from './digitalArtContent5';
import { digitalArtContent6 } from './digitalArtContent6';
import { digitalArtContent7 } from './digitalArtContent7';
import { digitalArtContent8 } from './digitalArtContent8';
import { scratchLessonsContent } from './scratchLessonsContent';
import { pythonLessonsContent } from './pythonLessonsContent';
import { aiLessonsContent } from './aiLessonsContent';
import { pixelKingdomFullContent } from './pixelKingdomFullContent';

export interface LessonContent {
  lessonId: string;
  videoTitle?: string;
  videoDuration?: string;
  steps?: Array<{
    title: string;
    description: string;
    hint?: string;
  }>;
  exerciseChallenge?: string;
  starterCode?: string;
  hints?: string[];
  expectedOutput?: string;
  quizQuestions?: Array<{
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }>;
}

export const lessonContentData: Record<string, LessonContent> = {
  // ============ SCRATCH SAGA - Complete 8 Lessons ============
  ...scratchLessonsContent,

  // ============ PYTHON SAGA - Complete 8 Lessons ============
  ...pythonLessonsContent,

  // ============ AI SAGA - Complete 8 Lessons ============
  ...aiLessonsContent,

  // ============ PIXEL KINGDOM - Complete 15 Quests ============
  ...pixelKingdomFullContent,

  // ============ NOVA-VILLE - Complete 24 Lessons (8 quests × 3 sub-lessons) ============
  ...novaVilleContent,

  // ============ DIGITAL ART MASTERS - Complete 24 Lessons (8 quests × 3 sub-lessons) ============
  ...digitalArtContent,
  ...digitalArtContent2,
  ...digitalArtContent3,
  ...digitalArtContent4,
  ...digitalArtContent5,
  ...digitalArtContent6,
  ...digitalArtContent7,
  ...digitalArtContent8,
};
