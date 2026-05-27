import { LessonContent } from './lessonContent';

// Python Saga - Complete Lesson Content (8 Lessons)
export const pythonLessonsContent: Record<string, LessonContent> = {
  // Lesson 1: Variables et Types
  'python-1': {
    lessonId: 'python-1',
    videoTitle: 'Variables et Types de Données',
    videoDuration: '20:00',
    steps: [
      { title: 'Qu\'est-ce qu\'une variable?', description: 'Une variable est comme une boîte étiquetée qui stocke une valeur. Tu lui donnes un nom et tu y mets ce que tu veux.', hint: 'nom_variable = valeur' },
      { title: 'Types de données', description: 'Python a plusieurs types: int (entiers), float (décimaux), str (texte), bool (vrai/faux).', hint: 'type(variable) pour voir le type' },
      { title: 'Nommer ses variables', description: 'Utilise des noms descriptifs en minuscules avec underscores: mon_score, nom_joueur.', hint: 'Pas d\'espaces ni de caractères spéciaux' },
      { title: 'La fonction print()', description: 'print() affiche du texte ou des variables à l\'écran. C\'est ton outil de débogage principal!', hint: 'print("Bonjour", variable)' },
    ],
    exerciseChallenge: 'Crée des variables pour stocker ton prénom, ton âge, et si tu aimes le code (vrai/faux). Affiche une phrase complète avec ces informations.',
    starterCode: `# Crée tes variables ici
prenom = ""
age = 0
aime_code = True

# Affiche une phrase complète
print()`,
    hints: ['Utilise des guillemets pour le texte: prenom = "Alex"', 'Les nombres n\'ont pas de guillemets: age = 12', 'True ou False pour les booléens'],
    expectedOutput: 'Je m\'appelle Alex, j\'ai 12 ans et j\'aime coder: True',
  },

  // Lesson 2: Opérations Mathématiques
  'python-2': {
    lessonId: 'python-2',
    videoTitle: 'Opérations Mathématiques et Expressions',
    videoDuration: '18:00',
    steps: [
      { title: 'Opérateurs de base', description: 'Addition (+), soustraction (-), multiplication (*), division (/). Python respecte les priorités mathématiques.', hint: 'Parenthèses pour forcer l\'ordre' },
      { title: 'Division entière et modulo', description: '// donne le quotient entier, % donne le reste (modulo). Très utile pour les calculs!', hint: '7 // 2 = 3, 7 % 2 = 1' },
      { title: 'Puissance', description: '** calcule la puissance. 2**3 = 8 (2 au cube).', hint: 'Plus rapide que multiplier plusieurs fois' },
      { title: 'Opérations sur les chaînes', description: 'Tu peux "additionner" des textes (concaténation) et les "multiplier" (répétition).', hint: '"Salut " + "toi" = "Salut toi"' },
    ],
    exerciseChallenge: 'Crée une calculatrice de moyenne: demande 3 notes, calcule la moyenne, et affiche le résultat arrondi à 2 décimales.',
    starterCode: `# Notes de l'élève
note1 = 15
note2 = 12
note3 = 18

# Calcule la moyenne
moyenne = 

# Affiche le résultat
print(f"La moyenne est: {moyenne}")`,
    hints: ['Moyenne = somme des notes / nombre de notes', 'Utilise round(nombre, 2) pour arrondir', 'f-string pour formater: f"texte {variable}"'],
  },

  // Lesson 3: Quiz Python 1
  'python-3': {
    lessonId: 'python-3',
    quizQuestions: [
      { question: 'Quel type de donnée est "Bonjour"?', options: ['int', 'float', 'str', 'bool'], correct: 2, explanation: 'Le texte entre guillemets est une chaîne de caractères (str).' },
      { question: 'Que vaut 7 // 2 en Python?', options: ['3.5', '3', '4', '1'], correct: 1, explanation: '// est la division entière, elle donne le quotient sans la partie décimale.' },
      { question: 'Comment afficher une variable en Python?', options: ['echo()', 'print()', 'display()', 'show()'], correct: 1, explanation: 'print() est la fonction standard pour afficher en Python.' },
      { question: 'Quel est le résultat de 2 ** 4?', options: ['8', '16', '6', '24'], correct: 1, explanation: '2 ** 4 = 2 × 2 × 2 × 2 = 16' },
      { question: 'Comment concaténer deux chaînes?', options: ['Avec -', 'Avec +', 'Avec *', 'Avec /'], correct: 1, explanation: 'L\'opérateur + joint deux chaînes: "Hello" + " World" = "Hello World"' },
    ],
  },

  // Lesson 4: Conditions if/else
  'python-4': {
    lessonId: 'python-4',
    videoTitle: 'Conditions if/else - Prendre des Décisions',
    videoDuration: '22:00',
    steps: [
      { title: 'La structure if', description: 'if condition: exécute le code indenté si la condition est vraie. L\'indentation (4 espaces) est obligatoire!', hint: 'N\'oublie pas les deux-points :' },
      { title: 'else et elif', description: 'else s\'exécute si la condition est fausse. elif (else if) teste une autre condition.', hint: 'Tu peux chaîner plusieurs elif' },
      { title: 'Opérateurs de comparaison', description: '== (égal), != (différent), < (inférieur), > (supérieur), <= (inférieur ou égal), >= (supérieur ou égal).', hint: '== pour comparer, = pour assigner' },
      { title: 'Opérateurs logiques', description: 'and (et), or (ou), not (non) combinent plusieurs conditions.', hint: 'if age >= 13 and age <= 19: # adolescent' },
    ],
    exerciseChallenge: 'Crée un programme qui détermine la mention d\'un élève selon sa note: < 10 = Insuffisant, 10-12 = Passable, 12-14 = Assez Bien, 14-16 = Bien, >= 16 = Très Bien.',
    starterCode: `# Note de l'élève
note = 15

# Détermine la mention
if note < 10:
    mention = "Insuffisant"
# Ajoute les autres conditions...

print(f"Note: {note}/20 - Mention: {mention}")`,
    hints: ['Utilise elif pour les conditions intermédiaires', 'Vérifie les bornes avec >= et <', 'L\'ordre des conditions est important!'],
  },

  // Lesson 5: Boucles for et while
  'python-5': {
    lessonId: 'python-5',
    videoTitle: 'Boucles for et while - Répéter des Actions',
    videoDuration: '25:00',
    steps: [
      { title: 'La boucle for', description: 'for i in range(n): répète n fois. for element in liste: parcourt chaque élément.', hint: 'range(5) = 0, 1, 2, 3, 4' },
      { title: 'La fonction range()', description: 'range(stop), range(start, stop), range(start, stop, step). Génère une séquence de nombres.', hint: 'range(1, 10, 2) = 1, 3, 5, 7, 9' },
      { title: 'La boucle while', description: 'while condition: répète tant que la condition est vraie. Attention aux boucles infinies!', hint: 'Assure-toi que la condition devient fausse' },
      { title: 'break et continue', description: 'break sort de la boucle immédiatement. continue passe à l\'itération suivante.', hint: 'Utiles pour contrôler le flux' },
    ],
    exerciseChallenge: 'Crée un programme qui affiche la table de multiplication d\'un nombre (de 1 à 10), puis calcule la somme de tous les résultats.',
    starterCode: `# Nombre pour la table de multiplication
nombre = 7
somme = 0

# Affiche la table et calcule la somme
for i in range(1, 11):
    resultat = nombre * i
    print(f"{nombre} x {i} = {resultat}")
    # Ajoute à la somme...

print(f"Somme totale: {somme}")`,
    hints: ['Utilise += pour ajouter à la somme', 'range(1, 11) donne 1 à 10', 'La somme finale devrait être 7 × (1+2+3+...+10) = 7 × 55 = 385'],
  },

  // Lesson 6: Listes et Dictionnaires
  'python-6': {
    lessonId: 'python-6',
    videoTitle: 'Listes et Dictionnaires - Organiser les Données',
    videoDuration: '28:00',
    steps: [
      { title: 'Les listes', description: 'Une liste stocke plusieurs valeurs ordonnées: fruits = ["pomme", "banane", "orange"]. Accès par index: fruits[0] = "pomme".', hint: 'Les index commencent à 0' },
      { title: 'Manipuler les listes', description: 'append() ajoute, remove() supprime, len() compte, sort() trie.', hint: 'liste.append("nouveau")' },
      { title: 'Les dictionnaires', description: 'Un dictionnaire associe des clés à des valeurs: eleve = {"nom": "Alice", "age": 12}. Accès: eleve["nom"].', hint: 'Clé: valeur' },
      { title: 'Parcourir les structures', description: 'for item in liste: pour les listes. for cle, valeur in dico.items(): pour les dictionnaires.', hint: 'items() donne clés et valeurs' },
    ],
    exerciseChallenge: 'Crée un carnet de contacts: une liste de dictionnaires avec nom, téléphone, email. Ajoute une fonction pour chercher un contact par nom.',
    starterCode: `# Carnet de contacts
contacts = [
    {"nom": "Alice", "tel": "0612345678", "email": "alice@mail.com"},
    {"nom": "Bob", "tel": "0698765432", "email": "bob@mail.com"},
]

def chercher_contact(nom):
    # Parcours les contacts et retourne celui qui correspond
    for contact in contacts:
        pass  # À compléter
    return None

# Test
resultat = chercher_contact("Alice")
print(resultat)`,
    hints: ['Compare contact["nom"] avec le nom recherché', 'Retourne le contact si trouvé', 'Retourne None si non trouvé'],
  },

  // Lesson 7: Quiz Python 2
  'python-7': {
    lessonId: 'python-7',
    quizQuestions: [
      { question: 'Comment accéder au premier élément d\'une liste?', options: ['liste[1]', 'liste[0]', 'liste.first()', 'liste[-1]'], correct: 1, explanation: 'Les index commencent à 0, donc liste[0] est le premier élément.' },
      { question: 'Que fait la méthode append()?', options: ['Supprime un élément', 'Ajoute à la fin', 'Trie la liste', 'Vide la liste'], correct: 1, explanation: 'append() ajoute un élément à la fin de la liste.' },
      { question: 'Comment créer un dictionnaire vide?', options: ['[]', '{}', '()', 'dict[]'], correct: 1, explanation: 'Les accolades {} créent un dictionnaire vide.' },
      { question: 'Que retourne range(3, 8)?', options: ['3, 4, 5, 6, 7, 8', '3, 4, 5, 6, 7', '0, 1, 2, 3, 4', '3, 8'], correct: 1, explanation: 'range(3, 8) génère les nombres de 3 à 7 (8 exclu).' },
      { question: 'Comment sortir d\'une boucle immédiatement?', options: ['stop', 'exit', 'break', 'return'], correct: 2, explanation: 'break interrompt la boucle et continue après celle-ci.' },
    ],
  },

  // Lesson 8: Mini-Projet Python
  'python-8': {
    lessonId: 'python-8',
    videoTitle: 'Mini-Projet Python - Application Complète',
    videoDuration: '35:00',
    steps: [
      { title: 'Planifier le projet', description: 'Définis les fonctionnalités: quelles données? Quelles actions? Quelle interface?', hint: 'Liste les fonctions nécessaires' },
      { title: 'Structurer le code', description: 'Organise en fonctions: chaque fonction fait une seule chose. Code principal à la fin.', hint: 'Fonctions réutilisables' },
      { title: 'Gérer les erreurs', description: 'Utilise try/except pour gérer les erreurs. Valide les entrées utilisateur.', hint: 'Anticipe les problèmes' },
      { title: 'Tester et améliorer', description: 'Teste chaque fonction séparément. Corrige les bugs. Améliore l\'expérience utilisateur.', hint: 'Teste les cas limites' },
    ],
    exerciseChallenge: 'Crée un jeu de devinette: l\'ordinateur choisit un nombre entre 1 et 100, le joueur doit le deviner. Indique "plus grand" ou "plus petit" après chaque essai. Compte le nombre de tentatives.',
    starterCode: `import random

def jeu_devinette():
    nombre_secret = random.randint(1, 100)
    tentatives = 0
    trouve = False
    
    print("Je pense à un nombre entre 1 et 100...")
    
    while not trouve:
        # Demande une proposition
        proposition = int(input("Ton essai: "))
        tentatives += 1
        
        # Compare et donne un indice
        if proposition < nombre_secret:
            print("C'est plus grand!")
        elif proposition > nombre_secret:
            print("C'est plus petit!")
        else:
            trouve = True
            print(f"Bravo! Tu as trouvé en {tentatives} tentatives!")

# Lance le jeu
jeu_devinette()`,
    hints: ['random.randint(1, 100) génère un nombre aléatoire', 'Utilise une boucle while jusqu\'à ce que le joueur trouve', 'Compte les tentatives à chaque essai'],
  },
};
