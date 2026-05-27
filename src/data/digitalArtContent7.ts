import { LessonContent } from './lessonContent';

export const digitalArtContent7: Record<string, LessonContent> = {
  'art-6-2': {
    lessonId: 'art-6-2',
    videoTitle: 'Synchronisation Audio-Vidéo',
    videoDuration: '16:00',
    exerciseChallenge: 'Ajoute de la musique et synchronise-la avec les changements de scène.',
  },

  'art-6-3': {
    lessonId: 'art-6-3',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'une timeline?', options: ['Une horloge', 'La ligne de temps du montage', 'Un effet', 'Un filtre'], correct: 1, explanation: 'La timeline organise les clips dans l\'ordre temporel.' },
      { question: 'Pourquoi varier le rythme?', options: ['Pour décorer', 'Pour créer de l\'émotion', 'Pour ralentir', 'Par hasard'], correct: 1, explanation: 'Le rythme guide l\'attention et l\'émotion du spectateur.' },
    ],
  },

  // Quest 7: Le Musée Interactif (Web Design)
  'art-7-1': {
    lessonId: 'art-7-1',
    videoTitle: 'Design Web et UX/UI',
    videoDuration: '17:00',
    steps: [
      { title: 'Grille et mise en page', description: 'Utilise une grille pour aligner les éléments. Espaces blancs = respiration.', hint: 'Structure invisible' },
      { title: 'Typographie', description: 'Choisis 2-3 polices max. Hiérarchie: titres, sous-titres, texte.', hint: 'Lisibilité d\'abord' },
      { title: 'Navigation intuitive', description: 'Menu clair, boutons visibles, parcours logique.', hint: 'L\'utilisateur ne doit pas réfléchir' },
    ],
    exerciseChallenge: 'Crée une galerie virtuelle avec Scratch pour exposer 6 œuvres.',
  },
};
