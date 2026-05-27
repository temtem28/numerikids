import { LessonContent } from './lessonContent';

export const digitalArtContent3: Record<string, LessonContent> = {
  'art-2-2': {
    lessonId: 'art-2-2',
    videoTitle: 'Perspective et Profondeur',
    videoDuration: '12:00',
    exerciseChallenge: 'Crée une scène avec perspective en utilisant les lignes de fuite.',
  },

  'art-2-3': {
    lessonId: 'art-2-3',
    quizQuestions: [
      { question: 'Qu\'est-ce que la règle des tiers?', options: ['Diviser en 3 couleurs', 'Grille 3x3 pour composition', 'Utiliser 3 objets', '3 minutes'], correct: 1, explanation: 'La règle des tiers aide à placer les éléments de manière harmonieuse.' },
      { question: 'Où placer le sujet principal?', options: ['Au centre toujours', 'Sur les points forts', 'En bas', 'Aléatoirement'], correct: 1, explanation: 'Les points d\'intersection des lignes de tiers sont idéaux.' },
    ],
  },

  // Quest 3: Le Sculpteur de Formes (Vector Design)
  'art-3-1': {
    lessonId: 'art-3-1',
    videoTitle: 'Design Vectoriel - Les Bases',
    videoDuration: '15:00',
    steps: [
      { title: 'Bitmap vs Vectoriel', description: 'Bitmap = pixels. Vectoriel = formules mathématiques. Le vectoriel ne perd pas en qualité.', hint: 'Zoom infini' },
      { title: 'Formes de base', description: 'Cercles, rectangles, polygones. Combine-les pour créer des formes complexes.', hint: 'Comme des LEGO' },
    ],
    exerciseChallenge: 'Dessine le logo de la Maison des Artistes avec des formes vectorielles.',
  },
};
