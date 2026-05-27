import { LessonContent } from './lessonContent';

export const digitalArtContent6: Record<string, LessonContent> = {
  'art-5-2': {
    lessonId: 'art-5-2',
    videoTitle: 'Création de GIF Animés',
    videoDuration: '15:00',
    exerciseChallenge: 'Crée un GIF animé en boucle avec un effet de rebond.',
  },

  'art-5-3': {
    lessonId: 'art-5-3',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'un keyframe?', options: ['Une touche', 'Une image clé', 'Un effet', 'Une couleur'], correct: 1, explanation: 'Un keyframe marque une position importante dans l\'animation.' },
      { question: 'Combien d\'images par seconde pour une animation fluide?', options: ['5-10', '24-30', '100', '1'], correct: 1, explanation: '24-30 fps est le standard pour une animation fluide.' },
    ],
  },

  // Quest 6: Le Maître du Montage (Video Editing)
  'art-6-1': {
    lessonId: 'art-6-1',
    videoTitle: 'Montage Vidéo - Les Bases',
    videoDuration: '18:00',
    steps: [
      { title: 'Timeline et séquençage', description: 'La timeline organise les clips dans le temps. Coupe, déplace, ajuste la durée.', hint: 'Ligne du temps' },
      { title: 'Transitions', description: 'Fondu, balayage, dissolution. Les transitions lient les scènes.', hint: 'Passage fluide' },
      { title: 'Rythme narratif', description: 'Alterne plans courts (action) et longs (émotion). La musique guide le rythme.', hint: 'Tempo visuel' },
    ],
    exerciseChallenge: 'Monte une courte histoire avec 5 clips et des transitions.',
  },
};
