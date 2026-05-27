export const sagaLessonsData = {
  scratch: {
    title: "Saga Scratch - Aventure Visuelle",
    backgroundImage: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763342398107_10dca743.webp",
    lessons: [
      { id: 1, title: "Les Blocs de Base", description: "Découvre les blocs fondamentaux de Scratch", type: "scratch" as const, duration: "15 min", xp: 100, position: { x: 15, y: 20 } },
      { id: 2, title: "Mouvement et Animation", description: "Fais bouger ton sprite", type: "scratch" as const, duration: "20 min", xp: 150, position: { x: 30, y: 35 } },
      { id: 3, title: "Quiz Scratch 1", description: "Teste tes connaissances", type: "quiz" as const, duration: "10 min", xp: 100, position: { x: 45, y: 25 } },
      { id: 4, title: "Sons et Effets", description: "Ajoute du son à tes projets", type: "scratch" as const, duration: "18 min", xp: 150, position: { x: 55, y: 45 } },
      { id: 5, title: "Conditions et Boucles", description: "Apprends la logique de programmation", type: "scratch" as const, duration: "25 min", xp: 200, position: { x: 65, y: 30 } },
      { id: 6, title: "Variables et Scores", description: "Crée un système de points", type: "scratch" as const, duration: "22 min", xp: 200, position: { x: 75, y: 50 } },
      { id: 7, title: "Quiz Scratch 2", description: "Valide tes compétences", type: "quiz" as const, duration: "10 min", xp: 150, position: { x: 85, y: 35 } },
      { id: 8, title: "Projet Final", description: "Crée ton premier jeu complet", type: "scratch" as const, duration: "30 min", xp: 300, position: { x: 92, y: 55 } },
    ]
  },
  python: {
    title: "Saga Python - Code Mystique",
    backgroundImage: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763342399196_11dfa45e.webp",
    lessons: [
      { id: 1, title: "Variables et Types", description: "Les bases de Python", type: "python" as const, duration: "20 min", xp: 100, position: { x: 12, y: 25 } },
      { id: 2, title: "Opérations Mathématiques", description: "Calculs et expressions", type: "python" as const, duration: "18 min", xp: 150, position: { x: 25, y: 40 } },
      { id: 3, title: "Quiz Python 1", description: "Vérifie tes bases", type: "quiz" as const, duration: "10 min", xp: 100, position: { x: 38, y: 28 } },
      { id: 4, title: "Conditions if/else", description: "Prends des décisions", type: "python" as const, duration: "22 min", xp: 200, position: { x: 50, y: 45 } },
      { id: 5, title: "Boucles for et while", description: "Répète des actions", type: "python" as const, duration: "25 min", xp: 200, position: { x: 62, y: 32 } },
      { id: 6, title: "Listes et Dictionnaires", description: "Organise tes données", type: "python" as const, duration: "28 min", xp: 250, position: { x: 72, y: 50 } },
      { id: 7, title: "Quiz Python 2", description: "Maîtrise confirmée", type: "quiz" as const, duration: "12 min", xp: 150, position: { x: 82, y: 38 } },
      { id: 8, title: "Mini-Projet Python", description: "Application complète", type: "python" as const, duration: "35 min", xp: 350, position: { x: 90, y: 58 } },
    ]
  },
  ai: {
    title: "Saga IA - Intelligence Artificielle",
    backgroundImage: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763342400267_8535be30.webp",
    lessons: [
      { id: 1, title: "Qu'est-ce que l'IA?", description: "Introduction à l'intelligence artificielle", type: "quiz" as const, duration: "15 min", xp: 100, position: { x: 18, y: 22 } },
      { id: 2, title: "Machine Learning Basics", description: "Comment les machines apprennent", type: "python" as const, duration: "25 min", xp: 200, position: { x: 28, y: 38 } },
      { id: 3, title: "Reconnaissance d'Images", description: "IA et vision par ordinateur", type: "python" as const, duration: "30 min", xp: 250, position: { x: 42, y: 30 } },
      { id: 4, title: "Quiz IA 1", description: "Teste tes connaissances", type: "quiz" as const, duration: "10 min", xp: 150, position: { x: 52, y: 48 } },
      { id: 5, title: "Chatbots et NLP", description: "Traitement du langage naturel", type: "python" as const, duration: "28 min", xp: 250, position: { x: 65, y: 35 } },
      { id: 6, title: "Réseaux de Neurones", description: "Le cerveau de l'IA", type: "python" as const, duration: "32 min", xp: 300, position: { x: 75, y: 52 } },
      { id: 7, title: "Quiz IA 2", description: "Validation des compétences", type: "quiz" as const, duration: "12 min", xp: 200, position: { x: 85, y: 40 } },
      { id: 8, title: "Projet IA Final", description: "Crée ton propre modèle IA", type: "python" as const, duration: "40 min", xp: 400, position: { x: 92, y: 60 } },
    ]
  },
  novaville: {
    title: "Nova-Ville - Cité Numérique Durable",
    backgroundImage: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763347948594_42b904a9.webp",
    lessons: [
      { id: 1, title: "Fondations Numériques", description: "Logique de base : tracé des routes et réseaux", type: "scratch" as const, duration: "20 min", xp: 150, position: { x: 15, y: 25 } },
      { id: 2, title: "L'Énergie Intelligente", description: "Systèmes de données : optimise la consommation électrique", type: "python" as const, duration: "25 min", xp: 200, position: { x: 28, y: 40 } },
      { id: 3, title: "Le Quartier Connecté", description: "UI/UX : prototype l'application mobile des citoyens", type: "scratch" as const, duration: "22 min", xp: 200, position: { x: 42, y: 30 } },
      { id: 4, title: "Sécurité Urbaine", description: "Cyber-résilience : autorisations d'accès aux services", type: "python" as const, duration: "28 min", xp: 250, position: { x: 54, y: 48 } },
      { id: 5, title: "Le Transport Autonome", description: "Algorithmes : règles de conduite pour véhicules autonomes", type: "python" as const, duration: "30 min", xp: 300, position: { x: 66, y: 35 } },
      { id: 6, title: "La Bibliothèque du Savoir", description: "Bases de données : classe les informations de la ville", type: "python" as const, duration: "26 min", xp: 250, position: { x: 76, y: 52 } },
      { id: 7, title: "Le Réseau Mondial", description: "Internet et protocoles : connecte Nova-Ville au monde", type: "python" as const, duration: "24 min", xp: 250, position: { x: 85, y: 38 } },
      { id: 8, title: "Inauguration et Mise à Jour", description: "Déploiement : lance la version bêta et corrige les bugs", type: "quiz" as const, duration: "35 min", xp: 400, position: { x: 92, y: 58 } },
    ]
  },
  digitalart: {
    title: "Les Maîtres de l'Art Numérique",
    backgroundImage: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763509349328_149425d0.webp",
    lessons: [
      { id: 1, title: "Les 3 Couleurs Primaires", description: "RVB, CMJN et harmonies colorées", type: "scratch" as const, duration: "20 min", xp: 150, position: { x: 15, y: 25 } },
      { id: 2, title: "La Composition Magique", description: "Règle des tiers et cadrage parfait", type: "scratch" as const, duration: "22 min", xp: 200, position: { x: 28, y: 40 } },
      { id: 3, title: "Le Sculpteur de Formes", description: "Design vectoriel et logos", type: "scratch" as const, duration: "24 min", xp: 200, position: { x: 42, y: 30 } },
      { id: 4, title: "L'Ombre et la Profondeur", description: "Retouche photo et calques", type: "scratch" as const, duration: "26 min", xp: 250, position: { x: 54, y: 48 } },
      { id: 5, title: "L'Illusion du Mouvement", description: "Animation et création de GIF", type: "scratch" as const, duration: "28 min", xp: 300, position: { x: 66, y: 35 } },
      { id: 6, title: "Le Maître du Montage", description: "Montage vidéo et narration", type: "scratch" as const, duration: "30 min", xp: 300, position: { x: 76, y: 52 } },
      { id: 7, title: "Le Musée Interactif", description: "Design web et galerie virtuelle", type: "scratch" as const, duration: "28 min", xp: 300, position: { x: 85, y: 38 } },
      { id: 8, title: "Le Gala d'Illumination", description: "Optimisation et publication", type: "quiz" as const, duration: "25 min", xp: 400, position: { x: 92, y: 58 } },
    ]
  },
  'pixel-kingdom': {
    title: "Le Royaume des Pixels",
    backgroundImage: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763342401255_61eca8f4.webp",
    lessons: [
      // Chapter 1: La Forêt des Pixels (7-8 ans)
      { id: 1, title: "L'Éveil du Pixel", description: "Premiers pas dans le monde des pixels", type: "scratch" as const, duration: "12 min", xp: 100, position: { x: 8, y: 15 }, chapter: 1, isBoss: false },
      { id: 2, title: "Le Sort de Couleur", description: "Maîtrise les couleurs RGB", type: "scratch" as const, duration: "14 min", xp: 120, position: { x: 16, y: 28 }, chapter: 1, isBoss: false },
      { id: 3, title: "Boss: Le Gardien Pixelisé", description: "Affronte le gardien de la forêt", type: "quiz" as const, duration: "10 min", xp: 200, position: { x: 24, y: 18 }, chapter: 1, isBoss: true },
      
      // Chapter 2: Les Montagnes de Bytes (8-9 ans)
      { id: 4, title: "L'Algorithme de l'Escalade", description: "Apprends les algorithmes", type: "python" as const, duration: "16 min", xp: 150, position: { x: 32, y: 35 }, chapter: 2, isBoss: false },
      { id: 5, title: "Le Bouclier Debug", description: "Chasse les bugs", type: "python" as const, duration: "15 min", xp: 180, position: { x: 40, y: 25 }, chapter: 2, isBoss: false },
      { id: 6, title: "Boss: Le Dragon Binaire", description: "Affronte le dragon du binaire", type: "quiz" as const, duration: "12 min", xp: 250, position: { x: 48, y: 40 }, chapter: 2, isBoss: true },
      
      // Chapter 3: Le Serveur de Cristal (9-10 ans)
      { id: 7, title: "Les Portails Glitchés", description: "Maîtrise les conditions", type: "python" as const, duration: "18 min", xp: 200, position: { x: 55, y: 20 }, chapter: 3, isBoss: false },
      { id: 8, title: "La Boucle Infinie", description: "Échappe au piège des boucles", type: "python" as const, duration: "17 min", xp: 220, position: { x: 62, y: 35 }, chapter: 3, isBoss: false },
      { id: 9, title: "Boss: Le Sphinx des Variables", description: "Résous les énigmes du Sphinx", type: "quiz" as const, duration: "14 min", xp: 300, position: { x: 68, y: 22 }, chapter: 3, isBoss: true },
      
      // Chapter 4: La Dimension Glitch (10-11 ans)
      { id: 10, title: "La Récursion Mystique", description: "Découvre la magie de la récursion", type: "python" as const, duration: "20 min", xp: 250, position: { x: 74, y: 42 }, chapter: 4, isBoss: false },
      { id: 11, title: "Les Fonctions Enchantées", description: "Crée des sorts avec les fonctions", type: "python" as const, duration: "19 min", xp: 280, position: { x: 80, y: 28 }, chapter: 4, isBoss: false },
      { id: 12, title: "Boss: Le Sorcier des Exceptions", description: "Affronte le maître des erreurs", type: "quiz" as const, duration: "15 min", xp: 350, position: { x: 86, y: 45 }, chapter: 4, isBoss: true },
      
      // Chapter 5: Le Palais du Roi Pixel (11-12 ans)
      { id: 13, title: "L'Algorithme Royal", description: "Maîtrise les algorithmes de tri", type: "python" as const, duration: "22 min", xp: 300, position: { x: 90, y: 18 }, chapter: 5, isBoss: false },
      { id: 14, title: "Le Défi des Classes", description: "Programmation orientée objet", type: "python" as const, duration: "24 min", xp: 350, position: { x: 94, y: 35 }, chapter: 5, isBoss: false },
      { id: 15, title: "Boss Final: Le Roi Pixel Corrompu", description: "Le combat ultime pour sauver le royaume!", type: "quiz" as const, duration: "20 min", xp: 500, position: { x: 96, y: 55 }, chapter: 5, isBoss: true },
    ]
  }
};
