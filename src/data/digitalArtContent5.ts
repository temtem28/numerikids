import { LessonContent } from './lessonContent';

export const digitalArtContent5: Record<string, LessonContent> = {
  'art-4-2': {
    lessonId: 'art-4-2',
    videoTitle: 'Corrections et Filtres',
    videoDuration: '14:00',
    exerciseChallenge: 'Corrige l\'exposition, le contraste et la saturation d\'une photo.',
  },

  'art-4-3': {
    lessonId: 'art-4-3',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'un calque?', options: ['Une couleur', 'Une couche d\'image', 'Un filtre', 'Un outil'], correct: 1, explanation: 'Un calque est une couche indépendante dans la composition.' },
      { question: 'Pourquoi utiliser des masques?', options: ['Pour décorer', 'Pour cacher sans détruire', 'Pour colorier', 'Pour imprimer'], correct: 1, explanation: 'Les masques permettent des modifications non-destructives.' },
    ],
  },

  // Quest 5: L'Illusion du Mouvement (Animation)
  'art-5-1': {
    lessonId: 'art-5-1',
    videoTitle: 'Principes de l\'Animation',
    videoDuration: '17:00',
    steps: [
      { title: 'Images par seconde', description: '24-30 fps pour une animation fluide. Chaque image est une étape du mouvement.', hint: 'FPS = Frames Per Second' },
      { title: 'Keyframes', description: 'Définis les positions clés. L\'ordinateur calcule les images entre deux keyframes.', hint: 'Interpolation automatique' },
    ],
    exerciseChallenge: 'Crée un personnage animé qui marche avec Scratch.',
  },
};
