import { LessonContent } from './lessonContent';

// AI Saga - Complete Lesson Content (8 Lessons)
export const aiLessonsContent: Record<string, LessonContent> = {
  // Lesson 1: Qu'est-ce que l'IA?
  'ai-1': {
    lessonId: 'ai-1',
    quizQuestions: [
      { question: 'Qu\'est-ce que l\'Intelligence Artificielle?', options: ['Un robot humanoïde', 'Des programmes qui simulent l\'intelligence', 'Un super ordinateur', 'Un jeu vidéo'], correct: 1, explanation: 'L\'IA désigne des programmes capables d\'apprendre et de prendre des décisions comme un humain.' },
      { question: 'Quel est un exemple d\'IA dans la vie quotidienne?', options: ['Une calculatrice', 'Un assistant vocal (Siri, Alexa)', 'Une ampoule', 'Un livre'], correct: 1, explanation: 'Les assistants vocaux utilisent l\'IA pour comprendre et répondre à nos questions.' },
      { question: 'L\'IA peut-elle apprendre?', options: ['Non, elle suit des règles fixes', 'Oui, grâce au Machine Learning', 'Seulement si on la programme', 'Elle est déjà parfaite'], correct: 1, explanation: 'Le Machine Learning permet à l\'IA d\'apprendre à partir de données.' },
      { question: 'Qui a inventé le terme "Intelligence Artificielle"?', options: ['Albert Einstein', 'John McCarthy en 1956', 'Steve Jobs', 'Elon Musk'], correct: 1, explanation: 'John McCarthy a inventé le terme lors de la conférence de Dartmouth en 1956.' },
      { question: 'L\'IA peut-elle être créative?', options: ['Non, jamais', 'Oui, elle peut créer de l\'art et de la musique', 'Seulement pour les maths', 'Elle copie seulement'], correct: 1, explanation: 'L\'IA générative peut créer des images, de la musique, et du texte original.' },
    ],
  },

  // Lesson 2: Machine Learning Basics
  'ai-2': {
    lessonId: 'ai-2',
    videoTitle: 'Machine Learning - Comment les Machines Apprennent',
    videoDuration: '25:00',
    steps: [
      { title: 'Apprentissage supervisé', description: 'On donne des exemples étiquetés à la machine: "ceci est un chat", "ceci est un chien". Elle apprend à reconnaître les patterns.', hint: 'Comme apprendre avec un professeur' },
      { title: 'Apprentissage non supervisé', description: 'La machine trouve elle-même des patterns dans les données sans étiquettes. Elle regroupe les données similaires.', hint: 'Comme trier des LEGO par couleur sans instructions' },
      { title: 'Données d\'entraînement', description: 'Plus on a de données de qualité, mieux l\'IA apprend. Les données biaisées créent une IA biaisée!', hint: 'Garbage in, garbage out' },
      { title: 'Modèle et prédiction', description: 'Le modèle est le "cerveau" entraîné. Il prend de nouvelles données et fait des prédictions.', hint: 'Entraînement → Modèle → Prédiction' },
    ],
    exerciseChallenge: 'Simule un classificateur simple: crée un programme qui prédit si un animal est un chat ou un chien selon ses caractéristiques (taille, aboie/miaule).',
    starterCode: `# Classificateur Chat vs Chien
def classifier_animal(taille, fait_miaou, fait_ouaf):
    """
    taille: 'petit', 'moyen', 'grand'
    fait_miaou: True/False
    fait_ouaf: True/False
    """
    # Règles de classification
    if fait_miaou and not fait_ouaf:
        return "Chat"
    elif fait_ouaf and not fait_miaou:
        return "Chien"
    else:
        return "Inconnu"

# Tests
print(classifier_animal("petit", True, False))  # Chat
print(classifier_animal("grand", False, True))  # Chien`,
    hints: ['Commence par les cas évidents', 'Ajoute la taille comme critère supplémentaire', 'Gère les cas ambigus'],
  },

  // Lesson 3: Reconnaissance d'Images
  'ai-3': {
    lessonId: 'ai-3',
    videoTitle: 'Vision par Ordinateur - Voir comme une Machine',
    videoDuration: '30:00',
    steps: [
      { title: 'Comment l\'IA voit les images', description: 'Une image est une grille de pixels. Chaque pixel a des valeurs RGB (Rouge, Vert, Bleu) de 0 à 255.', hint: 'Image = tableau de nombres' },
      { title: 'Détection de contours', description: 'L\'IA détecte les changements brusques de couleur pour trouver les bords des objets.', hint: 'Comme colorier les contours' },
      { title: 'Réseaux de neurones convolutifs', description: 'Les CNN analysent l\'image par petites zones, détectent des patterns de plus en plus complexes.', hint: 'Couche par couche, du simple au complexe' },
      { title: 'Applications pratiques', description: 'Reconnaissance faciale, voitures autonomes, diagnostic médical, filtres photo...', hint: 'L\'IA voit partout!' },
    ],
    exerciseChallenge: 'Crée un programme qui analyse une "image" simplifiée (grille de caractères) et détecte si elle contient une forme carrée ou ronde.',
    starterCode: `# Image simplifiée (grille de caractères)
image_carre = [
    ".....",
    ".###.",
    ".###.",
    ".###.",
    ".....",
]

image_rond = [
    "..O..",
    ".O.O.",
    "O...O",
    ".O.O.",
    "..O..",
]

def detecter_forme(image):
    """Analyse l'image et retourne 'carré', 'rond' ou 'inconnu'"""
    # Compte les caractères
    nb_diese = sum(ligne.count('#') for ligne in image)
    nb_o = sum(ligne.count('O') for ligne in image)
    
    if nb_diese > 0:
        return "carré"
    elif nb_o > 0:
        return "rond"
    return "inconnu"

print(detecter_forme(image_carre))
print(detecter_forme(image_rond))`,
    hints: ['Analyse les patterns de caractères', 'Un carré a des lignes droites (#)', 'Un rond a des courbes (O)'],
  },

  // Lesson 4: Quiz IA 1
  'ai-4': {
    lessonId: 'ai-4',
    quizQuestions: [
      { question: 'Qu\'est-ce que l\'apprentissage supervisé?', options: ['Apprendre sans données', 'Apprendre avec des exemples étiquetés', 'Apprendre tout seul', 'Ne pas apprendre'], correct: 1, explanation: 'L\'apprentissage supervisé utilise des données avec des réponses connues pour entraîner le modèle.' },
      { question: 'Comment une IA voit-elle une image?', options: ['Comme un humain', 'Comme une grille de nombres', 'Elle ne peut pas voir', 'Comme du texte'], correct: 1, explanation: 'Pour l\'IA, une image est une matrice de valeurs numériques (pixels).' },
      { question: 'Qu\'est-ce qu\'un CNN?', options: ['Un réseau social', 'Un réseau de neurones pour les images', 'Un type de données', 'Un langage de programmation'], correct: 1, explanation: 'CNN (Convolutional Neural Network) est spécialisé dans l\'analyse d\'images.' },
      { question: 'Pourquoi les données sont-elles importantes pour l\'IA?', options: ['Elles ne sont pas importantes', 'L\'IA apprend à partir des données', 'Pour décorer', 'Pour ralentir l\'IA'], correct: 1, explanation: 'La qualité et la quantité des données déterminent la qualité de l\'apprentissage.' },
      { question: 'L\'IA peut-elle reconnaître des visages?', options: ['Non, impossible', 'Oui, grâce à la vision par ordinateur', 'Seulement les robots', 'Seulement en noir et blanc'], correct: 1, explanation: 'La reconnaissance faciale est une application courante de la vision par ordinateur.' },
    ],
  },

  // Lesson 5: Chatbots et NLP
  'ai-5': {
    lessonId: 'ai-5',
    videoTitle: 'Traitement du Langage Naturel - Comprendre les Mots',
    videoDuration: '28:00',
    steps: [
      { title: 'Qu\'est-ce que le NLP?', description: 'Natural Language Processing permet à l\'IA de comprendre, interpréter et générer du langage humain.', hint: 'Parler avec les machines' },
      { title: 'Tokenisation', description: 'Découper le texte en mots ou sous-mots. "Bonjour le monde" → ["Bonjour", "le", "monde"]', hint: 'Première étape du traitement' },
      { title: 'Analyse de sentiment', description: 'Déterminer si un texte est positif, négatif ou neutre. Utile pour les avis clients!', hint: 'Mots-clés positifs vs négatifs' },
      { title: 'Génération de texte', description: 'L\'IA peut écrire du texte cohérent en prédisant le mot suivant le plus probable.', hint: 'GPT, Claude, etc.' },
    ],
    exerciseChallenge: 'Crée un chatbot simple qui répond à des questions basiques sur la météo, l\'heure, et dit bonjour.',
    starterCode: `def chatbot(message):
    """Un chatbot simple qui répond à des messages"""
    message = message.lower()  # Convertir en minuscules
    
    # Salutations
    if "bonjour" in message or "salut" in message:
        return "Bonjour! Comment puis-je t'aider?"
    
    # Météo
    elif "météo" in message or "temps" in message:
        return "Il fait beau aujourd'hui! ☀️"
    
    # Heure
    elif "heure" in message:
        return "Il est l'heure d'apprendre le code!"
    
    # Aide
    elif "aide" in message:
        return "Je peux parler de météo, donner l'heure, ou simplement discuter!"
    
    # Réponse par défaut
    else:
        return "Je ne comprends pas. Peux-tu reformuler?"

# Test du chatbot
print(chatbot("Bonjour!"))
print(chatbot("Quelle heure est-il?"))
print(chatbot("Comment est la météo?"))`,
    hints: ['Utilise .lower() pour ignorer la casse', 'Cherche des mots-clés dans le message', 'Ajoute plus de réponses possibles'],
  },

  // Lesson 6: Réseaux de Neurones
  'ai-6': {
    lessonId: 'ai-6',
    videoTitle: 'Réseaux de Neurones - Le Cerveau de l\'IA',
    videoDuration: '32:00',
    steps: [
      { title: 'Neurone artificiel', description: 'Un neurone prend des entrées, les multiplie par des poids, ajoute un biais, et applique une fonction d\'activation.', hint: 'Inspiré du cerveau humain' },
      { title: 'Couches du réseau', description: 'Couche d\'entrée → Couches cachées → Couche de sortie. Plus de couches = réseau plus profond (Deep Learning).', hint: 'Chaque couche transforme les données' },
      { title: 'Entraînement', description: 'Le réseau ajuste ses poids pour minimiser l\'erreur. C\'est la rétropropagation.', hint: 'Apprendre de ses erreurs' },
      { title: 'Fonction d\'activation', description: 'ReLU, Sigmoid, Tanh... Ces fonctions ajoutent de la non-linéarité pour apprendre des patterns complexes.', hint: 'Sans activation = juste des multiplications' },
    ],
    exerciseChallenge: 'Simule un neurone simple qui prend 2 entrées et décide si un étudiant réussit (note >= 10 ET présence >= 80%).',
    starterCode: `def neurone_reussite(note, presence):
    """
    Simule un neurone qui prédit la réussite
    note: 0-20
    presence: 0-100 (pourcentage)
    """
    # Poids (importance de chaque facteur)
    poids_note = 0.6
    poids_presence = 0.4
    
    # Normalisation (ramener entre 0 et 1)
    note_norm = note / 20
    presence_norm = presence / 100
    
    # Calcul pondéré
    score = (note_norm * poids_note) + (presence_norm * poids_presence)
    
    # Fonction d'activation (seuil)
    if score >= 0.5:
        return "Réussite probable"
    else:
        return "Échec probable"

# Tests
print(neurone_reussite(15, 90))  # Bon élève
print(neurone_reussite(8, 50))   # Élève en difficulté
print(neurone_reussite(12, 85))  # Cas limite`,
    hints: ['Normalise les valeurs entre 0 et 1', 'Les poids déterminent l\'importance', 'Le seuil décide de la sortie'],
  },

  // Lesson 7: Quiz IA 2
  'ai-7': {
    lessonId: 'ai-7',
    quizQuestions: [
      { question: 'Que signifie NLP?', options: ['New Learning Process', 'Natural Language Processing', 'Neural Logic Programming', 'Network Layer Protocol'], correct: 1, explanation: 'NLP = Natural Language Processing, le traitement du langage naturel.' },
      { question: 'Qu\'est-ce qu\'un neurone artificiel?', options: ['Une cellule du cerveau', 'Une unité de calcul dans un réseau', 'Un type de données', 'Un robot'], correct: 1, explanation: 'Un neurone artificiel est l\'unité de base d\'un réseau de neurones.' },
      { question: 'Que fait la tokenisation?', options: ['Chiffre le texte', 'Découpe le texte en morceaux', 'Traduit le texte', 'Supprime le texte'], correct: 1, explanation: 'La tokenisation divise le texte en tokens (mots, sous-mots, caractères).' },
      { question: 'Qu\'est-ce que le Deep Learning?', options: ['Apprendre en profondeur', 'Réseaux de neurones à plusieurs couches', 'Apprendre lentement', 'Apprendre sous l\'eau'], correct: 1, explanation: 'Le Deep Learning utilise des réseaux de neurones profonds (nombreuses couches).' },
      { question: 'Comment un chatbot comprend-il les questions?', options: ['Par magie', 'En analysant les mots-clés et le contexte', 'Il ne comprend pas vraiment', 'Avec des caméras'], correct: 1, explanation: 'Les chatbots utilisent le NLP pour analyser et comprendre le texte.' },
    ],
  },

  // Lesson 8: Projet IA Final
  'ai-8': {
    lessonId: 'ai-8',
    videoTitle: 'Projet IA Final - Crée Ton Propre Modèle',
    videoDuration: '40:00',
    steps: [
      { title: 'Définir le problème', description: 'Quel problème veux-tu résoudre? Classification, prédiction, génération?', hint: 'Commence simple' },
      { title: 'Collecter les données', description: 'Rassemble des exemples pour entraîner ton modèle. Plus c\'est varié, mieux c\'est.', hint: 'Qualité > Quantité' },
      { title: 'Créer le modèle', description: 'Définis les règles ou le réseau de neurones qui fera les prédictions.', hint: 'Commence par des règles simples' },
      { title: 'Entraîner et tester', description: 'Entraîne sur une partie des données, teste sur le reste. Mesure la précision.', hint: '80% entraînement, 20% test' },
      { title: 'Améliorer', description: 'Analyse les erreurs, ajuste les paramètres, ajoute des données.', hint: 'Itération continue' },
    ],
    exerciseChallenge: 'Crée un classificateur de spam: analyse un message et détermine s\'il est spam ou non, basé sur des mots-clés suspects.',
    starterCode: `# Classificateur de Spam
mots_spam = ["gratuit", "gagnez", "urgent", "cliquez", "offre", "promo", "million", "félicitations"]
mots_legitimes = ["bonjour", "merci", "cordialement", "réunion", "projet", "équipe"]

def detecter_spam(message):
    """Analyse un message et retourne 'spam' ou 'légitime'"""
    message = message.lower()
    
    score_spam = 0
    score_legitime = 0
    
    # Compte les mots suspects
    for mot in mots_spam:
        if mot in message:
            score_spam += 1
    
    # Compte les mots légitimes
    for mot in mots_legitimes:
        if mot in message:
            score_legitime += 1
    
    # Décision
    if score_spam > score_legitime:
        return f"SPAM (score: {score_spam} vs {score_legitime})"
    else:
        return f"Légitime (score: {score_legitime} vs {score_spam})"

# Tests
print(detecter_spam("URGENT! Gagnez 1 million GRATUIT! Cliquez ici!"))
print(detecter_spam("Bonjour, merci pour la réunion d'hier. Cordialement."))
print(detecter_spam("Offre spéciale: réunion gratuite avec l'équipe!"))`,
    hints: ['Ajoute plus de mots-clés', 'Considère la longueur du message', 'Ajoute des poids différents selon les mots'],
  },
};
