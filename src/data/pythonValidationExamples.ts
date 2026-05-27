// Exemples de leçons Python avec validation de sortie

export const pythonValidationExamples = {
  'python-hello': {
    lessonId: 'python-hello',
    videoTitle: 'Premier Programme: Bonjour!',
    videoDuration: '5:00',
    exerciseChallenge: 'Affiche "Bonjour" à l\'écran en utilisant print()',
    starterCode: '# Écris ton code ici\n',
    hints: [
      'Utilise la fonction print()',
      'Mets le texte entre guillemets',
      'Exemple: print("Bonjour")'
    ],
    expectedOutput: 'Bonjour',
  },

  'python-calcul': {
    lessonId: 'python-calcul',
    videoTitle: 'Calculs Simples',
    videoDuration: '6:00',
    exerciseChallenge: 'Calcule 5 + 3 et affiche le résultat',
    starterCode: '# Fais le calcul et affiche-le\n',
    hints: [
      'Tu peux faire des calculs directement dans print()',
      'Exemple: print(2 + 2)',
      'N\'oublie pas les parenthèses!'
    ],
    expectedOutput: '8',
  },

  'python-nom': {
    lessonId: 'python-nom',
    videoTitle: 'Variables et Noms',
    videoDuration: '7:00',
    exerciseChallenge: 'Crée une variable "nom" et affiche "Je m\'appelle [nom]"',
    starterCode: '# Crée ta variable\nnom = ""\n\n# Affiche le message\n',
    hints: [
      'Mets ton nom entre guillemets',
      'Utilise print("Je m\'appelle", nom)',
      'Ou utilise des f-strings: print(f"Je m\'appelle {nom}")'
    ],
    expectedOutput: 'Je m\'appelle',
  },
};
