export const quizData: Record<string, any> = {
  'scratch-quiz': {
    title: 'Quiz Scratch - Royaume des Pixels',
    questions: [
      {
        question: "Quel bloc fait avancer le sprite?",
        options: ["Avancer de 10 pas", "Tourner à droite", "Dire Bonjour", "Changer de costume"],
        correct: 0,
        explanation: "Le bloc 'Avancer de 10 pas' est un bloc de mouvement bleu qui déplace le sprite vers l'avant."
      },
      {
        question: "De quelle couleur sont les blocs de contrôle (boucles)?",
        options: ["Bleu", "Violet", "Orange", "Vert"],
        correct: 2,
        explanation: "Les blocs de contrôle comme 'répéter' et 'si...alors' sont de couleur orange."
      },
      {
        question: "Que fait le bloc 'répéter 5 fois'?",
        options: ["Attend 5 secondes", "Exécute le code 5 fois", "Crée 5 sprites", "Change de costume 5 fois"],
        correct: 1,
        explanation: "Le bloc 'répéter' est une boucle qui exécute les blocs à l'intérieur le nombre de fois indiqué."
      },
      {
        question: "Comment faire parler un sprite?",
        options: ["Bloc 'avancer'", "Bloc 'dire'", "Bloc 'tourner'", "Bloc 'jouer un son'"],
        correct: 1,
        explanation: "Le bloc 'dire' (violet) affiche une bulle de dialogue au-dessus du sprite."
      }
    ]
  },
  
  'python-quiz': {
    title: 'Quiz Python - Temple du Serpent',
    questions: [
      {
        question: "Comment afficher du texte en Python?",
        options: ["display('texte')", "print('texte')", "show('texte')", "write('texte')"],
        correct: 1,
        explanation: "La fonction print() est utilisée pour afficher du texte ou des variables dans la console."
      },
      {
        question: "Quel symbole utilise-t-on pour créer une variable?",
        options: [":", "=", "==", "->"],
        correct: 1,
        explanation: "Le signe = permet d'assigner une valeur à une variable. Par exemple: age = 10"
      },
      {
        question: "Comment commence une condition en Python?",
        options: ["if:", "si:", "when:", "condition:"],
        correct: 0,
        explanation: "Une condition commence par 'if' suivi de la condition et de deux-points (:)"
      },
      {
        question: "Qu'est-ce que l'indentation en Python?",
        options: ["Un commentaire", "Les espaces au début d'une ligne", "Une variable", "Une fonction"],
        correct: 1,
        explanation: "L'indentation (espaces au début) est cruciale en Python pour définir les blocs de code."
      },
      {
        question: "Que fait range(5)?",
        options: ["Crée les nombres 1 à 5", "Crée les nombres 0 à 4", "Crée les nombres 0 à 5", "Attend 5 secondes"],
        correct: 1,
        explanation: "range(5) génère les nombres de 0 à 4 (5 nombres au total, en commençant à 0)."
      }
    ]
  },

  'ai-quiz': {
    title: 'Quiz IA - Gardiens de l\'Intelligence',
    questions: [
      {
        question: "Qu'est-ce que l'Intelligence Artificielle?",
        options: ["Un robot", "Un programme qui apprend", "Un ordinateur", "Un jeu vidéo"],
        correct: 1,
        explanation: "L'IA est un programme capable d'apprendre et de s'améliorer à partir de données."
      },
      {
        question: "Comment une IA apprend-elle?",
        options: ["En lisant des livres", "Avec des données d'entraînement", "Toute seule", "Par magie"],
        correct: 1,
        explanation: "Une IA apprend en analysant de nombreux exemples (données d'entraînement)."
      },
      {
        question: "Qu'est-ce qu'un dataset?",
        options: ["Un jeu de données", "Un ordinateur", "Un programme", "Un robot"],
        correct: 0,
        explanation: "Un dataset est un ensemble de données utilisées pour entraîner une IA."
      }
    ]
  }
};
