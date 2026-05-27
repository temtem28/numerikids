import { LessonContent } from './lessonContent';

export const digitalArtContent8: Record<string, LessonContent> = {
  'art-7-2': {
    lessonId: 'art-7-2',
    videoTitle: 'Responsive Design',
    videoDuration: '15:00',
    exerciseChallenge: 'Adapte ta galerie pour mobile, tablette et desktop.',
  },

  'art-7-3': {
    lessonId: 'art-7-3',
    quizQuestions: [
      { question: 'Qu\'est-ce que l\'UX?', options: ['Les couleurs', 'L\'expérience utilisateur', 'Un logiciel', 'Une police'], correct: 1, explanation: 'UX = User Experience, l\'expérience globale de l\'utilisateur.' },
      { question: 'Combien de polices maximum?', options: ['10', '2-3', '1', 'Autant que possible'], correct: 1, explanation: '2-3 polices suffisent pour garder la cohérence visuelle.' },
    ],
  },

  // Quest 8: Le Gala d'Illumination (Publishing)
  'art-8-1': {
    lessonId: 'art-8-1',
    videoTitle: 'Optimisation et Export',
    videoDuration: '16:00',
    steps: [
      { title: 'Formats d\'export', description: 'JPEG (photos), PNG (transparence), GIF (animation), MP4 (vidéo), SVG (vectoriel).', hint: 'Chaque format a son usage' },
      { title: 'Compression', description: 'Réduis la taille sans trop perdre en qualité. Important pour le web.', hint: 'Équilibre poids/qualité' },
      { title: 'Publication', description: 'Partage sur les plateformes adaptées: portfolio, réseaux sociaux, galeries en ligne.', hint: 'Choisis le bon canal' },
    ],
    exerciseChallenge: 'Exporte ton œuvre finale dans 3 formats différents.',
  },

  'art-8-2': {
    lessonId: 'art-8-2',
    quizQuestions: [
      { question: 'Format pour transparence?', options: ['JPEG', 'PNG', 'MP3', 'TXT'], correct: 1, explanation: 'PNG supporte la transparence, pas JPEG.' },
    ],
  },
};
