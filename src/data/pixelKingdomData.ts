export const pixelKingdomData = {
  title: "Le Royaume des Pixels",
  description: "Une aventure épique où la magie rencontre le code",
  chapters: [
    {
      id: 1,
      title: "La Forêt des Pixels",
      age: "7-8 ans",
      background: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763342398107_10dca743.webp",
      color: "#8B5CF6",
      quests: [
        { id: 1, title: "L'Éveil du Pixel", xp: 100, items: ["Baguette de Pixel"], isBoss: false, locked: false },
        { id: 2, title: "Le Sort de Couleur", xp: 120, items: ["Cape Arc-en-ciel"], isBoss: false, locked: true },
        { id: 3, title: "Boss: Le Gardien Pixelisé", xp: 200, items: ["Épée de Lumière"], isBoss: true, locked: true }
      ]
    },
    {
      id: 2,
      title: "Les Montagnes de Bytes",
      age: "8-9 ans",
      background: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763342399196_11dfa45e.webp",
      color: "#3B82F6",
      quests: [
        { id: 4, title: "L'Algorithme de l'Escalade", xp: 150, items: ["Bottes Magnétiques"], isBoss: false, locked: true },
        { id: 5, title: "Le Bouclier Debug", xp: 180, items: ["Bouclier Anti-Bug"], isBoss: false, locked: true },
        { id: 6, title: "Boss: Le Dragon Binaire", xp: 250, items: ["Armure de Code"], isBoss: true, locked: true }
      ]
    },
    {
      id: 3,
      title: "Le Serveur de Cristal",
      age: "9-10 ans",
      background: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763342400267_8535be30.webp",
      color: "#10B981",
      quests: [
        { id: 7, title: "Les Portails Glitchés", xp: 200, items: ["Clé Dimensionnelle"], isBoss: false, locked: true },
        { id: 8, title: "La Boucle Infinie", xp: 220, items: ["Anneau du Temps"], isBoss: false, locked: true },
        { id: 9, title: "Boss: Le Sphinx des Variables", xp: 300, items: ["Grimoire des Données"], isBoss: true, locked: true }
      ]
    },
    {
      id: 4,
      title: "La Dimension Glitch",
      age: "10-11 ans",
      background: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763342401255_61eca8f4.webp",
      color: "#EF4444",
      quests: [
        { id: 10, title: "La Récursion Mystique", xp: 250, items: ["Miroir Fractal"], isBoss: false, locked: true },
        { id: 11, title: "Les Fonctions Enchantées", xp: 280, items: ["Sceptre des Fonctions"], isBoss: false, locked: true },
        { id: 12, title: "Boss: Le Sorcier des Exceptions", xp: 350, items: ["Manteau d'Invincibilité"], isBoss: true, locked: true }
      ]
    },
    {
      id: 5,
      title: "Le Palais du Roi Pixel",
      age: "11-12 ans",
      background: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763342402239_39b7e3d9.webp",
      color: "#F59E0B",
      quests: [
        { id: 13, title: "L'Algorithme Royal", xp: 300, items: ["Couronne de Sagesse"], isBoss: false, locked: true },
        { id: 14, title: "Le Défi des Classes", xp: 350, items: ["Orbe de Puissance"], isBoss: false, locked: true },
        { id: 15, title: "Boss Final: Le Roi Pixel Corrompu", xp: 500, items: ["Sceptre Suprême", "Titre: Maître du Code"], isBoss: true, locked: true }
      ]
    }
  ]
};
