export function getPixelKingdomResponse(
  questId: number,
  userQuestion: string,
  currentCode?: string
): string {
  const question = userQuestion.toLowerCase();
  
  // Quest-specific responses
  const questResponses: Record<number, Record<string, string>> = {
    1: {
      'pixel': "Un pixel est comme une pierre magique lumineuse! Il a 3 valeurs: Rouge, Vert, Bleu (RGB). Par exemple: RGB(255, 0, 0) = rouge pur!",
      'rgb': "RGB signifie Rouge-Vert-Bleu. Chaque valeur va de 0 à 255. RGB(255, 255, 255) = blanc, RGB(0, 0, 0) = noir!",
      'couleur': "Pour créer une couleur, mélange les 3 valeurs RGB! Rouge + Vert = Jaune, Rouge + Bleu = Magenta, Vert + Bleu = Cyan!",
      'aide': "Pour cette quête, tu dois créer des pixels colorés. Utilise la fonction set_pixel(x, y, r, g, b) avec des valeurs entre 0 et 255!"
    },
    2: {
      'arc-en-ciel': "L'arc-en-ciel utilise 7 couleurs principales! Rouge, Orange, Jaune, Vert, Bleu, Indigo, Violet. Crée chaque couleur avec RGB!",
      'boucle': "Une boucle for répète des actions! for i in range(7): répète 7 fois. Parfait pour créer plusieurs couleurs!",
      'aide': "Utilise une boucle for pour créer chaque couleur de l'arc-en-ciel. Change les valeurs RGB à chaque itération!"
    }
  };

  // Check for quest-specific keywords
  if (questResponses[questId]) {
    for (const [keyword, response] of Object.entries(questResponses[questId])) {
      if (question.includes(keyword)) {
        return `🧙‍♂️ Merlin le Sage dit:\n\n${response}`;
      }
    }
  }

  // General debugging help
  if (question.includes('erreur') || question.includes('bug') || question.includes('marche pas')) {
    return `🧙‍♂️ Merlin le Sage dit:\n\nPas de panique, jeune mage! Vérifie:\n1. Les parenthèses sont bien fermées\n2. Les virgules séparent les valeurs\n3. Les valeurs RGB sont entre 0 et 255\n4. L'indentation est correcte`;
  }

  // Default encouraging response
  return `🧙‍♂️ Merlin le Sage dit:\n\nBonne question! ${getEncouragingTip(questId)}`;
}

function getEncouragingTip(questId: number): string {
  const tips = [
    "Essaie de décomposer le problème en petites étapes magiques!",
    "Chaque grand mage a commencé par des petits sorts. Continue!",
    "La magie du code demande de la pratique. Tu progresses bien!",
    "N'hésite pas à expérimenter! C'est comme ça qu'on apprend la magie!"
  ];
  return tips[questId % tips.length];
}
