import { LessonContent } from './lessonContent';

// Nova-Ville Complete Lesson Content - All 8 Quests
export const novaVilleContent: Record<string, LessonContent> = {
  // Quest 1: Fondations Numériques (Scratch - City Planning)
  'nova-1-1': {
    lessonId: 'nova-1-1',
    videoTitle: 'Les Fondations de Nova-Ville',
    videoDuration: '12:00',
    steps: [
      { title: 'Séquences d\'instructions', description: 'Une séquence est une suite d\'actions dans l\'ordre. Pour tracer des routes, chaque étape compte!', hint: 'Comme suivre un plan' },
      { title: 'Boucles pour répéter', description: 'Les boucles répètent des actions. Parfait pour créer plusieurs rues identiques!', hint: 'Utilise "répéter" dans Scratch' },
      { title: 'Tracer la grille', description: 'Crée une grille de rues en utilisant des boucles imbriquées.', hint: 'Boucle dans une boucle' },
    ],
    exerciseChallenge: 'Crée le tracé des routes de Nova-Ville: une grille de 5x5 avec des rues horizontales et verticales.',
  },

  'nova-1-2': {
    lessonId: 'nova-1-2',
    videoTitle: 'Réseaux d\'Infrastructure',
    videoDuration: '10:00',
    steps: [
      { title: 'Planifier les réseaux', description: 'Eau, électricité, internet: chaque réseau suit les routes mais avec sa propre couleur.', hint: 'Utilise des couleurs différentes' },
      { title: 'Optimiser le tracé', description: 'Le chemin le plus court économise des ressources!', hint: 'Évite les détours' },
    ],
    exerciseChallenge: 'Ajoute les réseaux d\'eau (bleu) et d\'électricité (jaune) en suivant les routes.',
  },

  'nova-1-3': {
    lessonId: 'nova-1-3',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'une séquence en programmation?', options: ['Des actions dans l\'ordre', 'Des actions aléatoires', 'Une seule action', 'Des actions simultanées'], correct: 0, explanation: 'Une séquence exécute les instructions dans l\'ordre.' },
      { question: 'Pourquoi utiliser des boucles?', options: ['Pour décorer', 'Pour répéter des actions', 'Pour arrêter le programme', 'Pour effacer'], correct: 1, explanation: 'Les boucles permettent de répéter du code sans le réécrire.' },
      { question: 'Dans une ville, quel réseau est prioritaire?', options: ['Décoration', 'Eau et électricité', 'Publicité', 'Aucun'], correct: 1, explanation: 'L\'eau et l\'électricité sont essentiels pour les habitants.' },
    ],
  },

  // Quest 2: L'Énergie Intelligente (Python - Energy Optimization)
  'nova-2-1': {
    lessonId: 'nova-2-1',
    videoTitle: 'Systèmes Énergétiques Intelligents',
    videoDuration: '15:00',
    steps: [
      { title: 'Variables pour capteurs', description: 'Les variables stockent les données: température, consommation, production solaire.', hint: 'Une variable par donnée' },
      { title: 'Conditions d\'optimisation', description: 'if/else pour décider: si consommation > production, réduire l\'éclairage.', hint: 'Compare avec >, <, ==' },
      { title: 'Algorithme intelligent', description: 'Équilibre automatiquement production et consommation.', hint: 'Priorise l\'essentiel' },
    ],
    exerciseChallenge: 'Crée un système qui optimise la consommation selon l\'heure et la production solaire.',
    starterCode: `# Capteurs de Nova-Ville
production_solaire = 80
consommation = 100
heure = 14

# Ton algorithme d'optimisation
if production_solaire < consommation:
    # Réduis la consommation
    pass
`,
    hints: ['Si production < consommation, réduis l\'éclairage', 'La nuit (heure > 20), production = 0', 'Priorise hôpitaux et écoles'],
  },

  'nova-2-2': {
    lessonId: 'nova-2-2',
    videoTitle: 'Gestion des Panneaux Solaires',
    videoDuration: '12:00',
    exerciseChallenge: 'Calcule l\'énergie produite par les panneaux selon l\'heure et la météo.',
    starterCode: `# Paramètres
heure = 14
meteo = "ensoleillé"  # ou "nuageux", "pluie"
nb_panneaux = 50

# Calcule la production
production = 0
`,
    hints: ['Production maximale à midi (12h-14h)', 'Météo nuageuse = 50% de production', 'Pluie = 20% de production'],
  },

  'nova-2-3': {
    lessonId: 'nova-2-3',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'un capteur?', options: ['Un appareil qui mesure', 'Un ordinateur', 'Une batterie', 'Un câble'], correct: 0, explanation: 'Un capteur mesure des données physiques (température, lumière, etc.).' },
      { question: 'Comment optimiser la consommation?', options: ['Tout allumer', 'Éteindre l\'essentiel', 'Adapter selon les besoins', 'Rien faire'], correct: 2, explanation: 'L\'optimisation adapte la consommation aux besoins réels.' },
      { question: 'Quand les panneaux solaires produisent le plus?', options: ['La nuit', 'À midi', 'Le matin tôt', 'Toujours pareil'], correct: 1, explanation: 'La production solaire est maximale quand le soleil est au zénith (midi).' },
    ],
  },

  // Quest 3: Le Quartier Connecté (Scratch - UI/UX Design)
  'nova-3-1': {
    lessonId: 'nova-3-1',
    videoTitle: 'Design de l\'Application Citoyenne',
    videoDuration: '14:00',
    steps: [
      { title: 'Interface utilisateur', description: 'L\'interface doit être simple et intuitive. Chaque bouton a une fonction claire.', hint: 'Moins c\'est mieux' },
      { title: 'Navigation entre écrans', description: 'Crée plusieurs arrière-plans pour simuler différents écrans de l\'app.', hint: 'Utilise "changer d\'arrière-plan"' },
      { title: 'Interactions tactiles', description: 'Ajoute des boutons cliquables qui réagissent au toucher.', hint: 'Utilise "quand ce sprite est cliqué"' },
    ],
    exerciseChallenge: 'Crée un prototype d\'application avec 3 écrans: Accueil, Services, Profil.',
  },

  'nova-3-2': {
    lessonId: 'nova-3-2',
    videoTitle: 'Services Citoyens Interactifs',
    videoDuration: '12:00',
    exerciseChallenge: 'Ajoute 5 services cliquables: Transport, Santé, Éducation, Loisirs, Urgences.',
  },

  'nova-3-3': {
    lessonId: 'nova-3-3',
    quizQuestions: [
      { question: 'Qu\'est-ce que l\'UI (Interface Utilisateur)?', options: ['Ce que l\'utilisateur voit', 'Le code', 'La base de données', 'Le serveur'], correct: 0, explanation: 'L\'UI est l\'interface visuelle avec laquelle l\'utilisateur interagit.' },
      { question: 'Qu\'est-ce que l\'UX (Expérience Utilisateur)?', options: ['Les couleurs', 'Comment l\'utilisateur se sent', 'La vitesse', 'Le prix'], correct: 1, explanation: 'L\'UX concerne l\'expérience globale et le ressenti de l\'utilisateur.' },
      { question: 'Pourquoi prototyper une application?', options: ['Pour décorer', 'Pour tester avant de coder', 'Pour perdre du temps', 'Ce n\'est pas utile'], correct: 1, explanation: 'Le prototype permet de tester l\'interface avant le développement complet.' },
    ],
  },

  // Quest 4: Sécurité Urbaine (Python - Access Control)
  'nova-4-1': {
    lessonId: 'nova-4-1',
    videoTitle: 'Système de Contrôle d\'Accès',
    videoDuration: '16:00',
    steps: [
      { title: 'Rôles et permissions', description: 'Chaque citoyen a un rôle: citoyen, agent, admin. Chaque rôle a des permissions différentes.', hint: 'Utilise un dictionnaire' },
      { title: 'Vérification d\'accès', description: 'Avant chaque action, vérifie si l\'utilisateur a la permission.', hint: 'Fonction verifier_permission()' },
      { title: 'Journalisation', description: 'Enregistre toutes les tentatives d\'accès pour la sécurité.', hint: 'Liste des logs' },
    ],
    exerciseChallenge: 'Crée un système qui vérifie les permissions avant d\'autoriser l\'accès aux services.',
    starterCode: `# Système de permissions
roles = {
    "citoyen": ["transport", "sante", "loisirs"],
    "agent": ["transport", "sante", "loisirs", "rapports"],
    "admin": ["transport", "sante", "loisirs", "rapports", "config"]
}

def verifier_acces(role, service):
    # Ton code ici
    pass

# Test
print(verifier_acces("citoyen", "transport"))
`,
    hints: ['Vérifie si service est dans roles[role]', 'Retourne True ou False', 'Gère les rôles inexistants'],
  },

  'nova-4-2': {
    lessonId: 'nova-4-2',
    videoTitle: 'Authentification Sécurisée',
    videoDuration: '14:00',
    exerciseChallenge: 'Crée un système de connexion avec nom d\'utilisateur et mot de passe.',
    starterCode: `# Base de données utilisateurs
utilisateurs = {
    "alice": {"mdp": "secret123", "role": "admin"},
    "bob": {"mdp": "pass456", "role": "citoyen"}
}

def connexion(nom, mdp):
    # Vérifie les identifiants
    pass
`,
    hints: ['Vérifie si nom existe dans utilisateurs', 'Compare le mot de passe', 'Retourne le rôle si succès, None sinon'],
  },

  'nova-4-3': {
    lessonId: 'nova-4-3',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'un rôle utilisateur?', options: ['Un nom', 'Un ensemble de permissions', 'Un mot de passe', 'Une adresse'], correct: 1, explanation: 'Un rôle définit ce qu\'un utilisateur peut faire dans le système.' },
      { question: 'Pourquoi journaliser les accès?', options: ['Pour décorer', 'Pour la sécurité et traçabilité', 'Pour ralentir', 'Ce n\'est pas utile'], correct: 1, explanation: 'Les logs permettent de détecter les tentatives d\'intrusion et de tracer les actions.' },
      { question: 'Qu\'est-ce que l\'authentification?', options: ['Vérifier l\'identité', 'Donner des permissions', 'Créer un compte', 'Supprimer un compte'], correct: 0, explanation: 'L\'authentification vérifie que l\'utilisateur est bien qui il prétend être.' },
    ],
  },

  // Quest 5: Le Transport Autonome (Python - Autonomous Vehicle Algorithms)
  'nova-5-1': {
    lessonId: 'nova-5-1',
    videoTitle: 'Algorithmes de Conduite Autonome',
    videoDuration: '18:00',
    steps: [
      { title: 'Détection d\'obstacles', description: 'Le véhicule doit détecter les obstacles: piétons, autres véhicules, feux rouges.', hint: 'Utilise des capteurs virtuels' },
      { title: 'Prise de décision', description: 'Selon les obstacles, décide: avancer, ralentir, s\'arrêter, tourner.', hint: 'Arbre de décision avec if/elif/else' },
      { title: 'Navigation GPS', description: 'Calcule le chemin le plus court entre deux points de la ville.', hint: 'Algorithme de pathfinding simple' },
    ],
    exerciseChallenge: 'Crée un algorithme qui fait circuler un véhicule autonome en évitant les obstacles.',
    starterCode: `# Véhicule autonome
position = 0
vitesse = 50
obstacle_devant = False
feu_rouge = False

def conduire():
    # Ton algorithme de conduite
    if obstacle_devant:
        # Que faire?
        pass
    elif feu_rouge:
        # Que faire?
        pass
    else:
        # Avancer normalement
        pass

conduire()
`,
    hints: ['Si obstacle, vitesse = 0', 'Si feu rouge, arrêter', 'Sinon, avancer à vitesse normale', 'Vérifie les capteurs en continu'],
  },

  'nova-5-2': {
    lessonId: 'nova-5-2',
    videoTitle: 'Optimisation des Trajets',
    videoDuration: '16:00',
    exerciseChallenge: 'Crée un algorithme qui trouve le trajet le plus rapide entre deux points.',
    starterCode: `# Carte de Nova-Ville (distances entre points)
carte = {
    "A": {"B": 5, "C": 10},
    "B": {"A": 5, "D": 8},
    "C": {"A": 10, "D": 3},
    "D": {"B": 8, "C": 3}
}

def trajet_optimal(depart, arrivee):
    # Trouve le chemin le plus court
    pass

print(trajet_optimal("A", "D"))
`,
    hints: ['Compare les différents chemins possibles', 'Additionne les distances', 'Retourne le chemin le plus court'],
  },

  'nova-5-3': {
    lessonId: 'nova-5-3',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'un algorithme de pathfinding?', options: ['Chercher un chemin', 'Dessiner', 'Compter', 'Effacer'], correct: 0, explanation: 'Le pathfinding trouve le meilleur chemin entre deux points.' },
      { question: 'Que doit faire un véhicule autonome face à un obstacle?', options: ['Accélérer', 'S\'arrêter ou contourner', 'Klaxonner', 'Reculer toujours'], correct: 1, explanation: 'La sécurité est prioritaire: arrêter ou contourner l\'obstacle.' },
      { question: 'Qu\'est-ce qu\'un capteur de véhicule?', options: ['Une décoration', 'Un appareil qui détecte l\'environnement', 'Un moteur', 'Une roue'], correct: 1, explanation: 'Les capteurs détectent obstacles, distances, vitesse, etc.' },
    ],
  },

  // Quest 6: La Bibliothèque du Savoir (Python - Database Management)
  'nova-6-1': {
    lessonId: 'nova-6-1',
    videoTitle: 'Organisation des Bases de Données',
    videoDuration: '17:00',
    steps: [
      { title: 'Structure de données', description: 'Une base de données organise l\'information en tables avec des colonnes (champs) et des lignes (enregistrements).', hint: 'Comme un tableau Excel' },
      { title: 'Dictionnaires et listes', description: 'En Python, utilise des dictionnaires pour représenter des enregistrements et des listes pour les collections.', hint: 'Liste de dictionnaires' },
      { title: 'Opérations CRUD', description: 'Create (créer), Read (lire), Update (modifier), Delete (supprimer) sont les 4 opérations de base.', hint: 'CRUD = Create Read Update Delete' },
    ],
    exerciseChallenge: 'Crée une base de données pour les citoyens de Nova-Ville avec nom, âge, adresse.',
    starterCode: `# Base de données citoyens
citoyens = []

def ajouter_citoyen(nom, age, adresse):
    # Ajoute un nouveau citoyen
    pass

def chercher_citoyen(nom):
    # Trouve un citoyen par nom
    pass

def modifier_citoyen(nom, nouveau_age):
    # Modifie l'âge d'un citoyen
    pass

# Test
ajouter_citoyen("Alice", 25, "Rue de la Paix")
`,
    hints: ['citoyens.append() pour ajouter', 'Boucle for pour chercher', 'Modifie le dictionnaire trouvé'],
  },

  'nova-6-2': {
    lessonId: 'nova-6-2',
    videoTitle: 'Recherche et Filtrage',
    videoDuration: '15:00',
    exerciseChallenge: 'Crée des fonctions pour filtrer les citoyens par âge, adresse, ou autre critère.',
    starterCode: `# Base de données
citoyens = [
    {"nom": "Alice", "age": 25, "quartier": "Centre"},
    {"nom": "Bob", "age": 30, "quartier": "Nord"},
    {"nom": "Charlie", "age": 22, "quartier": "Centre"}
]

def filtrer_par_age(age_min, age_max):
    # Retourne les citoyens dans cette tranche d'âge
    pass

def filtrer_par_quartier(quartier):
    # Retourne les citoyens de ce quartier
    pass
`,
    hints: ['Utilise une liste en compréhension', 'Vérifie les conditions avec if', 'Retourne une nouvelle liste'],
  },

  'nova-6-3': {
    lessonId: 'nova-6-3',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'une base de données?', options: ['Un fichier', 'Un système organisé de stockage', 'Un programme', 'Un site web'], correct: 1, explanation: 'Une base de données organise et stocke les informations de manière structurée.' },
      { question: 'Que signifie CRUD?', options: ['Create Read Update Delete', 'Copy Run Use Delete', 'Code Read Upload Download', 'Create Remove Update Duplicate'], correct: 0, explanation: 'CRUD = Create, Read, Update, Delete - les 4 opérations de base.' },
      { question: 'Pourquoi organiser les données?', options: ['Pour décorer', 'Pour retrouver rapidement l\'information', 'Pour ralentir', 'Ce n\'est pas utile'], correct: 1, explanation: 'L\'organisation permet de retrouver et manipuler les données efficacement.' },
    ],
  },

  // Quest 7: Le Réseau Mondial (Python - Networking)
  'nova-7-1': {
    lessonId: 'nova-7-1',
    videoTitle: 'Protocoles et Communication',
    videoDuration: '16:00',
    steps: [
      { title: 'Qu\'est-ce qu\'un réseau?', description: 'Un réseau connecte plusieurs ordinateurs pour qu\'ils puissent échanger des données.', hint: 'Comme un réseau routier' },
      { title: 'Adresses IP', description: 'Chaque appareil a une adresse unique (IP) pour être identifié sur le réseau.', hint: 'Comme une adresse postale' },
      { title: 'Protocoles de communication', description: 'Les protocoles sont les règles que suivent les appareils pour communiquer (HTTP, TCP/IP).', hint: 'Comme les règles de la route' },
    ],
    exerciseChallenge: 'Simule l\'envoi de messages entre différents appareils de Nova-Ville.',
    starterCode: `# Réseau de Nova-Ville
appareils = {
    "192.168.1.1": "Serveur Central",
    "192.168.1.10": "École",
    "192.168.1.20": "Hôpital",
    "192.168.1.30": "Mairie"
}

def envoyer_message(ip_source, ip_dest, message):
    # Vérifie que les IPs existent
    if ip_source in appareils and ip_dest in appareils:
        print(f"{appareils[ip_source]} -> {appareils[ip_dest]}: {message}")
        return True
    return False

# Test
envoyer_message("192.168.1.1", "192.168.1.10", "Bonjour!")
`,
    hints: ['Vérifie que les deux IPs existent', 'Affiche l\'expéditeur et le destinataire', 'Retourne True si succès'],
  },

  'nova-7-2': {
    lessonId: 'nova-7-2',
    videoTitle: 'Sécurité des Communications',
    videoDuration: '14:00',
    exerciseChallenge: 'Crée un système de chiffrement simple pour sécuriser les messages.',
    starterCode: `# Chiffrement César simple
def chiffrer(message, decalage):
    # Décale chaque lettre de 'decalage' positions
    resultat = ""
    for lettre in message:
        if lettre.isalpha():
            # Chiffre la lettre
            pass
        else:
            resultat += lettre
    return resultat

def dechiffrer(message, decalage):
    # Inverse du chiffrement
    return chiffrer(message, -decalage)

# Test
secret = chiffrer("HELLO", 3)
print(secret)  # KHOOR
`,
    hints: ['Utilise ord() et chr() pour manipuler les lettres', 'Décale de "decalage" positions', 'Gère majuscules et minuscules'],
  },

  'nova-7-3': {
    lessonId: 'nova-7-3',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'une adresse IP?', options: ['Un mot de passe', 'Une adresse unique sur le réseau', 'Un nom', 'Un programme'], correct: 1, explanation: 'L\'adresse IP identifie de manière unique un appareil sur le réseau.' },
      { question: 'Pourquoi chiffrer les messages?', options: ['Pour décorer', 'Pour la sécurité et confidentialité', 'Pour ralentir', 'Ce n\'est pas utile'], correct: 1, explanation: 'Le chiffrement protège les données contre les interceptions.' },
      { question: 'Qu\'est-ce qu\'un protocole réseau?', options: ['Un appareil', 'Des règles de communication', 'Un câble', 'Un mot de passe'], correct: 1, explanation: 'Un protocole définit comment les appareils communiquent entre eux.' },
    ],
  },

  // Quest 8: Inauguration et Mise à Jour (Python - Testing & Debugging)
  'nova-8-1': {
    lessonId: 'nova-8-1',
    videoTitle: 'Tests et Débogage',
    videoDuration: '18:00',
    steps: [
      { title: 'Qu\'est-ce qu\'un bug?', description: 'Un bug est une erreur dans le code qui empêche le programme de fonctionner correctement.', hint: 'Comme un grain de sable dans un moteur' },
      { title: 'Techniques de débogage', description: 'Utilise print() pour afficher les valeurs, teste chaque fonction séparément, vérifie les conditions.', hint: 'Divise pour mieux régner' },
      { title: 'Tests unitaires', description: 'Teste chaque fonction avec différentes valeurs pour vérifier qu\'elle fonctionne dans tous les cas.', hint: 'Teste les cas normaux et extrêmes' },
    ],
    exerciseChallenge: 'Trouve et corrige les 5 bugs dans le code de Nova-Ville.',
    starterCode: `# Code bugué de Nova-Ville - Trouve les 5 bugs!

def calculer_consommation(habitants, consommation_par_personne):
    # Bug 1: Division au lieu de multiplication
    total = habitants / consommation_par_personne
    return total

def verifier_age(age):
    # Bug 2: Condition inversée
    if age < 18:
        return "Adulte"
    else:
        return "Mineur"

def ajouter_citoyen(liste, nom):
    # Bug 3: Oubli de return
    liste.append(nom)

citoyens = []
# Bug 4: Mauvais nom de fonction
ajouter_citoyens(citoyens, "Alice")

# Bug 5: Indentation incorrecte
for i in range(5):
print(i)
`,
    hints: ['Bug 1: habitants * consommation', 'Bug 2: Inverse les conditions', 'Bug 3: Ajoute return liste', 'Bug 4: ajouter_citoyen (sans s)', 'Bug 5: Indente le print'],
  },

  'nova-8-2': {
    lessonId: 'nova-8-2',
    videoTitle: 'Version Bêta et Feedback',
    videoDuration: '15:00',
    exerciseChallenge: 'Crée un système de feedback pour collecter les avis des utilisateurs.',
    starterCode: `# Système de feedback
feedbacks = []

def ajouter_feedback(utilisateur, note, commentaire):
    # Ajoute un feedback (note de 1 à 5)
    if 1 <= note <= 5:
        feedbacks.append({
            "utilisateur": utilisateur,
            "note": note,
            "commentaire": commentaire
        })
        return True
    return False

def calculer_moyenne():
    # Calcule la note moyenne
    if len(feedbacks) == 0:
        return 0
    total = sum(f["note"] for f in feedbacks)
    return total / len(feedbacks)

# Test
ajouter_feedback("Alice", 5, "Excellent!")
ajouter_feedback("Bob", 4, "Très bien")
print(f"Note moyenne: {calculer_moyenne()}/5")
`,
    hints: ['Vérifie que la note est entre 1 et 5', 'Utilise sum() pour additionner', 'Gère le cas liste vide'],
  },

  'nova-8-3': {
    lessonId: 'nova-8-3',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'un bug en programmation?', options: ['Un insecte', 'Une erreur dans le code', 'Un virus', 'Un fichier'], correct: 1, explanation: 'Un bug est une erreur qui empêche le programme de fonctionner correctement.' },
      { question: 'Pourquoi tester son code?', options: ['Pour perdre du temps', 'Pour trouver et corriger les bugs', 'Ce n\'est pas nécessaire', 'Pour décorer'], correct: 1, explanation: 'Les tests permettent de détecter les bugs avant la mise en production.' },
      { question: 'Qu\'est-ce qu\'une version bêta?', options: ['La version finale', 'Une version de test', 'Une erreur', 'Un bug'], correct: 1, explanation: 'Une version bêta est testée par des utilisateurs avant la version finale.' },
      { question: 'Pourquoi collecter des feedbacks?', options: ['Pour décorer', 'Pour améliorer le produit', 'Pour ralentir', 'Ce n\'est pas utile'], correct: 1, explanation: 'Les feedbacks aident à identifier les problèmes et améliorer l\'expérience.' },
    ],
  },
};