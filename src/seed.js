export const seed = {
  users: [
    { id: "1", firstName: "Alice", district: "Centre" },
    { id: "2", firstName: "Bilal", district: "Gare" },
    { id: "3", firstName: "Chloé", district: "Port" },
    { id: "4", firstName: "David", district: "Faubourg" },
  ],
  tools: [
    { id: "1", ownerId: "1", name: "Perceuse à percussion", category: "Perçage", description: "Bosch 750 W, coffret de forets fourni.", status: "available" },
    { id: "2", ownerId: "1", name: "Niveau laser", category: "Mesure", description: "Laser croix, portée 15 m.", status: "lent" },
    { id: "3", ownerId: "2", name: "Tondeuse électrique", category: "Jardinage", description: "Coupe 38 cm, bac 40 L.", status: "available" },
    { id: "4", ownerId: "2", name: "Taille-haie", category: "Jardinage", description: "Lame 50 cm, batterie incluse.", status: "unavailable" },
    { id: "5", ownerId: "3", name: "Rouleau et bac à peinture", category: "Peinture", description: "Rouleau 180 mm, manche télescopique.", status: "available" },
    { id: "6", ownerId: "3", name: "Nettoyeur haute pression", category: "Nettoyage", description: "130 bars, lance rotative.", status: "available" },
    { id: "7", ownerId: "4", name: "Visseuse sans fil", category: "Perçage", description: "18 V, deux batteries.", status: "available" },
    { id: "8", ownerId: "4", name: "Mètre ruban 8 m", category: "Mesure", description: "Ruban large, blocage automatique.", status: "available" },
  ],
  loans: [],
};
