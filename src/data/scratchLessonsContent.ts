import { LessonContent } from './lessonContent';

// Scratch Saga - Complete Lesson Content (8 Lessons)
export const scratchLessonsContent: Record<string, LessonContent> = {
  // Lesson 1: Les Blocs de Base
  'scratch-1': {
    lessonId: 'scratch-1',
    videoTitle: 'Découverte de Scratch - Les Blocs de Base',
    videoDuration: '15:00',
    steps: [
      { title: 'L\'interface Scratch', description: 'Scratch a 3 zones principales: la palette de blocs à gauche, la zone de code au centre, et la scène à droite où ton personnage évolue.', hint: 'Explore chaque zone en cliquant dessus' },
      { title: 'Les catégories de blocs', description: 'Les blocs sont organisés par couleur: bleu pour le mouvement, violet pour l\'apparence, rose pour les sons, jaune pour les événements.', hint: 'Chaque couleur = une fonction différente' },
      { title: 'Ton premier sprite', description: 'Le sprite est le personnage que tu vas programmer. Par défaut, c\'est Scratch le chat! Tu peux le changer ou en ajouter d\'autres.', hint: 'Clique sur le bouton sprite en bas à droite' },
      { title: 'Assembler des blocs', description: 'Glisse les blocs dans la zone de code et emboîte-les comme des LEGO. Commence toujours par un bloc événement (jaune).', hint: 'Les blocs s\'aimantent automatiquement' },
    ],
    exerciseChallenge: 'Crée un programme qui fait dire "Bonjour!" au chat quand on clique sur le drapeau vert, puis le fait avancer de 100 pas.',
  },

  // Lesson 2: Mouvement et Animation
  'scratch-2': {
    lessonId: 'scratch-2',
    videoTitle: 'Mouvement et Animation de Sprites',
    videoDuration: '20:00',
    steps: [
      { title: 'Les blocs de mouvement', description: 'Les blocs bleus contrôlent le déplacement: avancer, tourner, aller à une position (x, y), glisser vers un point.', hint: 'x = horizontal, y = vertical' },
      { title: 'Système de coordonnées', description: 'La scène utilise un système de coordonnées. Le centre est (0, 0). x va de -240 à 240, y de -180 à 180.', hint: 'Comme une carte avec latitude et longitude' },
      { title: 'Changer de costume', description: 'Les sprites ont plusieurs costumes. Alterne entre eux pour créer une animation de marche ou de mouvement.', hint: 'Utilise "costume suivant" dans une boucle' },
      { title: 'Boucles d\'animation', description: 'Utilise "répéter" pour faire une action plusieurs fois. Combine avec "attendre" pour contrôler la vitesse.', hint: 'Répéter + attendre = animation fluide' },
    ],
    exerciseChallenge: 'Crée une animation où le chat marche de gauche à droite en changeant de costume, puis revient au point de départ.',
  },

  // Lesson 3: Quiz Scratch 1
  'scratch-3': {
    lessonId: 'scratch-3',
    quizQuestions: [
      { question: 'Quelle couleur représente les blocs de mouvement dans Scratch?', options: ['Violet', 'Bleu', 'Jaune', 'Rose'], correct: 1, explanation: 'Les blocs de mouvement sont bleus et contrôlent le déplacement du sprite.' },
      { question: 'Quel bloc faut-il utiliser pour démarrer un programme?', options: ['Avancer de 10 pas', 'Quand drapeau vert cliqué', 'Dire Bonjour', 'Répéter 10 fois'], correct: 1, explanation: 'Le bloc "Quand drapeau vert cliqué" est un événement qui démarre le programme.' },
      { question: 'Que représente le point (0, 0) sur la scène?', options: ['Le coin supérieur gauche', 'Le centre de la scène', 'Le coin inférieur droit', 'Le bord gauche'], correct: 1, explanation: 'Le point (0, 0) est exactement au centre de la scène Scratch.' },
      { question: 'Comment créer une animation de marche?', options: ['Un seul costume', 'Changer de costume dans une boucle', 'Utiliser uniquement avancer', 'Supprimer le sprite'], correct: 1, explanation: 'En alternant entre plusieurs costumes dans une boucle, on crée l\'illusion du mouvement.' },
      { question: 'Que fait le bloc "attendre 1 seconde"?', options: ['Arrête le programme', 'Pause l\'exécution pendant 1 seconde', 'Accélère le programme', 'Supprime le sprite'], correct: 1, explanation: 'Ce bloc met en pause l\'exécution pendant le temps spécifié.' },
    ],
  },

  // Lesson 4: Sons et Effets
  'scratch-4': {
    lessonId: 'scratch-4',
    videoTitle: 'Sons et Effets Spéciaux',
    videoDuration: '18:00',
    steps: [
      { title: 'Ajouter des sons', description: 'Scratch a une bibliothèque de sons. Tu peux aussi enregistrer les tiens ou importer des fichiers audio.', hint: 'Onglet Sons en haut' },
      { title: 'Jouer un son', description: 'Utilise "jouer le son" pour lancer un son. "jouer le son jusqu\'au bout" attend que le son finisse avant de continuer.', hint: 'Différence importante pour la synchronisation' },
      { title: 'Effets visuels', description: 'Les blocs d\'apparence permettent des effets: changer la couleur, la taille, la transparence, ajouter des effets graphiques.', hint: 'Bloc "ajouter effet"' },
      { title: 'Synchronisation son/image', description: 'Combine sons et effets visuels pour créer des animations immersives. Le timing est crucial!', hint: 'Utilise "attendre" pour synchroniser' },
    ],
    exerciseChallenge: 'Crée une animation où le chat joue de la musique: il grandit quand la note est haute, rétrécit quand elle est basse, et change de couleur au rythme.',
  },

  // Lesson 5: Conditions et Boucles
  'scratch-5': {
    lessonId: 'scratch-5',
    videoTitle: 'Conditions et Boucles - La Logique',
    videoDuration: '25:00',
    steps: [
      { title: 'Les conditions if/else', description: 'Le bloc "si...alors" exécute du code seulement si une condition est vraie. "si...alors...sinon" ajoute une alternative.', hint: 'Comme un aiguillage de train' },
      { title: 'Les opérateurs de comparaison', description: 'Compare des valeurs avec <, >, =. Combine avec "et", "ou", "non" pour des conditions complexes.', hint: 'Blocs verts hexagonaux' },
      { title: 'Boucle "répéter"', description: 'Répète un nombre fixe de fois. Parfait quand tu sais combien de répétitions tu veux.', hint: 'Répéter 10 fois = 10 exécutions' },
      { title: 'Boucle "répéter indéfiniment"', description: 'Continue sans fin jusqu\'à ce que le programme s\'arrête. Idéal pour les jeux.', hint: 'Boucle infinie' },
      { title: 'Boucle "répéter jusqu\'à"', description: 'Continue jusqu\'à ce qu\'une condition devienne vraie. Combine boucle et condition.', hint: 'S\'arrête quand la condition est vraie' },
    ],
    exerciseChallenge: 'Crée un jeu où le chat suit la souris. S\'il touche le bord, il dit "Aïe!" et rebondit. S\'il touche un autre sprite, il gagne des points.',
  },

  // Lesson 6: Variables et Scores
  'scratch-6': {
    lessonId: 'scratch-6',
    videoTitle: 'Variables et Système de Score',
    videoDuration: '22:00',
    steps: [
      { title: 'Créer une variable', description: 'Une variable stocke une valeur (nombre ou texte). Crée-la dans la catégorie orange "Variables".', hint: 'Donne-lui un nom descriptif' },
      { title: 'Modifier une variable', description: 'Utilise "mettre à" pour définir une valeur, "ajouter à" pour l\'augmenter, "soustraire" pour la diminuer.', hint: 'Score = Score + 1' },
      { title: 'Afficher le score', description: 'Coche la case à côté de la variable pour l\'afficher sur la scène. Tu peux la déplacer où tu veux.', hint: 'Visible pour le joueur' },
      { title: 'Utiliser les variables dans les conditions', description: 'Compare la variable dans un "si": si score > 10, alors niveau suivant!', hint: 'Variables dans les conditions' },
    ],
    exerciseChallenge: 'Crée un jeu de collecte: le joueur contrôle un sprite avec les flèches, collecte des étoiles (+10 points), évite les obstacles (-5 points). Affiche le score et un message quand il atteint 100 points.',
  },

  // Lesson 7: Quiz Scratch 2
  'scratch-7': {
    lessonId: 'scratch-7',
    quizQuestions: [
      { question: 'Que fait le bloc "si...alors...sinon"?', options: ['Répète une action', 'Exécute du code selon une condition', 'Joue un son', 'Déplace le sprite'], correct: 1, explanation: 'Ce bloc exécute un code si la condition est vraie, un autre code sinon.' },
      { question: 'Comment créer un score dans Scratch?', options: ['Avec un bloc son', 'En créant une variable', 'Avec un costume', 'Impossible'], correct: 1, explanation: 'Les variables permettent de stocker et afficher des valeurs comme le score.' },
      { question: 'Quelle boucle s\'arrête quand une condition devient vraie?', options: ['Répéter 10 fois', 'Répéter indéfiniment', 'Répéter jusqu\'à', 'Aucune'], correct: 2, explanation: 'La boucle "répéter jusqu\'à" continue jusqu\'à ce que la condition soit vraie.' },
      { question: 'Comment détecter si deux sprites se touchent?', options: ['Bloc "touche le bord"', 'Bloc "touche [sprite]"', 'Bloc "avancer"', 'Impossible'], correct: 1, explanation: 'Le bloc "touche [sprite]" détecte les collisions entre sprites.' },
      { question: 'Que signifie "ajouter 1 à score"?', options: ['Remplace le score par 1', 'Augmente le score de 1', 'Multiplie par 1', 'Divise par 1'], correct: 1, explanation: 'Ce bloc ajoute 1 à la valeur actuelle de la variable score.' },
    ],
  },

  // Lesson 8: Projet Final
  'scratch-8': {
    lessonId: 'scratch-8',
    videoTitle: 'Projet Final - Crée Ton Premier Jeu Complet',
    videoDuration: '30:00',
    steps: [
      { title: 'Conception du jeu', description: 'Avant de coder, planifie: quel type de jeu? Quels sprites? Quelles règles? Quel objectif?', hint: 'Dessine ton idée sur papier' },
      { title: 'Créer les sprites', description: 'Dessine ou importe tes personnages. Chaque sprite aura son propre code.', hint: 'Garde les sprites simples au début' },
      { title: 'Programmer les interactions', description: 'Chaque sprite réagit aux événements: touches clavier, clics, collisions avec d\'autres sprites.', hint: 'Teste souvent pendant le développement' },
      { title: 'Ajouter le système de jeu', description: 'Score, vies, niveaux, écran de fin. Utilise des variables et des conditions.', hint: 'Un jeu complet a un début et une fin' },
      { title: 'Polir et tester', description: 'Ajoute sons, effets, et teste ton jeu. Corrige les bugs et améliore l\'expérience.', hint: 'Fais tester par un ami' },
    ],
    exerciseChallenge: 'Crée un jeu complet avec: un personnage contrôlable, des ennemis ou obstacles, un système de score, 3 vies, un écran de game over, et au moins 2 niveaux de difficulté.',
  },
};
