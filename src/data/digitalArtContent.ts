import { LessonContent } from './lessonContent';

// Digital Art Masters - Complete Lesson Content (8 Quests)
export const digitalArtContent: Record<string, LessonContent> = {
  // Quest 1: Les 3 Couleurs Primaires (Color Theory)
  'art-1-1': {
    lessonId: 'art-1-1',
    videoTitle: 'Théorie des Couleurs RVB et CMJN',
    videoDuration: '12:00',
    steps: [
      { title: 'RVB vs CMJN', description: 'RVB (Rouge, Vert, Bleu) pour écrans. CMJN (Cyan, Magenta, Jaune, Noir) pour impression.', hint: 'Écran = lumière, Papier = encre' },
      { title: 'Mélange des couleurs', description: 'En RVB: Rouge + Vert = Jaune. En CMJN: Cyan + Magenta = Bleu.', hint: 'Synthèse additive vs soustractive' },
      { title: 'Cercle chromatique', description: 'Couleurs primaires, secondaires, tertiaires. Complémentaires opposées.', hint: 'Roue des couleurs' },
    ],
    exerciseChallenge: 'Crée un mood board avec 5 couleurs harmonieuses pour une ambiance joyeuse.',
  },

  'art-1-2': {
    lessonId: 'art-1-2',
    videoTitle: 'Harmonies Colorées',
    videoDuration: '10:00',
    exerciseChallenge: 'Utilise Scratch pour créer des dégradés et tester différentes harmonies.',
  },
};
