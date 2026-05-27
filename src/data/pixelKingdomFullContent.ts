import { LessonContent } from './lessonContent';

// Pixel Kingdom - Complete Lesson Content (15 Quests across 5 Chapters)
export const pixelKingdomFullContent: Record<string, LessonContent> = {
  // ============ CHAPTER 1: La Forêt des Pixels (7-8 ans) ============
  
  // Quest 1: L'Éveil du Pixel
  'pixel-1': {
    lessonId: 'pixel-1',
    videoTitle: 'L\'Éveil du Pixel - Premiers pas dans le Royaume',
    videoDuration: '12:00',
    steps: [
      { title: 'Qu\'est-ce qu\'un pixel?', description: 'Un pixel est le plus petit point d\'une image numérique. C\'est comme une brique magique de lumière! Ton écran est fait de millions de pixels.', hint: 'Zoom sur ton écran pour les voir' },
      { title: 'Allumer un pixel', description: 'En code, on peut allumer un pixel en lui donnant une position (x, y) et une couleur. C\'est comme placer une étoile dans le ciel!', hint: 'x = horizontal, y = vertical' },
      { title: 'Coordonnées magiques', description: 'Chaque pixel a une adresse: (x, y). Le point (0, 0) est en haut à gauche. x augmente vers la droite, y vers le bas.', hint: 'Comme une carte au trésor' },
      { title: 'Ta première magie', description: 'Utilise les blocs pour créer un carré de pixels lumineux. Répète 4 fois pour dessiner chaque côté!', hint: 'Boucle + avancer + tourner' },
    ],
    exerciseChallenge: 'Crée un carré magique de 5x5 pixels qui brille en bleu. Utilise une boucle pour ne pas répéter le code!',
  },

  // Quest 2: Le Sort de Couleur
  'pixel-2': {
    lessonId: 'pixel-2',
    videoTitle: 'Le Sort de Couleur - Maîtrise les teintes',
    videoDuration: '14:00',
    steps: [
      { title: 'Les couleurs RGB', description: 'Toutes les couleurs sont faites de Rouge, Vert et Bleu (RGB). Chaque valeur va de 0 (éteint) à 255 (maximum).', hint: 'RGB(255,0,0) = rouge pur' },
      { title: 'Mélanger les couleurs', description: 'En combinant R, G et B, tu peux créer des millions de couleurs! Rouge + Vert = Jaune, Rouge + Bleu = Magenta.', hint: 'Expérimente les mélanges' },
      { title: 'Dégradés magiques', description: 'Change progressivement une valeur RGB pour créer un dégradé. C\'est comme un arc-en-ciel programmé!', hint: 'Utilise une boucle qui augmente la valeur' },
      { title: 'Arc-en-ciel enchanté', description: 'Combine plusieurs dégradés pour créer un arc-en-ciel complet. Chaque couleur se transforme en la suivante.', hint: 'Rouge → Orange → Jaune → Vert → Bleu → Violet' },
    ],
    exerciseChallenge: 'Crée un dégradé arc-en-ciel de 10 pixels, passant du rouge au violet.',
    starterCode: `# Crée un arc-en-ciel
couleurs = []
for i in range(10):
    # Calcule la couleur pour chaque position
    r = 255 - (i * 25)
    g = i * 25
    b = i * 15
    couleurs.append((r, g, b))
    print(f"Pixel {i}: RGB({r}, {g}, {b})")`,
  },

  // Quest 3: Boss - Le Gardien Pixelisé
  'pixel-3': {
    lessonId: 'pixel-3',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'un pixel?', options: ['Un animal magique', 'Le plus petit point d\'une image', 'Un sort de couleur', 'Une planète lointaine'], correct: 1, explanation: 'Un pixel est le plus petit élément d\'une image numérique, comme une brique de lumière.' },
      { question: 'Combien de valeurs possibles pour chaque composante RGB?', options: ['100', '256 (de 0 à 255)', '1000', '10'], correct: 1, explanation: 'Chaque composante RGB va de 0 à 255, soit 256 valeurs possibles.' },
      { question: 'Quelle couleur donne RGB(0, 255, 0)?', options: ['Rouge', 'Bleu', 'Vert pur', 'Jaune'], correct: 2, explanation: 'Seul le Vert est à 255, les autres à 0, donc c\'est du vert pur.' },
      { question: 'Comment créer du jaune en RGB?', options: ['RGB(255, 255, 0)', 'RGB(0, 255, 255)', 'RGB(255, 0, 255)', 'RGB(0, 0, 255)'], correct: 0, explanation: 'Jaune = Rouge + Vert au maximum, sans Bleu.' },
      { question: 'Où se trouve le pixel (0, 0)?', options: ['Au centre', 'En haut à gauche', 'En bas à droite', 'Partout'], correct: 1, explanation: 'Par convention, (0, 0) est le coin supérieur gauche de l\'écran.' },
    ],
  },

  // ============ CHAPTER 2: Les Montagnes de Bytes (8-9 ans) ============
  
  // Quest 4: L'Algorithme de l'Escalade
  'pixel-4': {
    lessonId: 'pixel-4',
    videoTitle: 'L\'Algorithme de l\'Escalade - Résoudre des problèmes',
    videoDuration: '16:00',
    steps: [
      { title: 'Qu\'est-ce qu\'un algorithme?', description: 'Un algorithme est une suite d\'instructions précises pour résoudre un problème. Comme une recette de cuisine magique!', hint: 'Étape par étape' },
      { title: 'Décomposer le problème', description: 'Pour escalader une montagne, on ne saute pas au sommet! On avance pas à pas, en vérifiant chaque prise.', hint: 'Diviser pour mieux régner' },
      { title: 'Boucles et répétitions', description: 'Si tu dois monter 100 marches, tu ne vas pas écrire "monter" 100 fois! Utilise une boucle.', hint: 'for i in range(100): monter()' },
      { title: 'Optimiser le chemin', description: 'Trouve le chemin le plus court vers le sommet. Compare les distances, évite les obstacles.', hint: 'Le plus court n\'est pas toujours le plus direct' },
    ],
    exerciseChallenge: 'Crée un algorithme qui trouve le chemin le plus court pour atteindre le sommet (position 10) depuis la position 0.',
    starterCode: `# Position de départ
position = 0
sommet = 10
pas_faits = 0

# Ton algorithme d'escalade
while position < sommet:
    position += 1
    pas_faits += 1
    print(f"Position: {position}")

print(f"Sommet atteint en {pas_faits} pas!")`,
  },

  // Quest 5: Le Bouclier Debug
  'pixel-5': {
    lessonId: 'pixel-5',
    videoTitle: 'Le Bouclier Debug - Chasse aux bugs',
    videoDuration: '15:00',
    steps: [
      { title: 'Qu\'est-ce qu\'un bug?', description: 'Un bug est une erreur dans le code qui empêche le programme de fonctionner correctement. Comme un grain de sable dans un engrenage!', hint: 'Le premier bug était un vrai insecte!' },
      { title: 'Lire les messages d\'erreur', description: 'Python te donne des indices précieux: le type d\'erreur, le numéro de ligne, et parfois une suggestion.', hint: 'Lis attentivement le message' },
      { title: 'Techniques de débogage', description: 'Utilise print() pour afficher les valeurs. Teste chaque partie séparément. Vérifie les types de données.', hint: 'print() est ton meilleur ami' },
      { title: 'Erreurs courantes', description: 'Oubli de deux-points, mauvaise indentation, variable non définie, division par zéro...', hint: 'Vérifie la syntaxe d\'abord' },
    ],
    exerciseChallenge: 'Corrige le code bugué pour activer le bouclier magique. Il y a 4 erreurs à trouver!',
    starterCode: `# Ce code a des bugs! Trouve et corrige les 4 erreurs.

def activer_bouclier(puissance)  # Bug 1: manque les deux-points
    if puissance > 100
        print("Bouclier activé!")  # Bug 2: manque les deux-points
    else:
        print(Puissance insuffisante)  # Bug 3: guillemets manquants
    
    return puisance  # Bug 4: faute de frappe

# Test
resultat = activer_bouclier(150)
print(resultat)`,
    hints: ['Ligne 3: ajoute :', 'Ligne 4: ajoute :', 'Ligne 7: ajoute des guillemets', 'Ligne 9: corrige "puisance" en "puissance"'],
  },

  // Quest 6: Boss - Le Dragon Binaire
  'pixel-6': {
    lessonId: 'pixel-6',
    quizQuestions: [
      { question: 'Qu\'est-ce que le binaire?', options: ['Un langage de programmation', 'Un système à base 2 (0 et 1)', 'Un type de dragon', 'Une couleur'], correct: 1, explanation: 'Le binaire utilise seulement 0 et 1, c\'est le langage des ordinateurs.' },
      { question: 'Que vaut 1010 en binaire converti en décimal?', options: ['8', '10', '12', '1010'], correct: 1, explanation: '1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10 en décimal.' },
      { question: 'Comment débugger efficacement?', options: ['Deviner au hasard', 'Lire les messages d\'erreur et utiliser print()', 'Tout effacer et recommencer', 'Abandonner'], correct: 1, explanation: 'Les messages d\'erreur et print() sont tes meilleurs outils de débogage.' },
      { question: 'Qu\'est-ce qu\'un algorithme?', options: ['Un bug', 'Une suite d\'instructions pour résoudre un problème', 'Un type de variable', 'Une erreur'], correct: 1, explanation: 'Un algorithme est une séquence d\'étapes logiques pour résoudre un problème.' },
      { question: 'Quelle erreur cause "NameError: name \'x\' is not defined"?', options: ['x est mal orthographié', 'x n\'a pas été créé avant d\'être utilisé', 'x est trop grand', 'x est un mot réservé'], correct: 1, explanation: 'Cette erreur signifie que la variable n\'existe pas encore.' },
    ],
  },

  // ============ CHAPTER 3: Le Serveur de Cristal (9-10 ans) ============
  
  // Quest 7: Les Portails Glitchés
  'pixel-7': {
    lessonId: 'pixel-7',
    videoTitle: 'Les Portails Glitchés - Maîtrise les conditions',
    videoDuration: '18:00',
    steps: [
      { title: 'Les conditions if/elif/else', description: 'Les portails s\'ouvrent selon des conditions. if vérifie une condition, elif en vérifie une autre, else est le cas par défaut.', hint: 'Comme un aiguillage magique' },
      { title: 'Opérateurs de comparaison', description: 'Utilise >, <, ==, !=, >=, <= pour comparer des valeurs. == teste l\'égalité (attention: = c\'est l\'assignation!)', hint: '== pour comparer, = pour assigner' },
      { title: 'Logique booléenne', description: 'Combine des conditions avec and (et), or (ou), not (non). Puissant pour des conditions complexes!', hint: 'and = les deux doivent être vrais' },
      { title: 'Portails imbriqués', description: 'Tu peux mettre des if dans des if pour des décisions en cascade.', hint: 'Attention à l\'indentation!' },
    ],
    exerciseChallenge: 'Crée un système de portails qui s\'ouvrent selon l\'énergie et le niveau du joueur.',
    starterCode: `# Système de portails magiques
energie = 75
niveau = 5

def ouvrir_portail(energie, niveau):
    if energie >= 100 and niveau >= 10:
        return "Portail Doré - Accès au trésor!"
    elif energie >= 75 and niveau >= 5:
        return "Portail Argenté - Zone intermédiaire"
    elif energie >= 50:
        return "Portail Bronze - Zone débutant"
    else:
        return "Portail Fermé - Énergie insuffisante"

print(ouvrir_portail(energie, niveau))
print(ouvrir_portail(100, 10))
print(ouvrir_portail(30, 2))`,
  },

  // Quest 8: La Boucle Infinie
  'pixel-8': {
    lessonId: 'pixel-8',
    videoTitle: 'La Boucle Infinie - Échapper au piège',
    videoDuration: '17:00',
    steps: [
      { title: 'Boucles while', description: 'Une boucle while répète tant qu\'une condition est vraie. Attention aux boucles infinies!', hint: 'La condition doit devenir fausse un jour' },
      { title: 'Le piège de l\'infini', description: 'Si la condition reste toujours vraie, le programme tourne à l\'infini! C\'est le piège du labyrinthe.', hint: 'Toujours prévoir une sortie' },
      { title: 'Break et Continue', description: 'break sort immédiatement de la boucle. continue passe à l\'itération suivante sans exécuter le reste.', hint: 'break = sortie de secours' },
      { title: 'Compteurs et conditions de sortie', description: 'Utilise un compteur ou une condition qui change pour garantir la sortie.', hint: 'compteur += 1 à chaque tour' },
    ],
    exerciseChallenge: 'Échappe de la boucle infinie en trouvant la sortie au bon moment!',
    starterCode: `# Échappe du labyrinthe!
position = 0
sortie = 42
energie = 100

print("Tu es piégé dans le labyrinthe...")

while True:
    position += 1
    energie -= 1
    
    if position == sortie:
        print(f"SORTIE TROUVÉE à la position {position}!")
        break
    
    if energie <= 0:
        print("Plus d'énergie... Game Over!")
        break
    
    if position % 10 == 0:
        print(f"Position {position}, énergie restante: {energie}")

print(f"Fin du jeu. Position finale: {position}")`,
  },

  // Quest 9: Boss - Le Sphinx des Variables
  'pixel-9': {
    lessonId: 'pixel-9',
    quizQuestions: [
      { question: 'Que fait une boucle while?', options: ['Répète une seule fois', 'Répète tant que la condition est vraie', 'Ne répète jamais', 'Répète exactement 10 fois'], correct: 1, explanation: 'while continue tant que sa condition reste vraie.' },
      { question: 'Quel mot-clé sort immédiatement d\'une boucle?', options: ['stop', 'break', 'exit', 'end'], correct: 1, explanation: 'break interrompt la boucle et continue après celle-ci.' },
      { question: 'Que signifie elif en Python?', options: ['Erreur', 'Sinon si (else if)', 'Fin de boucle', 'Variable'], correct: 1, explanation: 'elif est la contraction de "else if" (sinon si).' },
      { question: 'Comment éviter une boucle infinie?', options: ['Utiliser break partout', 'S\'assurer que la condition devient fausse', 'Ne jamais utiliser while', 'Éteindre l\'ordinateur'], correct: 1, explanation: 'La condition du while doit pouvoir devenir fausse.' },
      { question: 'Que fait continue dans une boucle?', options: ['Arrête la boucle', 'Passe à l\'itération suivante', 'Recommence depuis le début', 'Rien'], correct: 1, explanation: 'continue saute le reste du code et passe au tour suivant.' },
    ],
  },

  // ============ CHAPTER 4: La Dimension Glitch (10-11 ans) ============
  
  // Quest 10: La Récursion Mystique
  'pixel-10': {
    lessonId: 'pixel-10',
    videoTitle: 'La Récursion Mystique - Miroirs infinis',
    videoDuration: '20:00',
    steps: [
      { title: 'Qu\'est-ce que la récursion?', description: 'Une fonction qui s\'appelle elle-même! Comme un miroir dans un miroir, ou des poupées russes.', hint: 'Fonction → appelle elle-même → résultat' },
      { title: 'Le cas de base', description: 'CRUCIAL: toute récursion doit avoir un cas de base qui arrête les appels. Sinon, récursion infinie!', hint: 'if n == 0: return résultat' },
      { title: 'Factorielle', description: 'n! = n × (n-1) × (n-2) × ... × 1. Exemple parfait de récursion: n! = n × (n-1)!', hint: '5! = 5 × 4! = 5 × 4 × 3! = ...' },
      { title: 'Fibonacci', description: 'Chaque nombre est la somme des deux précédents: 1, 1, 2, 3, 5, 8, 13... F(n) = F(n-1) + F(n-2)', hint: 'Deux cas de base: F(0)=0, F(1)=1' },
    ],
    exerciseChallenge: 'Crée une fonction récursive pour calculer la factorielle et une pour Fibonacci.',
    starterCode: `def factorielle(n):
    """Calcule n! de manière récursive"""
    # Cas de base
    if n == 0 or n == 1:
        return 1
    # Cas récursif
    return n * factorielle(n - 1)

def fibonacci(n):
    """Calcule le n-ième nombre de Fibonacci"""
    # Cas de base
    if n <= 1:
        return n
    # Cas récursif
    return fibonacci(n - 1) + fibonacci(n - 2)

# Tests
print(f"5! = {factorielle(5)}")  # 120
print(f"Fibo(10) = {fibonacci(10)}")  # 55

# Affiche les 10 premiers Fibonacci
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
  },

  // Quest 11: Les Fonctions Enchantées
  'pixel-11': {
    lessonId: 'pixel-11',
    videoTitle: 'Les Fonctions Enchantées - Créer des sorts',
    videoDuration: '19:00',
    steps: [
      { title: 'Créer une fonction', description: 'def nom_fonction(paramètres): définit une fonction. Elle encapsule du code réutilisable.', hint: 'def = define (définir)' },
      { title: 'Paramètres et arguments', description: 'Les paramètres sont les "ingrédients" de ta fonction. Tu les passes quand tu l\'appelles.', hint: 'def saluer(nom): → saluer("Alice")' },
      { title: 'Valeur de retour', description: 'return renvoie un résultat. Sans return, la fonction renvoie None.', hint: 'return permet de récupérer le résultat' },
      { title: 'Portée des variables', description: 'Les variables créées dans une fonction sont locales. Elles n\'existent pas en dehors.', hint: 'Local vs Global' },
    ],
    exerciseChallenge: 'Crée des fonctions magiques: lancer_sort, calculer_degats, soigner.',
    starterCode: `def lancer_sort(type_sort, puissance):
    """Lance un sort et retourne les dégâts"""
    multiplicateurs = {
        "feu": 1.5,
        "glace": 1.2,
        "foudre": 1.8,
        "terre": 1.0
    }
    mult = multiplicateurs.get(type_sort, 1.0)
    degats = puissance * mult
    return int(degats)

def soigner(vie_actuelle, vie_max, potion):
    """Soigne le personnage sans dépasser vie_max"""
    nouvelle_vie = vie_actuelle + potion
    return min(nouvelle_vie, vie_max)

# Tests
print(f"Sort de feu (100): {lancer_sort('feu', 100)} dégâts")
print(f"Sort de foudre (100): {lancer_sort('foudre', 100)} dégâts")
print(f"Soin (50/100, potion 30): {soigner(50, 100, 30)} PV")
print(f"Soin (90/100, potion 30): {soigner(90, 100, 30)} PV")`,
  },

  // Quest 12: Boss - Le Sorcier des Exceptions
  'pixel-12': {
    lessonId: 'pixel-12',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'une fonction en programmation?', options: ['Un sort magique', 'Un bloc de code réutilisable', 'Une erreur', 'Une boucle'], correct: 1, explanation: 'Une fonction encapsule du code qu\'on peut appeler plusieurs fois.' },
      { question: 'Que fait le mot-clé return?', options: ['Arrête le programme', 'Renvoie une valeur depuis la fonction', 'Crée une erreur', 'Rien du tout'], correct: 1, explanation: 'return termine la fonction et renvoie une valeur.' },
      { question: 'Qu\'est-ce que la récursion?', options: ['Une erreur', 'Une fonction qui s\'appelle elle-même', 'Une boucle for', 'Un type de variable'], correct: 1, explanation: 'La récursion est quand une fonction s\'appelle elle-même.' },
      { question: 'Pourquoi le cas de base est-il crucial en récursion?', options: ['Pour décorer', 'Pour arrêter les appels récursifs', 'Pour aller plus vite', 'Il n\'est pas nécessaire'], correct: 1, explanation: 'Sans cas de base, la récursion ne s\'arrête jamais!' },
      { question: 'Que vaut factorielle(0)?', options: ['0', '1', 'Erreur', 'Infini'], correct: 1, explanation: 'Par définition, 0! = 1. C\'est le cas de base.' },
    ],
  },

  // ============ CHAPTER 5: Le Palais du Roi Pixel (11-12 ans) ============
  
  // Quest 13: L'Algorithme Royal
  'pixel-13': {
    lessonId: 'pixel-13',
    videoTitle: 'L\'Algorithme Royal - Trier les données',
    videoDuration: '22:00',
    steps: [
      { title: 'Pourquoi trier?', description: 'Les données triées sont plus faciles à chercher et analyser. Imagine chercher un livre dans une bibliothèque non rangée!', hint: 'Tri = organisation' },
      { title: 'Tri à bulles (Bubble Sort)', description: 'Compare chaque paire d\'éléments adjacents et les échange si nécessaire. Simple mais lent.', hint: 'Les plus grands "remontent" comme des bulles' },
      { title: 'Tri par sélection', description: 'Trouve le minimum, place-le au début, puis recommence avec le reste.', hint: 'Sélectionne le plus petit à chaque tour' },
      { title: 'Complexité algorithmique', description: 'O(n²) pour bubble/selection, O(n log n) pour les tris rapides. Plus c\'est petit, mieux c\'est!', hint: 'Big O notation' },
    ],
    exerciseChallenge: 'Implémente un algorithme de tri pour organiser les scores royaux.',
    starterCode: `def tri_bulles(liste):
    """Tri à bulles - simple mais O(n²)"""
    n = len(liste)
    for i in range(n):
        for j in range(0, n - i - 1):
            if liste[j] > liste[j + 1]:
                # Échange
                liste[j], liste[j + 1] = liste[j + 1], liste[j]
    return liste

def tri_selection(liste):
    """Tri par sélection"""
    n = len(liste)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if liste[j] < liste[min_idx]:
                min_idx = j
        liste[i], liste[min_idx] = liste[min_idx], liste[i]
    return liste

# Test avec les scores royaux
scores = [64, 34, 25, 12, 22, 11, 90]
print(f"Scores originaux: {scores}")
print(f"Triés (bulles): {tri_bulles(scores.copy())}")
print(f"Triés (sélection): {tri_selection(scores.copy())}")`,
  },

  // Quest 14: Le Défi des Classes
  'pixel-14': {
    lessonId: 'pixel-14',
    videoTitle: 'Le Défi des Classes - Programmation Orientée Objet',
    videoDuration: '24:00',
    steps: [
      { title: 'Qu\'est-ce qu\'une classe?', description: 'Une classe est un modèle pour créer des objets. Comme un moule à gâteaux: le moule est la classe, les gâteaux sont les objets.', hint: 'Classe = plan, Objet = instance' },
      { title: 'Attributs et méthodes', description: 'Les attributs sont les caractéristiques (nom, vie). Les méthodes sont les actions (attaquer, soigner).', hint: 'Attributs = données, Méthodes = fonctions' },
      { title: 'Le constructeur __init__', description: '__init__ est appelé quand on crée un objet. Il initialise les attributs.', hint: 'self.attribut = valeur' },
      { title: 'self', description: 'self représente l\'objet lui-même. On l\'utilise pour accéder aux attributs et méthodes.', hint: 'self = "moi-même"' },
    ],
    exerciseChallenge: 'Crée une classe Héros avec attributs et méthodes pour un RPG.',
    starterCode: `class Heros:
    def __init__(self, nom, classe, vie_max):
        self.nom = nom
        self.classe = classe
        self.vie_max = vie_max
        self.vie = vie_max
        self.niveau = 1
        self.xp = 0
    
    def attaquer(self, ennemi, degats):
        ennemi.vie -= degats
        print(f"{self.nom} attaque {ennemi.nom} pour {degats} dégâts!")
        if ennemi.vie <= 0:
            print(f"{ennemi.nom} est vaincu!")
            self.gagner_xp(50)
    
    def soigner(self, montant):
        self.vie = min(self.vie + montant, self.vie_max)
        print(f"{self.nom} récupère {montant} PV. Vie: {self.vie}/{self.vie_max}")
    
    def gagner_xp(self, xp):
        self.xp += xp
        print(f"+{xp} XP!")
        if self.xp >= self.niveau * 100:
            self.niveau += 1
            self.vie_max += 10
            print(f"NIVEAU {self.niveau}! Vie max: {self.vie_max}")

# Crée des héros
guerrier = Heros("Pixel", "Guerrier", 100)
mage = Heros("Glitch", "Mage", 70)

# Combat!
guerrier.attaquer(mage, 30)
mage.soigner(20)`,
  },

  // Quest 15: Boss Final - Le Roi Pixel Corrompu
  'pixel-15': {
    lessonId: 'pixel-15',
    quizQuestions: [
      { question: 'Qu\'est-ce qu\'une classe en POO?', options: ['Une salle de cours', 'Un modèle pour créer des objets', 'Une fonction spéciale', 'Un type de boucle'], correct: 1, explanation: 'Une classe est un plan/modèle à partir duquel on crée des objets.' },
      { question: 'Quel algorithme de tri est le plus rapide en moyenne?', options: ['Tri à bulles O(n²)', 'Tri rapide O(n log n)', 'Tri par sélection O(n²)', 'Tous pareils'], correct: 1, explanation: 'Quick Sort (tri rapide) a une complexité moyenne de O(n log n).' },
      { question: 'À quoi sert __init__ dans une classe?', options: ['Détruire l\'objet', 'Initialiser l\'objet à sa création', 'Copier l\'objet', 'Afficher l\'objet'], correct: 1, explanation: '__init__ est le constructeur, appelé quand on crée un nouvel objet.' },
      { question: 'Que représente self dans une classe?', options: ['Une variable globale', 'L\'objet lui-même', 'La classe parente', 'Rien'], correct: 1, explanation: 'self fait référence à l\'instance actuelle de l\'objet.' },
      { question: 'Quelle est la différence entre attribut et méthode?', options: ['Aucune', 'Attribut = donnée, Méthode = action', 'Attribut = action, Méthode = donnée', 'Les deux sont des fonctions'], correct: 1, explanation: 'Les attributs stockent des données, les méthodes définissent des comportements.' },
      { question: 'Tu as terminé le Royaume des Pixels! Quel titre mérites-tu?', options: ['Apprenti Pixel', 'Chevalier du Code', 'Maître du Royaume', 'Roi/Reine du Code'], correct: 3, explanation: 'Félicitations! Tu as maîtrisé tous les concepts et mérité le titre suprême!' },
    ],
  },
};
