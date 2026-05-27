import { LessonContent } from './lessonContent';

export const pixelKingdomLessons: Record<string, LessonContent> = {
  'pixel-1': {
    lessonId: 'pixel-1',
    videoTitle: 'L\'Éveil du Pixel - Premiers pas',
    videoDuration: '10:00',
    steps: [
      { title: 'Qu\'est-ce qu\'un pixel?', description: 'Un pixel est le plus petit point d\'une image. C\'est comme une brique magique de lumière!', hint: 'Regarde de près ton écran' },
      { title: 'Allumer un pixel', description: 'En code, on peut allumer un pixel en lui donnant une position (x, y) et une couleur.', hint: 'x = horizontal, y = vertical' },
      { title: 'Ta première magie', description: 'Utilise les blocs pour créer un carré de pixels lumineux.', hint: 'Répète 4 fois pour faire un carré' },
    ],
    exerciseChallenge: 'Crée un carré magique de 5x5 pixels qui brille en bleu.',
  },
  'pixel-2': {
    lessonId: 'pixel-2',
    videoTitle: 'Le Sort de Couleur',
    videoDuration: '12:00',
    steps: [
      { title: 'Les couleurs RGB', description: 'Toutes les couleurs sont faites de Rouge, Vert et Bleu (RGB). Chaque valeur va de 0 à 255.', hint: 'RGB(255,0,0) = rouge pur' },
      { title: 'Mélanger les couleurs', description: 'En combinant R, G et B, tu peux créer des millions de couleurs!', hint: 'RGB(255,255,0) = jaune' },
      { title: 'Arc-en-ciel magique', description: 'Change progressivement les couleurs pour créer un arc-en-ciel.', hint: 'Utilise une boucle' },
    ],
    exerciseChallenge: 'Crée un dégradé arc-en-ciel de 10 pixels.',
  },

  'pixel-3': {
    lessonId: 'pixel-3',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'un pixel?', options: ['Un point lumineux', 'Un animal', 'Un sort', 'Une planète'], correct: 0, explanation: 'Un pixel est le plus petit point d\'une image numérique.' },
      { question: 'Combien de valeurs RGB existe-t-il?', options: ['100', '256', '1000', '10'], correct: 1, explanation: 'RGB va de 0 à 255, soit 256 valeurs.' },
      { question: 'Quelle couleur donne RGB(0,255,0)?', options: ['Rouge', 'Bleu', 'Vert', 'Jaune'], correct: 2, explanation: 'Le vert au maximum donne du vert pur.' },
    ],
  },
  'pixel-4': {
    lessonId: 'pixel-4',
    videoTitle: 'L\'Algorithme de l\'Escalade',
    videoDuration: '15:00',
    steps: [
      { title: 'Qu\'est-ce qu\'un algorithme?', description: 'Un algorithme est une suite d\'instructions pour résoudre un problème.', hint: 'Comme une recette de cuisine' },
      { title: 'Monter pas à pas', description: 'Pour escalader, on avance étape par étape. En code, c\'est pareil!', hint: 'Une boucle peut aider' },
      { title: 'Optimiser le chemin', description: 'Trouve le chemin le plus court vers le sommet.', hint: 'Compare les distances' },
    ],
    exerciseChallenge: 'Crée un algorithme qui trouve le chemin le plus court.',
    starterCode: '# Position de départ\nposition = 0\nsommet = 10\n\n# Ton algorithme ici\n',
  },

  'pixel-5': {
    lessonId: 'pixel-5',
    videoTitle: 'Le Bouclier Debug',
    videoDuration: '13:00',
    steps: [
      { title: 'Qu\'est-ce qu\'un bug?', description: 'Un bug est une erreur dans le code. Le debug, c\'est trouver et corriger ces erreurs.', hint: 'Comme un détective' },
      { title: 'Lire les messages d\'erreur', description: 'Python te donne des indices sur où se trouve l\'erreur.', hint: 'Regarde le numéro de ligne' },
      { title: 'Tester ton code', description: 'Teste chaque partie de ton code pour trouver le problème.', hint: 'Utilise print() pour voir les valeurs' },
    ],
    exerciseChallenge: 'Corrige le code bugué pour activer le bouclier.',
    starterCode: '# Ce code a des bugs!\ndef activer_bouclier(puissance)\n    if puissance > 100\n        print("Bouclier activé!")\n    else:\n        print(Puissance insuffisante)\n',
  },
  'pixel-6': {
    lessonId: 'pixel-6',
    quizQuestions: [
      { question: 'Qu\'est-ce que le binaire?', options: ['Base 2', 'Base 10', 'Base 16', 'Base 8'], correct: 0, explanation: 'Le binaire utilise seulement 0 et 1.' },
      { question: 'Que vaut 1010 en binaire?', options: ['8', '10', '12', '14'], correct: 1, explanation: '1010 en binaire = 10 en décimal.' },
      { question: 'Comment débugger un code?', options: ['Deviner', 'Lire les erreurs', 'Abandonner', 'Tout effacer'], correct: 1, explanation: 'Les messages d\'erreur donnent des indices précieux.' },
    ],
  },
};
