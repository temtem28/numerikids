import { LessonContent } from './lessonContent';

export const pixelKingdomLessons2: Record<string, LessonContent> = {
  'pixel-7': {
    lessonId: 'pixel-7',
    videoTitle: 'Les Portails Glitchés',
    videoDuration: '14:00',
    steps: [
      { title: 'Les conditions if/elif/else', description: 'Les portails s\'ouvrent selon des conditions. Utilise if, elif et else pour choisir le bon portail.', hint: 'elif = "sinon si"' },
      { title: 'Opérateurs de comparaison', description: 'Utilise >, <, ==, != pour comparer des valeurs.', hint: '== teste l\'égalité' },
      { title: 'Logique booléenne', description: 'Combine des conditions avec and, or, not.', hint: 'and = les deux doivent être vrais' },
    ],
    exerciseChallenge: 'Crée un système de portails qui s\'ouvrent selon l\'énergie du joueur.',
    starterCode: '# Énergie du joueur\nenergie = 75\n\n# Ton code de portails ici\nif energie >= 100:\n    print("Portail doré")\n',
  },
  'pixel-8': {
    lessonId: 'pixel-8',
    videoTitle: 'La Boucle Infinie',
    videoDuration: '16:00',
    steps: [
      { title: 'Boucles while', description: 'Une boucle while répète tant qu\'une condition est vraie.', hint: 'Attention aux boucles infinies!' },
      { title: 'Break et Continue', description: 'break sort de la boucle, continue passe à l\'itération suivante.', hint: 'Utilise break pour sortir' },
    ],
    exerciseChallenge: 'Échappe de la boucle infinie en trouvant la sortie.',
    starterCode: '# Trouve la sortie!\nposition = 0\nwhile True:\n    # Ton code ici\n    position += 1\n',
  },
  'pixel-9': {
    lessonId: 'pixel-9',

    quizQuestions: [
      { question: 'Que fait une boucle while?', options: ['Répète une fois', 'Répète tant que vrai', 'Ne répète jamais', 'Répète 10 fois'], correct: 1, explanation: 'while répète tant que la condition est vraie.' },
      { question: 'Quel mot-clé sort d\'une boucle?', options: ['stop', 'break', 'exit', 'end'], correct: 1, explanation: 'break permet de sortir d\'une boucle.' },
      { question: 'Que signifie elif?', options: ['Erreur', 'Sinon si', 'Fin', 'Boucle'], correct: 1, explanation: 'elif est la contraction de "else if" (sinon si).' },
    ],
  },
  'pixel-10': {
    lessonId: 'pixel-10',
    videoTitle: 'La Récursion Mystique',
    videoDuration: '18:00',
    steps: [
      { title: 'Qu\'est-ce que la récursion?', description: 'Une fonction qui s\'appelle elle-même. Comme un miroir dans un miroir!', hint: 'Attention à la condition d\'arrêt' },
      { title: 'Cas de base', description: 'Toute récursion doit avoir un cas de base pour s\'arrêter.', hint: 'Sinon, récursion infinie!' },
    ],
    exerciseChallenge: 'Crée une fonction récursive pour calculer une factorielle.',
    starterCode: 'def factorielle(n):\n    if n == 0:\n        return 1\n    # Ton code récursif ici\n',
  },
  'pixel-11': {
    lessonId: 'pixel-11',
    videoTitle: 'Les Fonctions Enchantées',
    videoDuration: '17:00',
    exerciseChallenge: 'Crée des fonctions magiques avec paramètres et return.',
    starterCode: 'def lancer_sort(type_sort, puissance):\n    # Ton code ici\n    return\n',
  },
  'pixel-12': {
    lessonId: 'pixel-12',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'une fonction?', options: ['Un sort', 'Un bloc de code réutilisable', 'Une erreur', 'Une boucle'], correct: 1, explanation: 'Une fonction est un bloc de code qu\'on peut réutiliser.' },
      { question: 'Que fait return?', options: ['Arrête le programme', 'Renvoie une valeur', 'Crée une erreur', 'Rien'], correct: 1, explanation: 'return renvoie une valeur depuis la fonction.' },
    ],
  },
  'pixel-13': {
    lessonId: 'pixel-13',
    videoTitle: 'L\'Algorithme Royal',
    videoDuration: '20:00',
    exerciseChallenge: 'Implémente un algorithme de tri pour organiser les données royales.',
    starterCode: 'def tri_royal(liste):\n    # Algorithme de tri ici\n    return liste\n',
  },
  'pixel-14': {
    lessonId: 'pixel-14',
    videoTitle: 'Le Défi des Classes',
    videoDuration: '22:00',
    exerciseChallenge: 'Crée une classe Héros avec attributs et méthodes.',
    starterCode: 'class Heros:\n    def __init__(self, nom, vie):\n        # Ton code ici\n        pass\n',
  },
  'pixel-15': {
    lessonId: 'pixel-15',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'une classe?', options: ['Un modèle d\'objet', 'Une fonction', 'Une variable', 'Une boucle'], correct: 0, explanation: 'Une classe est un modèle pour créer des objets.' },
      { question: 'Quel algorithme est le plus rapide?', options: ['Bubble sort', 'Quick sort', 'Selection sort', 'Tous pareils'], correct: 1, explanation: 'Quick sort est généralement le plus rapide.' },
      { question: 'À quoi sert __init__?', options: ['Détruire', 'Initialiser', 'Copier', 'Rien'], correct: 1, explanation: '__init__ initialise un nouvel objet.' },
    ],
  },
};
