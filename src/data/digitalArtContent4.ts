import { LessonContent } from './lessonContent';

export const digitalArtContent4: Record<string, LessonContent> = {
  'art-3-2': {
    lessonId: 'art-3-2',
    videoTitle: 'Manipulation de Formes',
    videoDuration: '13:00',
    exerciseChallenge: 'Crée un personnage en assemblant des formes géométriques.',
  },

  'art-3-3': {
    lessonId: 'art-3-3',
    quizQuestions: [
      { question: 'Avantage du vectoriel?', options: ['Plus petit', 'Qualité infinie', 'Plus rapide', 'Plus coloré'], correct: 1, explanation: 'Le vectoriel garde sa qualité à toutes les tailles.' },
      { question: 'Qu\'est-ce qu\'un tracé?', options: ['Un dessin', 'Un chemin vectoriel', 'Une couleur', 'Un filtre'], correct: 1, explanation: 'Un tracé définit le contour d\'une forme vectorielle.' },
    ],
  },

  // Quest 4: L'Ombre et la Profondeur (Photo Editing)
  'art-4-1': {
    lessonId: 'art-4-1',
    videoTitle: 'Retouche Photo et Calques',
    videoDuration: '16:00',
    steps: [
      { title: 'Système de calques', description: 'Chaque calque est une couche transparente. Empile-les pour composer l\'image finale.', hint: 'Comme des feuilles transparentes' },
      { title: 'Masques de fusion', description: 'Les masques cachent ou révèlent des parties d\'un calque sans détruire l\'image.', hint: 'Gomme non-destructive' },
    ],
    exerciseChallenge: 'Ajoute des effets de lumière sur une image en utilisant les calques.',
  },
};
