import { LessonContent } from './lessonContent';

export const digitalArtContent2: Record<string, LessonContent> = {
  'art-1-3': {
    lessonId: 'art-1-3',
    quizQuestions: [
      { question: 'Quel modèle pour les écrans?', options: ['CMJN', 'RVB', 'HSL', 'Pantone'], correct: 1, explanation: 'RVB (Rouge, Vert, Bleu) est utilisé pour les écrans.' },
      { question: 'Couleurs complémentaires?', options: ['Côte à côte', 'Opposées sur le cercle', 'Identiques', 'Aléatoires'], correct: 1, explanation: 'Les complémentaires sont opposées sur le cercle chromatique.' },
    ],
  },

  // Quest 2: La Composition Magique
  'art-2-1': {
    lessonId: 'art-2-1',
    videoTitle: 'Règle des Tiers et Cadrage',
    videoDuration: '14:00',
    steps: [
      { title: 'Règle des tiers', description: 'Divise l\'image en 9 parties égales. Place les éléments importants sur les lignes.', hint: 'Grille 3x3' },
      { title: 'Points forts', description: 'Les 4 intersections sont les points les plus attractifs.', hint: 'Là où l\'œil va naturellement' },
      { title: 'Équilibre visuel', description: 'Répartis les éléments pour créer harmonie et dynamisme.', hint: 'Symétrie ou asymétrie' },
    ],
    exerciseChallenge: 'Compose une image de héros numérique en appliquant la règle des tiers.',
  },
};
